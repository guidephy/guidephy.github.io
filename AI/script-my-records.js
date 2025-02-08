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
    const notesDisplayArea = document.getElementById('notes-display-area');

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

    // 載入筆記
    async function loadNotes() {
        const username = document.getElementById('notes-username').value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        notesDisplayArea.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner"></div>
                <p>載入中...</p>
            </div>
        `;

        try {
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getNotes(username);
            });

            if (result.status === 'success') {
                const notes = result.notes;
                if (notes.length === 0) {
                    notesDisplayArea.innerHTML = '<p style="text-align: center;">目前還沒有任何筆記。</p>';
                    return;
                }

                // 顯示筆記
                notesDisplayArea.innerHTML = notes.map((note, index) => `
                    <div class="note-card">
                        <div class="note-content">${formatText(note)}</div>
                    </div>
                `).join('');
            } else {
                notesDisplayArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
            }
        } catch (error) {
            notesDisplayArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
        }
    }

    // 載入測驗記錄
   // 在 script-my-records.js 中修改 loadTestRecords 函數
async function loadTestRecords() {
    const username = document.getElementById('records-username').value.trim();
    if (!username) {
        alert('請輸入帳號');
        return;
    }

    // 添加載入提示
    recordsQuizArea.innerHTML = `
        <div style="text-align: center;">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
        </div>
    `;
    recordsOptionsDiv.style.display = 'none';

    try {
        // 添加日誌輸出
        console.log('正在讀取用戶:', username);
        
        const result = await new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler(result => {
                    console.log('收到測驗記錄:', result);
                    resolve(result);
                })
                .withFailureHandler(error => {
                    console.error('載入失敗:', error);
                    reject(error);
                })
                .getTestRecords(username);
        });

        if (result.status === 'success') {
            allQuestions = result.allQuestions;
            wrongQuestions = result.wrongQuestions;
            
            if (!allQuestions || allQuestions.length === 0) {
                recordsQuizArea.innerHTML = '<p style="text-align: center;">尚無測驗記錄。</p>';
                return;
            }

            recordsOptionsDiv.style.display = 'flex';
            
            // 顯示測驗統計資訊
            const totalQuestions = allQuestions.length;
            const totalWrong = wrongQuestions.length;
            const correctRate = ((totalQuestions - totalWrong) / totalQuestions * 100).toFixed(1);

            recordsQuizArea.innerHTML = `
                <div class="statistics-card">
                    <div class="row" style="display: flex; justify-content: space-around;">
                        <div class="col" style="text-align: center; padding: 10px;">
                            <div class="statistics-number">${totalQuestions}</div>
                            <div class="statistics-label">總題數</div>
                        </div>
                        <div class="col" style="text-align: center; padding: 10px;">
                            <div class="statistics-number">${totalQuestions - totalWrong}</div>
                            <div class="statistics-label">答對題數</div>
                        </div>
                        <div class="col" style="text-align: center; padding: 10px;">
                            <div class="statistics-number">${correctRate}%</div>
                            <div class="statistics-label">正確率</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            recordsQuizArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
        }
    } catch (error) {
        console.error('處理測驗記錄時出錯：', error);
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
                ${questions.map((q, i) => `
                    <div class="question-card">
                        <p><strong>${i + 1}. ${q.question}</strong></p>
                        <div class="question-options">
                            ${q.options.map((option, j) => `
                                <label style="display: block; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                                    <input type="radio" name="question${i}" value="${j}" required>
                                    ${option}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div style="text-align: center; margin-top: 20px;">
                    <button type="submit" class="feature-button">提交答案</button>
                </div>
            </form>
        `;

        recordsQuizArea.innerHTML = quizHtml;

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
        
        const resultsHtml = results.map((result, i) => {
            if (result.correct) correctCount++;

            const options = Array.isArray(result.options) ? result.options : [];
            const correctAnswerIndex = options.findIndex(opt => 
                opt.startsWith(result.correctAnswer));
            const userAnswerIndex = parseInt(result.userAnswer);

            return `
                <div class="question-card">
                    <p><strong>${i + 1}. ${result.question}</strong></p>
                    <div class="question-options">
                        ${options.map((option, j) => `
                            <label style="display: block; margin: 10px 0; padding: 10px; border-radius: 4px; cursor: default;
                                background-color: ${j === correctAnswerIndex ? '#28a745' : 
                                    (j === userAnswerIndex && j !== correctAnswerIndex ? '#dc3545' : '#ffffff')};
                                color: ${(j === correctAnswerIndex || j === userAnswerIndex) ? 'white' : '#333'};">
                                ${option}
                            </label>
                        `).join('')}
                    </div>
                    <p class="your-answer" style="margin-top: 10px;">
                        您的答案：${result.userAnswer === '未作答' ? '未作答' : 
                            options[userAnswerIndex]?.match(/^[A-D]/)?.[0] || '無效答案'} 
                        ${result.correct ? '✔️' : '❌'}
                    </p>
                    ${!result.correct ? `
                        <p class="correct-answer" style="color: #28a745; margin-top: 5px;">
                            正確答案：${result.correctAnswer}
                        </p>` : ''}
                    <p class="explanation" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                        <strong>解答說明：</strong>${result.explanation}
                    </p>
                </div>
            `;
        }).join('');

        recordsQuizArea.innerHTML = `
            <div class="statistics-card">
                <div class="row" style="display: flex; justify-content: space-around;">
                    <div class="col" style="text-align: center; padding: 10px;">
                        <div class="statistics-number">${results.length}</div>
                        <div class="statistics-label">總題數</div>
                    </div>
                    <div class="col" style="text-align: center; padding: 10px;">
                        <div class="statistics-number">${correctCount}</div>
                        <div class="statistics-label">答對題數</div>
                    </div>
                    <div class="col" style="text-align: center; padding: 10px;">
                        <div class="statistics-number">${((correctCount / results.length) * 100).toFixed(1)}%</div>
                        <div class="statistics-label">正確率</div>
                    </div>
                </div>
            </div>
            ${resultsHtml}
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
        document.getElementById('load-notes-button').addEventListener('click', loadNotes);
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
