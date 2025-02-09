// script-chat.js (聊天功能)
const chatModule = (() => {
    // DOM 元素參考
    let uploadImage;
    let imagePreviewContainer;
    let sendButton;
    let userInput;
    let chatWindow;
    let studyPlanButton;
    let translateButton;
    let returnToChatButton;
    let generateNotesButton;

    // 學習計畫相關變數
    let studyPlanStep = 0;
    let studyPlanData = {};
    let hasIdea = null;
    let isStudyPlanActive = false;
    let isInputDisabled = false;
    let translationMode = false;

    // 初始化 DOM 元素
    function initializeElements() {
        uploadImage = document.getElementById('upload-image');
        imagePreviewContainer = document.getElementById('image-preview-container');
        sendButton = document.getElementById('send-button');
        userInput = document.getElementById('user-input');
        chatWindow = document.getElementById('chat-window');
        studyPlanButton = document.getElementById('study-plan-button');
        translateButton = document.getElementById('translate-button');
        returnToChatButton = document.getElementById('return-to-chat-button');
        generateNotesButton = document.getElementById('generate-notes-button');

        if (!uploadImage || !sendButton || !userInput || !chatWindow) {
            console.error('Chat module: Some DOM elements not found');
            return false;
        }
        return true;
    }

    // 設定輸入狀態
    function setInputState(disabled) {
        isInputDisabled = disabled;
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
        uploadImage.disabled = disabled;
    }

    // 圖片上傳處理
    function initializeImageUpload() {
        uploadImage.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreviewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="圖片預覽">
                        <div class="delete-button" onclick="chatModule.clearImage()">x</div>
                    `;
                    imagePreviewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 清除圖片
    function clearImage() {
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.style.display = 'none';
        uploadImage.value = '';
    }

    // 初始化事件監聽器
    function initializeEventListeners() {
        // 聊天發送按鈕
        sendButton.addEventListener('click', handleSendMessage);

        // 其他按鈕事件
        translateButton.addEventListener("click", handleTranslateMode);
        returnToChatButton.addEventListener("click", handleReturnToChat);
        studyPlanButton.addEventListener('click', startStudyPlan);
        generateNotesButton.addEventListener('click', generateNotes);

        // Enter 鍵發送訊息
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // 初始化圖片上傳
        initializeImageUpload();
    }

    // 處理發送訊息
    async function handleSendMessage() {
        if (isInputDisabled) return;
        const message = userInput.value.trim();
        if (!message && !uploadImage.files.length) return;

        try {
            if (uploadImage.files && uploadImage.files[0]) {
                const file = uploadImage.files[0];
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const selectedImageBase64 = e.target.result;
                    appendMessage('（圖片已傳送）', 'user-message');
                    window.thread.push({
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
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('發送訊息時發生錯誤，請稍後再試。', 'bot-message');
        }
    }

    // 處理文字訊息
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
            window.thread.push({
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
                botReply = await fetchBotReply(window.thread);
            }
            hideLoadingIndicator();
            appendMessage(botReply, 'bot-message');
            window.thread.push({
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

    // 獲取機器人回覆
    async function fetchBotReply(thread) {
        const systemMessage = {
            role: 'user',
            parts: [{ text: '請以繁體中文回答，不得使用簡體字。' }]
        };

        const newThread = [systemMessage, ...thread];

        const response = await fetch(window.geminiurl, {
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
            const response = await fetch(window.geminiurl, {
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

    // 處理翻譯模式
    function handleTranslateMode() {
        translationMode = true;
        returnToChatButton.style.display = "inline-block";
        translateButton.style.display = "none";
        setInputState(false);
        appendMessage("請輸入想查的中文或英文", "bot-message");
    }

    // 處理返回聊天
    function handleReturnToChat() {
        translationMode = false;
        returnToChatButton.style.display = "none";
        translateButton.style.display = "inline-block";
        setInputState(false);
        appendMessage("已返回聊天模式。", "bot-message");
    }

    // 生成筆記
    async function generateNotes() {
        if (!loginModule.requireLogin()) {
            return;
        }

        if (window.thread.length === 0) {
            alert('目前無聊天記錄，無法生成筆記。');
            return;
        }

        const username = loginModule.getCurrentUsername();

        // 獲取聊天記錄 (去除系統訊息)
        const chatLog = window.thread
            .filter(msg => msg.role !== 'system')
            .map(entry => `${entry.role}: ${entry.parts[0].text}`)
            .join('\n');

        // 顯示載入指示器
        appendMessage('正在生成筆記...', 'bot-message');

        try {
            // 生成摘要
            const summaryResponse = await fetch(window.geminiurl, {
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
            await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(result => {
                        removeLastBotMessage();
                        if (result && result.status === 'success') {
                            appendMessage('筆記生成成功！已儲存至 Google 試算表。\n您可以在「我的筆記」中查看所有筆記。', 'bot-message');
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

    // 移除最後一條機器人訊息
    function removeLastBotMessage() {
        const messages = chatWindow.querySelectorAll('.bot-message');
        if (messages.length > 0) {
            chatWindow.removeChild(messages[messages.length - 1]);
        }
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

// 初始化函數
    function init() {
        console.log('Initializing chat module...');
        
        // 初始化 DOM 元素
        if (!initializeElements()) {
            console.error('Failed to initialize DOM elements');
            return;
        }

        // 初始化事件監聽器
        initializeEventListeners();

        // 初始化 thread
        window.thread = [];

        // 顯示歡迎訊息
        const greeting = getGreeting();
        appendMessage(`${greeting} 今天想要討論什麼呢？`, 'bot-message');
        
        // 設定輸入狀態
        setInputState(false);

        console.log('Chat module initialized successfully');
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

    // 處理自主學習計畫的選項選擇
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

    // 公開 API
    return {
        init,
        clearImage,
        appendMessage,
        startStudyPlan,
        generateNotes,
        setInputState,
        removeLastBotMessage
    };
})();

// DOM 載入完成後初始化聊天模組
document.addEventListener('DOMContentLoaded', () => {
    chatModule.init();
});
