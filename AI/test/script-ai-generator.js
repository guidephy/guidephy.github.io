// script-ai-generator.js (AI 素養題產生器)

const aiGeneratorModule = (() => {
    // 獲取 DOM 元素
    const customTopicTab = document.getElementById('customTopicTab');
    const chatTopicTab = document.getElementById('chatTopicTab');
    const questionTopicTab = document.getElementById('questionTopicTab');
    const customTopicContent = document.getElementById('customTopicContent');
    const chatTopicContent = document.getElementById('chatTopicContent');
    const questionTopicContent = document.getElementById('questionTopicContent');
    const imageQTab = document.getElementById('imageQTab');
    const textQTab = document.getElementById('textQTab');
    const imageQContent = document.getElementById('imageQContent');
    const textQContent = document.getElementById('textQContent');
    const generateButton = document.getElementById('generateButton');
    const quizForm = document.getElementById('quizForm');
    const questionsDiv = document.getElementById('questions');
    const gradeSelect = document.getElementById('grade');
    const questionCountSelect = document.getElementById('questionCount');
    const mainGenerateGroup = document.getElementById('mainGenerateGroup');
    const singleQuizForm = document.getElementById('singleQuizForm');
    const singleQuestionDiv = document.getElementById('singleQuestion');
    const copyQContent = document.getElementById('copyQContent');
    const uploadQImage = document.getElementById('uploadQImage');
    const imageQPreview = document.getElementById('imageQPreview');
    const textQInput = document.getElementById('textQInput');
    const generateFromQButton = document.getElementById('generateFromQButton');

    let questions = [];      // 儲存產生的題目
    let singleQuestionData = null;  // 儲存以題出題

    // 初始化選項
    function initOptions() {
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
        customTopicTab.classList.remove('active');
        chatTopicTab.classList.remove('active');
        questionTopicTab.classList.remove('active');

        // 隱藏所有 Tab 內容
        customTopicContent.classList.remove('active');
        chatTopicContent.classList.remove('active');
        questionTopicContent.classList.remove('active');

        // 設定選中的 Tab 和內容
        document.getElementById(tabId + 'Tab').classList.add('active');
        document.getElementById(tabId + 'Content').classList.add('active');

        // 根據 Tab 決定是否顯示主要生成按鈕
        mainGenerateGroup.style.display = (tabId === 'questionTopic') ? 'none' : 'flex';
        quizForm.style.display = 'none';
    }

    // 切換分頁的事件監聽
    customTopicTab.addEventListener('click', () => switchTab('customTopic'));
    chatTopicTab.addEventListener('click', () => switchTab('chatTopic'));
    questionTopicTab.addEventListener('click', () => switchTab('questionTopic'));

    // 以題出題的 Tab 切換
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
        const button = document.getElementById('generateButton');
        try {
            button.innerText = '生成題目中，請稍候...';
            button.disabled = true;

            let topic = '';
            let topicText = '';
            let grade = '';
            let questionCount = '';

            if (customTopicTab.classList.contains('active')) {
                topic = document.getElementById('topic').value;
                if (!topic) {
                    alert('請填寫主題！');
                    return;
                }
                topicText = document.getElementById('topicText').value;
                grade = document.getElementById('grade').value;
                questionCount = document.getElementById('questionCount').value;
            } else {
                topic = '以聊天記錄生成題目';
                grade = '10';
                questionCount = '5';
            }

            const conditions = '符合高中學科學習目標，並為該領域專家設計的符合使用者年級並結合生活情境之素養題，並確定選項中一定有答案。';

            quizForm.style.display = 'none';
            questionsDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';

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
                    quizForm.style.display = 'block';
                    quizForm.querySelector('.submit-button').style.display = 'block';
                    document.getElementById('copyContent').style.display = 'block';
                } else {
                    throw new Error('無法解析回應格式');
                }
            } else {
                throw new Error('API 回應格式不正確');
            }
        } catch (error) {
            console.error('生成題目時發生錯誤:', error);
            questionsDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
        } finally {
            button.disabled = false;
            button.innerText = '重新生成題目';
        }
    }

    // 顯示題目
    function displayQuestions(questions) {
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

        const formData = new FormData(document.getElementById('quizForm'));
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
        const submitButton = document.querySelector('#quizForm .submit-button');
        submitButton.style.display = 'none';
    }

    // 顯示結果
    function displayResults(results) {
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

        document.getElementById('saveTestButton').addEventListener('click', async () => {
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

    // 生成單一題目 (以題出題)
    async function generateSingleQuestion() {
        const button = document.getElementById('generateFromQButton');
        try {
            button.innerText = '生成中，請稍候...';
            button.disabled = true;
            singleQuizForm.style.display = 'none';
            singleQuestionDiv.innerHTML = '<p class="loading">生成題目中，請稍候...</p>';
            copyQContent.style.display = 'none';

            let payload = {};
            let prompt = `請以繁體中文回答，不得使用簡體字或英文詞彙。

請根據下列資訊產生符合學科學習目標的素養題（選擇題）。
每題有四個選項，並結合生活情境。
題目數量：1題
主題：請扮演該領域中具有嚴謹教學素養的資深教師。對於給定的題目（由圖片或文字提供）解題作為出題靈感，重新設計題目。
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
                            text: `${prompt}
                            題目內容：${textQInput.value.trim()}`
                        }]
                    }]
                };
            } else {
                alert('請提供圖片或文字內容！');
                button.innerText = '生成題目';
                button.disabled = false;
                singleQuestionDiv.innerHTML = '';
                return;
            }

            const response = await fetch(geminiurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

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
                        singleQuizForm.querySelector('.submit-button').style.display = 'block';
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
            singleQuestionDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
        } finally {
            button.innerText = '生成題目';
            button.disabled = false;
        }
    }

    // 顯示單一題目
    function displaySingleQuestion(q) {
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
        `;
        singleQuestionDiv.innerHTML += questionHtml;
    }

    // 檢查單一題目的答案並顯示結果
    function checkSingleAnswer(event) {
        event.preventDefault();
        if (!singleQuestionData) return;

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

        document.querySelector('#singleQuizForm .submit-button').style.display = 'none';

        singleQuestionDiv.innerHTML += `
            <div style="text-align: center; margin-top: 20px;">
                <button id="saveSingleTestButton" class="feature-button">儲存測驗結果</button>
            </div>
        `;

        document.getElementById('saveSingleTestButton').addEventListener('click', async () => {
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

    // 將圖片轉換為 Base64
    async function convertImageToBase64(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(imageFile);
        });
    }

    // 事件監聽器綁定
    function initEventListeners() {
        generateButton.addEventListener('click', () => {
            if (customTopicTab.classList.contains('active')) {
                generateQuestions();
            } else if (chatTopicTab.classList.contains('active')) {
                generateQuestionsFromChat();
            }
        });

        quizForm.addEventListener('submit', checkAnswers);
        document.getElementById('copyContent').addEventListener('click', copyContentFn);
        uploadQImage.addEventListener('change', previewQImage);
        generateFromQButton.addEventListener('click', generateSingleQuestion);
        singleQuizForm.addEventListener('submit', checkSingleAnswer);
        copyQContent.addEventListener('click', copySingleContent);
    }

    // 初始化
    function init() {
        initOptions();
        initEventListeners();
    }

// 暴露需要外部訪問的函數
    return {
        init // 初始化函數
    };
})();

// 初始化 AI 素養題產生器
aiGeneratorModule.init();
