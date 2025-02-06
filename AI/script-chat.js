// script-chat.js (聊天功能)

const chatModule = (() => {
    // 獲取 DOM 元素
    const uploadImage = document.getElementById('upload-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');



    // 圖片上傳（聊天）
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
    };


    // 聊天發送
    sendButton.addEventListener('click', async () => {
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

    // 處理使用者文字訊息
    async function handleUserTextMessage(message) {
        if (message) {
            appendMessage(message, 'user-message');
            thread.push({
                role: 'user',
                parts: [{ text: message }],
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
                parts: [{ text: botReply }],
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
            existingIndicator.remove(); //如果指示器存在，則先移除
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

        // 自動滾動到最底部
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth',
        });
    }

    // 隱藏載入指示器
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove(); //如果指示器存在，則移除
        }
    }

    // 獲取機器人回覆
    async function fetchBotReply(thread) {
        // 系統訊息：請 AI 以繁體中文回答，不得使用簡體字
        const systemMessage = {
            role: 'user',
            parts: [{ text: '請以繁體中文回答，不得使用簡體字。' }],
        };

        const newThread = [systemMessage, ...thread];

        const response = await fetch(geminiurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: newThread, // 將系統訊息和對話紀錄一起發送
            }),
        });
        const data = await response.json();
        // 檢查回應中是否有 candidates，且 candidates 陣列長度大於 0
        if (data.candidates && data.candidates.length > 0) {
          // 嘗試取得第一個 candidate 的 content 中的 text
          // 如果 text 不存在，則回傳一個預設訊息
            return data.candidates[0].content.parts[0].text || '未能獲取有效回應';
        } else {
            return '未能獲取有效回應'; // 如果沒有 candidates 或陣列為空，回傳錯誤訊息
        }
    }

   // 判斷文字類型：中文短語、英文單字、句子、段落
   function determineTextType(inputText) {
       const hasChinese = /[\u4E00-\u9FFF]/.test(inputText); // 檢查是否包含中文字符
       const words = inputText.trim().split(/\s+/); // 將輸入文字以空格分割成單詞陣列

        if (hasChinese) {
            if (words.length < 5) {
                return "chinese_word"; // 如果包含中文且單詞數量少於 5，則為中文短語
            } else {
                return "paragraph"; // 否則為段落
            }
        } else {
            if (words.length <= 2) {
                return "english_word"; // 如果不包含中文且單詞數量不超過 2，則為英文單字
            } else {
                return "paragraph"; // 否則為段落
            }
        }
    }


    // 獲取翻譯
    async function fetchTranslation(inputText) {
        let prompt = `請以繁體中文回答，不得使用簡體字。`; // 系統提示，要求 AI 使用繁體中文

        prompt +=`現在你是中英翻譯助理。根據使用者輸入的內容進行如下處理：

1. 如果輸入為中文短語或單詞：
   - 請提供該中文的對應英文翻譯。
   - 列出該英文翻譯所有可能的詞性。
   - 對於每個詞性，詳細列出該詞性的所有可能解釋。
   - 為每個解釋提供一個單獨的英文例句，並附上該例句的中文翻譯（中文翻譯:...在英文例句的下一行顯示，並在每個解釋之間增加空行）。

   格式：
   英文翻譯：...
   詞性與解釋：
     - 詞性1：
       1. 解釋1：...
          英文例句：...
          中文翻譯：...
       
       2. 解釋2：...
          英文例句：...
          中文翻譯：...
       
     - 詞性2：
       1. 解釋1：...
          英文例句：...
          中文翻譯：...
       
   輸入: ${inputText}

2. 如果輸入為英文單詞：
   - 請提供該英文的中文翻譯。
   - 列出該單詞所有可能的詞性。
   - 對於每個詞性，詳細列出該詞性的所有可能解釋。
   - 為每個解釋提供一個單獨的英文例句，並附上該例句的中文翻譯（中文翻譯:...在英文例句的下一行顯示，並在每個解釋之間增加空行）。

   格式：
   中文翻譯：...
   詞性與解釋：
     - 詞性1：
       1. 解釋1：...
          英文例句：...
          中文翻譯：...
       
       2. 解釋2：...
          英文例句：...
          中文翻譯：...
       
     - 詞性2：
       1. 解釋1：...
          英文例句：...
          中文翻譯：...
       
   輸入: ${inputText}

3. 如果輸入為中文或英文句子：
   - 將其翻譯為對應的另一種語言（英文或中文）。
   - 提供翻譯後的每個句子的文法結構與用途說明（如時態、語態）。

   格式：
   翻譯結果：...
   文法說明：...

4. 如果輸入為一段較長的文章：
   - 將其翻譯為對應的另一種語言（英文或中文）。
   - 提供整段文章的文法重點和寫作風格分析。

   格式：
   翻譯結果：...
   文法重點：...
   寫作風格分析：...

請確保輸出簡潔、清晰，並保持條例清晰易讀。`;


        const response = await fetch(geminiurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }], // 使用 prompt 作為請求內容
            }),
        });

        let data;
        try {
            data = await response.json(); // 嘗試解析回應為 JSON
        } catch (e) {
            return '未能獲取有效回應'; // 如果解析失敗，則回傳錯誤訊息
        }

        // 檢查 data 是否有效，以及 candidates 陣列和其中的 text 是否存在
        if (
            data &&
            data.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0].text
        ) {
            return data.candidates[0].content.parts[0].text; // 如果一切正常，返回翻譯結果
        } else {
            return '未能獲取有效回應'; // 如果任何檢查失敗，回傳錯誤訊息
        }
    }

    // 添加訊息到聊天視窗
    function appendMessage(content, className) {
        const message = document.createElement('div');
        message.classList.add('message', className);
        const formattedContent = formatText(content); // 使用 formatText 函數格式化內容
        const text = document.createElement('span');
        text.innerHTML = formattedContent; // 設定 innerHTML，允許 HTML 標籤生效
        message.appendChild(text);
        chatWindow.appendChild(message);

        // 延遲滾動，確保內容加載完成
        setTimeout(() => {
            chatWindow.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: 'smooth',
            });
        }, 100);
    }

     // 取得現在時間給予的問候語
    function getGreeting() {
        const now = new Date();
        const hour = now.getHours();

        if (hour > 6 && hour < 12) {
            return '早安！';
        } else if (hour >= 12 && hour < 14) {
            return '午安！';
        } else {
            return 'Hello！';
        }
    }
    const greeting = getGreeting();
    appendMessage(`${greeting} 今天想要討論什麼呢？`, 'bot-message');
    
    // 暴露需要外部訪問的函數
    return {
        clearImage,
        appendMessage
    };   
})();