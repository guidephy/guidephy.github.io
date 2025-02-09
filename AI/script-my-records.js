// script-my-records.js (學習記錄功能)
const myRecordsModule = (() => {
    // 獲取 DOM 元素
    const notesTab = document.getElementById('notesTab');
    const testRecordsTab = document.getElementById('testRecordsTab');
    const notesContent = document.getElementById('notesContent');
    const testRecordsContent = document.getElementById('testRecordsContent');
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
            loadUserNotes(); // 切換到筆記頁時自動載入筆記
        });

        testRecordsTab.addEventListener('click', () => {
            testRecordsTab.classList.add('active');
            notesTab.classList.remove('active');
            testRecordsContent.classList.add('active');
            notesContent.classList.remove('active');
            loadTestRecords(); // 切換到測驗記錄頁時自動載入記錄
        });
    }

    // 載入使用者筆記
    async function loadUserNotes() {
        // 檢查是否已登入
        if (!loginModule.requireLogin()) {
            notesDisplayArea.innerHTML = '<p style="text-align: center;">請先登入以查看筆記</p>';
            return;
        }

        const username = loginModule.getCurrentUsername();
        notesDisplayArea.innerHTML = '<p style="text-align: center;">載入中...</p>';

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
    async function loadTestRecords() {
        // 檢查是否已登入
        if (!loginModule.requireLogin()) {
            recordsQuizArea.innerHTML = '<p style="text-align: center;">請先登入以查看測驗記錄</p>';
            recordsOptionsDiv.style.display = 'none';
            return;
        }

        const username = loginModule.getCurrentUsername();
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
                    <div class="statistics-cards">
                        <div class="statistic-card">
                            <div class="statistic-number">${totalQuestions}</div>
                            <div class="statistic-label">總題數</div>
                        </div>
                        <div class="statistic-card">
                            <div class="statistic-number">${totalQuestions - totalWrong}</div>
                            <div class="statistic-label">答對題數</div>
                        </div>
                        <div class="statistic-card">
                            <div class="statistic-number">${totalWrong}</div>
                            <div class="statistic-label">答錯題數</div>
                        </div>
                        <div class="statistic-card">
                            <div class="statistic-number">${correctRate}%</div>
                            <div class="statistic-label">正確率</div>
                        </div>
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
                ${questions.map((q, i) => `
                    <div class="question-card">
                        <p><strong>${i + 1}. ${q.question}</strong></p>
                        <div class="question-options">
                            ${q.options.map((option, j) => `
                                <label>
                                    <input type="radio" name="question${i}" value="${j}" required>
                                    <span>${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="submit-button-container">
                    <button type="submit" class="submit-button">提交答案</button>
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

            const userAnswerString = userAnswer === null ? '未作答' : userAnswer.toString();

            return {
                question: q.question || '無題目',
                options: options,
                userAnswer: userAnswerString,
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
                            <label style="
                                background-color: ${j === correctAnswerIndex ? '#d4edda' : 
                                    (j === userAnswerIndex && j !== correctAnswerIndex ? '#f8d7da' : '#f8f9fa')};
                                color: ${(j === correctAnswerIndex || j === userAnswerIndex) ? '#000' : '#444'};
                                pointer-events: none;
                                ${j === correctAnswerIndex ? 'border: 2px solid #28a745;' : ''}
                                ${j === userAnswerIndex && j !== correctAnswerIndex ? 'border: 2px solid #dc3545;' : ''}
                            ">
                                <input type="radio" ${j === userAnswerIndex ? 'checked' : ''} disabled>
                                <span>${option}</span>
                            </label>
                        `).join('')}
                    </div>
                    <div class="your-answer">
                        您的答案：${result.userAnswer === '未作答' ? '未作答' : 
                            options[userAnswerIndex]?.match(/^[A-D]/)?.[0] || '無效答案'} 
                        ${result.correct ? '✔️' : '❌'}
                    </div>
                    ${!result.correct ? `
                        <div class="correct-answer">
                            正確答案：${result.correctAnswer}
                        </div>` : ''}
                    <div class="explanation">
                        <strong>解答說明：</strong>${result.explanation}
                    </div>
                </div>
            `;
        }).join('');

        const statisticsHtml = `
            <div class="statistics-cards">
                <div class="statistic-card">
                    <div class="statistic-number">${results.length}</div>
                    <div class="statistic-label">總題數</div>
                </div>
                <div class="statistic-card">
                    <div class="statistic-number">${correctCount}</div>
                    <div class="statistic-label">答對題數</div>
                </div>
                <div class="statistic-card">
                    <div class="statistic-number">${((correctCount / results.length) * 100).toFixed(1)}%</div>
                    <div class="statistic-label">正確率</div>
                </div>
            </div>
        `;

        recordsQuizArea.innerHTML = `
            ${statisticsHtml}
            ${resultsHtml}
            <div class="submit-button-container">
                <button onclick="myRecordsModule.retryQuiz()" class="submit-button">重新測驗</button>
            </div>
        `;

        // 儲存測驗結果
        saveTestResult(results);
    }

    // 儲存測驗結果
    async function saveTestResult(results) {
        const username = loginModule.getCurrentUsername();
        const testData = formatTestDataForStorage(results);

        try {
            await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .saveTestResult({
                        username: username,
                        testData: testData
                    });
            });
        } catch (error) {
            console.error('儲存測驗結果時發生錯誤：', error);
        }
    }

    // 格式化測驗資料以供儲存
    function formatTestDataForStorage(results) {
        let testData = '測驗結果：\n\n';
        results.forEach((result, index) => {
            testData += `題目：${result.question}\n`;
            result.options.forEach((option, i) => {
                testData += `${['A', 'B', 'C', 'D'][i]}. ${option}\n`;
            });
            testData += `您的答案：${result.userAnswer === '未作答' ? result.userAnswer : 
                ['A', 'B', 'C', 'D'][result.userAnswer]}\n`;
            testData += `正確答案：${result.correctAnswer}\n`;
            testData += `結果：${result.correct ? '正確' : '錯誤'}\n`;
            testData += `解釋：${result.explanation}\n\n`;
        });
        return testData;
    }

    // 重新測驗
    function retryQuiz() {
        if (currentQuestions.length > 0) {
            displayQuiz(getRandomQuestions(currentQuestions, currentQuestions.length));
        }
    }

    // 事件監聽器綁定
    function initializeEventListeners() {
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

    // 監聽登入狀態變化
    window.addEventListener('userLoggedIn', () => {
        // 根據當前顯示的頁面載入對應的資料
        if (notesContent.classList.contains('active')) {
            loadUserNotes();
        } else {
            loadTestRecords();
        }
    });

    window.addEventListener('userLoggedOut', () => {
      // 清空顯示區域
        notesDisplayArea.innerHTML = '<p style="text-align: center;">請先登入以查看筆記</p>';
        recordsQuizArea.innerHTML = '<p style="text-align: center;">請先登入以查看測驗記錄</p>';
        recordsOptionsDiv.style.display = 'none';
    });

    // 初始化
    function init() {
        initializeTabs();
        initializeEventListeners();

        // 檢查初始登入狀態
        if (loginModule.getCurrentUsername()) {
            if (notesContent.classList.contains('active')) {
                loadUserNotes();
            } else {
                loadTestRecords();
            }
        } else {
            notesDisplayArea.innerHTML = '<p style="text-align: center;">請先登入以查看筆記</p>';
            recordsQuizArea.innerHTML = '<p style="text-align: center;">請先登入以查看測驗記錄</p>';
        }
    }

    // 公開 API
    return {
        init,
        retryQuiz,
        loadUserNotes,
        loadTestRecords
    };
})();

// 初始化學習記錄模組
document.addEventListener('DOMContentLoaded', () => {
    myRecordsModule.init();
});
