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
                            text: `請以繁體中文回答，不得使用簡體字。作為一位專業的教學助理，請仔細閱讀以下的對話內容，並整理成結構清晰的學習筆記。

對話內容：
${chatLog}

請依照以下結構整理：

【討論主題分類】
列出所有討論的主題（不限數量），並簡述每個主題的主要內容。

【各主題詳解】
針對每個主題，請提供：
1. 完整的概念解釋：包含定義、原理或背景
2. 關鍵重點歸納：列出最重要的學習要點
3. 相關實例說明：如果有討論到具體案例，請一併整理

請確保每個主題都有詳細的說明，並保持內容的完整性。避免重複的資訊，重點放在知識的系統性整理。`
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
                            // 清空聊天記錄
                            thread = [];
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

    // 載入用戶筆記、翻譯功能、自主學習計畫等其他功能的程式碼保持不變
    // ... (其他功能程式碼) ...

    // 初始化
    function init() {
        thread = [];
        const greeting = getGreeting();
        updateModeDisplay('聊天');
        userInput.placeholder = "輸入訊息...";
        appendMessage(`${greeting} 今天想要討論什麼呢？`, 'bot-message');
        setInputState(false);

        // 綁定事件監聽器
        document.getElementById('load-notes-button').addEventListener('click', loadUserNotes);
        generateNotesButton.addEventListener('click', generateNotes);

        // 按鈕事件監聽
        translateButton.addEventListener("click", () => {
            translationMode = true;
            returnToChatButton.style.display = "inline-block";
            translateButton.style.display = "none";
            setInputState(false);
            isStudyPlanActive = false;
            studyPlanStep = 0;
            studyPlanData = {};
            hasIdea = null;
            thread = []; 
            updateModeDisplay('中英翻譯');
            userInput.placeholder = "請輸入要翻譯的內容...";
            appendMessage("請輸入想查的中文或英文", "bot-message");
        });

        returnToChatButton.addEventListener("click", () => {
            translationMode = false;
            returnToChatButton.style.display = "none";
            translateButton.style.display = "inline-block";
            setInputState(false);
            isStudyPlanActive = false;
            studyPlanStep = 0;
            studyPlanData = {};
            hasIdea = null;
            thread = [];
            updateModeDisplay('聊天');
            userInput.placeholder = "輸入訊息...";
            appendMessage("已返回聊天模式。", "bot-message");
        });

        studyPlanButton.addEventListener('click', () => {
            translationMode = false;
            returnToChatButton.style.display = 'none';
            translateButton.style.display = 'inline-block';
            setInputState(false);
            thread = [];
            updateModeDisplay('自主學習計畫');
            userInput.placeholder = "請依照指示回答...";
            startStudyPlan();
        });
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

    // 移除最後一條 bot 訊息
    function removeLastBotMessage() {
        const messages = chatWindow.querySelectorAll('.bot-message');
        if (messages.length > 0) {
            chatWindow.removeChild(messages[messages.length - 1]);
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
