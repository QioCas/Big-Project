const rpp = document.getElementById('random-player-popup');

let countdownInterval = null;

/** Displays the popup to randomly select the first player and start a countdown.
 *
 * Hides the waiting room, shows the popup, randomly selects a player, and starts a 5-second
 * countdown before initializing the game. Stores the selected player in `window.selectedPlayer`
 * and sets `FirstMove` and `currentPlayer`.
 */
function randomizePlayer() {
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('random-player-popup').style.display = 'flex';
    document.getElementById('result').textContent = ''; // Xóa kết quả cũ
    document.getElementById('countdown').textContent = ''; // Xóa đếm ngược cũ
    if (countdownInterval) clearInterval(countdownInterval); // Hủy đếm ngược nếu có

    // Tự động random và đếm ngược
    const players = ['Player', 'Bot'];
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

/** Returns to the waiting room screen.
 *
 * Clears the countdown interval, hides the popup and game screens, and shows the waiting room.
 */
function backToWaitingRoom() {
    if (countdownInterval) clearInterval(countdownInterval); // Hủy đếm ngược
    document.getElementById('random-player-popup').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('waiting-room').style.display = 'flex';
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.getElementById('random-player-popup').style.display === 'flex') {
        backToWaitingRoom();
    }
});
