// script-my-records.js
const myRecordsModule = (() => {
    // 獲取 DOM 元素
    let notesTab, testRecordsTab, notesContent, testRecordsContent, 
        loadNotesButton, loadRecordsButton, retryHistoryButton, retryWrongButton,
        recordsOptionsDiv, recordsQuizArea, notesDisplayArea, 
        notesUsernameInput, recordsUsernameInput;

    let allQuestions = [];
    let wrongQuestions = [];
    let currentQuestions = [];

    // 初始化 DOM 元素
    function initializeDOMElements() {
        notesTab = document.getElementById('notesTab');
        testRecordsTab = document.getElementById('testRecordsTab');
        notesContent = document.getElementById('notesContent');
        testRecordsContent = document.getElementById('testRecordsContent');
        loadNotesButton = document.getElementById('load-notes-button');
        loadRecordsButton = document.getElementById('load-records-button');
        retryHistoryButton = document.getElementById('retry-history');
        retryWrongButton = document.getElementById('retry-wrong');
        recordsOptionsDiv = document.getElementById('records-options');
        recordsQuizArea = document.getElementById('records-quiz-area');
        notesDisplayArea = document.getElementById('notes-display-area');
        notesUsernameInput = document.getElementById('notes-username');
        recordsUsernameInput = document.getElementById('records-username');

        // 檢查必要元素是否存在
        const requiredElements = [
            { element: notesTab, name: 'notesTab' },
            { element: testRecordsTab, name: 'testRecordsTab' },
            { element: notesContent, name: 'notesContent' },
            { element: testRecordsContent, name: 'testRecordsContent' },
            { element: loadNotesButton, name: 'loadNotesButton' },
            { element: notesDisplayArea, name: 'notesDisplayArea' },
            { element: notesUsernameInput, name: 'notesUsernameInput' }
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

    // Tab 切換
    function switchTab(tabId) {
        if (!notesTab || !testRecordsTab || !notesContent || !testRecordsContent) return;

        // 移除所有 Tab 的 active 狀態
        notesTab.classList.remove('active');
        testRecordsTab.classList.remove('active');
        notesContent.classList.remove('active');
        testRecordsContent.classList.remove('active');

        // 設定選中的 Tab 和內容
        const selectedTab = document.getElementById(tabId + 'Tab');
        const selectedContent = document.getElementById(tabId + 'Content');
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }

    // 格式化文字
    function formatText(text) {
        if (!text) return '';
        let formatted = text.toString();
        // 先處理 Markdown 格式
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 再處理換行符
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    // 載入用戶筆記
    async function loadUserNotes() {
        if (!notesUsernameInput || !notesDisplayArea) {
            console.error('找不到筆記相關的 DOM 元素');
            return;
        }

        const username = notesUsernameInput.value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        notesDisplayArea.innerHTML = '<p style="text-align: center;">載入中...</p>';

        try {
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getNotes(username);
            });

            if (result && result.status === 'success') {
                const notes = result.notes;
                if (!Array.isArray(notes) || notes.length === 0) {
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
                throw new Error(result ? result.error : '未知錯誤');
            }
        } catch (error) {
            console.error('載入筆記發生錯誤:', error);
            notesDisplayArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
        }
    }

    // 載入測驗記錄
    async function loadTestRecords() {
        if (!recordsUsernameInput || !recordsQuizArea || !recordsOptionsDiv) return;

        const username = recordsUsernameInput.value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        recordsQuizArea.innerHTML = '<p class="loading">載入中...</p>';
        recordsOptionsDiv.style.display = 'none';

        try {
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .getTestRecords(username);
            });

            if (result.status === 'success') {
                allQuestions = result.allQuestions || [];
                wrongQuestions = result.wrongQuestions || [];

                if (allQuestions.length === 0) {
                    recordsQuizArea.innerHTML = '<p style="text-align: center;">尚無測驗記錄。</p>';
                    return;
                }

                recordsOptionsDiv.style.display = 'flex';
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
                throw new Error(result.error || '載入失敗');
            }
        } catch (error) {
            recordsQuizArea.innerHTML = `<p class="loading" style="color: red;">載入失敗：${error.message}</p>`;
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
                <div class="button-group">
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

    // 顯示測驗結果
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
            <div class="button-group">
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

    // 初始化事件監聽器
    function initializeEventListeners() {
        if (!loadNotesButton || !loadRecordsButton || !notesTab || !testRecordsTab || 
            !retryHistoryButton || !retryWrongButton) {
            console.error('無法初始化事件監聽器：找不到必要的 DOM 元素');
            return;
        }

        // 移除現有的事件監聽器
        // 事件監聽器綁定（續）
        const newLoadNotesButton = loadNotesButton.cloneNode(true);
        loadNotesButton.parentNode.replaceChild(newLoadNotesButton, loadNotesButton);
        loadNotesButton = newLoadNotesButton;

        const newLoadRecordsButton = loadRecordsButton.cloneNode(true);
        loadRecordsButton.parentNode.replaceChild(newLoadRecordsButton, loadRecordsButton);
        loadRecordsButton = newLoadRecordsButton;

        // 綁定新的事件監聽器
        loadNotesButton.addEventListener('click', loadUserNotes);
        loadRecordsButton.addEventListener('click', loadTestRecords);

        notesTab.addEventListener('click', () => switchTab('notes'));
        testRecordsTab.addEventListener('click', () => switchTab('testRecords'));

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
        console.log('初始化 myRecordsModule...');
        if (!initializeDOMElements()) {
            console.error('初始化 DOM 元素失敗');
            return;
        }
        
        switchTab('notes'); // 預設顯示筆記頁面
        initializeEventListeners();
        console.log('myRecordsModule 初始化完成');
    }

    // 公開的介面
    return {
        init,
        retryQuiz
    };
})();

// 確保 DOM 完全載入後再初始化模組
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，開始初始化 myRecordsModule');
    myRecordsModule.init();
});
