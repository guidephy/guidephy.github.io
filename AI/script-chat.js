// script-chat.js (聊天功能)

const chatModule = (() => {
    // 獲取 DOM 元素 (與之前相同)
    const uploadImage = document.getElementById('upload-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const studyPlanButton = document.getElementById('study-plan-button');


    // 圖片上傳、清除圖片、聊天發送、處理使用者文字訊息、顯示/隱藏載入指示器、獲取機器人回覆、判斷文字類型、獲取翻譯、添加訊息到聊天視窗、取得現在時間給予的問候語 (這些函數都與之前相同，不做更動)
      // 圖片上傳（聊天）
    uploadImage.addEventListener('change', (event) => {
        // ... (與之前相同)
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
         // ... (與之前相同)
        imagePreviewContainer.innerHTML = '';
        imagePreviewContainer.style.display = 'none';
        uploadImage.value = '';
    };


    // 聊天發送
    sendButton.addEventListener('click', async () => {
        // ... (與之前相同)
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
         // ... (與之前相同)
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
         // ... (與之前相同)
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
         // ... (與之前相同)
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove(); //如果指示器存在，則移除
        }
    }

    // 獲取機器人回覆
    async function fetchBotReply(thread) {
         // ... (與之前相同)
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
       // ... (與之前相同)
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
        // ... (與之前相同)
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
         // ... (與之前相同)
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
         // ... (與之前相同)
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

    // --- 自主學習計畫相關程式碼 (大幅修改) ---

    let studyPlanStep = 0;
    let studyPlanData = {};
    let hasIdea = null; // 新增：追蹤使用者是否有想法

    studyPlanButton.addEventListener('click', () => {
        startStudyPlan();
    });

    async function startStudyPlan() {
        studyPlanStep = 1;
        studyPlanData = {};
        hasIdea = null; // 重置
        appendMessage("好的，我們開始規劃你的自主學習計畫！首先，請問你對學習主題是否已經有初步的想法？", "bot-message");

        // 建立選項按鈕
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message-options';
        const optionYes = createOptionButton('已有想法', () => handleIdeaSelection(true));
        const optionNo = createOptionButton('完全沒想法', () => handleIdeaSelection(false));
        optionsDiv.appendChild(optionYes);
        optionsDiv.appendChild(optionNo);
        chatWindow.appendChild(optionsDiv);
          // 自動滾動到最底部
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth',
        });
    }
    // 建立選項按鈕的函數
    function createOptionButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'option-button'; // 新增樣式
        button.addEventListener('click', () => {
            clickHandler();
            // 移除所有選項按鈕 (點擊後消失)
            const options = document.querySelectorAll('.message-options');
            options.forEach(option => option.remove());

        });
        return button;
    }

    // 處理使用者選擇「已有想法」或「完全沒想法」
    function handleIdeaSelection(idea) {
        hasIdea = idea;
        if (idea) {
            studyPlanStep = 2; // 直接進入主題確認
            appendMessage("太好了！請告訴我你感興趣的學習主題或科目。", "bot-message");
        } else {
            studyPlanStep = 'A1'; // 進入「完全沒想法」的引導流程
            appendMessage("沒關係，我們一起來探索！首先，你平常對哪些事物比較感興趣？（例如：運動、音樂、科技、歷史...）", "bot-message");
        }
    }

    // 處理自主學習計畫的輸入 (根據不同步驟)
    async function handleStudyPlanInput(message) {
        appendMessage(message, 'user-message'); // 顯示使用者的訊息。  所有地方都先顯示

        if (hasIdea === false && studyPlanStep.startsWith('A')) {
            // 「完全沒想法」的引導流程
            switch (studyPlanStep) {
                case 'A1':
                    studyPlanData.interests = message;
                    studyPlanStep = 'A2';
                    appendMessage(`瞭解了，你對 ${message} 感興趣。在這些興趣中，有沒有哪個領域是你特別想深入了解的？`, "bot-message");
                    break;
                case 'A2':
                    studyPlanData.field = message;
                    studyPlanStep = 'A3';
                    appendMessage(`很好！在 ${message} 這個領域中，有沒有哪個特定的主題或概念是你覺得特別有趣的？`, "bot-message");
                    break;
                case 'A3':
                    studyPlanData.topic = message;
                    studyPlanStep = 'A4';
                    appendMessage(`不錯喔！那麼關於 ${message}，你有沒有想要進一步探索或研究的方向？`, "bot-message");
                    break;
                case 'A4':
                    studyPlanData.direction = message;
                    studyPlanStep = 2; // 過渡到「已有想法」的流程
                    appendMessage(`太棒了！看來你對自主學習已經有一些想法了。我們現在來進一步確認你的專題題目。根據你目前的想法，你希望你的專題題目是什麼？`, "bot-message");
                    break;
            }
        } else {
            // 「已有想法」或過渡後的流程
            switch (studyPlanStep) {
                case 2:
                    studyPlanData.subject = message;
                    studyPlanStep = 3;
                    appendMessage(`瞭解了，你想以 ${message} 作為自主學習題目。你對 ${message} 目前的理解程度如何？（例如：完全不了解、稍微知道一些、已經有基礎）`, "bot-message");
                    break;
                case 3:
                    studyPlanData.level = message;
                    studyPlanStep = 4;
                    appendMessage(`明白了。最後，你有沒有特別想在哪個時間點達成什麼學習目標？（例如：學期結束前掌握基本概念、三個月後能夠獨立解題）`, "bot-message");
                    break;
                case 4:
                    studyPlanData.goal = message;
                    studyPlanStep = 0; // 重置步驟
                    hasIdea = null; // 重置
                    const plan = await generateStudyPlan(studyPlanData);
                    appendMessage(plan, "bot-message");
                     // 清空先前的對話，只保留學習計畫
                    thread = [{ role: 'model', parts: [{ text: plan }] }];
                    break;
            }
        }
    }


    // 生成學習計畫 (向 Gemini API 發送請求)
    async function generateStudyPlan(data) {
         // ... (與之前相同, prompt 內容不變)
        showLoadingIndicator();
        const prompt = `請以繁體中文回答，不得使用簡體字。
請扮演一位具有豐富教學經驗的老師，為學生制定一份為期18週的自主學習計畫。

學生提供的資訊如下：
* 學習主題/科目：${data.subject}
* 目前理解程度：${data.level}
* 學習目標：${data.goal}

請根據這些資訊，設計一份詳細的學習計畫，包含：
1. **每週的學習主題**：清楚列出每週要學習的具體內容。
2. **學習活動建議**：提供多樣化的學習活動（例如：閱讀教材、觀看影片、做練習題、實作 প্রকল্প、小考）。
3. **學習資源**：推薦相關的學習資源（例如：教科書章節、網站、影片）。
4. **進度評估方式**：建議學生如何評估自己的學習進度（例如：每週自我測驗、與朋友討論）。
5. 總體學習目標回顧: 計畫最後再次強調整體18週的學習目標。

請以條列式、清晰易懂的方式呈現學習計畫，並在適當的地方加入鼓勵的話語。
`;

        try {
            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });
            const responseData = await response.json();
            hideLoadingIndicator();
            return getNestedValue(responseData, 'text') || '無法生成學習計畫，請再試一次。';

        } catch (error) {
            hideLoadingIndicator();
            return `生成學習計畫時發生錯誤：${error.message}`;
        }
    }
