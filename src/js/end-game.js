
/** Resolves remaining stones on the board at game end.
 *
 * Animates the collection of stones from each player's cells, adding them to their scores.
 *
 * Returns:
 *   Promise<void>: Resolves when all stones are resolved.
 */
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

/** Announces the winner of the game.
 *
 * Displays an alert with the game result (win, loss, or draw) and updates the user's game data.
 *
 * Args:
 *   state (number): The game result (0 for draw, 1 for Player 1 win, 2 for Player 2 win).
 *
 * Returns:
 *   Promise<void>: Resolves when the announcement is complete.
 */
async function announceWinner(state) {
    if (state == 0) {
        updateGameData(currentUser.wins, currentUser.totals + 1);
        alert("Trò chơi kết thúc! Kết quả hoà.");
        return;
    }
    if(state == 1) {
        alert("Trò chơi kết thúc! Người chơi thắng.");
        updateGameData(currentUser.wins + 1, currentUser.totals + 1);
    }
    if(state == 2) {
        alert("Trò chơi kết thúc! Người chơi thua.");
        updateGameData(currentUser.wins, currentUser.totals + 1);
    }
}

/** Checks if the game has ended and resolves it if necessary.
 *
 * Checks if both mandarin cells are empty, resolves remaining points, determines the winner,
 * and starts a new game.
 *
 * Returns:
 *   Promise<boolean>: True if the game has ended, false otherwise.
 */
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