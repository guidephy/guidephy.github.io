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

    // 模組狀態管理
    let questions = [];      // 儲存產生的題目
    let singleQuestionData = null;  // 儲存以題出題
    let currentQuestionIndex = 0;   // 當前題目索引
    let testStartTime = null;       // 測驗開始時間

    // 題目狀態管理器
    const questionStateManager = {
        savedQuestions: [],
        currentIndex: 0,

        saveQuestion(question) {
            this.savedQuestions.push(question);
        },

        getNextQuestion() {
            if (this.currentIndex < this.savedQuestions.length) {
                return this.savedQuestions[this.currentIndex++];
            }
            return null;
        },

        reset() {
            this.savedQuestions = [];
            this.currentIndex = 0;
        }
    };

    // 題目歷史記錄管理
    const questionHistory = {
        history: [],
        
        add(question) {
            this.history.push({
                question,
                timestamp: new Date().toISOString()
            });
        },

        getRecent(count = 5) {
            return this.history.slice(-count);
        },

        clear() {
            this.history = [];
        }
    };

    // 初始化選項
    function initOptions() {
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

    // 顯示通知的輔助函數
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 添加動畫效果
        notification.style.animation = 'slideIn 0.3s ease-out';
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // 驗證題目格式
    function validateQuestionFormat(question) {
        if (!question.question || !question.options || !Array.isArray(question.options)) {
            throw new Error('題目格式不正確');
        }
        if (question.options.length !== 4) {
            throw new Error('選項數量必須為4個');
        }
        if (typeof question.answer !== 'number' || question.answer < 0 || question.answer > 3) {
            throw new Error('答案格式不正確');
        }
        return true;
    }

    // 驗證圖片
    function validateImage(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('圖片大小不能超過5MB');
        }
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            throw new Error('只支援 JPG、PNG 和 GIF 格式的圖片');
        }
        return true;
    }

    // 分析測驗結果
    function analyzeTestResults(results) {
        const analysis = {
            totalQuestions: results.length,
            correctCount: 0,
            wrongAnswers: [],
            timeSpent: testStartTime ? (new Date() - testStartTime) / 1000 : 0,
            performance: {}
        };

        results.forEach((result, index) => {
            if (result.correct) {
                analysis.correctCount++;
            } else {
                analysis.wrongAnswers.push({
                    questionIndex: index,
                    question: result.question,
                    userAnswer: result.userAnswer,
                    correctAnswer: result.correctAnswer
                });
            }
        });

        analysis.performance = {
            accuracy: (analysis.correctCount / analysis.totalQuestions * 100).toFixed(2),
            needReview: analysis.wrongAnswers.length > 0,
            averageTimePerQuestion: (analysis.timeSpent / analysis.totalQuestions).toFixed(2)
        };

        return analysis;
    }
    // 格式化測驗結果以供儲存
    function formatTestDataForStorage(results) {
        const analysis = analyzeTestResults(results);
        let testData = '測驗結果：\n\n';
        
        // 添加測驗統計
        testData += `測驗統計：\n`;
        testData += `總題數：${analysis.totalQuestions}\n`;
        testData += `答對題數：${analysis.correctCount}\n`;
        testData += `正確率：${analysis.performance.accuracy}%\n`;
        testData += `作答時間：${analysis.timeSpent} 秒\n`;
        testData += `平均每題時間：${analysis.performance.averageTimePerQuestion} 秒\n\n`;

        // 添加個別題目結果
        results.forEach((result, index) => {
            testData += `題目 ${index + 1}：${result.question}\n`;
            result.options.forEach((option, i) => {
                testData += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
            });
            testData += `您的答案：${result.userAnswer === '未作答' ? result.userAnswer : ['A', 'B', 'C', 'D'][result.userAnswer]}\n`;
            testData += `正確答案：${['A', 'B', 'C', 'D'][result.correctAnswer]}\n`;
            testData += `結果：${result.correct ? '正確' : '錯誤'}\n`;
            testData += `解釋：${result.explanation}\n\n`;
        });

        // 如果有需要複習的題目
        if (analysis.wrongAnswers.length > 0) {
            testData += `需要複習的題目：\n`;
            analysis.wrongAnswers.forEach((wrong, index) => {
                testData += `${index + 1}. 第 ${wrong.questionIndex + 1} 題\n`;
            });
        }

        return testData;
    }

    // 根據聊天記錄產生題目
    async function generateQuestionsFromChat() {
        if (thread.length === 0) {
            showNotification('目前無聊天記錄，無法使用', 'error');
            return;
        }

        // 格式化聊天記錄
        const chatContent = thread.map(entry => {
            const role = entry.role === 'user' ? '使用者' : '機器人';
            const message = entry.parts.map(part => part.text).join('\n');
            return `${role}: ${message}`;
        }).join('\n');

        await generateQuestions(chatContent);
    }

    // 產生題目 (主要函數)
    async function generateQuestions(chatContent = '') {
        const button = document.getElementById('generateButton');
        button.innerText = '生成題目中，請稍候...';
        button.disabled = true;

        let topic = '';
        let topicText = '';
        let grade = '';
        let questionCount = '';

        try {
            if (customTopicTab.classList.contains('active')) {
                topic = document.getElementById('topic').value;
                if (!topic) {
                    throw new Error('請填寫主題！');
                }
                topicText = document.getElementById('topicText').value;
                grade = document.getElementById('grade').value;
                questionCount = document.getElementById('questionCount').value;

            } else {
                topic = '以聊天記錄生成題目';
                grade = '10';  //預設十年級
                questionCount = '5'; // 預設五題
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

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                const textContent = data.candidates[0].content.parts[0].text;
                const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    questions = parsedData.questions.map((q) => {
                        validateQuestionFormat(q);
                        q.options = [...new Set(q.options)];
                        questionHistory.add(q);
                        return q;
                    });
                    displayQuestions(questions);
                    quizForm.style.display = 'block';
                    quizForm.querySelector('.submit-button').style.display = 'block';
                    document.getElementById('copyContent').style.display = 'block';
                    testStartTime = new Date();
                    showNotification('題目生成成功！', 'success');
                } else {
                    throw new Error('無法解析回應格式');
                }
            } else {
                throw new Error('API 回應格式不正確');
            }
        } catch (error) {
            questionsDiv.innerHTML = `<p class="loading">錯誤：${error.message}</p>`;
            showNotification(error.message, 'error');
        } finally {
            button.innerText = '重新生成題目';
            button.disabled = false;
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
                <div class="question-card" data-question-index="${i}">
                    <p><strong>${i + 1}. ${q.question}</strong></p>
                    <div class="question-options">
                        ${formattedOptions.map((option, j) => `
                            <label class="option-label">
                                <input type="radio" name="question${i}" value="${j}" required>
                                <span class="option-text">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="timer" id="timer-${i}">剩餘時間: --:--</div>
                </div>
            `;
            questionsDiv.innerHTML += questionHtml;
        });

        // 加入進度指示器
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        progressIndicator.innerHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
            <div class="progress-text">進度: 0/${questions.length}</div>
        `;
        questionsDiv.insertBefore(progressIndicator, questionsDiv.firstChild);

        // 初始化計時器
        initializeTimers();
        
        // 綁定選項變更事件以更新進度
        bindOptionChangeEvents();
    }

    // 初始化計時器
    function initializeTimers() {
        questions.forEach((_, index) => {
            const timerElement = document.getElementById(`timer-${index}`);
            if (timerElement) {
                let timeLeft = 300; // 5分鐘
                const timer = setInterval(() => {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerElement.textContent = `剩餘時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        timerElement.textContent = '時間到！';
                        timerElement.style.color = 'red';
                    }
                    timeLeft--;
                }, 1000);
            }
        });
    }

    // 綁定選項變更事件
    function bindOptionChangeEvents() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', updateProgress);
        });
    }

    // 更新進度
    function updateProgress() {
        const totalQuestions = questions.length;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        const progressBar = document.querySelector('.progress');
        const progressText = document.querySelector('.progress-text');
        
        const percentage = (answeredQuestions / totalQuestions) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `進度: ${answeredQuestions}/${totalQuestions}`;
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
        const analysis = analyzeTestResults(results);
        
        // 顯示整體統計
        questionsDiv.innerHTML = `
            <div class="results-summary">
                <h3>測驗結果統計</h3>
                <div class="statistics-grid">
                    <div class="statistic-item">
                        <div class="statistic-value">${analysis.totalQuestions}</div>
                        <div class="statistic-label">總題數</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-value">${analysis.correctCount}</div>
                        <div class="statistic-label">答對題數</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-value">${analysis.performance.accuracy}%</div>
                        <div class="statistic-label">正確率</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-value">${analysis.performance.averageTimePerQuestion}秒</div>
                        <div class="statistic-label">平均每題時間</div>
                    </div>
                </div>
            </div>
        `;

        // 顯示個別題目結果
        results.forEach((result, i) => {
            questionsDiv.innerHTML += `
                <div class="question-card ${result.correct ? 'correct' : 'incorrect'}">
                    <p><strong>${i + 1}. ${result.question}</strong></p>
                    <div class="question-options">
                        ${result.options.map((option, j) => `
                            <label class="option-label ${j === result.correctAnswer ? 'correct-answer' : 
                                (j === result.userAnswer ? 'user-answer' : '')}">
                                ${['A', 'B', 'C', 'D'][j]}. ${option}
                            </label>
                        `).join('')}
                    </div>
                    <p class="your-answer">您的答案：${result.userAnswer === '未作答' ? result.userAnswer : 
                        ['A', 'B', 'C', 'D'][result.userAnswer]} ${result.correct ? '✔️' : '❌'}</p>
                    ${!result.correct ? `<p class="correct-answer-text">正確答案：${['A', 'B', 'C', 'D'][result.correctAnswer]}</p>` : ''}
                    <p class="explanation">解答說明：${result.explanation}</p>
                </div>
            `;
        });

        // 添加儲存和重新測驗按鈕
        questionsDiv.innerHTML += `
            <div class="result-actions">
                <button id="saveTestButton" class="feature-button">儲存測驗結果</button>
                <button id="retryButton" class="feature-button">重新測驗</button>
            </div>
        `;

        // 綁定儲存測驗結果事件
        document.getElementById('saveTestButton').addEventListener('click', async () => {
            const username = window.chatModule.getUserAccount();
            if (!username) return;

            const testData = formatTestDataForStorage(results);

            try {
                await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(result => {
                            if (result.status === 'success') {
                                showNotification('測驗結果已成功儲存！', 'success');
                            } else {
                                showNotification(`儲存失敗：${result.error}`, 'error');
                            }
                            resolve(result);
                        })
                        .withFailureHandler(error => {
                            showNotification(`儲存失敗：${error.message}`, 'error');
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

        // 綁定重新測驗按鈕事件
        document.getElementById('retryButton').addEventListener('click', () => {
            generateQuestions();
        });
    }

    // 複製內容
    function copyContentFn() {
        if (questions.length === 0) {
            showNotification('請先生成題目！', 'error');
            return;
        }

        let content = '題目列表:\n\n';
        questions.forEach((q, index) => {
            content += `${index + 1}. ${q.question}\n`;
            q.options.forEach((option, i) => {
                content += `   ${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
            });
            content += '\n';
        });

        content += '正確答案與解答:\n';
        questions.forEach((q, index) => {
            content += `${index + 1}. 正確答案: ${['A', 'B', 'C', 'D'][q.answer]}\n`;
            content += `   解答說明: ${q.explanation}\n\n`;
        });

        navigator.clipboard.writeText(content)
            .then(() => showNotification('內容已複製到剪貼簿！', 'success'))
            .catch(err => showNotification('複製失敗：' + err, 'error'));
    }

    // 預覽以題出題的圖片
    function previewQImage(event) {
        try {
            const file = event.target.files[0];
            if (file) {
                validateImage(file);
                const reader = new FileReader();
                reader.onload = function (e) {
                    imageQPreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" alt="題目圖片" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 8px;">
                            <button class="remove-image" onclick="clearQImage()">×</button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                imageQPreview.innerHTML = '';
            }
        } catch (error) {
            showNotification(error.message, 'error');
            event.target.value = '';
            imageQPreview.innerHTML = '';
        }
    }

    // 清除預覽圖片
    function clearQImage() {
        uploadQImage.value = '';
        imageQPreview.innerHTML = '';
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

請用以下JSON格式回應：
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
                const file = uploadQImage.files[0];
                validateImage(file);
                const base64Image = await convertImageToBase64(file);
                payload = {
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: 'image/jpeg',
                                        data: base64Image
                                    }
                                }
                            ]
                        }
                    ]
                };
            } else if (textQTab.classList.contains('active') && textQInput.value.trim()) {
                payload = {
                    contents: [
                        {
                            parts: [
                                {
                                    text: `${prompt}
                                    題目內容：${textQInput.value.trim()}`
                                }
                            ]
                        }
                    ]
                };
            } else {
                throw new Error('請提供圖片或文字內容！');
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
                        validateQuestionFormat(q);
                        q.options = [...new Set(q.options)];
                        return q;
                    });
                    if (qList.length > 0) {
                        singleQuestionData = qList[0];
                        questionHistory.add(singleQuestionData);
                        displaySingleQuestion(singleQuestionData);
                        singleQuizForm.style.display = 'block';
                        singleQuizForm.querySelector('.submit-button').style.display = 'block';
                        copyQContent.style.display = 'block';
                        showNotification('題目生成成功！', 'success');
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
            showNotification(error.message, 'error');
        } finally {
            button.innerText = '生成題目';
            button.disabled = false;
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
                        <label class="option-label">
                            <input type="radio" name="singleQ" value="${j}" required>
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="timer" id="single-timer">剩餘時間: 5:00</div>
            </div>
        `;
        singleQuestionDiv.innerHTML = questionHtml;

        // 初始化計時器
        let timeLeft = 300; // 5分鐘
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timerElement = document.getElementById('single-timer');
            if (timerElement) {
                timerElement.textContent = `剩餘時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timerElement.textContent = '時間到！';
                    timerElement.style.color = 'red';
                }
                timeLeft--;
            }
        }, 1000);
    }

    // 檢查單一題目的答案並顯示結果
    function checkSingleAnswer(event) {
        event.preventDefault();
        if (!singleQuestionData) return;

        const formData = new FormData(document.getElementById('singleQuizForm'));
        const userAnswer = formData.get('singleQ');
        const correctAnswer = singleQuestionData.answer;
        const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswer;

        const results = [{
            question: singleQuestionData.question,
            options: singleQuestionData.options,
            userAnswer: userAnswer !== null ? parseInt(userAnswer) : '未作答',
            correctAnswer: correctAnswer,
            correct: isCorrect,
            explanation: singleQuestionData.explanation
        }];

        displayResults(results);
        singleQuizForm.querySelector('.submit-button').style.display = 'none';
    }

    // 複製單一題目的內容
    function copySingleContent() {
        if (!singleQuestionData) {
            showNotification('請先生成題目！', 'error');
            return;
        }

        let content = '題目：\n';
        content += `${singleQuestionData.question}\n\n`;
        singleQuestionData.options.forEach((option, i) => {
            content += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
        });

        content += '\n正確答案與解答:\n';
        content += `正確答案: ${['A', 'B', 'C', 'D'][singleQuestionData.answer]}\n`;
        content += `解答說明: ${singleQuestionData.explanation}\n`;

        navigator.clipboard.writeText(content)
            .then(() => showNotification('內容已複製到剪貼簿！', 'success'))
            .catch(err => showNotification('複製失敗：' + err, 'error'));
    }

    // 初始化和事件綁定
    function init() {
        // 初始化
        initOptions();
        questionStateManager.reset();
        questionHistory.clear();

        // 綁定頁籤切換事件
        customTopicTab.addEventListener('click', () => {
            customTopicTab.classList.add('active');
            chatTopicTab.classList.remove('active');
            questionTopicTab.classList.remove('active');
            customTopicContent.classList.add('active');
            chatTopicContent.classList.remove('active');
            questionTopicContent.classList.remove('active');
            mainGenerateGroup.style.display = 'flex';
            quizForm.style.display = 'none';
            showNotification('切換到自訂主題模式');
        });

        chatTopicTab.addEventListener('click', () => {
            chatTopicTab.classList.add('active');
            customTopicTab.classList.remove('active');
            questionTopicTab.classList.remove('active');
            chatTopicContent.classList.add('active');
            customTopicContent.classList.remove('active');
            questionTopicContent.classList.remove('active');
            mainGenerateGroup.style.display = 'flex';
            quizForm.style.display = 'none';
            showNotification('切換到聊天內容模式');
        });

        questionTopicTab.addEventListener('click', () => {
            questionTopicTab.classList.add('active');
            customTopicTab.classList.remove('active');
            chatTopicTab.classList.remove('active');
            questionTopicContent.classList.add('active');
            customTopicContent.classList.remove('active');
            chatTopicContent.classList.remove('active');
            mainGenerateGroup.style.display = 'none';
            quizForm.style.display = 'none';
            showNotification('切換到以題出題模式');
        });

        // 綁定其他事件
        generateButton.addEventListener('click', () => {
            if (customTopicTab.classList.contains('active')) {
                generateQuestions();
            } else {
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

    // 返回公開的API
    return {
        init: init,
        clearQImage: clearQImage
    };
})();

// 初始化 AI 素養題產生器
aiGeneratorModule.init();
