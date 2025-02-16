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

    // 檢查 google.script.run 是否可用
    function checkGoogleScriptRun() {
        if (typeof google === 'undefined' || !google.script || !google.script.run) {
            console.error('google.script.run 未定義！');
            return false;
        }
        console.log('google.script.run 可用');
        return true;
    }

    // 格式化文字
    function formatText(text) {
        console.log('formatText 被調用，輸入:', text);
        if (!text) return '';
        let formatted = text.toString();
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        console.log('formatText 輸出:', formatted);
        return formatted;
    }

    // 初始化 DOM 元素
    function initializeDOMElements() {
        console.log('開始初始化 DOM 元素...');
        try {
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

            // 輸出每個元素的狀態
            console.log('DOM 元素狀態：', {
                notesTab: !!notesTab,
                loadNotesButton: !!loadNotesButton,
                notesDisplayArea: !!notesDisplayArea,
                notesUsernameInput: !!notesUsernameInput
            });

            if (!notesTab || !loadNotesButton || !notesDisplayArea || !notesUsernameInput) {
                throw new Error('必要的 DOM 元素未找到');
            }

            return true;
        } catch (error) {
            console.error('DOM 元素初始化失敗:', error);
            alert('頁面初始化失敗，請重新整理頁面');
            return false;
        }
    }

    // 載入用戶筆記
    async function loadUserNotes() {
        console.log('loadUserNotes 被調用');
        
        // 檢查必要元素
        if (!notesUsernameInput || !notesDisplayArea || !loadNotesButton) {
            console.error('必要元素未找到：', {
                notesUsernameInput: !!notesUsernameInput,
                notesDisplayArea: !!notesDisplayArea,
                loadNotesButton: !!loadNotesButton
            });
            alert('系統錯誤：找不到必要元素');
            return;
        }

        // 檢查用戶輸入
        const username = notesUsernameInput.value.trim();
        console.log('用戶名：', username);
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        // 顯示載入中
        notesDisplayArea.innerHTML = '<p class="loading">載入中...</p>';
        
        // 檢查 Google Apps Script API
        if (!checkGoogleScriptRun()) {
            notesDisplayArea.innerHTML = '<p style="color: red;">系統錯誤：無法連接到 Google Apps Script</p>';
            return;
        }

        try {
            console.log('開始呼叫 getNotes...');
            loadNotesButton.disabled = true; // 禁用按鈕
            
            const result = await new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(response => {
                        console.log('getNotes 回應：', response);
                        resolve(response);
                    })
                    .withFailureHandler(error => {
                        console.error('getNotes 錯誤：', error);
                        reject(error);
                    })
                    .getNotes(username);
            });

            if (result && result.status === 'success') {
                const notes = result.notes;
                console.log('獲取到筆記數量：', notes.length);

                if (!Array.isArray(notes) || notes.length === 0) {
                    notesDisplayArea.innerHTML = '<p style="text-align: center;">目前還沒有任何筆記。</p>';
                    return;
                }

                // 顯示筆記
                const notesHtml = notes.map((note, index) => {
                    console.log(`處理第 ${index + 1} 個筆記`);
                    return `
                        <div class="note-card">
                            <div class="note-content">${formatText(note)}</div>
                        </div>
                    `;
                }).join('');

                notesDisplayArea.innerHTML = notesHtml;
                console.log('筆記顯示完成');
            } else {
                throw new Error(result ? result.error : '未知錯誤');
            }
        } catch (error) {
            console.error('載入筆記時發生錯誤:', error);
            notesDisplayArea.innerHTML = `
                <p style="text-align: center; color: red;">
                    載入失敗：${error.message}
                    <br>
                    <small>請確認您的帳號是否正確，或重新整理頁面後再試。</small>
                </p>
            `;
        } finally {
            loadNotesButton.disabled = false; // 重新啟用按鈕
        }
    }

    // Tab 切換
    function switchTab(tabId) {
        console.log('切換頁籤:', tabId);
        if (!notesTab || !testRecordsTab || !notesContent || !testRecordsContent) {
            console.error('Tab 元素未正確初始化');
            return;
        }

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

    // 初始化事件監聽器
    function initializeEventListeners() {
        console.log('初始化事件監聽器...');
        
        // 為了確保事件不會重複綁定，先創建新的按鈕
        if (loadNotesButton) {
            const newLoadNotesButton = loadNotesButton.cloneNode(true);
            loadNotesButton.parentNode.replaceChild(newLoadNotesButton, loadNotesButton);
            loadNotesButton = newLoadNotesButton;
            
            // 綁定點擊事件
            loadNotesButton.addEventListener('click', (event) => {
                event.preventDefault(); // 防止表單提交
                console.log('載入筆記按鈕被點擊');
                loadUserNotes();
            });
            console.log('載入筆記按鈕事件已綁定');
        } else {
            console.error('找不到載入筆記按鈕');
        }

        // Tab 切換事件
        if (notesTab) {
            notesTab.addEventListener('click', () => {
                console.log('筆記頁籤被點擊');
                switchTab('notes');
            });
        }

        if (testRecordsTab) {
            testRecordsTab.addEventListener('click', () => {
                console.log('測驗記錄頁籤被點擊');
                switchTab('testRecords');
            });
        }

        console.log('事件監聽器初始化完成');
    }

    // 初始化
    function init() {
        console.log('開始初始化 myRecordsModule...');
        
        if (!initializeDOMElements()) {
            console.error('DOM 元素初始化失敗');
            return;
        }

        // 檢查 Google Apps Script API
        if (!checkGoogleScriptRun()) {
            console.error('Google Apps Script API 未正確載入');
            return;
        }

        switchTab('notes');
        initializeEventListeners();
        
        console.log('myRecordsModule 初始化完成');
    }

    // 公開的介面
    return {
        init,
        loadUserNotes // 公開此函數以便直接調用測試
    };
})();

// 確保 DOM 完全載入後再初始化模組
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，開始初始化 myRecordsModule');
    myRecordsModule.init();
});
