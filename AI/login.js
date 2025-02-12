const loginModule = (() => {
    let currentUsername = null;
    let initialized = false;
    
    // 初始化函數
    function init() {
        if (initialized) return;
        
        // 獲取 DOM 元素
        const loginArea = document.getElementById('login-area');
        const loginInput = document.getElementById('login-username');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const loginStatus = document.getElementById('login-status');
        
        if (!loginArea || !loginInput || !loginButton || !logoutButton || !loginStatus) {
            console.error('找不到登入相關的 DOM 元素');
            return;
        }
        
        // 登入處理
        function handleLogin() {
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
        function handleLogout() {
            currentUsername = null;
            loginInput.style.display = 'block';
            loginInput.value = '';
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            loginStatus.textContent = '';
            
            // 發送登出事件
            document.dispatchEvent(new CustomEvent('userLoggedOut'));
        }
        
        // 綁定事件監聽器
        loginButton.addEventListener('click', handleLogin);
        logoutButton.addEventListener('click', handleLogout);
        
        // 添加鍵盤事件處理
        loginInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
        
        initialized = true;
        console.log('登入模組初始化完成');
    }
    
    // 檢查登入狀態
    function isLoggedIn() {
        return currentUsername !== null;
    }
    
    // 獲取當前用戶名
    function getCurrentUsername() {
        return currentUsername;
    }
    
    // 公開介面
    return {
        init,
        isLoggedIn,
        getCurrentUsername
    };
})();
