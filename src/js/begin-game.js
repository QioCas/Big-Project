const rpp = document.getElementById('random-player-popup');

let countdownInterval = null;

// Hàm hiển thị pop-up và tự động random
function randomizePlayer() {
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('random-player-popup').style.display = 'flex';
    document.getElementById('result').textContent = ''; // Xóa kết quả cũ
    document.getElementById('countdown').textContent = ''; // Xóa đếm ngược cũ
    if (countdownInterval) clearInterval(countdownInterval); // Hủy đếm ngược nếu có

    // Tự động random và đếm ngược
    const players = ['Người chơi 1', 'Người chơi 2'];
    const randomIndex = Math.floor(Math.random() * players.length);
    const selectedPlayer = players[randomIndex];
    document.getElementById('result').textContent = `${selectedPlayer} đi đầu!`;
    window.selectedPlayer = selectedPlayer; // Lưu để dùng trong initGame

    FirstMove = randomIndex + 1;
    currentPlayer = randomIndex + 1;

    // Bắt đầu đếm ngược 5s
    let timeLeft = 5;
    document.getElementById('countdown').textContent = `Bắt đầu sau ${timeLeft} giây...`;
    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            document.getElementById('countdown').textContent = `Bắt đầu sau ${timeLeft} giây...`;
        } else {
            document.getElementById('countdown').textContent = 'Đang bắt đầu!';
            clearInterval(countdownInterval);
            // Chuyển sang trò chơi
            document.getElementById('random-player-popup').style.display = 'none';
            document.getElementById('game').style.display = 'block';
            initGame();
        }
    }, 1000);
}

// Hàm trở về màn hình chờ
function backToWaitingRoom() {
    if (countdownInterval) clearInterval(countdownInterval); // Hủy đếm ngược
    document.getElementById('random-player-popup').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('waiting-room').style.display = 'flex';
}

// Sự kiện phím Esc
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.getElementById('random-player-popup').style.display === 'flex') {
        backToWaitingRoom();
    }
});
