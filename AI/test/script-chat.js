// script-chat.js (聊天功能)
const chatModule = (() => {
    // 獲取 DOM 元素
    const uploadImage = document.getElementById('upload-image');
    const imageUploadButton = document.getElementById('image-upload-button');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const studyPlanButton = document.getElementById('study-plan-button');
    const translateButton = document.getElementById('translate-button');
    const returnToChatButton = document.getElementById('return-to-chat-button');
    const generateNotesButton = document.getElementById('generate-notes-button');
    const currentModeIndicator = document.getElementById('current-mode');

    // 學習計畫相關變數
    let studyPlanStep = 0;
    let studyPlanData = {};
    let hasIdea = null;
    let isStudyPlanActive = false;
    let isInputDisabled = false;
    let translationMode = false;

    // 更新模式顯示的函數
    function updateModeDisplay(mode) {
        currentModeIndicator.classList.add('mode-transition');
        currentModeIndicator.textContent = mode;
        setTimeout(() => {
            currentModeIndicator.classList.remove('mode-transition');
        }, 300);
    }

    // 格式化文字
    function formatText(text) {
        let formatted = text;
        // 移除 Markdown 標題標記 (移除所有的 # 符號和後面的空格)
        formatted = formatted.replace(/^#+\s*/gm, '');
        // 轉換換行符
        formatted = formatted.replace(/\n/g, '<br>');
        // 轉換粗體
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formatted;
    }

    // 設定輸入狀態的函數
    function setInputState(disabled) {
        isInputDisabled = disabled;
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
        uploadImage.disabled = disabled;
    }

    // 新增圖片上傳按鈕事件
    imageUploadButton.addEventListener('click', () => {
        uploadImage.click();
    });

    // 圖片上傳
    uploadImage.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const selectedImage = e.target.result;
                imagePreviewContainer.innerHTML = `
                    <div class="preview-wrapper">
                        <img src="${selectedImage}" alt="圖片預覽" class="preview-image">
                        <button class="delete-button" onclick="chatModule.clearImage()">×</button>
                    </div>
                `;
                imagePreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    });

    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
        .preview-wrapper {
            position: relative;
            display: inline-block;
            margin: 5px;
        }
        
        .preview-image {
            max-width: 100px;
            max-height: 100px;
            border-radius: 4px;
        }
        
        .delete-button {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #ff4444;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            padding: 0;
            line-height: 1;
        }
        
        .delete-button:hover {
            background-color: #cc0000;
        }
        
        #image-preview-container {
            display: none;
            margin-top: 10px;
            flex-wrap: wrap;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);

    // 清除圖片
    function clearImage() {
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.style.display = 'none';
        uploadImage.value = '';
    }

    // 聊天發送
