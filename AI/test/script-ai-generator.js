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
            { element: mainGenerateGroup, name: 'mainGenerateGroup' },
            { element: imageQTab, name: 'imageQTab' },
            { element: textQTab, name: 'textQTab' },
            { element: imageQContent, name: 'imageQContent' },
            { element: textQContent, name: 'textQContent' }
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

    // 切換分頁的函數
    function switchTab(tabId) {
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

        // 控制生成按鈕的顯示
        if (mainGenerateGroup) {
            mainGenerateGroup.style.display = (tabId === 'questionTopic') ? 'none' : 'flex';
        }
        if (quizForm) {
            quizForm.style.display = 'none';
        }
    }

    // 切換「以題出題」內的 tab
    function switchQTab(tab) {
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
                        const submitButton = quizForm.querySelector('.submit-button');
                        if (submitButton) submitButton.style.display = 'block';
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
async function generateSingleQuestion() {
    const button = generateFromQButton;
    if (!button || !singleQuizForm || !singleQuestionDiv || !copyQContent) return;

    try {
        button.innerText = '生成中，請稍候...';
        button.disabled = true;
        singleQuizForm.style.display = 'none';
        singleQuestionDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';
        copyQContent.style.display = 'none';

        let payload = {};
        let prompt = `請以繁體中文回答，不得使用簡體字或英文詞彙。

請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供），請依照下列步驟進行分析和出題：

1. 題目分析：
   - 仔細分析題目測驗的核心概念和知識點
   - 確認題目考察的學科能力和思維方式
   - 判斷題目的難度層級和適用年級

2. 概念延伸：
   - 基於相同的核心概念，思考不同的應用場景
   - 保持相同的思維邏輯，但改變情境設定
   - 維持相近的難度水準，確保學習連貫性

3. 新題目設計：
   - 運用不同的生活情境或實例
   - 保持原有概念的完整性
   - 確保新題目能有效檢驗相同的知識理解
   - 設計具啟發性的選項，包含常見迷思概念

重要要求：
1. 新題目必須測驗相同的核心概念，但使用全新的情境
2. 確保新題目的難度相當，但不是簡單改寫原題
3. 選項設計要能反映學生對概念的不同理解層次
4. 解答說明要特別強調與原題的概念連結
5. 務必確保答案唯一且正確，以數字0,1,2,3分別對應A,B,C,D選項

請用以下JSON格式回應：
{
    "questions": [
        {
            "originalConcept": "原題目測驗的核心概念說明",
            "question": "新設計的題目內容",
            "options": ["A選項", "B選項", "C選項", "D選項"],
            "answer": 0,
            "explanation": "解答說明（需包含與原概念的連結）",
            "conceptLink": "新舊題目的概念連結說明"
        }
    ]
}`;

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
        if (data.candidates && data.candidates[0].content) {
            const textContent = data.candidates[0].content.parts[0].text;
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                const qList = parsedData.questions.map((q) => {
                    q.options = [...new Set(q.options)];
                    return q;
                });
                if (qList.length > 0) {
                    singleQuestionData = qList[0];
                    displaySingleQuestion(singleQuestionData);
                    singleQuizForm.style.display = 'block';
                    const submitButton = singleQuizForm.querySelector('.submit-button');
                    if (submitButton) submitButton.style.display = 'block';
                    copyQContent.style.display = 'block';
                } else {
                    throw new Error('沒有產生題目');
                }
            } else {
                throw new Error('無法解析回應格式');
            }
        } else {
            throw new Error('API 回應格式不正確');
        }
    } catch (error) {
        console.error('生成單一題目時發生錯誤:', error);
        if (singleQuestionDiv) {
            singleQuestionDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
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
    singleQuestionDiv.innerHTML = '';
    const uniqueOptions = [...new Set(q.options)];
    const formattedOptions = uniqueOptions.map((option, index) => {
        if (/^[A-D]\.\s/.test(option)) {
            return option;
        }
        return `${['A', 'B', 'C', 'D'][index]}. ${option}`;
    });

    const questionHtml = `
        <div class="question-card">
            <div class="concept-area">
                <h3>核心概念</h3>
                <p>${q.originalConcept}</p>
            </div>
            <div class="question-content">
                <p><strong>${q.question}</strong></p>
                <div class="question-options">
                    ${formattedOptions.map((option, j) => `
                        <label>
                            <input type="radio" name="singleQ" value="${j}" required>
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    singleQuestionDiv.innerHTML += questionHtml;
}

function displaySingleResult(q, userAnswer, isCorrect) {
    return `
        <div class="question-card">
            <div class="concept-area">
                <h3>核心概念</h3>
                <p>${q.originalConcept}</p>
            </div>
            <p><strong>${q.question}</strong></p>
            <div class="question-options">
                ${q.options.map((option, j) => `
                    <label style="background-color: ${j === q.answer ? '#28a745' :
                        (j === parseInt(userAnswer) ? '#dc3545' : '#ffffff')};
                        color: ${j === q.answer || j === parseInt(userAnswer) ? 'white' : '#333'};">
                        ${['A', 'B', 'C', 'D'][j]}. ${option}
                    </label>
                `).join('')}
            </div>
            <p class="your-answer">您的答案：${userAnswer === null ? '未作答' : ['A', 'B', 'C', 'D'][userAnswer]} ${isCorrect ? '✔️' : '❌'}</p>
            ${!isCorrect ? `<p class="correct-answer">正確答案：${['A', 'B', 'C', 'D'][q.answer]}</p>` : ''}
            <p class="explanation">解答說明：${q.explanation}</p>
            <div class="concept-link">
                <h3>概念連結</h3>
                <p>${q.conceptLink}</p>
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
                <p class="explanation">解答說明：${singleQuestionData.explanation}</p>
            </div>
        `;

        if (singleQuizForm) {
            const submitButton = singleQuizForm.querySelector('.submit-button');
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
