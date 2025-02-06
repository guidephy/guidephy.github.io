let thread = []; // 儲存聊天記錄
        let translationMode = false; // 新增翻譯模式變數

        document.addEventListener('DOMContentLoaded', () => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menu-toggle');
            const openAIGenerator = document.getElementById('open-ai-generator');
            const openSolveProblem = document.getElementById('open-solve-problem'); 
            const openPhysicsLecture = document.getElementById('open-physics-lecture'); 
            const openCalculator = document.getElementById('open-calculator');
            const openTomato = document.getElementById('open-tomato');
            const returnChat = document.getElementById('return-chat');
            const chatWindow = document.getElementById('chat-window');
            const aiGeneratorContent = document.getElementById('ai-generator-content');
            const solveProblemContent = document.getElementById('solve-problem-content');
            const physicsLectureContent = document.getElementById('physics-lecture-content');
            const calculatorContent = document.getElementById('calculator-content');
            const tomatoContent = document.getElementById('tomato-content');
            const uploadImage = document.getElementById('upload-image');
            const imagePreviewContainer = document.getElementById('image-preview-container');
            const sendButton = document.getElementById('send-button');
            const userInput = document.getElementById('user-input');
            const overlay = document.getElementById('overlay');
            const translateButton = document.getElementById('translate-button'); 
            const returnToChatButton = document.getElementById('return-to-chat-button');

            const toolbar = document.getElementById('toolbar');


            // AI素養題產生器 Tab 切換
            const customTopicTab = document.getElementById('customTopicTab');
            const chatTopicTab = document.getElementById('chatTopicTab');
            const questionTopicTab = document.getElementById('questionTopicTab');

            const customTopicContent = document.getElementById('customTopicContent');
            const chatTopicContent = document.getElementById('chatTopicContent');
            const questionTopicContent = document.getElementById('questionTopicContent');

            customTopicTab.addEventListener('click', () => {
                customTopicTab.classList.add('active');
                chatTopicTab.classList.remove('active');
                questionTopicTab.classList.remove('active');
                customTopicContent.classList.add('active');
                chatTopicContent.classList.remove('active');
                questionTopicContent.classList.remove('active');
                document.getElementById('mainGenerateGroup').style.display = 'flex';
                document.getElementById('quizForm').style.display = 'none';
            });

            chatTopicTab.addEventListener('click', () => {
                chatTopicTab.classList.add('active');
                customTopicTab.classList.remove('active');
                questionTopicTab.classList.remove('active');
                chatTopicContent.classList.add('active');
                customTopicContent.classList.remove('active');
                questionTopicContent.classList.remove('active');
                document.getElementById('mainGenerateGroup').style.display = 'flex';
                document.getElementById('quizForm').style.display = 'none';
            });

            questionTopicTab.addEventListener('click', () => {
                questionTopicTab.classList.add('active');
                customTopicTab.classList.remove('active');
                chatTopicTab.classList.remove('active');
                questionTopicContent.classList.add('active');
                customTopicContent.classList.remove('active');
                chatTopicContent.classList.remove('active');
                document.getElementById('mainGenerateGroup').style.display = 'none';
                document.getElementById('quizForm').style.display = 'none';
            });

            // 以題出題的 Tab 切換
            const imageQTab = document.getElementById('imageQTab');
            const textQTab = document.getElementById('textQTab');
            const imageQContent = document.getElementById('imageQContent');
            const textQContent = document.getElementById('textQContent');

            imageQTab.addEventListener('click', () => {
                imageQTab.classList.add('active');
                textQTab.classList.remove('active');
                imageQContent.classList.add('active');
                textQContent.classList.remove('active');
            });

            textQTab.addEventListener('click', () => {
                textQTab.classList.add('active');
                imageQTab.classList.remove('active');
                textQContent.classList.add('active');
                imageQContent.classList.remove('active');
            });



            // 初始化狀態
            chatWindow.style.display = 'flex';
            aiGeneratorContent.style.display = 'none';
            solveProblemContent.style.display = 'none';
            physicsLectureContent.style.display = 'none';
            calculatorContent.style.display = 'none';
            tomatoContent.style.display = 'none';
            returnChat.classList.add('hidden');

            // 中英翻譯模式
            translateButton.addEventListener("click", () => {
                translationMode = true;
                returnToChatButton.style.display = "inline-block";
                translateButton.style.display = "none";
                appendMessage("請輸入想查的中文或英文", "bot-message");
            });

            returnToChatButton.addEventListener("click", () => {
                translationMode = false;
                returnToChatButton.style.display = "none";
                translateButton.style.display = "inline-block";
                appendMessage("已返回聊天模式。", "bot-message");
            });

            // 側邊欄控制
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('show');
                overlay.classList.toggle('show'); 
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            document.addEventListener('click', (event) => {
                if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                }
            });

            openAIGenerator.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                aiGeneratorContent.style.display = 'block';
                solveProblemContent.style.display = 'none';
                physicsLectureContent.style.display = 'none';
                calculatorContent.style.display = 'none';
                tomatoContent.style.display = 'none';
                toolbar.style.display = 'none';
                returnChat.classList.remove('hidden');
                openAIGenerator.classList.add('hidden');
                openSolveProblem.classList.add('hidden');
                openPhysicsLecture.classList.add('hidden');
                openCalculator.classList.add('hidden');
                openTomato.classList.add('hidden');
                document.querySelector('.input-area').style.display = 'none';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            openSolveProblem.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                aiGeneratorContent.style.display = 'none';
                solveProblemContent.style.display = 'block';
                physicsLectureContent.style.display = 'none';
                calculatorContent.style.display = 'none';
                tomatoContent.style.display = 'none';
                toolbar.style.display = 'none';
                returnChat.classList.remove('hidden');
                openAIGenerator.classList.add('hidden');
                openSolveProblem.classList.add('hidden');
                openPhysicsLecture.classList.add('hidden');
                openCalculator.classList.add('hidden');
                openTomato.classList.add('hidden');
                document.querySelector('.input-area').style.display = 'none';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            openPhysicsLecture.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                aiGeneratorContent.style.display = 'none';
                solveProblemContent.style.display = 'none';
                toolbar.style.display = 'none';
                physicsLectureContent.style.display = 'block';
                calculatorContent.style.display = 'none';
                tomatoContent.style.display = 'none';
                returnChat.classList.remove('hidden');
                openAIGenerator.classList.add('hidden');
                openSolveProblem.classList.add('hidden');
                openPhysicsLecture.classList.add('hidden');
                openCalculator.classList.add('hidden');
                openTomato.classList.add('hidden');
                document.querySelector('.input-area').style.display = 'none';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });
            
            openCalculator.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                aiGeneratorContent.style.display = 'none';
                solveProblemContent.style.display = 'none';
                physicsLectureContent.style.display = 'none';
                tomatoContent.style.display = 'none';
                calculatorContent.style.display = 'block';
                toolbar.style.display = 'none';
                returnChat.classList.remove('hidden');
                openAIGenerator.classList.add('hidden');
                openSolveProblem.classList.add('hidden');
                openPhysicsLecture.classList.add('hidden');
                openCalculator.classList.add('hidden');
                openTomato.classList.add('hidden');
                document.querySelector('.input-area').style.display = 'none';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });
            
            openTomato.addEventListener('click', () => {
                chatWindow.style.display = 'none';
                aiGeneratorContent.style.display = 'none';
                solveProblemContent.style.display = 'none';
                physicsLectureContent.style.display = 'none';
                calculatorContent.style.display = 'none';
                tomatoContent.style.display = 'block';
                toolbar.style.display = 'none';
                returnChat.classList.remove('hidden');
                openAIGenerator.classList.add('hidden');
                openSolveProblem.classList.add('hidden');
                openPhysicsLecture.classList.add('hidden');
                openCalculator.classList.add('hidden');
                openTomato.classList.add('hidden');
                document.querySelector('.input-area').style.display = 'none';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            returnChat.addEventListener('click', () => {
                chatWindow.style.display = 'flex';
                aiGeneratorContent.style.display = 'none';
                solveProblemContent.style.display = 'none';
                physicsLectureContent.style.display = 'none';
                calculatorContent.style.display = 'none';
                tomatoContent.style.display = 'none';
                toolbar.style.display = 'block';
                returnChat.classList.add('hidden');
                openAIGenerator.classList.remove('hidden');
                openSolveProblem.classList.remove('hidden');
                openPhysicsLecture.classList.remove('hidden');
                openCalculator.classList.remove('hidden');
                openTomato.classList.remove('hidden');
                document.querySelector('.input-area').style.display = 'flex';
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
            });

            // 圖片上傳（聊天）
            uploadImage.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const selectedImage = e.target.result;
                        imagePreviewContainer.innerHTML = `
                            <img src="${selectedImage}" alt="圖片預覽">
                            <div class="delete-button" onclick="clearImage()">x</div>
                        `;
                        imagePreviewContainer.style.display = "flex";
                    };
                    reader.readAsDataURL(file);
                } else {
                    imagePreviewContainer.style.display = "none";
                }
            });

            window.clearImage = function () {
                imagePreviewContainer.innerHTML = "";
                imagePreviewContainer.style.display = "none";
                uploadImage.value = "";
            };

            // 聊天發送
            sendButton.addEventListener("click", async () => {
                const message = userInput.value.trim();
                if (!message && !uploadImage.value) return;

                if (uploadImage.files && uploadImage.files[0]) {
                    const file = uploadImage.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const selectedImageBase64 = e.target.result;
                        appendMessage("（圖片已傳送）", "user-message");
                        thread.push({
                            role: "user",
                            parts: [{ text: "圖片訊息", image: selectedImageBase64 }],
                        });
                        clearImage();
                        await handleUserTextMessage(message);
                    };
                    reader.readAsDataURL(file);
                } else {
                    await handleUserTextMessage(message);
                }
            });

            async function handleUserTextMessage(message) {
                if (message) {
                    appendMessage(message, "user-message");
                    thread.push({
                        role: "user",
                        parts: [{ text: message }],
                    });
                }

                userInput.value = "";
                showLoadingIndicator();

                try {
                    let botReply;
                    if (translationMode) {
                        botReply = await fetchTranslation(message);
                    } else {
                        botReply = await fetchBotReply(thread);
                    }
                    hideLoadingIndicator();
                    appendMessage(botReply, "bot-message");
                    thread.push({
                        role: "model",
                        parts: [{ text: botReply }],
                    });
                } catch (error) {
                    hideLoadingIndicator();
                    appendMessage(`錯誤：${error.message}`, "bot-message");
                }
            }

            function showLoadingIndicator() {
                const existingIndicator = document.getElementById("loading-indicator");
                if (existingIndicator) {
                    existingIndicator.remove();
                }
                const loadingIndicator = document.createElement("div");
                loadingIndicator.id = "loading-indicator";
                loadingIndicator.textContent = "正在思考中...";
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
                    behavior: "smooth",
                });
            }

            function hideLoadingIndicator() {
                const loadingIndicator = document.getElementById("loading-indicator");
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
            }

            async function fetchBotReply(thread) {
                const systemMessage = {
                   role: "user",
                   parts: [{ text: "請以繁體中文回答，不得使用簡體字。"}]
                };

                const newThread = [systemMessage, ...thread];

                const response = await fetch(geminiurl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: newThread,
                    }),
                });
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    return data.candidates[0].content.parts[0].text || "未能獲取有效回應";
                } else {
                    return "未能獲取有效回應";
                }
            }

            function determineTextType(inputText) {
                const hasChinese = /[\u4E00-\u9FFF]/.test(inputText);
                const words = inputText.trim().split(/\s+/);
                if (hasChinese) {
                    if (words.length < 5) {
                        return "chinese_word"; 
                    } else {
                        return "paragraph"; 
                    }
                } else {
                    if (words.length <= 2) {
                        return "english_word"; 
                    } else {
                        return "paragraph"; 
                    }
                }
            }

            async function fetchTranslation(inputText) {
                let prompt = `請以繁體中文回答，不得使用簡體字。`;

                prompt += `
現在你是中英翻譯助理。根據使用者輸入的內容進行如下處理：

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

請確保輸出簡潔、清晰，並保持條例清晰易讀。
`;

                const response = await fetch(geminiurl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    }),
                });

                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    return "未能獲取有效回應";
                }

                if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    return "未能獲取有效回應";
                }
            }

            function formatText(text) {
                let formatted = text;
                formatted = formatted.replace(/\n/g, '<br>');
                formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                formatted = formatted.replace(/\*\*/g, '');
                return formatted;
            }

            function appendMessage(content, className) {
                const message = document.createElement("div");
                message.classList.add("message", className);
                const formattedContent = formatText(content); 
                const text = document.createElement("span");
                text.innerHTML = formattedContent;
                message.appendChild(text);
                chatWindow.appendChild(message);

                setTimeout(() => {
                    chatWindow.scrollTo({
                        top: chatWindow.scrollHeight,
                        behavior: "smooth",
                    });
                }, 100);
            }

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
