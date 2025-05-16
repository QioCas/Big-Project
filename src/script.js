// Biến xác thực
let token = localStorage.getItem('token');
let currentUser = null;

// DOM Elements
const authDiv = document.getElementById('auth');
const gameDiv = document.getElementById('game');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const toggleAuth = document.getElementById('toggle-auth');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameDisplay = document.getElementById('username-display');
const winsDisplay = document.getElementById('wins');
const coinsDisplay = document.getElementById('coins');
const logoutButton = document.getElementById('logout');
const scoresDiv = document.getElementById('scores');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const stonesInHand = document.getElementById('stones-in-hand');
const messageDiv = document.getElementById('message');
const gameBoard = document.getElementById('game-board');

// URL Backend
const API_URL = 'https://big-project-production.up.railway.app/api'; 

// Kiểm tra trạng thái đăng nhập
async function checkAuth() {
    if (token) {
        try {
            const response = await fetch(`${API_URL}/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                currentUser = await response.json();
                authDiv.style.display = 'none';
                gameDiv.style.display = 'block';
                updateUserInfo();
                initializeGame();
            } else {
                localStorage.removeItem('token');
                token = null;
                showAuthForm();
            }
        } catch (error) {
            console.error('Lỗi kiểm tra xác thực:', error);
            showAuthForm();
        }
    } else {
        showAuthForm();
    }
}

function showAuthForm(isLogin = true) {
    authDiv.style.display = 'block';
    gameDiv.style.display = 'none';
    authTitle.textContent = isLogin ? 'Đăng nhập' : 'Đăng ký';
    authSubmit.textContent = isLogin ? 'Đăng nhập' : 'Đăng ký';
    toggleAuth.textContent = isLogin ? 'Đăng ký' : 'Đăng nhập';
    authForm.dataset.mode = isLogin ? 'login' : 'register';
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    const isLogin = authForm.dataset.mode === 'login';
    const endpoint = isLogin ? 'login' : 'register';

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (isLogin) {
                token = data.token;
                localStorage.setItem('token', token);
                currentUser = data.user;
                authDiv.style.display = 'none';
                gameDiv.style.display = 'block';
                updateUserInfo();
                initializeGame();
            } else {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                showAuthForm(true);
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi xác thực:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
});

toggleAuth.addEventListener('click', () => {
    showAuthForm(authForm.dataset.mode !== 'login');
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showAuthForm();
});

function updateUserInfo() {
    usernameDisplay.textContent = currentUser.username;
    winsDisplay.textContent = currentUser.wins;
    coinsDisplay.textContent = currentUser.coins;
}

async function updateGameData(wins, coins) {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wins, coins })
        });
        if (response.ok) {
            currentUser = await response.json();
            updateUserInfo();
        } else {
            console.error('Lỗi cập nhật dữ liệu trò chơi');
        }
    } catch (error) {
        console.error('Lỗi cập nhật dữ liệu:', error);
    }
}

let scores = [0, 0]; // scores[0] là người chơi 1, scores[1] là người chơi 2
let board = [5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 0]; // Quan cells start at 0
let quanStones = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]; // 1 = has Quan stone, 0 = no Quan stone

let newGame = 0;
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

function renderIndex(cell) {
    const index = parseInt(cell.getAttribute('data-index'));
    // Calculate total stone count (civilian + Quan value)
    let stoneCount = board[index]; // Only civilian stones for rendering
    let hasQuanStone = quanStones[index] === 1; // Check if quan stone is present
    let quanValue = hasQuanStone ? quanPoints : 0; // Quan points if quan stone exists
    cell.setAttribute('data-stone-count', (stoneCount + quanValue) > 0 ? (stoneCount + quanValue) : '');

    // Clear existing stones
    cell.innerHTML = ''; // Remove any previous stone elements

    // Determine cell dimensions
    const isQuan = cell.classList.contains('quan');
    const cellWidth = 60; // Width is the same for all cells
    const cellHeight = isQuan ? 125 : 60; // Quan cells are taller

    // Center of the cell
    let centerX = cellWidth / 2;
    const centerY = cellHeight / 2;

    if (isQuan && hasQuanStone) {
        // Render quan cell with quan stone (large central circle + regular stones concentrated around it)
        // Add the large central quan stone
        const quanStone = document.createElement('div');
        quanStone.classList.add('quan-stone'); // No animation
        quanStone.style.left = `${centerX - 10}px`; // Center the 24px quan stone
        quanStone.style.top = `${centerY - 10}px`; // Center vertically
        
        // Render regular stones concentrated around the quan stone (excluding center)
        if (stoneCount > 0) {
            const radius = Math.min(cellWidth, cellHeight) / 1.5; // Reduced radius to bring stones closer
            
            // Place extra stones closer to the center if any
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); // No animation
                const smallRadius = radius / 2; // Half the radius for tighter clustering
                const angle = (i / stoneCount) * 2 * Math.PI; // Evenly spaced
                const posX = centerX + smallRadius * Math.cos(angle) - 3;
                const posY = centerY + smallRadius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        }
        cell.appendChild(quanStone);
    } else {
        // Render as a regular cell (dân cell or quan cell without quan stone)
        if (stoneCount >= 7) {
            // Concentrated arrangement for 7 or more stones
            const radius = Math.min(cellWidth, cellHeight) / 6; // Small radius for tight center clustering
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); // No animation
                const angle = (i / stoneCount) * 2 * Math.PI; // Evenly spaced
                const posX = centerX + radius * Math.cos(angle) - 3;
                const posY = centerY + radius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        } else if (stoneCount >= 4) {
            // Circular arrangement for 4 to 6 stones
            const radius = Math.min(cellWidth, cellHeight) / 3; // Standard radius
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); // No animation
                const angle = (i / stoneCount) * 2 * Math.PI; // Evenly spaced
                const posX = centerX + radius * Math.cos(angle) - 3;
                const posY = centerY + radius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        } else if (stoneCount > 0) {
            // Grid-like or linear arrangement for 0 to 3 stones
            const stoneSize = 12; // Stone diameter (including some spacing)
            const maxCols = Math.floor(cellWidth / stoneSize); // Max stones per row
            const stonesPerRow = Math.min(maxCols, Math.ceil(Math.sqrt(stoneCount))); // Aim for a square-ish grid

            // Calculate starting position to center the grid
            const totalWidth = stonesPerRow * stoneSize;
            const totalHeight = Math.ceil(stoneCount / stonesPerRow) * stoneSize;
            const startX = (cellWidth - totalWidth) / 2; // Center horizontally
            const startY = (cellHeight - totalHeight) / 2; // Center vertically

            // Generate stones in a grid pattern
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); // No animation

                // Calculate row and column
                const row = Math.floor(i / stonesPerRow);
                const col = i % stonesPerRow;

                // Calculate position
                const posX = startX + col * stoneSize + stoneSize / 2 - 5; // Center the stone in its grid slot
                const posY = startY + row * stoneSize + stoneSize / 2 - 5;

                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        }
    }
}


function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        renderIndex(cell)
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
            updateScores();
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                await renderIndex(cell); // Render with animation
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
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
                let points = board[next2] + (quanStones[next2] * quanPoints);
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
        if(await checkGameEnd() == false) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            selectedIndex = -1;
    
            if (await checkAndDistributeStones()) {
                updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
            }
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


async function initializeGame() {
    renderBoard();
    currentPlayer = 1;
    scores[0] = scores[1] = 0;
    updateScores();
    if (newGame == 1) {
        board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        quanStones = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        renderBoard();
        quanStones[5] = 1;
        quanStones[11] = 1;
        let cells = [5, 0, 1, 2, 3, 4, 11, 6, 7, 8, 9, 10];
        for (let index of cells) {
            board[index] = (index == 5 || index == 11) ? 0 : 5;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                await renderIndex(cell); // Render with animation
            }
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation

        }
        newGame = 0;
    } else {
        renderBoard(); // Render without animation for non-new games
    }
    updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
}
async function calculation() {
    const cell0 = [0, 1, 2, 3, 4];
    const cell1 = [6, 7, 8, 9, 10];

    // Animate stone removal for Player 1's cells
    for (let index of cell0) {
        while (board[index] > 0) {
            highlightCell(index);
            board[index]--;
            scores[0]++;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                renderIndex(cell); // Update with new stone count
                updateScores();
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for visual update
            }
        }
    }

    // Animate stone removal for Player 2's cells
    for (let index of cell1) {
        while (board[index] > 0) {
            highlightCell(index);
            board[index]--;
            scores[1]++;
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            if (cell) {
                renderIndex(cell); // Update with new stone count
                updateScores();
                await new Promise(resolve => setTimeout(resolve, 300)); // Wait for visual update
            }
        }
    }
    highlightCell(-1);
}
async function checkGameEnd() {
    if (quanStones[5] == 0 && quanStones[11] == 0 && board[5] == 0 && board[11] == 0) {
        await calculation(); // Wait for calculation animation to complete
        const winner = scores[0] > scores[1] ? 1 : scores[0] < scores[1] ? 2 : 0;
        let message = `Trò chơi kết thúc! Điểm: Người chơi 1: ${scores[0]}, Người chơi 2: ${scores[1]}`;
        if (winner) {
            message += `\nNgười chơi ${winner} thắng!`;
            if (currentUser && winner === currentPlayer) {
                updateGameData(currentUser.wins + 1, currentUser.coins + 10);
            }
        } else {
            message += '\nHòa!';
        }
        alert(message);
        newGame = 1;
        initializeGame();
        return true;
    }
    return false;
}
checkAuth();


// ... (Previous code remains unchanged until event listeners)

// Add drag-and-drop event listeners to all cells
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick); // Keep click functionality
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
    cell.addEventListener('dragend', handleDragEnd);
});

// Drag and Drop handlers
let draggedIndex = -1;

function handleDragStart(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    const isPlayer1 = currentPlayer === 1 && index >= 0 && index <= 4;
    const isPlayer2 = currentPlayer === 2 && index >= 6 && index <= 10;

    if (!isPlayer1 && !isPlayer2) return;
    if (board[index] === 0) return;

    draggedIndex = index;
    e.dataTransfer.setData('text/plain', index); // Set the dragged index
    highlightCell(index); // Highlight the dragged cell
    highlightAdjacentCells(index); // Highlight adjacent cells as drop targets
    updateMessage(`Kéo ô này vào ô bên cạnh (${getAdjacentCells(index).join(', ')}) để chọn hướng đi.`);
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow drop
}

function handleDrop(e) {
    e.preventDefault();
    const dropIndex = parseInt(e.currentTarget.getAttribute('data-index'));
    const adjacents = getAdjacentCells(draggedIndex);

    if (draggedIndex === dropIndex) {
        draggedIndex = -1;
        highlightCell(-1); // Clear highlight
        updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
        return;
    }

    if (!adjacents.includes(dropIndex)) return;

    // Determine direction based on adjacent cell
    let direction = '';
    if (currentPlayer === 1) {
        direction = dropIndex === (draggedIndex + 1) % 12 ? 'right' : 'left';
    } else {
        direction = dropIndex === (draggedIndex + 1) % 12 ? 'left' : 'right';
    }

    highlightCell(-1); // Clear highlights
    moveStones(draggedIndex, direction); // Execute the move
    draggedIndex = -1; // Reset dragged index
}

function handleDragEnd(e) {
    highlightCell(-1); // Clear highlights when drag ends
    if (draggedIndex !== -1) {
        updateMessage(`Lượt của Người chơi ${currentPlayer}: Chọn một ô để di chuyển.`);
    }
    draggedIndex = -1; // Reset dragged index
}

// ... (Rest of the code remains unchanged, including renderIndex, moveStones, etc.)

// Ensure cells are draggable in HTML (add this attribute to your cell elements)
document.querySelectorAll('.cell').forEach(cell => {
    cell.setAttribute('draggable', 'true');
});
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('dragenter', function(e) {
        e.preventDefault();
        if (getAdjacentCells(draggedIndex).includes(parseInt(this.getAttribute('data-index')))) {
            this.classList.add('drag-over');
        }
    });

    cell.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });

    cell.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (getAdjacentCells(draggedIndex).includes(parseInt(this.getAttribute('data-index')))) {
            this.classList.add('drag-over');
        }
    });

    cell.addEventListener('drop', function(e) {
        this.classList.remove('drag-over'); // Remove on drop
    });
});