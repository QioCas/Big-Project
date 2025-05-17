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
            if (cell) {
                await renderIndex(cell); // Render with animation
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
            }

        }
        return true;
    }
    return true;
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function removeOneStoneFromCell(index, isQuan = false) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;

    // Xoá một viên sỏi (hoặc quan)
    const stones = cell.querySelectorAll(isQuan ? '.quan-stone' : '.stone');
    if (stones.length > 0) {
        cell.removeChild(stones[stones.length - 1]);
    }
}

async function animateEating(index) {
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

        await removeOneStoneFromCell(index, false); // false: là Dân
        await delay(300);
    }

    renderBoard();
}

async function moveStones(index, direction, cont = 0) {
    if(cont == 0) {
        numberClick++;
    }
    let stones = board[index];
    board[index] = 0;
    renderBoard();
    updateStonesInHand(stones);
    highlightCell(index);
    await new Promise(resolve => setTimeout(resolve, 400));
    let i = index;

    // Rải quân
    while (stones > 0) {
        i = getNextPos(i, direction);
        board[i]++;
        stones--;
        renderBoard();
        highlightCell(i);
        updateStonesInHand(stones);
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Kiểm tra sau rải
    let next = getNextPos(i, direction);
    let next2 = getNextPos(i, direction, 2);

    if (board[next] > 0 && next !== 5 && next !== 11) {
        // Nếu ô kế tiếp có quân và không phải ô quan → tiếp tục rải
        await moveStones(next, direction, 1);
    } else if (board[next] === 0 && board[next2] > 0 && next !== 5 && next !== 11) {
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
