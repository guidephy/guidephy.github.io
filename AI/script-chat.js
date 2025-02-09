// script-chat.js (聊天功能)
const chatModule = (() => {
    // DOM 元素
    let elements = {
        uploadImage: null,
        imagePreviewContainer: null,
        sendButton: null,
        userInput: null,
        chatWindow: null,
        studyPlanButton: null,
        translateButton: null,
        returnToChatButton: null,
        generateNotesButton: null
    };

    // 模組狀態
    let state = {
        isStudyPlanActive: false,
        studyPlanStep: 0,
        studyPlanData: {},
        hasIdea: null
    };

    // 初始化 DOM 元素
    function initializeElements() {
        elements = {
            uploadImage: document.getElementById('upload-image'),
            imagePreviewContainer: document.getElementById('image-preview-container'),
            sendButton: document.getElementById('send-button'),
            userInput: document.getElementById('user-input'),
            chatWindow: document.getElementById('chat-window'),
            studyPlanButton: document.getElementById('study-plan-button'),
            translateButton: document.getElementById('translate-button'),
            returnToChatButton: document.getElementById('return-to-chat-button'),
            generateNotesButton: document.getElementById('generate-notes-button')
        };

        // 驗證必要元素是否存在
        const requiredElements = ['uploadImage', 'sendButton', 'userInput', 'chatWindow'];
        const missingElements = requiredElements.filter(elem => !elements[elem]);
        
        if (missingElements.length > 0) {
            console.error('缺少必要的DOM元素:', missingElements.join(', '));
            return false;
        }
        
        return true;
    }

    // 初始化事件監聽器
    function initializeEventListeners() {
        // 圖片上傳
        elements.uploadImage.addEventListener('change', handleImageUpload);
        
        // 發送訊息
        elements.sendButton.addEventListener('click', handleSendMessage);
        elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // 功能按鈕
        elements.translateButton.addEventListener('click', handleTranslateMode);
        elements.returnToChatButton.addEventListener('click', handleReturnToChat);
        elements.studyPlanButton.addEventListener('click', handleStudyPlan);
        elements.generateNotesButton.addEventListener('click', handleGenerateNotes);
    }

    // 處理圖片上傳
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                elements.imagePreviewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="圖片預覽">
                    <div class="delete-button" onclick="chatModule.clearImage()">x</div>
                `;
                elements.imagePreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    }

    // 清除圖片
    function clearImage() {
        elements.imagePreviewContainer.innerHTML = '';
        elements.imagePreviewContainer.style.display = 'none';
        elements.uploadImage.value = '';
    }

    // 處理發送訊息
    async function handleSendMessage() {
        if (window.APP.isInputDisabled) return;
        
        const message = elements.userInput.value.trim();
        if (!message && !elements.uploadImage.files.length) return;

        try {
            if (elements.uploadImage.files.length > 0) {
                await handleImageMessage(message);
            } else {
                await handleTextMessage(message);
            }
        } catch (error) {
            console.error('發送訊息時發生錯誤:', error);
            appendMessage('發送訊息時發生錯誤，請稍後再試。', 'bot-message');
        }
    }

    // 處理圖片訊息
    async function handleImageMessage(message) {
        const file = elements.uploadImage.files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const imageBase64 = e.target.result;
            appendMessage('（圖片已傳送）', 'user-message');
            window.APP.thread.push({
                role: 'user',
                parts: [{ text: message || '圖片訊息', image: imageBase64 }]
            });
            
            clearImage();
            if (message) {
                await handleTextMessage(message, true);
            } else {
                await getBotResponse();
            }
        };
        
        reader.readAsDataURL(file);
    }

    // 處理文字訊息
    async function handleTextMessage(message, skipUserMessage = false) {
        if (!skipUserMessage) {
            appendMessage(message, 'user-message');
            window.APP.thread.push({
                role: 'user',
                parts: [{ text: message }]
            });
        }

        elements.userInput.value = '';
        await getBotResponse();
    }

    // 獲取機器人回應
    async function getBotResponse() {
        showLoadingIndicator();
        try {
            let botReply;
            if (window.APP.translationMode) {
                botReply = await fetchTranslation(window.APP.thread[window.APP.thread.length - 1].parts[0].text);
            } else {
                botReply = await fetchBotReply();
            }
            
            hideLoadingIndicator();
            appendMessage(botReply, 'bot-message');
            window.APP.thread.push({
                role: 'model',
                parts: [{ text: botReply }]
            });
        } catch (error) {
            hideLoadingIndicator();
            appendMessage('無法取得回應，請稍後再試。', 'bot-message');
            console.error('獲取回應時發生錯誤:', error);
        }
    }

    // 發送API請求獲取回應
    async function fetchBotReply() {
        const systemMessage = {
            role: 'user',
            parts: [{ text: '請以繁體中文回答，不得使用簡體字。' }]
        };

        const response = await fetch(window.APP.geminiurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [systemMessage, ...window.APP.thread]
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '無法獲取回應';
    }

    // 取得翻譯
    async function fetchTranslation(text) {
        if (!text) return '請輸入要翻譯的內容';

        const prompt = `請以繁體中文回答。你現在是一位專業的英語教師，請依照以下格式提供翻譯和學習資訊：...`;
        
        const response = await fetch(window.APP.geminiurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt + text }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '翻譯失敗，請重試';
    }

    // 顯示載入指示器
    function showLoadingIndicator() {
        const existingIndicator = document.getElementById('loading-indicator');
        if (existingIndicator) existingIndicator.remove();

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
        
        elements.chatWindow.appendChild(loadingIndicator);
        scrollToBottom();
    }

    // 隱藏載入指示器
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) loadingIndicator.remove();
    }

    // 添加訊息到聊天視窗
    function appendMessage(content, className) {
        const message = document.createElement('div');
        message.classList.add('message', className);
        
        const text = document.createElement('span');
        text.innerHTML = formatText(content);
        message.appendChild(text);
        
        elements.chatWindow.appendChild(message);
        scrollToBottom();
    }

    // 滾動到底部
    function scrollToBottom() {
        setTimeout(() => {
            elements.chatWindow.scrollTo({
                top: elements.chatWindow.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    // 處理翻譯模式
    function handleTranslateMode() {
        window.APP.translationMode = true;
        elements.returnToChatButton.style.display = 'inline-block';
        elements.translateButton.style.display = 'none';
        setInputState(false);
        appendMessage('請輸入想查的中文或英文', 'bot-message');
    }

    // 處理返回聊天
    function handleReturnToChat() {
        window.APP.translationMode = false;
        elements.returnToChatButton.style.display = 'none';
        elements.translateButton.style.display = 'inline-block';
        setInputState(false);
        appendMessage('已返回聊天模式。', 'bot-message');
    }

    // 設定輸入狀態
    function setInputState(disabled) {
        window.APP.isInputDisabled = disabled;
        elements.userInput.disabled = disabled;
        elements.sendButton.disabled = disabled;
        elements.uploadImage.disabled = disabled;
    }

    // 格式化文字
    function formatText(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\*/g, '');
    }

    // 取得問候語
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return '早安！';
        if (hour >= 12 && hour < 14) return '午安！';
        return 'Hello！';
    }

    // 生成筆記
    async function handleGenerateNotes() {
        if (!loginModule.requireLogin()) return;
        if (window.APP.thread.length === 0) {
            alert('目前無聊天記錄，無法生成筆記。');
            return;
        }

        const username = loginModule.getCurrentUsername();
        if (!username) {
            alert('無法獲取用戶名稱');
            return;
        }

        appendMessage('正在生成筆記...', 'bot-message');
        
        try {
            const chatLog = window.APP.thread
                .filter(msg => msg.role !== 'system')
                .map(entry => `${entry.role}: ${entry.parts[0].text}`)
                .join('\n');

            const summary = await generateSummary(chatLog);
            await saveNotesToServer(username, summary);
            
            removeLastBotMessage();
            appendMessage('筆記生成成功！已儲存至 Google 試算表。\n您可以在「我的筆記」中查看所有筆記。', 'bot-message');
        } catch (error) {
            removeLastBotMessage();
            appendMessage(`筆記生成失敗：${error.message}`, 'bot-message');
        }
    }

    // 生成摘要
    async function generateSummary(chatLog) {
        const response = await fetch(window.APP.geminiurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `請以繁體中文回答，不得使用簡體字。
                        請將以下對話內容做重點摘要，並以條列方式呈現主要討論內容和結論：
                        ${chatLog}`
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // 儲存筆記到伺服器
    async function saveNotesToServer(username, summary) {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
                .doPost({
                    username: username,
                    chatLog: summary
                });
        });
    }

    // 移除最後一條機器人訊息
    function removeLastBotMessage() {
        const messages = elements.chatWindow.querySelectorAll('.bot-message');
        if (messages.length > 0) {
            elements.chatWindow.removeChild(messages[messages.length - 1]);
        }
    }

    // 處理自主學習計畫
    function handleStudyPlan() {
        // 自主學習計畫相關功能實現
        // ... (此部分代碼保持不變)
    }

    // 初始化模組
    function init() {
        console.log('Initializing chat module...');
        
        if (!initializeElements()) {
            console.error('Failed to initialize chat module: Missing required elements');
            return;
        }

        initializeEventListeners();
        window.APP.thread = [];
        appendMessage(`${getGreeting()} 今天想要討論什麼呢？`, 'bot-message');
        setInputState(false);
        
        console.log('Chat module initialized successfully');
    }

    // 公開 API
    return {
        init,
        clearImage,
        appendMessage,
        setInputState,
        removeLastBotMessage
    };
})();

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    chatModule.init();
});
