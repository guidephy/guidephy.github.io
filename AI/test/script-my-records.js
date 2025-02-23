// script-my-records.js
const myRecordsModule = (() => {
    // DOM 元素
    let notesTab, testRecordsTab, notesContent, testRecordsContent,
        loadNotesButton, loadRecordsButton, retryHistoryButton, retryWrongButton,
        recordsOptionsDiv, recordsQuizArea, notesDisplayArea;

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

        // 檢查是否所有必要元素都存在
        if (!notesTab || !testRecordsTab || !notesContent || !testRecordsContent || 
            !loadNotesButton || !loadRecordsButton || !notesDisplayArea) {
            console.error('無法找到必要的 DOM 元素');
            return false;
        }
        return true;
    }

    // Tab 切換函數
    function switchTab(tabId) {
        [notesTab, testRecordsTab].forEach(tab => {
            if (tab) tab.classList.remove('active');
        });
        [notesContent, testRecordsContent].forEach(content => {
            if (content) content.classList.remove('active');
        });

        const selectedTab = document.getElementById(tabId + 'Tab');
        const selectedContent = document.getElementById(tabId + 'Content');
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }

    // 格式化文字
    function formatText(text) {
        if (!text) return '';
        
        let formatted = text;
        // 處理段落
        formatted = formatted.replace(/\n/g, '<br>');
        // 處理粗體
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 處理【】標題
        formatted = formatted.replace(/【(.*?)】/g, '<h3 class="note-section">$1</h3>');
        // 處理項目符號
        formatted = formatted.replace(/•\s(.*?)(?=(\n|$))/g, '<li class="note-item">$1</li>');
        
        return formatted;
    }

    // 載入筆記函數
    async function loadUserNotes() {
        const username = document.getElementById('notes-username')?.value?.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        if (!notesDisplayArea) {
            console.error('找不到筆記顯示區域');
            return;
        }

        notesDisplayArea.innerHTML = '<p class="loading">載入中...</p>';

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
                        <div class="note-header">筆記 ${index + 1}</div>
                        <div class="note-content">${formatText(note)}</div>
                    </div>
                `).join('');
            } else {
                notesDisplayArea.innerHTML = `<p class="error-message">載入失敗：${result.error}</p>`;
            }
        } catch (error) {
            console.error('載入筆記時發生錯誤:', error);
            notesDisplayArea.innerHTML = `<p class="error-message">載入失敗：${error.message}</p>`;
        }
    }

    // 載入測驗記錄
    async function loadTestRecords() {
        const username = document.getElementById('records-username')?.value?.trim();
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
                allQuestions = result.allQuestions;
                wrongQuestions = result.wrongQuestions;

                if (allQuestions.length === 0) {
                    recordsQuizArea.innerHTML = '<p style="text-align: center;">尚無測驗記錄。</p>';
                    return;
                }

                recordsOptionsDiv.style.display = 'flex';
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
                recordsQuizArea.innerHTML = `<p class="error-message">載入失敗：${result.error}</p>`;
            }
        } catch (error) {
            recordsQuizArea.innerHTML = `<p class="error-message">載入失敗：${error.message}</p>`;
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

        const retryQuizForm = document.getElementById('retryQuizForm');
        if (retryQuizForm) {
            retryQuizForm.addEventListener('submit', (event) => {
                event.preventDefault();
                checkRetryAnswers();
            });
        }
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
        // 移除現有的事件監聽器並重新綁定
        if (loadNotesButton) {
            const newLoadNotesButton = loadNotesButton.cloneNode(true);
            loadNotesButton.parentNode.replaceChild(newLoadNotesButton, loadNotesButton);
            loadNotesButton = newLoadNotesButton;
            loadNotesButton.addEventListener('click', loadUserNotes);
        }

        if (loadRecordsButton) {
            const newLoadRecordsButton = loadRecordsButton.cloneNode(true);
            loadRecordsButton.parentNode.replaceChild(newLoadRecordsButton, loadRecordsButton);
            loadRecordsButton = newLoadRecordsButton;
            loadRecordsButton.addEventListener('click', loadTestRecords);
        }

        if (retryHistoryButton) {
            retryHistoryButton.addEventListener('click', () => {
                const selectedQuestions = getRandomQuestions(allQuestions, 5);
                displayQuiz(selectedQuestions);
            });
        }

        if (retryWrongButton) {
            retryWrongButton.addEventListener('click', () => {
                if (wrongQuestions.length === 0) {
                    alert('沒有錯題記錄！');
                    return;
                }
                const selectedQuestions = getRandomQuestions(wrongQuestions, Math.min(5, wrongQuestions.length));
                displayQuiz(selectedQuestions);
            });
        }

        if (notesTab) {
            notesTab.addEventListener('click', () => switchTab('notes'));
        }
        if (testRecordsTab) {
            testRecordsTab.addEventListener('click', () => switchTab('testRecords'));
        }
    }

    // 初始化模組
    function init() {
        console.log('Initializing My Records Module...');
        if (!initializeDOMElements()) {
            console.error('初始化 DOM 元素失敗');
            return;
        }
        
        initializeEventListeners();
        console.log('My Records Module initialized successfully');
    }

    // 返回公開的函數
    return {
        init,
        loadUserNotes,
        loadTestRecords,
        retryQuiz,
        switchTab
    };
})();

// 初始化模組
myRecordsModule.init();
