
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
const coinsDisplay = document.getElementById('coins');

// URL Backend
const API_URL = 'https://big-project-production.up.railway.app/api'; 

// Kiểm tra trạng thái đăng nhập
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
                document.getElementById('username-display').textContent = currentUser.username;
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


function updateUserInfo() {
    usernameDisplay.textContent = currentUser.username;
    winsDisplay.textContent = currentUser.wins;
    coinsDisplay.textContent = currentUser.coins;
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
  document.getElementById('waiting-room').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  initGame();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  location.reload();
});

document.getElementById('stats-btn').addEventListener('click', () => {
  alert(`🏆 Thắng: ${currentUser.wins} trận\n💰 Coins: ${currentUser.coins}`);
});

document.getElementById('help-btn').addEventListener('click', () => {
  alert("🎮 Luật chơi Ô Ăn Quan:\n- Rải sỏi theo chiều chọn.\n- Ăn sỏi để tích điểm.\n- Ai nhiều điểm hơn là thắng.");
});