// 從巢狀物件中取得指定鍵的值
    function getNestedValue(data, key) {
        // 如果 data 是物件且不為 null
        if (typeof data === 'object' && data !== null) {
             for (const [k, v] of Object.entries(data)) {  // 遍歷物件的鍵值對
                if (k === key) return v; // 如果找到指定的鍵，則返回對應的值
                 const nestedValue = getNestedValue(v, key); // 遞迴尋找巢狀物件
                if (nestedValue) return nestedValue;  // 如果找到值，則返回
            }
        }
        return null; // 如果找不到指定的鍵，則返回 null
    }
    // 覆寫 handleUserTextMessage，加入自主學習計畫的處理
    async function handleUserTextMessage(message) {
        if (studyPlanStep > 0) {
            // appendMessage(message, 'user-message'); // 顯示使用者訊息, 統一在 handleStudyPlanInput 處理
            await handleStudyPlanInput(message);
            return;
        }

        // ... (其他部分與之前相同)
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

      // 新增：startStudyPlan 函數 (供外部呼叫)
    function startStudyPlanFn() {
        startStudyPlan();
    }

    // 暴露需要外部訪問的函數
    return {
        clearImage,
        appendMessage,
        startStudyPlan: startStudyPlanFn // 暴露 startStudyPlan
    };
})();
