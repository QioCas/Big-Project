/** Checks and distributes stones when a player's cells are empty.
 *
 * If all cells of the current player are empty, either ends the game (if insufficient score)
 * or distributes one stone to each cell from the player's score, with animations.
 *
 * Returns:
 *   Promise<boolean>: True if the game continues, false if it ends.
 */
async function checkAndDistributeStones() {
    let cellsToCheck = currentPlayer === 1 ? [0, 1, 2, 3, 4] : [6, 7, 8, 9, 10];
    const allEmpty = cellsToCheck.every(index => board[index] === 0);

    if (allEmpty) {
        if (scores[currentPlayer - 1] < 5) {
            alert(`Người chơi ${currentPlayer} không đủ điểm để tiếp tục!`);
            announceWinner(currentPlayer == 1 ? 2 : 1);
            newGame = 1;
            initGame();

            return false;
        }
        for (let index of cellsToCheck) {
            board[index] = 1;
            scores[currentPlayer - 1]--;
            updateScores(currentPlayer);
            
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            showEmoji(cell, '🫳');
            if (cell) {
                await renderIndex(cell); // Render with animation
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
            }

        }
        return true;
    }
    return true;
}

/** Removes one stone from a cell with animation.
 *
 * Removes a single stone (or mandarin stone) from the specified cell and updates the UI.
 *
 * Args:
 *   index (number): The index of the cell to remove a stone from.
 *   isQuan (boolean, optional): If true, removes a mandarin stone. Defaults to false.
 *
 * Returns:
 *   Promise<void>: Resolves when the stone is removed.
 */
async function removeOneStoneFromCell(index, isQuan = false) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;

    // Xoá một viên sỏi (hoặc quan)
    const stones = cell.querySelectorAll(isQuan ? '.quan-stone' : '.stone');
    if (stones.length > 0) {
        cell.removeChild(stones[stones.length - 1]);
    }
}

/** Animates the process of capturing stones from a cell.
 *
 * Handles capturing mandarin stones (if present) and small stones, updating scores and the UI
 * with animations.
 *
 * Args:
 *   index (number): The index of the cell to capture stones from.
 *
 * Returns:
 *   Promise<void>: Resolves when the capture animation is complete.
 */
async function animateEating(index) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    showEmoji(cell, '🫳');

    // Ăn Quan trước (nếu có)
    if (quanStones[index]) {
        quanStones[index] = 0;
        board[index] += 10;

        for (let i = 0; i < quanPoints; i++) {
            scores[currentPlayer - 1] += 1;
            board[index]--;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            renderIndex(cell); // Update with new stone count
            updateScores(currentPlayer);
            onPlayerEat(currentPlayer, scores[currentPlayer - 1]); // Gọi onPlayerEat
            await delay(300);
        }
        await removeOneStoneFromCell(index, true); // true: là Quan
        quanStones[index] = 0;
        await delay(300);
    }

    // Ăn Dân
    while (board[index] > 0) {
        board[index]--;
        scores[currentPlayer - 1] += 1;
        updateScores(currentPlayer);
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        renderIndex(cell); // Update with new stone count
        onPlayerEat(currentPlayer, scores[currentPlayer - 1]); // Gọi onPlayerEat
        await removeOneStoneFromCell(index, false); // false: là Dân
        await delay(300);
    }

    renderBoard();
}

/** Executes a move by spreading and capturing stones.
 *
 * Spreads stones from the specified cell in the given direction, captures stones if possible,
 * and updates the game state. Handles recursive moves and game end conditions.
 *
 * Args:
 *   index (number): The index of the cell to start the move from.
 *   direction (string): The direction to spread stones ('right' or 'left').
 *   cont (number, optional): Indicates if the move is a continuation (1) or initial (0).
 *       Defaults to 0.
 *
 * Returns:
 *   Promise<void>: Resolves when the move is complete.
 */
async function moveStones(index, direction, cont = 0) {
    if(cont == 0) {
        numberClick++;
    }
    let stones = board[index];
    board[index] = 0;
    renderBoard();
    updateStonesInHand(stones);
    highlightCell(index);
    if(cont != 0) {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        showEmoji(cell, '🫳');
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    let i = index;

    // Rải quân
    while (stones > 0) {
        i = getNextPos(i, direction);
        board[i]++;
        stones--;
        renderBoard();
        highlightCell(i);
        const cell = document.querySelector(`.cell[data-index="${i}"]`);
        showEmoji(cell, '🫳');

        updateStonesInHand(stones);
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Kiểm tra sau rải
    let next = getNextPos(i, direction);
    let next2 = getNextPos(i, direction, 2);

    if (board[next] > 0 && next !== 5 && next !== 11) {
        // Nếu ô kế tiếp có quân và không phải ô quan → tiếp tục rải
        await moveStones(next, direction, 1);
    } else if (board[next] === 0 && (board[next2] > 0 && (!isFirstMove || (next2 !== 5 && next2 !== 11))) && next !== 5 && next !== 11) {
        let currentPos = i;

        while (true) {
            let next = getNextPos(currentPos, direction, 1);
            let next2 = getNextPos(currentPos, direction, 2);

            if (
                board[next] === 0 &&
                board[next2] > 0 &&
                next !== 5 &&
                next !== 11
            ) {
                highlightCell(next);
                const nextCell = document.querySelector(`.cell[data-index="${next}"]`);
                showEmoji(nextCell, '🤚');
                // Check if next2 is a Quan cell
                highlightCell(next2);
                await animateEating(next2);
                highlightCell(-1);

                currentPos = next2;
            } else {
                break; // Không tiếp tục ăn được nữa
            }
        }
    }

    highlightCell(-1); // Xoá highlight
    if (cont === 0) {
        isFirstMove = 0;
        if(await checkGameEnd() == false) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            selectedIndex = -1;
            await checkAndDistributeStones();
            if(currentPlayer === 2) {
                botMove();
            }
        }
        numberClick--;
    }
    renderBoard();
}

