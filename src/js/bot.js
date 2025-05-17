function botMove() {
    if (currentPlayer === 1) return;

    // Lọc ra những ô hợp lệ mà bot có thể chọn (ô từ 6 đến 10 có ít nhất 1 quân)
    let validIndices = [];
    for (let i = 6; i <= 10; i++) {
        if (board[i] > 0) validIndices.push(i);
    }

    // Lựa chọn chỉ số ngẫu nhiên để chơi
    let index = validIndices[Math.floor(Math.random() * validIndices.length)];

    // Mặc định đi bên phải
    let direction = "right";

    // Bắt đầu di chuyển quân như người chơi thật
    selectedIndex = index;
    moveStones(index, direction);
}
