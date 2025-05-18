async function resolvePoints() {
    const cell0 = [0, 1, 2, 3, 4];
    const cell1 = [6, 7, 8, 9, 10];

    // Animate stone removal for Player 1's cells
    for (let index of cell0) {
        while (board[index] > 0) {
            highlightCell(index);
            // Thêm emoji 🫳
            const nextcell = document.querySelector(`.cell[data-index="${index}"]`);
            showEmoji(nextcell, '🫳');
            board[index]--;
            scores[0]++;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                renderIndex(cell); // Update with new stone count
                updateScores(1);
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for visual update
            }
        }
    }

    // Animate stone removal for Player 2's cells
    for (let index of cell1) {
        while (board[index] > 0) {
            highlightCell(index);
            const nextcell = document.querySelector(`.cell[data-index="${index}"]`);
            showEmoji(nextcell, '🫳');

            board[index]--;
            scores[1]++;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                renderIndex(cell); // Update with new stone count
                updateScores(2);
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for visual update
            }
        }
    }
    highlightCell(-1);
}

async function announceWinner(state) {
    if (state == 0) {
        alert("Trò chơi kết thúc! Kết quả hoà.");
        return;
    }
    if(state == 1) {
        alert("Trò chơi kết thúc! Người chơi thắng.");
        updateGameData(currentUser.wins + 1, currentUser.coins + 10);
    }
    if(state == 2) {
        alert("Trò chơi kết thúc! Người chơi thua.");
    }
}

async function checkGameEnd() {
    if (quanStones[5] == 0 && quanStones[11] == 0 && board[5] == 0 && board[11] == 0) {
        await resolvePoints();
        let totalX = scores[0];
        let totalY = scores[1];

        const winner = totalX > totalY ? 1 : totalX < totalY ? 2 : 0;
        announceWinner(winner);
        newGame = 1;
        initGame();
        return true;
    }
    return false;
}