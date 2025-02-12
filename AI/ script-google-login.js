// Google Login Module
const loginModule = (() => {
    // 模組私有變數
    let isLoggedIn = false;
    let userEmail = '';
    const CLIENT_ID = 'YOUR_CLIENT_ID'; // 替換為你的 Google OAuth Client ID

    // JWT 解碼函數
    function decodeJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // 初始化 Google Sign-In
    function initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });
    }

    // 處理 Google 登入回應
    function handleCredentialResponse(response) {
        try {
            const decoded = decodeJWT(response.credential);
            isLoggedIn = true;
            userEmail = decoded.email;
            
            // 儲存登入狀態和使用者資訊
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userToken', response.credential);

            updateLoginStatus();
            updateUsernameInputs();
        } catch (error) {
            console.error('登入處理失敗:', error);
            handleSignOut();
        }
    }

    // 更新登入狀態顯示
    function updateLoginStatus() {
        const loginStatus = document.getElementById('login-status');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');

        if (isLoggedIn && userEmail) {
            loginStatus.textContent = `已登入: ${userEmail}`;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
        } else {
            loginStatus.textContent = '未登入';
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
        }
    }

    // 自動填入使用者帳號
    function updateUsernameInputs() {
        if (isLoggedIn && userEmail) {
            const notesUsername = document.getElementById('notes-username');
            const recordsUsername = document.getElementById('records-username');
            if (notesUsername) notesUsername.value = userEmail;
            if (recordsUsername) recordsUsername.value = userEmail;
        }
    }

    // 處理登出
    function handleSignOut() {
        google.accounts.id.disableAutoSelect();
        isLoggedIn = false;
        userEmail = '';
        
        // 清除本地儲存的登入狀態
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');
        
        updateLoginStatus();
        updateUsernameInputs();
    }

    // 顯示登入提示
    function showLoginPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'login-prompt';
        prompt.innerHTML = `
            <p>此功能需要先登入才能使用</p>
            <button id="prompt-login" class="login-button">立即登入</button>
            <button id="prompt-cancel" class="login-button">取消</button>
        `;
        document.body.appendChild(prompt);

        document.getElementById('prompt-login').onclick = () => {
            document.body.removeChild(prompt);
            google.accounts.id.prompt();
        };

        document.getElementById('prompt-cancel').onclick = () => {
            document.body.removeChild(prompt);
        };
    }

    // 檢查是否需要登入
    function checkLoginRequired(action) {
        if (!isLoggedIn) {
            showLoginPrompt();
            return false;
        }
        return true;
    }

    // 檢查本地儲存的登入狀態
    function checkStoredLoginState() {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const storedUserEmail = localStorage.getItem('userEmail');
        const storedToken = localStorage.getItem('userToken');

        if (storedIsLoggedIn === 'true' && storedUserEmail && storedToken) {
            try {
                const decoded = decodeJWT(storedToken);
                const currentTime = Math.floor(Date.now() / 1000);
                
                // 檢查 token 是否過期
                if (decoded.exp && decoded.exp > currentTime) {
                    isLoggedIn = true;
                    userEmail = storedUserEmail;
                    updateLoginStatus();
                    updateUsernameInputs();
                } else {
                    handleSignOut();
                }
            } catch (error) {
                console.error('Token 驗證失敗:', error);
                handleSignOut();
            }
        }
    }

    // 初始化功能
    function init() {
        // 初始化 Google Sign-In
        initializeGoogleSignIn();
        
        // 設置登入按鈕
        const loginButton = document.getElementById('login-button');
        loginButton.addEventListener('click', () => {
            google.accounts.id.prompt();
        });

        // 設置登出按鈕
        const logoutButton = document.getElementById('logout-button');
        logoutButton.addEventListener('click', handleSignOut);

        // 檢查儲存的登入狀態
        checkStoredLoginState();

        // 攔截需要登入的功能
        const loadNotesButton = document.getElementById('load-notes-button');
        const loadRecordsButton = document.getElementById('load-records-button');
        const generateNotesButton = document.getElementById('generate-notes-button');

        // 包裝需要登入的按鈕事件
        if (loadNotesButton) {
            const originalLoadNotes = loadNotesButton.onclick;
            loadNotesButton.onclick = function(e) {
                if (checkLoginRequired('loadNotes')) {
                    if (!this.value && isLoggedIn) {
                        document.getElementById('notes-username').value = userEmail;
                    }
                    originalLoadNotes.call(this, e);
                }
            };
        }

        if (loadRecordsButton) {
            const originalLoadRecords = loadRecordsButton.onclick;
            loadRecordsButton.onclick = function(e) {
                if (checkLoginRequired('loadRecords')) {
                    if (!this.value && isLoggedIn) {
                        document.getElementById('records-username').value = userEmail;
                    }
                    originalLoadRecords.call(this, e);
                }
            };
        }

        if (generateNotesButton) {
            const originalGenerateNotes = generateNotesButton.onclick;
            generateNotesButton.onclick = function(e) {
                if (checkLoginRequired('generateNotes')) {
                    originalGenerateNotes.call(this, e);
                }
            };
        }
    }

    // 公開的介面
    return {
        init,
        checkLoginRequired,
        isLoggedIn: () => isLoggedIn,
        getUserEmail: () => userEmail
    };
})();

// 初始化登入模組
document.addEventListener('DOMContentLoaded', () => {
    loginModule.init();
});