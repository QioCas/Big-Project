// score-box.js
let hideTimeout1, hideTimeout2;

// Hiển thị box
function showScoreBox(player) {
    const container = document.getElementById(`player${player}-container`);
    container.classList.remove('hidden');
    clearTimeout(hideTimeout1);
    clearTimeout(hideTimeout2);
}

// Ẩn box sau một khoảng thời gian
function hideScoreBox(player, delay = 200) {
    const container = document.getElementById(`player${player}-container`);
    if (!container.matches(':hover')) {
        if (player === 1) {
            hideTimeout1 = setTimeout(() => {
                container.classList.add('hidden');
            }, delay);
        } else {
            hideTimeout2 = setTimeout(() => {
                container.classList.add('hidden');
            }, delay);
        }
    }
}

// Khởi tạo: ẩn box ban đầu
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('player1-container').classList.add('hidden');
    document.getElementById('player2-container').classList.add('hidden');
});

// Xử lý hover cho score-tab và score-container
document.querySelectorAll('.score-tab, .score-container').forEach(element => {
    element.addEventListener('mouseenter', () => {
        const player = element.closest('.score-container').id.includes('player1') ? 1 : 2;
        showScoreBox(player);
    });
    element.addEventListener('mouseleave', () => {
        const player = element.closest('.score-container').id.includes('player1') ? 1 : 2;
        hideScoreBox(player);
    });
});

// Hàm gọi khi người chơi ăn quân
function onPlayerEat(player, stoneCount) {
    const scoreBox = document.getElementById(`score${player}-display`);
    scoreBox.classList.add('updated');
    showScoreBox(player);
    renderScoreBox(scoreBox, stoneCount); // Cập nhật số sỏi
    setTimeout(() => {
        scoreBox.classList.remove('updated');
        hideScoreBox(player, 300); // Ẩn sau 3 giây
    }, 300);
}