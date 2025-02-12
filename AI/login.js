// 創建新的 login.js 文件
const loginModule = (() => {
    // 私有變數
    let currentUsername = null;
    
    // DOM 元素
    const loginInput = document.getElementById('login-username');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const loginStatus = document.getElementById('login-status');
    
    // 檢查登入狀態
    function isLoggedIn() {
        return currentUsername !== null;
    }
    
    // 獲取當前用戶名
    function getCurrentUsername() {
        return currentUsername;
    }
    
    // 登入處理
    function login() {
        const username = loginInput.value.trim();
        if (!username) {
            alert('請輸入帳號');
            return;
        }
        
        currentUsername = username;
        loginInput.style.display = 'none';
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
        loginStatus.textContent = `目前登入：${username}`;
        
        // 發送登入事件
        document.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { username } 
        }));
    }
    
    // 登出處理
    function logout() {
        currentUsername = null;
        loginInput.style.display = 'block';
        loginInput.value = '';
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        loginStatus.textContent = '';
        
        // 發送登出事件
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
    
    // 初始化
    function init() {
        loginButton.addEventListener('click', login);
        logoutButton.addEventListener('click', logout);
    }
    
    // 公開介面
    return {
        init,
        isLoggedIn,
        getCurrentUsername
    };
})();

// 修改 chat.js 中生成筆記相關代碼
async function generateNotes() {
    if (!loginModule.isLoggedIn()) {
        alert('請先登入帳號才能生成筆記');
        return;
    }
    
    if (thread.length === 0) {
        alert('目前無聊天記錄，無法生成筆記。');
        return;
    }

    const username = loginModule.getCurrentUsername();
    // ... 其餘生成筆記的邏輯 ...
}

// 修改 my-records.js 中載入筆記相關代碼
async function loadUserNotes() {
    if (!loginModule.isLoggedIn()) {
        alert('請先登入帳號才能查看筆記');
        return;
    }

    const username = loginModule.getCurrentUsername();
    const notesDisplay = document.getElementById('notes-display-area');
    // ... 其餘載入筆記的邏輯 ...
}

// 修改測驗相關代碼
function saveTestResult(results) {
    if (!loginModule.isLoggedIn()) {
        alert('請先登入帳號才能儲存測驗結果');
        return;
    }

    const username = loginModule.getCurrentUsername();
    // ... 其餘儲存測驗結果的邏輯 ...
}

// 修改載入測驗記錄相關代碼
async function loadTestRecords() {
    if (!loginModule.isLoggedIn()) {
        alert('請先登入帳號才能查看測驗記錄');
        return;
    }

    const username = loginModule.getCurrentUsername();
    // ... 其餘載入測驗記錄的邏輯 ...
}

// 在頁面載入時初始化登入模組
document.addEventListener('DOMContentLoaded', () => {
    loginModule.init();
});
Last edited 1 minute ago