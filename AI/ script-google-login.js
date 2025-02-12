// Google Login Module
const loginModule = (() => {
    // 模組私有變數
    let isLoggedIn = false;
    let userEmail = '';
    const CLIENT_ID = '619176008397-nq6aehvssq4gcpif488d9ctnkdcofv9r.apps.googleusercontent.com'; // 替換為你的 Google OAuth Client ID

    // JWT 解碼函數
    function decodeJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // 更新登入狀態顯示
    function updateLoginStatus() {
        const loginStatus = document.getElementById('login-status');
        const googleSignInDiv = document.querySelector('.g_id_signin');
        const logoutButton = document.getElementById('logout-button');

        if (isLoggedIn && userEmail) {
            loginStatus.textContent = `已登入: ${userEmail}`;
            if (googleSignInDiv) googleSignInDiv.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            loginStatus.textContent = '未登入';
            if (googleSignInDiv) googleSignInDiv.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
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
        isLoggedIn = false;
        userEmail = '';
        
        // 清除本地儲存的登入狀態
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userToken');
        
        updateLoginStatus();
        updateUsernameInputs();

        // 重新初始化 Google 登入按鈕
        initializeGoogleSignIn();
    }

    // 顯示登入提示
    function showLoginPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'login-prompt';
        prompt.innerHTML = `
            <p>此功能需要先登入才能使用</p>
            <div id="prompt-login-button"></div>
            <button id="prompt-cancel" class="login-button">取消</button>
        `;
        document.body.appendChild(prompt);

        // 在提示視窗中渲染 Google 登入按鈕
        google.accounts.id.renderButton(
            document.getElementById('prompt-login-button'),
            { theme: "outline", size: "large" }
        );

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

    // 初始化 Google Sign-In
    function initializeGoogleSignIn() {
        google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        // 渲染登入按鈕
        const loginButtonContainer = document.getElementById('g_id_signin');
        if (loginButtonContainer) {
            google.accounts.id.renderButton(
                loginButtonContainer,
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }

    // 處理 Google 登入回應
    function handleCredentialResponse(response) {
        console.log('Received Google response:', response);
        try {
            const decoded = decodeJWT(response.credential);
            console.log('Decoded token:', decoded);
            
            isLoggedIn = true;
            userEmail = decoded.email;
            
            // 儲存登入狀態和使用者資訊
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userToken', response.credential);

            updateLoginStatus();
            updateUsernameInputs();

            // 如果有登入提示視窗，關閉它
            const loginPrompt = document.querySelector('.login-prompt');
            if (loginPrompt) {
                loginPrompt.remove();
            }
        } catch (error) {
            console.error('Login processing failed:', error);
            handleSignOut();
        }
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
                console.error('Token verification failed:', error);
                handleSignOut();
            }
        }
    }

    // 初始化功能
    function init() {
        // 延遲初始化，確保 Google API 已加載
        if (typeof google !== 'undefined' && google.accounts) {
            initializeGoogleSignIn();
        } else {
            // 如果 API 還沒加載完成，等待它加載
            const checkGoogleApi = setInterval(() => {
                if (typeof google !== 'undefined' && google.accounts) {
                    clearInterval(checkGoogleApi);
                    initializeGoogleSignIn();
                }
            }, 100);
        }

        // 設置登出按鈕
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleSignOut);
        }

        // 檢查儲存的登入狀態
        checkStoredLoginState();

        // 攔截需要登入的功能
        const loadNotesButton = document.getElementById('load-notes-button');
        const loadRecordsButton = document.getElementById('load-records-button');
        const generateNotesButton = document.getElementById('generate-notes-button');

        if (loadNotesButton) {
            const originalLoadNotes = loadNotesButton.onclick;
            loadNotesButton.onclick = function(e) {
                if (checkLoginRequired('loadNotes')) {
                    if (!this.value && isLoggedIn) {
                        document.getElementById('notes-username').value = userEmail;
                    }
                    if (typeof originalLoadNotes === 'function') {
                        originalLoadNotes.call(this, e);
                    }
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
                    if (typeof originalLoadRecords === 'function') {
                        originalLoadRecords.call(this, e);
                    }
                }
            };
        }

        if (generateNotesButton) {
            const originalGenerateNotes = generateNotesButton.onclick;
            generateNotesButton.onclick = function(e) {
                if (checkLoginRequired('generateNotes')) {
                    if (typeof originalGenerateNotes === 'function') {
                        originalGenerateNotes.call(this, e);
                    }
                }
            };
        }
    }

    // 監控 Google API 載入狀態
    window.onload = () => {
        console.log('Page loaded');
        if (window.google) {
            console.log('Google API loaded');
        } else {
            console.log('Google API not loaded');
        }
    };

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
