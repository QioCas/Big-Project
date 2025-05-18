
// Biến xác thực
let token = localStorage.getItem('token');
let currentUser = null;

const authDiv = document.getElementById('auth');
const gameDiv = document.getElementById('game');
const authForm = document.getElementById('auth-form');
const authSubmit = document.getElementById('auth-submit');
const toggleAuth = document.getElementById('toggle-auth');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameDisplay = document.getElementById('username-display');
const winsDisplay = document.getElementById('wins');
const totalsDisplay = document.getElementById('totals');

// URL Backend
const API_URL = 'https://big-project-production.up.railway.app/api'; 

/** Checks the authentication status of the user.
 *
 * Verifies the stored token by fetching user data from the API. If valid, displays the game
 * screen and updates user info; otherwise, shows the authentication form.
 *
 * Returns:
 *   Promise<void>: Resolves when authentication check is complete.
 */
async function checkAuth() {
    if (token) {
        try {
            const response = await fetch(`${API_URL}/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                authDiv.style.display = 'none';
                gameDiv.style.display = 'block';
                updateUserInfo();
                document.getElementById('waiting-room').style.display = 'flex';
                document.getElementById('game').style.display = 'none';
                document.querySelectorAll('.username-display').forEach(span => {
                    span.textContent = currentUser.username;
                });
            } else {
                localStorage.removeItem('token');
                token = null;
                showAuthForm();
            }
        } catch (error) {
            console.error('Lỗi kiểm tra xác thực:', error);
            showAuthForm();
        }
    } else {
        showAuthForm();
    }
}

/** Displays the authentication form for login or registration.
 *
 * Shows the authentication form and configures it for either login or registration mode.
 *
 * Args:
 *   isLogin (boolean, optional): If true, configures for login; otherwise, for registration.
 *       Defaults to true.
 */
function showAuthForm(isLogin = true) {
    authDiv.style.display = 'flex';
    gameDiv.style.display = 'none';
    authSubmit.textContent = isLogin ? 'Đăng nhập' : 'Đăng ký';
    toggleAuth.textContent = isLogin ? 'Đăng ký' : 'Đăng nhập';
    authForm.dataset.mode = isLogin ? 'login' : 'register';
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    const isLogin = authForm.dataset.mode === 'login';
    const endpoint = isLogin ? 'login' : 'register';

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (isLogin) {
                token = data.token;
                localStorage.setItem('token', token);
                currentUser = data.user;
                authDiv.style.display = 'none';
                gameDiv.style.display = 'block';
                updateUserInfo();
                document.getElementById('waiting-room').style.display = 'flex';
                document.getElementById('game').style.display = 'none';
                document.getElementById('username-display').textContent = currentUser.username; 
                alert("Đăng nhập thành công!");
           } else {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                showAuthForm(true);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
});

toggleAuth.addEventListener('click', () => {
    showAuthForm(authForm.dataset.mode !== 'login');
});

/** Updates the displayed user information.
 *
 * Sets the username, wins, and total games played in the UI based on the current user's data.
 */
function updateUserInfo() {
    usernameDisplay.textContent = currentUser.username;
    winsDisplay.textContent = currentUser.wins;
    totalsDisplay.textContent = currentUser.totals;
}


const logoutPopupBtn = document.getElementById('logout-button-popup');
if (logoutPopupBtn) {
    logoutPopupBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        token = null;
        currentUser = null;
        popup.style.display = 'none'; // đóng popup
        showAuthForm(); // quay lại màn hình đăng nhập
    });
}

checkAuth();

document.getElementById('play-btn').addEventListener('click', () => {
    randomizePlayer();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  location.reload();
});

document.getElementById('stats-btn').addEventListener('click', () => {
  alert(`🏆 Thắng: ${currentUser.wins} trận`);

});

document.getElementById('help-btn').addEventListener('click', () => {
  alert("🎮 Luật chơi Ô Ăn Quan:\n Ô ăn quan chơi trên bàn cờ có 12 ô nhỏ và 2 ô quan lớn.\n \
Mỗi ô nhỏ có 5 sỏi, mỗi ô quan có 1 sỏi lớn (quan).\n \
Hai người chơi luân phiên chọn ô nhỏ bên mình.\n \
Lấy hết sỏi trong ô, rải từng viên vào ô tiếp theo.\n \
Rải theo hoặc ngược chiều kim đồng hồ, tùy chọn.\n \
Sỏi hết ở ô trống, ăn sỏi ô kế nếu có sỏi.\n \
Mục tiêu: Thu nhiều sỏi, quan 10 điểm, sỏi nhỏ 1 điểm.\n \
Trò chơi kết thúc khi hai ô quan hết sỏi.\n \
Hết sỏi nhỏ, cấp lại 5 sỏi/ô, không đủ thì thua.\n \
Người nhiều điểm thắng, cần chiến thuật tạo ô trống.");
});

