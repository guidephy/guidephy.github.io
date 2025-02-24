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
        console.log('初始化 DOM 元素...');
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
        const elements = {
            notesTab, testRecordsTab, notesContent, testRecordsContent,
            loadNotesButton, loadRecordsButton, recordsOptionsDiv,
            recordsQuizArea, notesDisplayArea
        };

        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`找不到必要的 DOM 元素: ${name}`);
            }
        }

        const allElementsExist = Object.values(elements).every(element => element);
        if (!allElementsExist) {
            console.error('初始化 DOM 元素失敗');
            return false;
        }

        console.log('DOM 元素初始化完成');
        return true;
    }

    // Tab 切換函數
    function switchTab(tabId) {
        console.log('切換到標籤:', tabId);
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
        // 處理時間戳
        formatted = formatted.replace(/時間：(.*?)\n\n/g, '<div class="note-timestamp">$1</div>');
        // 處理其他格式
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/【(.*?)】/g, '<h3 class="note-section">$1</h3>');
        formatted = formatted.replace(/•\s(.*?)(?=(\n|$))/g, '<li class="note-item">$1</li>');
        
        return formatted;
    }

    // 載入筆記函數
    async function loadUserNotes() {
        console.log('開始載入筆記...');
        const username = document.getElementById('notes-username')?.value?.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        notesDisplayArea.style.display = 'block';
        notesDisplayArea.innerHTML = '<p class="loading">載入中...</p>';

        try {
            google.script.run
                .withSuccessHandler((result) => {
                    console.log('收到筆記載入結果:', result);
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
                })
                .withFailureHandler((error) => {
                    console.error('載入筆記時發生錯誤:', error);
                    notesDisplayArea.innerHTML = `<p class="error-message">載入失敗：${error.message || '未知錯誤'}</p>`;
                })
                .getNotes(username);
        } catch (error) {
            console.error('執行載入筆記時發生異常:', error);
            notesDisplayArea.innerHTML = `<p class="error-message">載入失敗：${error.message || '未知錯誤'}</p>`;
        }
    }

    // 載入測驗記錄
    async function loadTestRecords() {
        console.log('開始載入測驗記錄...');
        if (!recordsQuizArea || !recordsOptionsDiv) {
            console.error('找不到必要的 DOM 元素：', {
                recordsQuizArea: !!recordsQuizArea,
                recordsOptionsDiv: !!recordsOptionsDiv
            });
            alert('頁面初始化失敗，請重新整理頁面');
            return;
        }

        const username = document.getElementById('records-username')?.value?.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        recordsQuizArea.innerHTML = '<p class="loading">載入中...</p>';
        recordsOptionsDiv.style.display = 'none';

        try {
            console.log('調用 getTestRecords，使用者：', username);
            
            google.script.run
                .withSuccessHandler((result) => {
                    console.log('收到測驗記錄結果：', result);
                    
                    if (result.status === 'success') {
                        allQuestions = result.allQuestions || [];
                        wrongQuestions = result.wrongQuestions || [];

                        if (allQuestions.length === 0) {
                            recordsQuizArea.innerHTML = '<p style="text-align: center;">尚無測驗記錄。</p>';
                            return;
                        }

                        // 顯示統計資訊
                        const totalQuestions = allQuestions.length;
                        const totalWrong = wrongQuestions.length;
                        const correctRate = ((totalQuestions - totalWrong) / totalQuestions * 100).toFixed(1);

                        recordsOptionsDiv.style.display = 'flex';
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
                        
                        console.log('測驗記錄顯示完成');
                    } else {
                        console.error('載入失敗：', result.error);
                        recordsQuizArea.innerHTML = `
                            <p class="error-message">載入失敗：${result.error}</p>
                        `;
                    }
                })
                .withFailureHandler((error) => {
                    console.error('載入測驗記錄時發生錯誤：', error);
                    recordsQuizArea.innerHTML = `
                        <p class="error-message">載入失敗：${error.message || '未知錯誤'}</p>
                    `;
                })
                .getTestRecords(username);

        } catch (error) {
            console.error('執行載入測驗記錄時發生異常：', error);
            recordsQuizArea.innerHTML = `
                <p class="error-message">載入失敗：${error.message || '未知錯誤'}</p>
            `;
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
                                <label class="option-label">
                                    <input type="radio" name="question${i}" value="${j}" required>
                                    <span>${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="button-group">
                    <button type="submit" class="modern-button primary">提交答案</button>
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
                            <label class="option-label" style="
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
                <button onclick="myRecordsModule.retryQuiz()" class="modern-button primary">重新測驗</button>
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
        console.log('初始化事件監聽器...');
        
        // 移除現有的事件監聽器並重新綁定
        if (loadNotesButton) {
            console.log('綁定載入筆記按鈕事件');
            const newLoadNotesButton = loadNotesButton.cloneNode(true);
            loadNotesButton.parentNode.replaceChild(newLoadNotesButton, loadNotesButton);
            newLoadNotesButton.addEventListener('click', (e) => {
                e.preventDefault();
                loadUserNotes();
            });
        } else {
            console.error('找不到載入筆記按鈕');
        }

        if (loadRecordsButton) {
            console.log('綁定載入測驗記錄按鈕事件');
            const newLoadRecordsButton = loadRecordsButton.cloneNode(true);
            loadRecordsButton.parentNode.replaceChild(newLoadRecordsButton, loadRecordsButton);
            newLoadRecordsButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('點擊載入測驗記錄按鈕');
                loadTestRecords();
            });
        } else {
            console.error('找不到載入測驗記錄按鈕');
        }

        if (retryHistoryButton) {
            console.log('綁定重試歷史題目按鈕事件');
            retryHistoryButton.addEventListener('click', () => {
                if (!allQuestions || allQuestions.length === 0) {
                    alert('沒有可用的題目記錄！');
                    return;
                }
                const selectedQuestions = getRandomQuestions(allQuestions, 5);
                displayQuiz(selectedQuestions);
            });
        }

        if (retryWrongButton) {
            console.log('綁定重試錯題按鈕事件');
            retryWrongButton.addEventListener('click', () => {
                if (!wrongQuestions || wrongQuestions.length === 0) {
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

        console.log('事件監聽器初始化完成');
    }

    // 初始化模組
    function init() {
        console.log('初始化 My Records Module...');
        if (!initializeDOMElements()) {
            console.error('初始化 DOM 元素失敗');
            return;
        }
        
        initializeEventListeners();
        console.log('My Records Module 初始化完成');
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

// 確保在 DOM 載入完成後再初始化模組
document.addEventListener('DOMContentLoaded', () => {
    myRecordsModule.init();
});
