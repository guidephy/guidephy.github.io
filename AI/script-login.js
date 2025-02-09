// script-login.js
const loginModule = (() => {
    // DOM 元素
    let elements = {
        loginButton: null,
        logoutButton: null,
        userInfo: null,
        loginModal: null,
        closeModalButton: null,
        loginForm: null,
        usernameInput: null
    };

    // 初始化 DOM 元素
    function initializeElements() {
        elements = {
            loginButton: document.getElementById('login-button'),
            logoutButton: document.getElementById('logout-button'),
            userInfo: document.getElementById('user-info'),
            loginModal: document.getElementById('login-modal'),
            closeModalButton: document.getElementById('close-modal'),
            loginForm: document.getElementById('login-form'),
            usernameInput: document.getElementById('username-input')
        };

        // 驗證必要元素是否存在
        const requiredElements = ['loginButton', 'logoutButton', 'userInfo', 'loginModal', 'loginForm'];
        const missingElements = requiredElements.filter(elem => !elements[elem]);
        
        if (missingElements.length > 0) {
            console.error('缺少必要的登入相關DOM元素:', missingElements.join(', '));
            return false;
        }
        
        return true;
    }

    // 初始化事件監聽器
    function initializeEventListeners() {
        // 登入按鈕點擊
        elements.loginButton.addEventListener('click', showLoginModal);

        // 登出按鈕點擊
        elements.logoutButton.addEventListener('click', handleLogout);

        // 關閉按鈕點擊
        elements.closeModalButton.addEventListener('click', hideLoginModal);

        // 登入表單提交
        elements.loginForm.addEventListener('submit', handleLoginSubmit);

        // 點擊模態框外部關閉
        window.addEventListener('click', (e) => {
            if (e.target === elements.loginModal) {
                hideLoginModal();
            }
        });
    }

    // 顯示登入模態框
    function showLoginModal() {
        elements.loginModal.style.display = 'flex';
        elements.usernameInput.focus();
    }

    // 隱藏登入模態框
    function hideLoginModal() {
        elements.loginModal.style.display = 'none';
        elements.loginForm.reset();
    }

    // 處理登入表單提交
    async function handleLoginSubmit(e) {
        e.preventDefault();
        const username = elements.usernameInput.value.trim();
        
        if (!username) {
            alert('請輸入帳號');
            return;
        }

        // 執行登入
        login(username);
    }

    // 登入
    function login(username) {
        // 儲存登入狀態
        localStorage.setItem('username', username);
        window.APP.currentUser = username;

        // 更新 UI
        updateUIForLoggedInUser(username);

        // 隱藏登入模態框
        hideLoginModal();

        // 觸發登入事件
        const event = new CustomEvent('userLoggedIn', { 
            detail: { username } 
        });
        window.dispatchEvent(event);
    }

    // 登出
    function handleLogout() {
        // 清除登入狀態
        localStorage.removeItem('username');
        window.APP.currentUser = null;

        // 更新 UI
        updateUIForLoggedOutUser();

        // 觸發登出事件
        window.dispatchEvent(new Event('userLoggedOut'));
    }

    // 更新已登入用戶的 UI
    function updateUIForLoggedInUser(username) {
        elements.loginButton.style.display = 'none';
        elements.logoutButton.style.display = 'inline-flex';
        elements.userInfo.style.display = 'inline-flex';
        elements.userInfo.textContent = username;
    }

    // 更新未登入用戶的 UI
    function updateUIForLoggedOutUser() {
        elements.loginButton.style.display = 'inline-flex';
        elements.logoutButton.style.display = 'none';
        elements.userInfo.style.display = 'none';
        elements.userInfo.textContent = '';
    }

    // 檢查是否需要登入
    function requireLogin() {
        if (!window.APP.currentUser) {
            showLoginModal();
            return false;
        }
        return true;
    }

    // 獲取當前用戶名
    function getCurrentUsername() {
        return window.APP.currentUser;
    }

    // 檢查登入狀態
    function checkLoginStatus() {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            window.APP.currentUser = savedUsername;
            updateUIForLoggedInUser(savedUsername);
            return true;
        } else {
            window.APP.currentUser = null;
            updateUIForLoggedOutUser();
            return false;
        }
    }

    // 初始化模組
    function init() {
        console.log('Initializing login module...');
        
        if (!initializeElements()) {
            console.error('Failed to initialize login module: Missing required elements');
            return;
        }

        initializeEventListeners();
        checkLoginStatus();
        
        console.log('Login module initialized successfully');
    }

    // 公開 API
    return {
        init,
        requireLogin,
        getCurrentUsername,
        checkLoginStatus
    };
})();

// 當 DOM 載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    loginModule.init();
});
