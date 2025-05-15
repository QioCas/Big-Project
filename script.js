let scores = [0, 0]; // scores[0] là người chơi 1, scores[1] là người chơi 2
let board = [5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 0]; // Quan cells start at 0
let quanStones = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]; // 1 = has Quan stone, 0 = no Quan stone

let currentPlayer = 1;
let quanPoints = 5; // Default Quan points, can be 5 or 10
let selectedIndex = -1; // Track the selected cell

// Prompt players to set Quan points at the start

function updateScores() {
    document.getElementById('score1').innerText = scores[0];
    document.getElementById('score2').innerText = scores[1];
}

function updateMessage(msg) {
    document.getElementById('message').innerText = msg;
}

function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const index = parseInt(cell.getAttribute('data-index'));
        // Set stone count for bottom-right display (civilian + Quan value)
        let stoneCount = board[index];
        if (quanStones[index] === 1) {
            stoneCount = board[index] + quanPointValue; // Add Quan stone value
        }
        cell.setAttribute('data-stone-count', stoneCount > 0 ? stoneCount : '');
        cell.innerText = ''; // Clear innerText since ::after handles display
    });
}

function highlightCell(index, isAdjacent = false) {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('highlight', 'adjacent-highlight');
    });
    if (index >= 0) {
        const target = document.querySelector(`.cell[data-index="${index}"]`);
        if (target) {
            target.classList.add(isAdjacent ? 'adjacent-highlight' : 'highlight');
        }
    }
}

function highlightAdjacentCells(index) {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('adjacent-highlight');
    });
    const adjacents = getAdjacentCells(index);
    adjacents.forEach(adj => {
        const target = document.querySelector(`.cell[data-index="${adj}"]`);
        if (target) {
            target.classList.add('adjacent-highlight');
        }
    });
}

function updateStonesInHand(stones) {
    document.getElementById('stones-in-hand').innerText = `Sỏi trên tay: ${stones}`;
}

function getNextPos(i, direction, step = 1) {
    if (currentPlayer === 1) {
        return (direction === 'right') ? (i + step) % 12 : (i - step + 12) % 12;
    } else {
        return (direction === 'left') ? (i + step) % 12 : (i - step + 12) % 12;
    }
}

async function checkAndDistributeStones() {
    let cellsToCheck = currentPlayer === 1 ? [0, 1, 2, 3, 4] : [6, 7, 8, 9, 10];
    const allEmpty = cellsToCheck.every(index => board[index] === 0);

    if (allEmpty) {
        if (scores[currentPlayer - 1] < 5) {
            alert(`Người chơi ${currentPlayer} không đủ điểm để tiếp tục! Trò chơi kết thúc! Điểm: Người chơi 1: ${scores[0]}, Người chơi 2: ${scores[1]}`);
            return false;
        }
        updateMessage(`Tất cả ô dân của Người chơi ${currentPlayer} rỗng. Đặt 1 sỏi vào mỗi ô...`);
        for (let index of cellsToCheck) {
            board[index] = 1;
            scores[currentPlayer - 1]--;
            updateScores()
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('drop-animation');
                cell.innerText = board[index];
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
                cell.classList.remove('drop-animation');
            }
        }
        updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
        return true;
    }
    return true;
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

async function moveStones(index, direction, cont = 0) {
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
                let points = board[next2] + (quanStones[next2] * quanPointValue);
                scores[currentPlayer - 1] += points;
                board[next2] = 0;
                quanStones[next2] = 0;

                highlightCell(next);
                await new Promise(resolve => setTimeout(resolve, 500));

                updateScores();
                renderBoard();

                highlightCell(next2);
                await new Promise(resolve => setTimeout(resolve, 500));

                alert(`Bạn ăn ${points} điểm ở ô ${next2}`);
                currentPos = next2;
            } else {
                break; // Không tiếp tục ăn được nữa
            }
        }
    }

    highlightCell(-1); // Xoá highlight
    if (cont === 0) {
        checkGameEnd();
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        selectedIndex = -1;
        if (await checkAndDistributeStones()) {
            updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
        }
    }
    renderBoard();
}

function handleClick(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'));

    // Step 1: Select a cell
    if (selectedIndex === -1) {
        const isPlayer1 = currentPlayer === 1 && index >= 0 && index <= 4;
        const isPlayer2 = currentPlayer === 2 && index >= 6 && index <= 10;
        if (!isPlayer1 && !isPlayer2) return;
        if (board[index] === 0) return;

        selectedIndex = index;
        highlightCell(index);
        highlightAdjacentCells(index);
        updateMessage(`Chọn ô bên cạnh (${getAdjacentCells(index).join(', ')}) để quyết định hướng đi.`);
    }
    // Step 2: Select an adjacent cell for direction
    else {
        const adjacents = getAdjacentCells(selectedIndex);
        if (index == selectedIndex) {
            selectedIndex = -1;
            highlightCell(-1); // Xoá highlight
            updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
            return;
        }
        if (!adjacents.includes(index)) return;

        // Determine direction based on adjacent cell (DEBUG)
        let direction = '';
        if (currentPlayer == 1)
            direction = index == (selectedIndex + 1) % 12 ? 'right' : 'left';
        else
            direction = index == (selectedIndex + 1) % 12 ? 'left' : 'right';

        highlightCell(-1); // Clear highlights
        moveStones(selectedIndex, direction);
    }
}

document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick);
});

function initializeGame() {
    let choice;
    do {
        choice = prompt("Chọn điểm cho sỏi Quan (5 hoặc 10):", "5");
    } while (choice !== "5" && choice !== "10");
    quanPointValue = parseInt(choice);
    board[5] = 0; // No civilian stones in Quan cells initially
    board[11] = 0;
    quanStones[5] = 1; // Quan stone in cell 5
    quanStones[11] = 1; // Quan stone in cell 11
    renderBoard();
    checkAndDistributeStones();
    updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
}

initializeGame();

function checkGameEnd() {
    if (quanStones[5] == 0 & quanStones[11] == 0 & board[5] == 0 && board[11] == 0) {
        alert(`Trò chơi kết thúc! Điểm: Người chơi 1: ${scores[0]}, Người chơi 2: ${scores[1]}`);
    }
}
