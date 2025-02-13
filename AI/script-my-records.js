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

    // 模組狀態
    let allQuestions = [];
    let wrongQuestions = [];
    let currentQuestions = [];
    let currentUsername = '';

    // 顯示通知的輔助函數
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Tab 切換
    function initializeTabs() {
        notesTab.addEventListener('click', () => {
            notesTab.classList.add('active');
            testRecordsTab.classList.remove('active');
            notesContent.classList.add('active');
            testRecordsContent.classList.remove('active');
            showNotification('切換到筆記區域');
        });

        testRecordsTab.addEventListener('click', () => {
            testRecordsTab.classList.add('active');
            notesTab.classList.remove('active');
            testRecordsContent.classList.add('active');
            notesContent.classList.remove('active');
            showNotification('切換到測驗記錄');
        });
    }

    // 載入筆記
    async function loadUserNotes() {
        const username = window.chatModule.getUserAccount();
        if (!username) return;

        currentUsername = username;
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
                        <div class="note-actions">
                            <button onclick="myRecordsModule.copyNote(${index})" class="feature-button">複製</button>
                            <button onclick="myRecordsModule.deleteNote(${index})" class="feature-button delete">刪除</button>
                        </div>
                    </div>
                `).join('');
                
                showNotification('筆記載入成功', 'success');
            } else {
                notesDisplayArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
                showNotification('載入失敗：' + result.error, 'error');
            }
        } catch (error) {
            notesDisplayArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
            showNotification('載入失敗：' + error.message, 'error');
        }
    }

    // 複製筆記
    async function copyNote(index) {
        const noteContent = document.querySelectorAll('.note-content')[index].textContent;
        try {
            await navigator.clipboard.writeText(noteContent);
            showNotification('筆記已複製到剪貼簿', 'success');
        } catch (err) {
            showNotification('複製失敗：' + err.message, 'error');
        }
    }

    // 刪除筆記
    async function deleteNote(index) {
        if (!confirm('確定要刪除這個筆記嗎？')) return;

        try {
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .deleteNote({
                        username: currentUsername,
                        noteIndex: index
                    });
            });

            if (result.status === 'success') {
                showNotification('筆記已刪除', 'success');
                loadUserNotes(); // 重新載入筆記
            } else {
                showNotification('刪除失敗：' + result.error, 'error');
            }
        } catch (error) {
            showNotification('刪除失敗：' + error.message, 'error');
        }
    }

    // 載入測驗記錄
    async function loadTestRecords() {
        const username = window.chatModule.getUserAccount();
        if (!username) return;

        currentUsername = username;
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
                displayTestStatistics();
                showNotification('測驗記錄載入成功', 'success');
            } else {
                recordsQuizArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${result.error}</p>`;
                showNotification('載入失敗：' + result.error, 'error');
            }
        } catch (error) {
            recordsQuizArea.innerHTML = `<p style="text-align: center; color: red;">載入失敗：${error.message}</p>`;
            showNotification('載入失敗：' + error.message, 'error');
        }
    }

    // 顯示測驗統計
    function displayTestStatistics() {
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
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        `;

        // 創建圖表
        createPerformanceChart(totalQuestions - totalWrong, totalWrong);
    }

    // 建立性能圖表
    function createPerformanceChart(correct, wrong) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['答對', '答錯'],
                datasets: [{
                    data: [correct, wrong],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderColor: ['#fff', '#fff'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom'
                }
            }
        });
    }

    // 隨機選取題目
    function getRandomQuestions(questions, count) {
        if (!questions || questions.length === 0) return [];
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
                                    <span class="option-text">${option}</span>
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

    // 檢查重做題目的答案
    function checkRetryAnswers() {
        const formData = new FormData(document.getElementById('retryQuizForm'));
        const results = currentQuestions.map((q, i) => {
            const userAnswer = formData.get(`question${i}`);
            const correctAnswerIndex = q.options.findIndex(opt => 
                opt.startsWith(q.correctAnswer));
            
            return {
                question: q.question,
                options: q.options,
                userAnswer: userAnswer !== null ? parseInt(userAnswer) : '未作答',
                correctAnswer: correctAnswerIndex,
                correct: userAnswer !== null && parseInt(userAnswer) === correctAnswerIndex,
                explanation: q.explanation
            };
        });

        displayRetryResults(results);
    }

    // 顯示重做結果
    function displayRetryResults(results) {
        let correctCount = 0;
        results.forEach(result => {
            if (result.correct) correctCount++;
        });

        recordsQuizArea.innerHTML = `
            <div class="retry-results">
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

                ${results.map((result, i) => `
                    <div class="question-card ${result.correct ? 'correct' : 'incorrect'}">
                        <p><strong>${i + 1}. ${result.question}</strong></p>
                        <div class="question-options">
                            ${result.options.map((option, j) => `
                                <label class="option-label ${j === result.correctAnswer ? 'correct-answer' : 
                                    (j === result.userAnswer && !result.correct ? 'wrong-answer' : '')}">
                                    ${option}
                                </label>
                            `).join('')}
                        </div>
                        <p class="result-status ${result.correct ? 'correct' : 'incorrect'}">
                            ${result.correct ? '✓ 答對' : '✗ 答錯'}
                        </p>
                        <p class="explanation">${result.explanation}</p>
                    </div>
                `).join('')}

                <div class="retry-actions">
                    <button onclick="myRecordsModule.retryQuiz()" class="feature-button">重新測驗</button>
                    <button onclick="myRecordsModule.loadTestRecords()" class="feature-button">返回統計</button>
                </div>
            </div>
        `;
    }

    // 重新測驗
    function retryQuiz() {
        if (currentQuestions.length > 0) {
            displayQuiz(getRandomQuestions(currentQuestions, currentQuestions.length));
            showNotification('開始重新測驗', 'info');
        }
    }

    // 格式化文字
    function formatText(text) {
        let formatted = text;
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return formatted;
    }

    // 事件監聽器綁定
    function initializeEventListeners() {
        loadRecords
        // 事件監聽器綁定
        function initializeEventListeners() {
            loadRecordsButton.addEventListener('click', loadTestRecords);
            document.getElementById('load-notes-button').addEventListener('click', loadUserNotes);
            
            retryHistoryButton.addEventListener('click', () => {
                const selectedQuestions = getRandomQuestions(allQuestions, 5);
                if (selectedQuestions.length > 0) {
                    displayQuiz(selectedQuestions);
                    showNotification('已從歷史題目中隨機選取5題', 'info');
                } else {
                    showNotification('沒有可用的歷史題目', 'error');
                }
            });

            retryWrongButton.addEventListener('click', () => {
                if (wrongQuestions.length === 0) {
                    showNotification('沒有錯題記錄！', 'error');
                    return;
                }
                const selectedQuestions = getRandomQuestions(wrongQuestions, Math.min(5, wrongQuestions.length));
                displayQuiz(selectedQuestions);
                showNotification('開始錯題練習', 'info');
            });
        }

        // 初始化模組
        function init() {
            initializeTabs();
            initializeEventListeners();

            // 檢查是否有已登入的帳號並自動載入資料
            const savedUsername = localStorage.getItem('currentUser');
            if (savedUsername) {
                currentUsername = savedUsername;
                loadUserNotes();
                loadTestRecords();
            }
        }

        // 清除所有資料（用於登出時）
        function clearData() {
            allQuestions = [];
            wrongQuestions = [];
            currentQuestions = [];
            currentUsername = '';
            notesDisplayArea.innerHTML = '';
            recordsQuizArea.innerHTML = '';
            recordsOptionsDiv.style.display = 'none';
        }

        // 帳號變更時的處理
        function handleAccountChange(newUsername) {
            if (newUsername !== currentUsername) {
                clearData();
                if (newUsername) {
                    currentUsername = newUsername;
                    loadUserNotes();
                    loadTestRecords();
                }
            }
        }

        // 檢查帳號狀態
        function checkAccount() {
            const username = window.chatModule.getUserAccount();
            if (!username) {
                showNotification('請先登入帳號', 'error');
                return false;
            }
            return true;
        }

        // 上傳新筆記
        async function uploadNote(noteContent) {
            if (!checkAccount()) return;

            try {
                const result = await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .saveNote({
                            username: currentUsername,
                            noteContent: noteContent
                        });
                });

                if (result.status === 'success') {
                    showNotification('筆記上傳成功', 'success');
                    loadUserNotes(); // 重新載入筆記列表
                } else {
                    showNotification('上傳失敗：' + result.error, 'error');
                }
            } catch (error) {
                showNotification('上傳失敗：' + error.message, 'error');
            }
        }

        // 更新筆記
        async function updateNote(noteId, newContent) {
            if (!checkAccount()) return;

            try {
                const result = await new Promise((resolve, reject) => {
                    google.script.run
                        .withSuccessHandler(resolve)
                        .withFailureHandler(reject)
                        .updateNote({
                            username: currentUsername,
                            noteId: noteId,
                            newContent: newContent
                        });
                });

                if (result.status === 'success') {
                    showNotification('筆記更新成功', 'success');
                    loadUserNotes(); // 重新載入筆記列表
                } else {
                    showNotification('更新失敗：' + result.error, 'error');
                }
            } catch (error) {
                showNotification('更新失敗：' + error.message, 'error');
            }
        }

        // 返回公開的API
        return {
            init,
            retryQuiz,
            copyNote,
            deleteNote,
            uploadNote,
            updateNote,
            loadUserNotes,
            loadTestRecords,
            handleAccountChange,
            clearData
        };
    })();

// 初始化模組
myRecordsModule.init();

// 監聽帳號變更事件
window.addEventListener('accountChange', (event) => {
    myRecordsModule.handleAccountChange(event.detail.username);
});
