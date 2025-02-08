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
        currentQuestions = questions;
        
        const quizHtml = `
            <form id="retryQuizForm" class="result-area">
                ${questions.map((q, i) => `
                    <div class="question-card">
                        <p><strong>${i + 1}. ${q.question}</strong></p>
                        <div class="question-options">
                            ${q.options.map((option, j) => `
                                <label>
                                    <input type="radio" name="question${i}" value="${j}" required>
                                    ${option}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
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
            const correctAnswerIndex = q.options.findIndex(opt => opt.startsWith(q.correctAnswer));
            const isCorrect = userAnswer !== null && parseInt(userAnswer) === correctAnswerIndex;

            return {
                ...q,
                userAnswer: userAnswer === null ? '未作答' : userAnswer,
                correct: isCorrect
            };
        });

        displayRetryResults(results);
    }

    // 顯示結果
    function displayRetryResults(results) {
        recordsQuizArea.innerHTML = results.map((result, i) => `
            <div class="question-card">
                <p><strong>${i + 1}. ${result.question}</strong></p>
                <div class="question-options">
                    ${result.options.map((option, j) => `
                        <label style="background-color: ${option.startsWith(result.correctAnswer) ? '#28a745' : 
                            (j === parseInt(result.userAnswer) ? '#dc3545' : '#ffffff')};
                            color: ${option.startsWith(result.correctAnswer) || j === parseInt(result.userAnswer) ? 'white' : '#333'};">
                            ${option}
                        </label>
                    `).join('')}
                </div>
                <p class="your-answer">您的答案：${result.userAnswer === '未作答' ? result.userAnswer : 
                    result.options[result.userAnswer].match(/^[A-D]/)[0]} ${result.correct ? '✔️' : '❌'}</p>
                ${!result.correct ? `<p class="correct-answer">正確答案：${result.correctAnswer}</p>` : ''}
                <p class="explanation">解答說明：${result.explanation}</p>
            </div>
        `).join('');
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
            const selectedQuestions = getRandomQuestions(wrongQuestions, 5);
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
        init
    };
})();

// 初始化模組
myRecordsModule.init();