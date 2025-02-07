// script-chat.js (聊天功能)
const chatModule = (() => {
    // 獲取 DOM 元素
    const uploadImage = document.getElementById('upload-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const studyPlanButton = document.getElementById('study-plan-button');
    const translateButton = document.getElementById('translate-button');
    const returnToChatButton = document.getElementById('return-to-chat-button');
    const generateNotesButton = document.getElementById('generate-notes-button');

    // 學習計畫相關變數
    let studyPlanStep = 0;
    let studyPlanData = {};
    let hasIdea = null;
    let isStudyPlanActive = false;
    let isInputDisabled = false;
    let translationMode = false;

    // 設定輸入狀態的函數
    function setInputState(disabled) {
        isInputDisabled = disabled;
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
        uploadImage.disabled = disabled;
    }

    // 圖片上傳
    uploadImage.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const selectedImage = e.target.result;
                imagePreviewContainer.innerHTML = `
                    <img src="${selectedImage}" alt="圖片預覽">
                    <div class="delete-button" onclick="chatModule.clearImage()">x</div>
                `;
                imagePreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    });

    // 清除圖片
    function clearImage() {
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.style.display = 'none';
        uploadImage.value = '';
    }

    // 聊天發送
    sendButton.addEventListener('click', async () => {
        if (isInputDisabled) return;
        const message = userInput.value.trim();
        if (!message && !uploadImage.value) return;

        if (uploadImage.files && uploadImage.files[0]) {
            const file = uploadImage.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const selectedImageBase64 = e.target.result;
                appendMessage('（圖片已傳送）', 'user-message');
                thread.push({
                    role: 'user',
                    parts: [{ text: '圖片訊息', image: selectedImageBase64 }],
                });
                clearImage();
                await handleUserTextMessage(message);
            };
            reader.readAsDataURL(file);
        } else {
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

    // 啟動自主學習計畫
    function startStudyPlan() {
        isStudyPlanActive = true;
        studyPlanStep = 1;
        studyPlanData = {};
        hasIdea = null;
        setInputState(false);
        appendMessage("好的，我們開始規劃你的自主學習計畫！首先，請問你對學習主題是否已經有初步的想法？", "bot-message");

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

    // 獲取選項
    async function fetchOptions(promptText) {
        showLoadingIndicator();
        const prompt = `請以繁體中文回答，不得使用簡體字。
我正在為國中或高中生設計自主學習選項。
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
                    appendMessage(`太棒了！看來你對自主學習已經有一些想法了。我們現在來進一步確認你的專題題目。根據你目前的想法，你希望你的專題題目是什麼？`, "bot-message");
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
                    studyPlanData.level = selectedOption;
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
                    thread = [{ role: 'model', parts: [{ text: plan }] }];
                    setInputState(true);
                    break;
            }
        }
    }

    // 生成學習計畫
    async function generateStudyPlan(data) {
        showLoadingIndicator();
        const prompt = `請以繁體中文回答，不得使用簡體字。
請扮演一位具有豐富教學經驗的老師，為學生制定一份為期18週的自主學習計畫。

學生提供的資訊如下：
* 學習主題/科目：${data.subject}
* 目前理解程度：${data.level}
* 學習目標：${data.goal}

請根據這些資訊，設計一份詳細的學習計畫，包含：
1. **每週的學習主題**：清楚列出每週要學習的具體內容。
2. **學習活動建議**：提供多樣化的學習活動（例如：閱讀教材、觀看影片、做練習題、實作專案、小考）。
3. **學習資源**：推薦相關的學習資源（例如：教科書章節、網站、影片）。
4. **進度評估方式**：建議學生如何評估自己的學習進度（例如：每週自我測驗、與朋友討論）。
5. 總體學習目標回顧：計畫最後再次強調整體18週的學習目標。

請以條列式、清晰易懂的方式呈現學習計畫，並在適當的地方加入鼓勵的話語。`;

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
            if (responseData.candidates && responseData.candidates[0].content && responseData.candidates[0].content.parts && responseData.candidates[0].content.parts[0].text) {
                return responseData.candidates[0].content.parts[0].text;
            }
            return '無法生成學習計畫，請再試一次。';
        } catch (error) {
            hideLoadingIndicator();
            return `生成學習計畫時發生錯誤：${error.message}`;
        }
    }

    // 生成筆記
async function generateNotes() {
    if (thread.length === 0) {
        alert('目前無聊天記錄，無法生成筆記。');
        return;
    }

    // 要求用戶輸入帳號
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

    // 顯示載入指示器
    appendMessage('正在生成筆記...', 'bot-message');

    try {
        // 生成摘要
        const summaryResponse = await fetch(geminiurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `請以繁體中文回答，不得使用簡體字。
請將以下對話內容做重點摘要，並以條列方式呈現主要討論內容和結論：

${chatLog}

請用以下格式回應：
主要討論主題：
1. 
2. 
3. 

重要結論：
1. 
2. 
3. `
                    }]
                }]
            })
        });

        const summaryData = await summaryResponse.json();
        const summary = summaryData.candidates[0].content.parts[0].text;

        // 儲存到 Google Apps Script
        google.script.run
            .withSuccessHandler(function(result) {
                // 移除載入指示器
                removeLastBotMessage();
                
                if (result && result.status === 'success') {
                    appendMessage('筆記生成成功！已儲存至 Google 試算表。', 'bot-message');
                    
                    // 顯示檢視筆記選項
                    const viewNotesButton = document.createElement('button');
                    viewNotesButton.textContent = '檢視我的筆記';
                    viewNotesButton.className = 'option-button';
                    viewNotesButton.onclick = () => viewNotes(username);
                    
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message bot-message';
                    messageDiv.appendChild(viewNotesButton);
                    chatWindow.appendChild(messageDiv);
                } else {
                    appendMessage(`筆記生成失敗：${result ? result.error : '未知錯誤'}`, 'bot-message');
                }
            })
            .withFailureHandler(function(error) {
                removeLastBotMessage();
                appendMessage(`筆記生成失敗：${error.message}`, 'bot-message');
            })
            .doPost({
                username: username,  // 直接傳遞參數，不需要包在 postData 中
                chatLog: summary
            });

    } catch (error) {
        removeLastBotMessage();
        appendMessage(`筆記生成失敗：${error.message}`, 'bot-message');
    }
}
    
    // 檢視筆記函數
    async function viewNotes(username) {
        appendMessage('正在載入筆記...', 'bot-message');

        try {
            const result = await google.script.run
                .withSuccessHandler(function(result) {
                    removeLastBotMessage();
                    
                    if (result.status === 'success') {
                        const notes = result.notes;
                        if (notes.length === 0) {
                            appendMessage('目前還沒有任何筆記。', 'bot-message');
                            return;
                        }

                        // 為每個筆記創建一個訊息
                        notes.forEach((note, index) => {
                            const noteNum = index + 1;
                            appendMessage(`筆記 ${noteNum}:\n${note}`, 'bot-message');
                        });
                    } else {
                        appendMessage(`載入筆記失敗：${result.error}`, 'bot-message');
                    }
                })
                .withFailureHandler(function(error) {
                    removeLastBotMessage();
                    appendMessage(`載入筆記失敗：${error.message}`, 'bot-message');
                })
                .getNotes(username);

        } catch (error) {
            removeLastBotMessage();
            appendMessage(`載入筆記失敗：${error.message}`, 'bot-message');
        }
    }

    // 移除最後一條 bot 訊息
    function removeLastBotMessage() {
        const chatWindow = document.getElementById('chat-window');
        const messages = chatWindow.querySelectorAll('.bot-message');
        if (messages.length > 0) {
            chatWindow.removeChild(messages[messages.length - 1]);
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

    // 初始化
    function init() {
        thread = [];
        const greeting = getGreeting();
        appendMessage(`${greeting} 今天想要討論什麼呢？`, 'bot-message');
        setInputState(false);

        // 初始化按鈕事件監聽
        translateButton.addEventListener("click", () => {
            translationMode = true;
            returnToChatButton.style.display = "inline-block";
            translateButton.style.display = "none";
            setInputState(false);
            appendMessage("請輸入想查的中文或英文", "bot-message");
        });

        returnToChatButton.addEventListener("click", () => {
            translationMode = false;
            returnToChatButton.style.display = "none";
            translateButton.style.display = "inline-block";
            setInputState(false);
            appendMessage("已返回聊天模式。", "bot-message");
        });

        studyPlanButton.addEventListener('click', () => {
            translationMode = false;
            returnToChatButton.style.display = 'none';
            translateButton.style.display = 'inline-block';
            setInputState(false);
            startStudyPlan();
        });

        // 新增事件監聽器
        generateNotesButton.addEventListener('click', generateNotes);
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
        viewNotes,
        removeLastBotMessage
    };
})();

// 初始化
chatModule.init();