// 聊天發送
sendButton.addEventListener('click', async () => {
    if (isInputDisabled) return;
    const message = userInput.value.trim();
    if (!message && !uploadImage.files[0]) return;

    if (uploadImage.files && uploadImage.files[0]) {
        const file = uploadImage.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // 建立 canvas 來處理圖片
                const img = new Image();
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // 獲取 base64 圖片數據
                    const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                    
                    appendMessage('（圖片已傳送）', 'user-message');
                    if (message) {
                        appendMessage(message, 'user-message');
                    }
                    
                    showLoadingIndicator();
                    
                    // 準備發送給 Gemini 的數據
                    const payload = {
                        contents: [{
                            parts: [{
                                text: `請以繁體中文回答，請描述這張圖片，並根據圖片內容${message ? `回答以下問題：${message}` : '，告訴我這是什麼，並且分析其內容。'}`
                            }, {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: base64Data
                                }
                            }]
                        }]
                    };

                    // 發送請求到 Gemini API
                    const response = await fetch(geminiurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();
                    hideLoadingIndicator();

                    if (data.candidates && data.candidates.length > 0) {
                        const reply = data.candidates[0].content.parts[0].text;
                        appendMessage(reply, 'bot-message');
                        
                        // 更新對話記錄
                        thread.push({
                            role: 'user',
                            parts: [{
                                text: message || '請描述這張圖片',
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: base64Data
                                }
                            }]
                        });
                        thread.push({
                            role: 'model',
                            parts: [{ text: reply }]
                        });
                    } else {
                        appendMessage('無法解析圖片內容，請再試一次。', 'bot-message');
                    }
                };
                img.src = e.target.result;
            } catch (error) {
                hideLoadingIndicator();
                appendMessage(`處理圖片時發生錯誤：${error.message}`, 'bot-message');
            }

            clearImage();
            userInput.value = '';
        };
        reader.readAsDataURL(file);
    } else if (message) {
        // 純文字訊息的處理
        await handleUserTextMessage(message);
    }
});

    // 添加訊息到聊天視窗
    function appendMessage(content, className) {
        const message = document.createElement('div');
        message.classList.add('message', className);
        const formattedContent = formatText(content);
        const text = document.createElement('span');
        text.innerHTML = formattedContent;
        message.appendChild(text);
        chatWindow.appendChild(message);

        setTimeout(() => {
            chatWindow.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    // 處理使用者文字訊息
    async function handleUserTextMessage(message) {
        if (isStudyPlanActive) {
            if (message && message.trim()) {
                handleStudyPlanInput(message);
                userInput.value = '';
            }
            return;
        }

        if (message) {
            appendMessage(message, 'user-message');
            thread.push({
                role: 'user',
                parts: [{ text: message }]
            });
        }

        userInput.value = '';
        showLoadingIndicator();

        try {
            let botReply;
            if (translationMode) {
                botReply = await fetchTranslation(message);
            } else {
                botReply = await fetchBotReply(thread);
            }
            hideLoadingIndicator();
            appendMessage(botReply, 'bot-message');
            thread.push({
                role: 'model',
                parts: [{ text: botReply }]
            });
        } catch (error) {
            hideLoadingIndicator();
            appendMessage(`錯誤：${error.message}`, 'bot-message');
        }
    }

    // 顯示載入指示器
    function showLoadingIndicator() {
        const existingIndicator = document.getElementById('loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.textContent = '正在思考中...';
        loadingIndicator.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px;
            margin: 10px 0;
            background-color: white;
            border-radius: 15px;
            font-style: italic;
            color: #555;
        `;
        chatWindow.appendChild(loadingIndicator);
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 隱藏載入指示器
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // 獲取機器人回覆
    async function fetchBotReply(thread) {
        const systemMessage = {
            role: 'user',
            parts: [{ text: '請以繁體中文回答，不得使用簡體字。' }]
        };

        const newThread = [systemMessage, ...thread];

        const response = await fetch(geminiurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: newThread
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text || '未能獲取有效回應';
        } else {
            return '未能獲取有效回應';
        }
    }

    // 翻譯功能
    async function fetchTranslation(text) {
        if (!text) return '請輸入要翻譯的內容';

        const systemMessage = {
            role: 'user',
            parts: [{ text: `請以繁體中文回答。你現在是一位專業的英語教師，請依照以下格式提供翻譯和學習資訊：

1. 判斷輸入的是中文還是英文，並翻譯成另一種語言
2. 列出這個字/詞/句子的其他常見用法或相關詞組（至少3個）
3. 提供2個相關的例句（請包含中英對照）
4. 如果是句子，請說明當中的文法重點
5. 補充學習重點或記憶技巧

請用這種方式分析以下內容：
${text}

請用以下格式回答：
🔄 翻譯：
[翻譯內容]

📚 相關用法：
• [用法1]
• [用法2]
• [用法3]

🌟 例句：
1. [英文例句1]
   [中文翻譯1]
2. [英文例句2]
   [中文翻譯2]

📖 文法重點：
[相關文法說明]

💡 學習提示：
[實用的學習建議或記憶技巧]` }]
        };

        try {
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [systemMessage]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text || '翻譯失敗，請重試';
            } else {
                return '翻譯失敗，請重試';
            }
        } catch (error) {
            console.error('Translation error:', error);
            return `翻譯過程中發生錯誤：${error.message}`;
        }
    }

    // 生成筆記
    async function generateNotes() {
        if (thread.length === 0) {
            alert('目前無聊天記錄，無法生成筆記。');
            return;
        }

        const username = prompt('請輸入您的帳號：');
        if (!username) {
            alert('必須輸入帳號才能生成筆記。');
            return;
        }

        // 獲取聊天記錄 (去除系統訊息)
        const chatLog = thread
            .filter(msg => msg.role !== 'system')
            .map(entry => `${entry.role}: ${entry.parts[0].text}`)
            .join('\n');

        appendMessage('正在生成筆記...', 'bot-message');

        try {
            const summaryResponse = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `請以繁體中文回答，不得使用簡體字。
作為一位專業的教學助理，請幫我將以下對話內容整理成簡潔的學習筆記。請注意以下要求：

1. 篇幅控制：
   - 每個主題重點不超過3-4行
   - 使用簡潔的文字描述
   - 去除不必要的贅述

2. 結構要求：
   【關鍵概念】
   • 列出2-3個最重要的概念
   • 每個概念用一句話解釋

   【重點整理】
   • 用項目符號列出主要重點（最多5點）
   • 每點重點使用精簡的文字說明

對話內容：
${chatLog}

請依照上述格式整理出精簡的學習筆記。`
                        }]
                    }]
                })
            });

            const summaryData = await summaryResponse.json();
            const summary = summaryData.candidates[0].content.parts[0].text;

            // 儲存到 Google Apps Script
            await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(result => {
                        removeLastBotMessage();
                        if (result && result.status === 'success') {
                            appendMessage('筆記生成成功！已儲存至 Google 試算表。\n您可以在「我的筆記」中查看所有筆記。', 'bot-message');
                            thread = []; // 清空聊天記錄
                        } else {
                            appendMessage(`筆記生成失敗：${result ? result.error : '未知錯誤'}`, 'bot-message');
                        }
                        resolve(result);
                    })
                    .withFailureHandler(error => {
                        removeLastBotMessage();
                        appendMessage(`筆記生成失敗：${error.message}`, 'bot-message');
                        reject(error);
                    })
                    .doPost({
                        username: username,
                        chatLog: summary
                    });
            });

        } catch (error) {
            removeLastBotMessage();
            appendMessage(`筆記生成失敗：${error.message}`, 'bot-message');
        }
    }

    // 修改筆記顯示函數，讓筆記呈現更有結構
    function formatNoteDisplay(note) {
        // 將筆記文本轉換為 HTML 格式
        let formattedNote = note.replace(/【(.+?)】/g, '<h3 class="note-section">$1</h3>');
        formattedNote = formattedNote.replace(/•\s(.*?)(?=(\n|$))/g, '<li class="note-item">$1</li>');
        formattedNote = formattedNote.replace(/\n\n/g, '<br>');

        return `
            <div class="note-content">
                ${formattedNote}
            </div>
            <style>
                .note-section {
                    color: #8ab0ab;
                    font-size: 1.2em;
                    margin-top: 15px;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #8ab0ab;
                    padding-bottom: 5px;
                }
                .note-item {
                    margin: 8px 0;
                    list-style-type: none;
                    position: relative;
                    padding-left: 20px;
                }
                .note-item:before {
                    content: "•";
                    color: #8ab0ab;
                    position: absolute;
                    left: 0;
                }
            </style>
        `;
    }

    // 啟動專題計畫
    function startStudyPlan() {
        isStudyPlanActive = true;
        studyPlanStep = 1;
        studyPlanData = {};
        hasIdea = null;
        setInputState(false);
        appendMessage("好的，我們開始規劃你的專題計畫！首先，請問你對學習主題是否已經有初步的想法？", "bot-message");

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message-options';
        const optionYes = createOptionButton('已有想法', () => handleIdeaSelection(true));
        const optionNo = createOptionButton('完全沒想法', () => handleIdeaSelection(false));
        optionsDiv.appendChild(optionYes);
        optionsDiv.appendChild(optionNo);
        chatWindow.appendChild(optionsDiv);

        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 創建選項按鈕
    function createOptionButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'option-button';
        button.addEventListener('click', () => {
            clickHandler();
            const options = document.querySelectorAll('.message-options');
            options.forEach(option => option.remove());
        });
        return button;
    }

    // 處理想法選擇
    function handleIdeaSelection(idea) {
        hasIdea = idea;
        if (idea) {
            studyPlanStep = 2;
            appendMessage("太好了！請告訴我你感興趣的學習主題或科目。", "bot-message");
        } else {
            studyPlanStep = 'A1';
            const interests = ["運動", "音樂", "科技", "歷史", "藝術", "文學", "科學", "遊戲"];
            appendMessage("你平常對哪些事物比較感興趣？", "bot-message");

            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'message-options';

            interests.forEach(interest => {
                const button = document.createElement('button');
                button.textContent = interest;
                button.className = 'option-button';
                button.addEventListener('click', () => {
                    const options = document.querySelectorAll('.message-options');
                    options.forEach(option => option.remove());
                    handleStudyPlanInput(interest);
                });
                optionsDiv.appendChild(button);
            });

            chatWindow.appendChild(optionsDiv);
            chatWindow.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    // 載入用戶筆記
    async function loadUserNotes() {
        const username = document.getElementById('notes-username').value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        const notesDisplay = document.getElementById('notes-display-area');
        notesDisplay.innerHTML = '<p style="text-align: center;">載入中...</p>';

        try {
            await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(result => {
                        if (result.status === 'success') {
                            const notes = result.notes;
                            if (notes.length === 0) {
                                notesDisplay.innerHTML = '<p style="text-align: center;">目前還沒有任何筆記。</p>';
                                return;
                            }

                            // 顯示筆記
                            notesDisplay.innerHTML = notes.map((note, index) => `
                                <div class="note-card">
                                    <div class="note-content">${formatText(note)}</div>
                                </div>
                            `).join('');
                        } else {
                            notesDisplay.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
                        }
                        resolve(result);
                    })
                    .withFailureHandler(error => {
                        notesDisplay.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
                        reject(error);
                    })
                    .getNotes(username);
            });
        } catch (error) {
            notesDisplay.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
        }
    }

    // 獲取選項
    async function fetchOptions(promptText) {
        showLoadingIndicator();
        const prompt = `請以繁體中文回答，不得使用簡體字。
我正在為國中或高中生設計研究主題選項。
請根據以下主題，列出5個簡單、具體且符合中學生程度的選項: ${promptText}

要求：
1. 每個選項不超過5個字
2. 使用中學生熟悉的詞彙
3. 選項內容要具體且容易理解
4. 避免艱深專業術語
5. 與中學生日常學習和生活相關

請用以下JSON格式回應：
{
    "options": ["選項1", "選項2", "選項3", "選項4", "選項5"]
}`;

        try {
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            hideLoadingIndicator();

            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                try {
                    const textContent = data.candidates[0].content.parts[0].text;
                    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsedData = JSON.parse(jsonMatch[0]);
                        return parsedData.options;
                    }
                } catch (e) {
                    console.error("JSON解析錯誤:", e);
                    appendMessage("取得選項時發生錯誤，請稍後再試。", "bot-message");
                    return ["選項獲取失敗"];
                }
            }
            return ["選項獲取失敗"];
        } catch (error) {
            hideLoadingIndicator();
            appendMessage(`生成選項時發生錯誤：${error.message}`, "bot-message");
            return ["選項獲取失敗"];
        }
    }

    // 生成領域選項
    async function generateFieldOptions(selectedInterest) {
        const fields = await fetchOptions(`與${selectedInterest}相關的領域`);
        appendMessage(`你對${selectedInterest}感興趣。在這些興趣中，有沒有哪個領域是你特別想深入了解的？`, "bot-message");

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message-options';

        fields.forEach(field => {
            const button = document.createElement('button');
            button.textContent = field;
            button.className = 'option-button';
            button.addEventListener('click', () => {
                handleStudyPlanInput(field);
                const options = document.querySelectorAll('.message-options');
                options.forEach(option => option.remove());
            });
            optionsDiv.appendChild(button);
        });

        chatWindow.appendChild(optionsDiv);
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 生成主題選項
    async function generateTopicOptions(field) {
        const topics = await fetchOptions(`與${field}相關的主題`);
        appendMessage(`很好！在${field}這個領域中，有沒有哪個特定的主題或概念是你覺得特別有趣的？`, "bot-message");

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message-options';

        topics.forEach(topic => {
            const button = document.createElement('button');
            button.textContent = topic;
            button.className = 'option-button';
            button.addEventListener('click', () => {
                handleStudyPlanInput(topic);
                const options = document.querySelectorAll('.message-options');
                options.forEach(option => option.remove());
            });
            optionsDiv.appendChild(button);
        });

        chatWindow.appendChild(optionsDiv);
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 生成方向選項
    async function generateDirectionOptions(topic) {
        const directions = await fetchOptions(`關於${topic}，可以進一步探索或研究的方向`);
        appendMessage(`不錯喔！那麼關於${topic}，你有沒有想要進一步探索或研究的方向？`, "bot-message");

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message-options';

        directions.forEach(direction => {
            const button = document.createElement('button');
            button.textContent = direction;
            button.className = 'option-button';
            button.addEventListener('click', () => {
                handleStudyPlanInput(direction);
                const options = document.querySelectorAll('.message-options');
                options.forEach(option => option.remove());
            });
            optionsDiv.appendChild(button);
        });

        chatWindow.appendChild(optionsDiv);
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
        });
    }

    // 移除最後一條 bot 訊息
    function removeLastBotMessage() {
        const messages = chatWindow.querySelectorAll('.bot-message');
        if (messages.length > 0) {
            chatWindow.removeChild(messages[messages.length - 1]);
        }
    }

    // 處理學習計畫輸入
    async function handleStudyPlanInput(selectedOption) {
        if (!selectedOption) return;

        appendMessage(selectedOption, 'user-message');

        if (hasIdea === false && studyPlanStep.startsWith('A')) {
            switch (studyPlanStep) {
                case 'A1':
                    studyPlanData.interests = selectedOption;
                    studyPlanStep = 'A2';
                    await generateFieldOptions(selectedOption);
                    break;
                case 'A2':
                    studyPlanData.field = selectedOption;
                    studyPlanStep = 'A3';
                    await generateTopicOptions(selectedOption);
                    break;
                case 'A3':
                    studyPlanData.topic = selectedOption;
                    studyPlanStep = 'A4';
                    await generateDirectionOptions(selectedOption);
                    break;
                case 'A4':
                    studyPlanData.direction = selectedOption;
                    hasIdea = true;
                    studyPlanStep = 2;
                    appendMessage(`太棒了！看來你對專題已經有一些想法了。我們現在來進一步確認你的專題題目。根據你目前的想法，你希望你的專題題目是什麼？`, "bot-message");
                    break;
            }
        } else {
            switch (studyPlanStep) {
                case 2:
                    studyPlanData.subject = selectedOption;
                    studyPlanStep = 3;
                    appendMessage(`瞭解了，你想以${selectedOption}作為專題題目。你對${selectedOption}目前的理解程度如何？`, "bot-message");

                    const understandingOptionsDiv = document.createElement('div');
                    understandingOptionsDiv.className = 'message-options';

                    const understandingLevels = [
                        "完全不了解",
                        "稍微知道一些",
                        "已經有基礎"
                    ];

                    understandingLevels.forEach(level => {
                        const button = document.createElement('button');
                        button.textContent = level;
                        button.className = 'option-button';
                        button.addEventListener('click', () => {
                            const options = document.querySelectorAll('.message-options');
                            options.forEach(option => option.remove());
                            handleStudyPlanInput(level);
                        });
                        understandingOptionsDiv.appendChild(button);
                    });

                    chatWindow.appendChild(understandingOptionsDiv);
                    chatWindow.scrollTo({
                        top: chatWindow.scrollHeight,
                        behavior: 'smooth'
                    });
                    break;
                case 3:
                    studyPlanData.level= selectedOption;
                    studyPlanStep = 4;
                    appendMessage(`明白了。最後，你有沒有特別想在哪個時間點達成什麼學習目標？（例如：學期結束前掌握基本概念、半年後能參加科展比賽、高二投稿小論文…等）`, "bot-message");
                    break;
                case 4:
                    studyPlanData.goal = selectedOption;
                    const plan = await generateStudyPlan(studyPlanData);
                    appendMessage(plan, "bot-message");
                    isStudyPlanActive = false;
                    studyPlanStep = 0;
                    hasIdea = null;
                    thread = []; // 清空聊天記錄
                    setInputState(false);
                    break;
            }
        }
    }

    // 生成學習計畫
    async function generateStudyPlan(data) {
        showLoadingIndicator();
        const prompt = `請以繁體中文回答，不得使用簡體字。
請扮演一位具有豐富教學經驗的老師，為學生制定一份為期18週的專題計畫。

學生資訊：
* 學習主題：${data.subject}
* 目前程度：${data.level}
* 學習目標：${data.goal}

請使用以下格式回應，確保內容清晰易讀：

# 專題計畫總覽
【學習主題】：
【學習目標】：
【預期成果】：

# 每週學習規劃
請使用以下格式列出每週的學習內容：

第X週
-------------------
｜學習主題｜[本週主題]
｜學習活動｜[具體活動，以1. 2. 3.條列]
｜學習資源｜[推薦資源，以1. 2. 3.條列]
｜進度評估｜[如何評估本週學習成效]
-------------------

# 學習評量方式
1. [評量方式1]
2. [評量方式2]
3. [評量方式3]

# 學習建議
• [重要建議1]
• [重要建議2]
• [重要建議3]

請確保內容具體可行，並配合學生程度安排適當的進度。`;

        try {
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const responseData = await response.json();
            hideLoadingIndicator();
            
            if (responseData.candidates && responseData.candidates[0].content && 
                responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0].text) {
                // 格式化回應文字
                let planText = responseData.candidates[0].content.parts[0].text;
                
                // 將回應文字轉換為 HTML 格式
                planText = planText.replace(/^第(\d+)週$/gm, '<div class="week-header">第$1週</div>');
                planText = planText.replace(/^[-｜]{3,}$/gm, '');
                planText = planText.replace(/^｜([^｜]+)｜/gm, '<div class="plan-row"><strong>$1</strong>');
                planText = planText.replace(/(\d+\. .+?)(?=\d+\.|$)/g, '<div class="plan-item">$1</div>');
                
                // 添加樣式
                const styledPlan = `
                    <div class="study-plan">
                        ${planText}
                    </div>
                    <style>
                        .study-plan {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .week-header {
                            background: #8ab0ab;
                            color: white;
                            padding: 10px;
                            margin: 20px 0 10px 0;
                            border-radius: 4px;
                            font-weight: bold;
                        }
                        .plan-row {
                            display: grid;
                            grid-template-columns: 100px 1fr;
                            padding: 10px;
                            border-bottom: 1px solid #eee;
                        }
                        .plan-item {
                            margin: 5px 0;
                            padding-left: 20px;
                        }
                    </style>
                `;
                
                return styledPlan;
            }
            return '無法生成學習計畫，請再試一次。';
        } catch (error) {
            hideLoadingIndicator();
            return `生成學習計畫時發生錯誤：${error.message}`;
        }
    }

    // 初始化
    function init() {
        thread = [];
        const greeting = getGreeting();
        updateModeDisplay('聊天');
        userInput.placeholder = "輸入訊息...";
        
        // 檢查聊天窗口是否已經有內容
        if (chatWindow.children.length === 0) {
            appendMessage(`${greeting} 今天想要討論什麼呢？`, 'bot-message');
        }
        
        setInputState(false);

        // 移除所有已存在的事件監聽器
        const cloneLoadNotesButton = document.getElementById('load-notes-button').cloneNode(true);
        document.getElementById('load-notes-button').parentNode.replaceChild(cloneLoadNotesButton, document.getElementById('load-notes-button'));
        
        const cloneGenerateNotesButton = generateNotesButton.cloneNode(true);
        generateNotesButton.parentNode.replaceChild(cloneGenerateNotesButton, generateNotesButton);
        
        const cloneTranslateButton = translateButton.cloneNode(true);
        translateButton.parentNode.replaceChild(cloneTranslateButton, translateButton);
        
        const cloneReturnToChatButton = returnToChatButton.cloneNode(true);
        returnToChatButton.parentNode.replaceChild(cloneReturnToChatButton, returnToChatButton);
        
        const cloneStudyPlanButton = studyPlanButton.cloneNode(true);
        studyPlanButton.parentNode.replaceChild(cloneStudyPlanButton, studyPlanButton);

        // 重新綁定事件監聽器
        cloneLoadNotesButton.addEventListener('click', loadUserNotes);
        cloneGenerateNotesButton.addEventListener('click', generateNotes);

        // 翻譯按鈕事件
        cloneTranslateButton.addEventListener("click", () => {
            translationMode = true;
            cloneReturnToChatButton.style.display = "inline-block";
            cloneTranslateButton.style.display = "none";
            setInputState(false);
            isStudyPlanActive = false;
            studyPlanStep = 0;
            studyPlanData = {};
            hasIdea = null;
            thread = [];
            updateModeDisplay('中英翻譯');
            userInput.placeholder = "請輸入要翻譯的內容...";
            
            // 清空聊天窗口後再添加消息
            chatWindow.innerHTML = '';
            appendMessage("請輸入想查的中文或英文", "bot-message");
        });

        // 返回聊天按鈕事件
        cloneReturnToChatButton.addEventListener("click", () => {
            translationMode = false;
            cloneReturnToChatButton.style.display = "none";
            cloneTranslateButton.style.display = "inline-block";
            cloneStudyPlanButton.style.display = "inline-block";
            setInputState(false);
            isStudyPlanActive = false;
            studyPlanStep = 0;
            studyPlanData = {};
            hasIdea = null;
            thread = [];
            updateModeDisplay('聊天');
            userInput.placeholder = "輸入訊息...";
            
            // 清空聊天窗口後再添加消息
            chatWindow.innerHTML = '';
            appendMessage("已返回聊天模式。", "bot-message");
        });

        // 學習計畫按鈕事件
        cloneStudyPlanButton.addEventListener('click', () => {
            translationMode = false;
            cloneReturnToChatButton.style.display = 'inline-block';
            cloneTranslateButton.style.display = 'inline-block';
            cloneStudyPlanButton.style.display = 'none';
            setInputState(false);
            thread = [];
            updateModeDisplay('專題計畫');
            userInput.placeholder = "請依照指示回答...";
            
            // 清空聊天窗口後再開始學習計畫
            chatWindow.innerHTML = '';
            startStudyPlan();
        });

        // 更新按鈕引用
        translateButton = cloneTranslateButton;
        returnToChatButton = cloneReturnToChatButton;
        studyPlanButton = cloneStudyPlanButton;
        generateNotesButton = cloneGenerateNotesButton;
    }

    // 取得問候語
    function getGreeting() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 6 && hour < 12) {
            return '早安！';
        } else if (hour >= 12 && hour < 14) {
            return '午安！';
        } else {
            return 'Hello！';
        }
    }

    // 暴露公共接口
    return {
        clearImage,
        appendMessage,
        startStudyPlan,
        init,
        handleStudyPlanInput,
        setInputState,
        generateNotes,
        loadUserNotes,
        removeLastBotMessage
    };
})();

// 初始化
chatModule.init();
