function getNextPos(i, direction, step = 1) {
    step = (currentPlayer === 1 ? step : 12 - step);
    step = (direction === 'right' ? step : 12 - step);
    return (i + step) % 12;
}


function getAdjacentCells(index) {
    const adjacents = [];
    // For Player 1 (indices 0–4)
    if (currentPlayer === 1 && (index + 1) % 12 <= 5) {
        if (index >= 0) adjacents.push((index + 12 - 1) % 12); // Left
        if (index <= 4) adjacents.push(index + 1); // Right
    }
    // For Player 2 (indices 6–10)
    if (currentPlayer === 2 && index >= 6 && index <= 11) {
        if (index >= 6) adjacents.push(index - 1); // Left
        if (index <= 10) adjacents.push(index + 1); // Right
    }
    return adjacents;
}
// Thêm vào file utils.js hoặc tạo file mới effects.js
function showEmoji(cell, emoji) {
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'emoji-overlay';
    emojiDiv.textContent = emoji;
    cell.appendChild(emojiDiv);
    // Xóa emoji sau khi animation kết thúc
    setTimeout(() => {
        if (emojiDiv.parentNode) {
            emojiDiv.parentNode.removeChild(emojiDiv);
        }
    }, 400);
}