// script-ai-generator.js (AI 素養題產生器)

const aiGeneratorModule = (() => {
    // DOM 元素參考
    let customTopicTab, chatTopicTab, questionTopicTab,
        customTopicContent, chatTopicContent, questionTopicContent,
        imageQTab, textQTab, imageQContent, textQContent,
        generateButton, quizForm, questionsDiv,
        gradeSelect, questionCountSelect, mainGenerateGroup,
        singleQuizForm, singleQuestionDiv, copyQContent,
        uploadQImage, imageQPreview, textQInput, generateFromQButton;

    let questions = [];      // 儲存產生的題目
    let singleQuestionData = null;  // 儲存以題出題

    // 初始化 DOM 元素
    function initializeDOMElements() {
        // 獲取所有必要的 DOM 元素
        customTopicTab = document.getElementById('customTopicTab');
        chatTopicTab = document.getElementById('chatTopicTab');
        questionTopicTab = document.getElementById('questionTopicTab');
        customTopicContent = document.getElementById('customTopicContent');
        chatTopicContent = document.getElementById('chatTopicContent');
        questionTopicContent = document.getElementById('questionTopicContent');
        imageQTab = document.getElementById('imageQTab');
        textQTab = document.getElementById('textQTab');
        imageQContent = document.getElementById('imageQContent');
        textQContent = document.getElementById('textQContent');
        generateButton = document.getElementById('generateButton');
        quizForm = document.getElementById('quizForm');
        questionsDiv = document.getElementById('questions');
        gradeSelect = document.getElementById('grade');
        questionCountSelect = document.getElementById('questionCount');
        mainGenerateGroup = document.getElementById('mainGenerateGroup');
        singleQuizForm = document.getElementById('singleQuizForm');
        singleQuestionDiv = document.getElementById('singleQuestion');
        copyQContent = document.getElementById('copyQContent');
        uploadQImage = document.getElementById('uploadQImage');
        imageQPreview = document.getElementById('imageQPreview');
        textQInput = document.getElementById('textQInput');
        generateFromQButton = document.getElementById('generateFromQButton');

        // 檢查必要元素是否存在
        const requiredElements = [
            { element: generateButton, name: 'generateButton' },
            { element: quizForm, name: 'quizForm' },
            { element: questionsDiv, name: 'questionsDiv' },
            { element: mainGenerateGroup, name: 'mainGenerateGroup' }
        ];

        const missingElements = requiredElements
            .filter(({ element, name }) => !element)
            .map(({ name }) => name);

        if (missingElements.length > 0) {
            console.error('找不到必要的 DOM 元素:', missingElements.join(', '));
            return false;
        }

        return true;
    }

    // 初始化選項
    function initOptions() {
        if (!gradeSelect || !questionCountSelect) {
            console.error('找不到年級或題數選擇元素');
            return;
        }

        // 清空現有選項
        gradeSelect.innerHTML = '<option value="">請選擇年級</option>';
        questionCountSelect.innerHTML = '<option value="">請選擇題數</option>';

        // 年級選項 (1 到 12 年級)
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = `${i}年級`;
            gradeSelect.appendChild(option);
        }

        // 題數選項 (1 到 10 題)
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = `${i}題`;
            questionCountSelect.appendChild(option);
        }
    }

    // 重置頁面函數 (修改的部分)
    function resetGeneratorPage() {
        // 重置所有輸入
        const topicInput = document.getElementById('topic');
        const topicText = document.getElementById('topicText');
        if (topicInput) topicInput.value = '';
        if (topicText) topicText.value = '';
        if (gradeSelect) gradeSelect.value = '';
        if (questionCountSelect) questionCountSelect.value = '';

        // 重置文字輸入區
        if (textQInput) textQInput.value = '';

        // 重置圖片預覽
        if (imageQPreview) imageQPreview.innerHTML = '';
        if (uploadQImage) uploadQImage.value = '';

        // 隱藏結果區域, 並重置表單
        if (quizForm) {
            quizForm.style.display = 'none';
            quizForm.reset(); // 重置表單
        }
        if (singleQuizForm) {
            singleQuizForm.style.display = 'none';
            singleQuizForm.reset(); // 重置表單
        }
      
        // 清空題目顯示區域
        if (questionsDiv) questionsDiv.innerHTML = '';
        if (singleQuestionDiv) singleQuestionDiv.innerHTML = '';

        // 重置複製按鈕
        const copyContent = document.getElementById('copyContent');
        const copyQContent = document.getElementById('copyQContent');
        if (copyContent) copyContent.style.display = 'none';
        if (copyQContent) copyQContent.style.display = 'none';

        // 重置生成按鈕狀態
        if (generateButton) {
            generateButton.innerText = '生成題目';
            generateButton.disabled = false;
        }
        if (generateFromQButton) {
            generateFromQButton.innerText = '生成題目';
            generateFromQButton.disabled = false;
        }
      
      // 重新顯示主生成按鈕組 (在 customTopic 和 chatTopic 模式下)
        if (mainGenerateGroup) {
            mainGenerateGroup.style.display = 'flex';
        }

        // 重置提示和錯誤訊息
        const loadingMessages = document.querySelectorAll('.loading');
        const errorMessages = document.querySelectorAll('.error-message');
        loadingMessages.forEach(msg => msg.remove());
        errorMessages.forEach(msg => msg.remove());
      
        // 恢復提交按鈕的顯示狀態
        const quizSubmitButton = quizForm?.querySelector('.submit-button');
        if (quizSubmitButton) {
            quizSubmitButton.style.display = 'block';
        }
        const singleQuizSubmitButton = singleQuizForm?.querySelector('.submit-button');
        if (singleQuizSubmitButton) {
            singleQuizSubmitButton.style.display = 'block';
        }
    }


    // 切換分頁的函數 (修改的部分)
    function switchTab(tabId) {
        // 重置頁面狀態
        resetGeneratorPage();

        // 移除所有 Tab 的 active 狀態
        [customTopicTab, chatTopicTab, questionTopicTab].forEach(tab => {
            if (tab) tab.classList.remove('active');
        });

        // 隱藏所有 Tab 內容
        [customTopicContent, chatTopicContent, questionTopicContent].forEach(content => {
            if (content) content.classList.remove('active');
        });

        // 設定選中的 Tab 和內容
        const selectedTab = document.getElementById(tabId + 'Tab');
        const selectedContent = document.getElementById(tabId + 'Content');

        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');

        // 控制生成按鈕的顯示 (這裡做了修改)
        if (mainGenerateGroup) {
          mainGenerateGroup.style.display = (tabId === 'questionTopic') ? 'none' : 'flex';
        }
        

        // 重置「以題出題」的子分頁
        if (tabId === 'questionTopic') {
            if (imageQTab && textQTab) {
                imageQTab.classList.add('active');
                textQTab.classList.remove('active');
            }
            if (imageQContent && textQContent) {
                imageQContent.classList.add('active');
                textQContent.classList.remove('active');
            }
        }
    }
    // 切換「以題出題」內的 tab
    function switchQTab(tab) {
        // 重置頁面狀態
        resetGeneratorPage();

        [imageQTab, textQTab].forEach(t => {
            if (t) t.classList.remove('active');
        });
        [imageQContent, textQContent].forEach(c => {
            if (c) c.classList.remove('active');
        });

        if (tab === 'imageQ') {
            imageQTab.classList.add('active');
            imageQContent.classList.add('active');
        } else if (tab === 'textQ') {
            textQTab.classList.add('active');
            textQContent.classList.add('active');
        }
    }

    // 格式化測驗結果以供儲存
    function formatTestDataForStorage(results) {
        let testData = '測驗結果：\n\n';
        results.forEach((result, index) => {
            testData += `題目：${result.question}\n`;
            result.options.forEach((option, i) => {
                testData += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
            });
            testData += `您的答案：${result.userAnswer === '未作答' ? result.userAnswer : ['A', 'B', 'C', 'D'][result.userAnswer]}\n`;
            testData += `正確答案：${['A', 'B', 'C', 'D'][result.correctAnswer]}\n`;
            testData += `結果：${result.correct ? '正確' : '錯誤'}\n`;
            testData += `解釋：${result.explanation}\n\n`;
        });
        return testData;
    }

    // 根據聊天記錄產生題目
    async function generateQuestionsFromChat() {
        if (thread.length === 0) {
            alert('目前無聊天記錄，無法使用');
            return;
        }
        const chatContent = thread.map(entry => {
            const role = entry.role === 'user' ? '使用者' : '機器人';
            const message = entry.parts.map(part => part.text).join('\n');
            return `${role}: ${message}`;
        }).join('\n');

        generateQuestions(chatContent);
    }

    // 產生題目 (主要函數)
    async function generateQuestions(chatContent = '') {
        if (!generateButton || !questionsDiv || !quizForm) {
            console.error('找不到必要的 DOM 元素');
            return;
        }

        const button = generateButton;
        try {
            button.innerText = '生成題目中，請稍候...';
            button.disabled = true;

            let topic = '';
            let topicText = '';
            let grade = '';
            let questionCount = '';

            if (customTopicTab && customTopicTab.classList.contains('active')) {
                const topicInput = document.getElementById('topic');
                if (!topicInput || !topicInput.value.trim()) {
                    alert('請填寫主題！');
                    button.disabled = false;
                    button.innerText = '生成題目';
                    return;
                }
                topic = topicInput.value.trim();
                topicText = document.getElementById('topicText')?.value || '';
                grade = gradeSelect?.value || '10';
                questionCount = questionCountSelect?.value || '5';
            } else {
                topic = '以聊天記錄生成題目';
                grade = '10';
                questionCount = '5';
            }

            const conditions = '符合高中學科學習目標，並為該領域專家設計的符合使用者年級並結合生活情境之素養題，並確定選項中一定有答案。';

            if (quizForm) quizForm.style.display = 'none';
            if (questionsDiv) questionsDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';

            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `請以繁體中文回答，不得使用簡體字或英文詞彙。

請根據下列資訊產生符合學科學習目標的素養題（選擇題）。
每題有四個選項 (A、B、C、D)，並結合生活情境。
年級：${grade} 年級
題目數量：${questionCount} 題
主題：${topic}
${chatContent ? `參考文本(聊天紀錄)：${chatContent}` : (topicText ? `參考文本：${topicText}` : '')}

附加條件：${conditions}

重要要求：
1. 請以自然、通順的繁體中文撰寫題目和選項。
2. 務必提供唯一正確的答案，以數字0,1,2,3分別對應A,B,C,D選項。
3. 請確保選項中的正確答案與解釋絕對一致，不得有不合理或矛盾的地方。
4. 解答說明需明確指出為何該選項正確，其他選項為何不正確，並不得有不合理的論述。
5. 若引用參考文本或聊天紀錄，需先理解再轉換為素養題，不可直接複製整段文字。
6. 請自行檢查，保證題目、選項、正確答案及解釋完全匹配且無誤。

請用以下JSON格式回應（不得包含任何英文字詞在選項或題目中，但可保留JSON結構）：
{
    "questions": [
        {
            "question": "題目",
            "options": ["A選項", "B選項", "C選項", "D選項"],
            "answer": 0,
            "explanation": "解答說明"
        }
    ]
}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                const textContent = data.candidates[0].content.parts[0].text;
                const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    questions = parsedData.questions.map((q) => {
                        q.options = [...new Set(q.options)];
                        return q;
                    });
                    displayQuestions(questions);
                    if (quizForm) {
                        quizForm.style.display = 'block';
                        //const submitButton = quizForm.querySelector('.submit-button'); //搬到resetpage
                        //if (submitButton) submitButton.style.display = 'block'; // 顯示提交按鈕
                    }
                    const copyButton = document.getElementById('copyContent');
                    if (copyButton) copyButton.style.display = 'block';
                } else {
                    throw new Error('無法解析回應格式');
                }
            } else {
                throw new Error('API 回應格式不正確');
            }
        } catch (error) {
            console.error('生成題目時發生錯誤:', error);
            if (questionsDiv) questionsDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
        } finally {
            if (button) {
                button.disabled = false;
                button.innerText = '重新生成題目';
            }
        }
    }
    // 顯示題目
    function displayQuestions(questions) {
        if (!questionsDiv) return;
        questionsDiv.innerHTML = '';

        questions.forEach((q, i) => {
            const uniqueOptions = [...new Set(q.options)];
            const formattedOptions = uniqueOptions.map((option, index) => {
                if (/^[A-D]\.\s/.test(option)) {
                    return option;
                }
                return `${['A', 'B', 'C', 'D'][index]}. ${option}`;
            });

            const questionHtml = `
                <div class="question-card">
                    <p><strong>${i + 1}. ${q.question}</strong></p>
                    <div class="question-options">
                        ${formattedOptions.map((option, j) => `
                            <label>
                                <input type="radio" name="question${i}" value="${j}" required>
                                ${option}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            questionsDiv.innerHTML += questionHtml;
        });
    }

    // 檢查答案
    function checkAnswers(event) {
        event.preventDefault();
        if (!quizForm || !questionsDiv) return;

        const formData = new FormData(quizForm);
        const results = [];

        questions.forEach((q, i) => {
            const userAnswer = formData.get(`question${i}`);
            const correctAnswer = q.answer;
            const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswer;

            results.push({
                question: q.question,
                options: q.options,
                correct: isCorrect,
                userAnswer: userAnswer !== null ? parseInt(userAnswer) : '未作答',
                correctAnswer,
                explanation: q.explanation,
            });
        });

        displayResults(results);
        // 提交答案後隱藏提交按鈕
        const submitButton = quizForm.querySelector('.submit-button');
        if (submitButton) submitButton.style.display = 'none';
    }

    // 顯示結果
    function displayResults(results) {
        if (!questionsDiv) return;

        questionsDiv.innerHTML = results.map((result, i) => `
            <div class="question-card">
                <p><strong>${i + 1}. ${result.question}</strong></p>
                <div class="question-options">
                    ${result.options.map((option, j) => `
                        <label style="background-color: ${j === result.correctAnswer ? '#28a745' : 
                            (j === result.userAnswer ? '#dc3545' : '#ffffff')};
                            color: ${j === result.correctAnswer || j === result.userAnswer ? 'white' : '#333'};">
                            ${['A', 'B', 'C', 'D'][j]}. ${option}
                        </label>
                    `).join('')}
                </div>
                <p class="your-answer">您的答案：${result.userAnswer === '未作答' ? result.userAnswer : ['A', 'B', 'C', 'D'][result.userAnswer]} ${result.correct ? '✔️' : '❌'}</p>
                ${!result.correct ? `<p class="correct-answer">正確答案：${['A', 'B', 'C', 'D'][result.correctAnswer]}</p>` : ''}
                <p class="explanation">解答說明：${result.explanation}</p>
            </div>
        `).join('');

        questionsDiv.innerHTML += `
            <div style="text-align: center; margin-top: 20px;">
                <button id="saveTestButton" class="feature-button">儲存測驗結果</button>
            </div>
        `;

        const saveTestButton = document.getElementById('saveTestButton');
        if (saveTestButton) {
            saveTestButton.addEventListener('click', async () => {
                const username = prompt('請輸入您的帳號：');
                if (!username) {
                    alert('必須輸入帳號才能儲存測驗結果。');
                    return;
                }

                const testData = formatTestDataForStorage(results);

                try {
                    await new Promise((resolve, reject) => {
                        google.script.run
                            .withSuccessHandler(result => {
                                if (result.status === 'success') {
                                    alert('測驗結果已成功儲存！');
                                } else {
                                    alert(`儲存失敗：${result.error}`);
                                }
                                resolve(result);
                            })
                            .withFailureHandler(error => {
                                alert(`儲存失敗：${error.message}`);
                                reject(error);
                            })
                            .saveTestResult({
                                username: username,
                                testData: testData
                            });
                    });
                } catch (error) {
                    console.error('儲存測驗結果時發生錯誤：', error);
                }
            });
        }
    }

    // 複製內容
    function copyContentFn() {
        if (questions.length === 0) {
            alert('請先生成題目！');
            return;
        }

        let content = '題目列表:\n';
        questions.forEach((q, index) => {
            content += `${index + 1}. ${q.question}\n`;
            q.options.forEach((option, i) => {
                content += `   ${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
            });
        });

        content += '\n正確答案與解答:\n';
        questions.forEach((q, index) => {
            content += `${index + 1}. 正確答案: ${['A', 'B', 'C', 'D'][q.answer]}\n`;
            content += `   解答說明: ${q.explanation}\n\n`;
        });

        navigator.clipboard.writeText(content)
            .then(() => alert('內容已複製到剪貼簿！'))
            .catch(err => alert('複製失敗：' + err));
    }

    // 預覽以題出題的圖片
    function previewQImage(event) {
        if (!imageQPreview) return;
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageQPreview.innerHTML = `<img src="${e.target.result}" alt="題目圖片" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            imageQPreview.innerHTML = '';
        }
    }

    // 將圖片轉換為 Base64
    async function convertImageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(imageFile);
        });
    }

    // 生成單一題目 (以題出題)
    async function generateSingleQuestion() {
        const button = generateFromQButton;
        if (!button || !singleQuizForm || !singleQuestionDiv || !copyQContent) return;

        try {
            button.innerText = '生成中，請稍候...';
            button.disabled = true;
            singleQuizForm.style.display = 'none';
            singleQuestionDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';
            copyQContent.style.display = 'none';

              let prompt = `除了是以英文為主的來源，請以繁體中文回答，不得使用簡體字或英文詞彙。

請扮演資深數理教師，對提供的題目進行分析並產生新題目。請嚴格遵守以下規範：
1. 題目分析：
   - 識別題目的核心概念和解題原理
   - 判斷是否為計算題型
   - 分析題目的結構和關鍵要素

2. 新題目設計：
   - 使用相同的核心概念和解題方法
   - 如果是計算題：
     * 改變數值，但保持難度相當
     * 確保計算過程合理
     * 提供詳細的計算步驟
   - 如果是概念題：
     * 改變情境，保持概念相同
     * 使用不同的例子說明同一概念
     * 確保新情境貼近生活
3. 題目完整性檢查：
   - 確保題目陳述完整，包含所有必要的已知條件
   - 確認所有變數、單位都有明確定義
   - 避免模糊或可能造成誤解的描述
   - 檢查是否提供足夠資訊來解答

4. 答案正確性驗證：
   - 詳細列出解題步驟，確保邏輯正確
   - 確認選項間有足夠的區別性
   - 驗證只有一個絕對正確的答案
   - 其他選項必須合理但明確錯誤

5. 解說要求：
   - 詳細解釋為何正確答案是唯一解
   - 說明其他選項為何錯誤
   - 提供每個步驟的理論依據
   - 標註關鍵概念和解題要點

6. 選項設計規範：
   - 選項之間必須有明顯差異
   - 避免使用「以上皆是」或「以上皆非」
   - 錯誤選項要具有干擾性但不能太離譜
   - 選項長度和形式要盡量一致

7. 自我檢查機制：
   請列出以下驗證項目並確認：
   題目敘述是否完整無誤、是否提供足夠的解題資訊、是否只有一個正確答案、答案是否經過完整推導驗證、選項是否具有明確區別性、解說是否完整且邏輯清晰

請用以下JSON格式回應：
{
    "questions": [
        {
            "originalConcept": "原題目的核心概念",
            "isCalculation": true/false,
            "question": "新設計的題目內容",
            "options": ["A選項", "B選項", "C選項", "D選項"],
            "answer": 0,
            "solution": {
                "steps": [
                    "步驟1：...",
                    "步驟2：...",
                    "步驟3：..."
                ]
            },
            "explanation": "解答說明（包含計算過程或概念說明）",
            "conceptLink": "新舊題目的概念連結說明"
        }
    ]
}`;

            let payload = {};
            if (imageQTab.classList.contains('active') && uploadQImage.files.length > 0) {
                const base64Image = await convertImageToBase64(uploadQImage.files[0]);
                payload = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }, {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }]
                    }]
                };
            } else if (textQTab.classList.contains('active') && textQInput.value.trim()) {
                payload = {
                    contents: [{
                        parts: [{
                            text: `${prompt}\n\n原題目內容：${textQInput.value.trim()}`
                        }]
                    }]
                };
            } else {
                alert('請提供圖片或文字內容！');
                throw new Error('未提供題目內容');
            }

            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0].content) {
                throw new Error('API 回應格式不正確');
            }

            const textContent = data.candidates[0].content.parts[0].text;
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('無法解析回應格式');
            }

            const parsedData = JSON.parse(jsonMatch[0]);
            const qList = parsedData.questions.map((q) => {
                q.options = [...new Set(q.options)];
                if (q.options.length !== 4) {
                    throw new Error('選項數量必須為4個');
                }
                return q;
            });

            if (qList.length > 0) {
                singleQuestionData = qList[0];
                displaySingleQuestion(singleQuestionData);
                
                // 移除「更換數值」按鈕
                // const regenerateButton = document.createElement('button');
                // regenerateButton.textContent = '更換數值';
                // regenerateButton.className = 'feature-button';
                // regenerateButton.onclick = generateSingleQuestion;
                // singleQuestionDiv.appendChild(regenerateButton);

                
                singleQuizForm.style.display = 'block';
                //const submitButton = singleQuizForm.querySelector('.submit-button'); //搬到resetpage
                //if (submitButton) submitButton.style.display = 'block';
                copyQContent.style.display = 'block';
            } else {
                throw new Error('沒有產生題目');
            }

        } catch (error) {
            console.error('生成單一題目時發生錯誤:', error);
            if (singleQuestionDiv) {
                singleQuestionDiv.innerHTML = `<p class="error-message">錯誤：${error.message}</p>`;
            }
        } finally {
            if (button) {
                button.innerText = '生成題目';
                button.disabled = false;
            }
        }
    }

    // 顯示單一題目
    function displaySingleQuestion(q) {
        if (!singleQuestionDiv) return;
        singleQuestionDiv.innerHTML = `
            <div class="question-card">
                <div class="concept-area">
                    <h3>核心概念</h3>
                    <p>${q.originalConcept}</p>
                </div>
                <div class="question-content">
                    <p><strong>${q.question}</strong></p>
                    <div class="question-options">
                        ${q.options.map((option, j) => `
                            <label>
                                <input type="radio" name="singleQ" value="${j}" required>
                                ${['A', 'B', 'C', 'D'][j]}. ${option}
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // 檢查單一題目的答案並顯示結果
    function checkSingleAnswer(event) {
        event.preventDefault();
        if (!singleQuestionData || !singleQuestionDiv) return;

        const formData = new FormData(document.getElementById('singleQuizForm'));
        const userAnswer = formData.get('singleQ');
        const correctAnswer = singleQuestionData.answer;
        const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswer;

        singleQuestionDiv.innerHTML = `
            <div class="question-card">
                <div class="concept-area">
                    <h3>核心概念</h3>
                    <p>${singleQuestionData.originalConcept}</p>
                </div>
                <p><strong>${singleQuestionData.question}</strong></p>
                <div class="question-options">
                    ${singleQuestionData.options.map((option, j) => `
                        <label style="background-color: ${j === correctAnswer ? '#28a745' :
                            (j === parseInt(userAnswer) ? '#dc3545' : '#ffffff')};
                            color: ${j === correctAnswer || j === parseInt(userAnswer) ? 'white' : '#333'};">
                            ${['A', 'B', 'C', 'D'][j]}. ${option}
                        </label>
                    `).join('')}
                </div>
                <p class="your-answer">您的答案：${userAnswer === null ? '未作答' : ['A', 'B', 'C', 'D'][userAnswer]} ${isCorrect ? '✔️' : '❌'}</p>
                ${!isCorrect ? `<p class="correct-answer">正確答案：${['A', 'B', 'C', 'D'][correctAnswer]}</p>` : ''}
                
                <div class="solution-steps">
                    <h3>解題步驟</h3>
                    <ol>
                        ${singleQuestionData.solution.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                <p class="explanation">解答說明：${singleQuestionData.explanation}</p>
                
                <div class="concept-link">
                    <h3>概念連結</h3>
                    <p>${singleQuestionData.conceptLink}</p>
                </div>
            </div>
        `;

        if (singleQuizForm) {
            const submitButton = singleQuizForm.querySelector('.submit-button');
             // 提交答案後隱藏提交按鈕
            if (submitButton) submitButton.style.display = 'none';
        }

        singleQuestionDiv.innerHTML += `
            <div style="text-align: center; margin-top: 20px;">
                <button id="saveSingleTestButton" class="feature-button">儲存測驗結果</button>
            </div>
        `;

        const saveSingleTestButton = document.getElementById('saveSingleTestButton');
        if (saveSingleTestButton) {
            saveSingleTestButton.addEventListener('click', async () => {
                const username = prompt('請輸入您的帳號：');
                if (!username) {
                    alert('必須輸入帳號才能儲存測驗結果。');
                    return;
                }

                let testData = '測驗結果：\n\n';
                testData += `題目：${singleQuestionData.question}\n`;
                singleQuestionData.options.forEach((option, i) => {
                    testData += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
                });
                testData += `您的答案：${userAnswer === null ? '未作答' : ['A', 'B', 'C', 'D'][userAnswer]}\n`;
                testData += `正確答案：${['A', 'B', 'C', 'D'][correctAnswer]}\n`;
                testData += `結果：${isCorrect ? '正確' : '錯誤'}\n`;
                testData += `解釋：${singleQuestionData.explanation}\n`;

                try {
                    await new Promise((resolve, reject) => {
                        google.script.run                            .withSuccessHandler(result => {
                                if (result.status === 'success') {
                                    alert('測驗結果已成功儲存！');
                                } else {
                                    alert(`儲存失敗：${result.error}`);
                                }
                                resolve(result);
                            })
                            .withFailureHandler(error => {
                                alert(`儲存失敗：${error.message}`);
                                reject(error);
                            })
                            .saveTestResult({
                                username: username,
                                testData: testData
                            });
                    });
                } catch (error) {
                    console.error('儲存測驗結果時發生錯誤：', error);
                }
            });
        }
    }

    // 複製單一題目的內容
    function copySingleContent() {
        if (!singleQuestionData) {
            alert('請先生成題目！');
            return;
        }

        let content = '題目：\n';
        content += `${singleQuestionData.question}\n`;
        singleQuestionData.options.forEach((option, i) => {
            content += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
        });

        content += '\n正確答案與解答:\n';
        content += `正確答案: ${['A', 'B', 'C', 'D'][singleQuestionData.answer]}\n`;
        content += `解答說明: ${singleQuestionData.explanation}\n`;

        navigator.clipboard.writeText(content)
            .then(() => alert('內容已複製到剪貼簿！'))
            .catch(err => alert('複製失敗：' + err));
    }

    // 初始化
    function init() {
        // 初始化 DOM 元素
        if (!initializeDOMElements()) {
            console.error('初始化失敗：無法找到必要的 DOM 元素');
            return;
        }

        // 初始化選項
        initOptions();

        // 綁定事件監聽器
        if (customTopicTab) customTopicTab.addEventListener('click', () => switchTab('customTopic'));
        if (chatTopicTab) chatTopicTab.addEventListener('click', () => switchTab('chatTopic'));
        if (questionTopicTab) questionTopicTab.addEventListener('click', () => switchTab('questionTopic'));
        if (imageQTab) imageQTab.addEventListener('click', () => switchQTab('imageQ'));
        if (textQTab) textQTab.addEventListener('click', () => switchQTab('textQ'));

        // 綁定其他事件監聽器
        if (generateButton) {
            generateButton.addEventListener('click', () => {
                if (customTopicTab.classList.contains('active')) {
                    generateQuestions();
                } else if (chatTopicTab.classList.contains('active')) {
                   generateQuestionsFromChat();
                }
            });
        }

        if (quizForm) quizForm.addEventListener('submit', checkAnswers);
        const copyContentButton = document.getElementById('copyContent');
        if (copyContentButton) copyContentButton.addEventListener('click', copyContentFn);
        if (uploadQImage) uploadQImage.addEventListener('change', previewQImage);
        if (generateFromQButton) generateFromQButton.addEventListener('click', generateSingleQuestion);
        if (singleQuizForm) singleQuizForm.addEventListener('submit', checkSingleAnswer);
        if (copyQContent) copyQContent.addEventListener('click', copySingleContent);

        // 設定初始狀態
        switchTab('customTopic');
        switchQTab('imageQ');
    }

    // 暴露需要外部訪問的函數
    return {
        init
    };
})();

// 初始化 AI 素養題產生器
aiGeneratorModule.init();
