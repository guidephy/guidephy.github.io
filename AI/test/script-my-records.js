// script-my-records.js
const myRecordsModule = (() => {
    // 獲取 DOM 元素
    const notesTab = document.getElementById('notesTab');
    const testRecordsTab = document.getElementById('testRecordsTab');
    const notesContent = document.getElementById('notesContent');
    const testRecordsContent = document.getElementById('testRecordsContent');
    const loadRecordsButton = document.getElementById('load-records-button');
    const retryHistoryButton = document.getElementById('retry-history');
    const retryWrongButton = document.getElementById('retry-wrong');
    const recordsOptionsDiv = document.getElementById('records-options');
    const recordsQuizArea = document.getElementById('records-quiz-area');

    let allQuestions = [];
    let wrongQuestions = [];
    let currentQuestions = [];

    // Tab 切換
    function initializeTabs() {
        notesTab.addEventListener('click', () => {
            notesTab.classList.add('active');
            testRecordsTab.classList.remove('active');
            notesContent.classList.add('active');
            testRecordsContent.classList.remove('active');
        });

        testRecordsTab.addEventListener('click', () => {
            testRecordsTab.classList.add('active');
            notesTab.classList.remove('active');
            testRecordsContent.classList.add('active');
            notesContent.classList.remove('active');
        });
    }

    // 載入測驗記錄
    async function loadTestRecords() {
        const username = document.getElementById('records-username').value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        recordsQuizArea.innerHTML = '<p style="text-align: center;">載入中...</p>';
        recordsOptionsDiv.style.display = 'none';

        try {
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getTestRecords(username);
            });

            if (result.status === 'success') {
                allQuestions = result.allQuestions;
                wrongQuestions = result.wrongQuestions;
                
                if (allQuestions.length === 0) {
                    recordsQuizArea.innerHTML = '<p style="text-align: center;">尚無測驗記錄。</p>';
                    return;
                }

                recordsOptionsDiv.style.display = 'block';
                recordsQuizArea.innerHTML = '';

                // 顯示測驗統計資訊
                const totalQuestions = allQuestions.length;
                const totalWrong = wrongQuestions.length;
                const correctRate = ((totalQuestions - totalWrong) / totalQuestions * 100).toFixed(1);

                recordsQuizArea.innerHTML = `
                    <div style="text-align: center; margin: 20px 0;">
                        <p>總題數：${totalQuestions} 題</p>
                        <p>答對題數：${totalQuestions - totalWrong} 題</p>
                        <p>答錯題數：${totalWrong} 題</p>
                        <p>正確率：${correctRate}%</p>
                    </div>
                `;
            } else {
                recordsQuizArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
            }
        } catch (error) {
            recordsQuizArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
        }
    }

    // 隨機選取題目
    function getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, questions.length));
    }

    // 顯示測驗題目
    function displayQuiz(questions) {
        if (!questions || questions.length === 0) {
            recordsQuizArea.innerHTML = '<p style="text-align: center;">沒有可用的題目。</p>';
            return;
        }

        currentQuestions = questions;
        
        const quizHtml = `
            <form id="retryQuizForm" class="result-area">
                ${questions.map((q, i) => {
                    // 確保選項存在且為陣列
                    const options = Array.isArray(q.options) ? q.options : [];
                    return `
                        <div class="question-card">
                            <p><strong>${i + 1}. ${q.question || '無題目'}</strong></p>
                            <div class="question-options">
                                ${options.map((option, j) => `
                                    <label>
                                        <input type="radio" name="question${i}" value="${j}" required>
                                        ${option}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
                <button type="submit" class="submit-button">提交答案</button>
            </form>
        `;

        recordsQuizArea.innerHTML = quizHtml;

        // 綁定提交事件
        document.getElementById('retryQuizForm').addEventListener('submit', (event) => {
            event.preventDefault();
            checkRetryAnswers();
        });
    }

    // 檢查答案
    function checkRetryAnswers() {
        const formData = new FormData(document.getElementById('retryQuizForm'));
        const results = currentQuestions.map((q, i) => {
            const userAnswer = formData.get(`question${i}`);
            const options = Array.isArray(q.options) ? q.options : [];
            const correctAnswerIndex = options.findIndex(opt => 
                opt.startsWith(q.correctAnswer));

            return {
                question: q.question || '無題目',
                options: options,
                userAnswer: userAnswer === null ? '未作答' : userAnswer,
                correctAnswer: q.correctAnswer || '無答案',
                correct: userAnswer !== null && parseInt(userAnswer) === correctAnswerIndex,
                explanation: q.explanation || '無解說'
            };
        });

        displayRetryResults(results);
    }

    // 顯示結果
    function displayRetryResults(results) {
        let correctCount = 0;
        
        recordsQuizArea.innerHTML = results.map((result, i) => {
            // 統計正確題數
            if (result.correct) correctCount++;

            // 確保選項存在且為陣列
            const options = Array.isArray(result.options) ? result.options : [];
            
            // 找出正確答案選項的索引
            const correctAnswerIndex = options.findIndex(opt => 
                opt.startsWith(result.correctAnswer));
            
            // 確保 userAnswer 為有效值
            const userAnswerIndex = parseInt(result.userAnswer);
            const validUserAnswer = !isNaN(userAnswerIndex) ? userAnswerIndex : -1;

            return `
                <div class="question-card">
                    <p><strong>${i + 1}. ${result.question}</strong></p>
                    <div class="question-options">
                        ${options.map((option, j) => `
                            <label style="background-color: ${j === correctAnswerIndex ? '#28a745' : 
                                (j === validUserAnswer && j !== correctAnswerIndex ? '#dc3545' : '#ffffff')};
                                color: ${(j === correctAnswerIndex || j === validUserAnswer) ? 'white' : '#333'};">
                                ${option}
                            </label>
                        `).join('')}
                    </div>
                    <p class="your-answer">您的答案：${result.userAnswer === '未作答' ? '未作答' : 
                        (validUserAnswer >= 0 && options[validUserAnswer] ? 
                        options[validUserAnswer].match(/^[A-D]/)[0] : '無效答案')} 
                        ${result.correct ? '✔️' : '❌'}</p>
                    ${!result.correct ? `<p class="correct-answer">正確答案：${result.correctAnswer}</p>` : ''}
                    <p class="explanation">解答說明：${result.explanation}</p>
                </div>
            `;
        }).join('');

        // 添加測驗結果摘要
        recordsQuizArea.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3>測驗結果</h3>
                <p>共 ${results.length} 題，答對 ${correctCount} 題</p>
                <p>正確率：${((correctCount / results.length) * 100).toFixed(1)}%</p>
            </div>
        ` + recordsQuizArea.innerHTML;

        // 添加重新測驗按鈕
        recordsQuizArea.innerHTML += `
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="myRecordsModule.retryQuiz()" class="feature-button">重新測驗</button>
            </div>
        `;
    }

    // 重新測驗
    function retryQuiz() {
        if (currentQuestions.length > 0) {
            displayQuiz(getRandomQuestions(currentQuestions, currentQuestions.length));
        }
    }

    // 事件監聽器綁定
    function initializeEventListeners() {
        loadRecordsButton.addEventListener('click', loadTestRecords);
        
        retryHistoryButton.addEventListener('click', () => {
            const selectedQuestions = getRandomQuestions(allQuestions, 5);
            displayQuiz(selectedQuestions);
        });

        retryWrongButton.addEventListener('click', () => {
            if (wrongQuestions.length === 0) {
                alert('沒有錯題記錄！');
                return;
            }
            const selectedQuestions = getRandomQuestions(wrongQuestions, Math.min(5, wrongQuestions.length));
            displayQuiz(selectedQuestions);
        });
    }

    // 初始化
    function init() {
        initializeTabs();
        initializeEventListeners();
    }

    // 公開的介面
    return {
        init,
        retryQuiz // 將重新測驗函數公開，供按鈕調用
    };
})();

// 初始化模組
myRecordsModule.init();
