// script-login.js
const loginModule = (() => {
    // 私有變數
    let isLoggedIn = false;
    let currentUsername = '';

    // DOM 元素
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');
    const loginModal = document.getElementById('login-modal');
    const closeModalButton = document.getElementById('close-modal');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');

    // 初始化函數
    function init() {
        // 檢查是否已登入
        checkLoginStatus();
        
        // 綁定事件
        loginButton.addEventListener('click', showLoginModal);
        logoutButton.addEventListener('click', logout);
        closeModalButton.addEventListener('click', hideLoginModal);
        loginForm.addEventListener('submit', handleLogin);

        // 點擊模態框外部關閉
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });

        // 監聽存儲變化
        window.addEventListener('storage', (e) => {
            if (e.key === 'username') {
                checkLoginStatus();
            }
        });
    }

    // 檢查登入狀態
    function checkLoginStatus() {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            isLoggedIn = true;
            currentUsername = savedUsername;
            updateUIForLoggedInUser();
        } else {
            isLoggedIn = false;
            currentUsername = '';
            updateUIForLoggedOutUser();
        }
    }

    // 處理登入
    function handleLogin(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            login(username);
        }
    }

    // 登入
    function login(username) {
        localStorage.setItem('username', username);
        isLoggedIn = true;
        currentUsername = username;
        updateUIForLoggedInUser();
        hideLoginModal();
        
        // 觸發登入事件
        const event = new CustomEvent('userLoggedIn', { detail: { username } });
        window.dispatchEvent(event);
    }

    // 登出
    function logout() {
        localStorage.removeItem('username');
        isLoggedIn = false;
        currentUsername = '';
        updateUIForLoggedOutUser();
        
        // 觸發登出事件
        window.dispatchEvent(new Event('userLoggedOut'));
    }

    // 更新已登入用戶的 UI
    function updateUIForLoggedInUser() {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-flex';
        userInfo.style.display = 'inline-flex';
        userInfo.textContent = currentUsername;
    }

    // 更新未登入用戶的 UI
    function updateUIForLoggedOutUser() {
        loginButton.style.display = 'inline-flex';
        logoutButton.style.display = 'none';
        userInfo.style.display = 'none';
        userInfo.textContent = '';
    }

    // 顯示登入模態框
    function showLoginModal() {
        loginModal.style.display = 'flex';
    }

    // 隱藏登入模態框
    function hideLoginModal() {
        loginModal.style.display = 'none';
        usernameInput.value = '';
    }

    // 檢查是否需要登入
    function requireLogin() {
        if (!isLoggedIn) {
            showLoginModal();
            return false;
        }
        return true;
    }

    // 獲取當前用戶名
    function getCurrentUsername() {
        return currentUsername;
    }

    // 公開 API
    return {
        init,
        requireLogin,
        getCurrentUsername,
        checkLoginStatus
    };
})();

// 初始化登入模組
document.addEventListener('DOMContentLoaded', () => {
    loginModule.init();
});