/** Renders the score box with stones for a player.
 *
 * Clears the container and renders stones based on the score, using different layouts for
 * different stone counts.
 *
 * Args:
 *   container (HTMLElement): The DOM element to render stones in.
 *   score (number): The number of stones to render.
 */
function renderScoreBox(container, score) {
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight;

    let stoneCount = score;
    // ✅ Hiển thị số tổng
    if (stoneCount > 0) {
        container.setAttribute('data-stone-count', stoneCount);
    } else {
        container.removeAttribute('data-stone-count');
    }

    const centerX = width / 2;
    const centerY = height / 2;
    if(stoneCount >= 10) {
        for (let i = 0; i < stoneCount; i++) {
            const stone = document.createElement('div');
            stone.classList.add('stone');

            const posX = Math.random() * (width - 6);  // 6 là đường kính sỏi
            const posY = Math.random() * (height - 6);

            stone.style.left = `${posX}px`;
            stone.style.top = `${posY}px`;

            container.appendChild(stone);
        }
    } else if (stoneCount >= 7) {
        const radius = Math.min(width, height) / 6;
        for (let i = 0; i < stoneCount; i++) {
            const stone = document.createElement('div');
            stone.classList.add('stone');
            const angle = (i / stoneCount) * 2 * Math.PI; 
            const posX = centerX + radius * Math.cos(angle) - 3;
            const posY = centerY + radius * Math.sin(angle) - 3;
            stone.style.left = `${posX}px`;
            stone.style.top = `${posY}px`;
            container.appendChild(stone);
        }
    } else if (stoneCount >= 4) {
        const radius = Math.min(width, height) / 3;
        for (let i = 0; i < stoneCount; i++) {
            const stone = document.createElement('div');
            stone.classList.add('stone'); 
            const angle = (i / stoneCount) * 2 * Math.PI; 
            const posX = centerX + radius * Math.cos(angle) - 3;
            const posY = centerY + radius * Math.sin(angle) - 3;
            stone.style.left = `${posX}px`;
            stone.style.top = `${posY}px`;
            container.appendChild(stone);
        }
    } else if (stoneCount > 0) {
        const stoneSize = 12;
        const maxCols = Math.floor(width / stoneSize);
        const stonesPerRow = Math.min(maxCols, Math.ceil(Math.sqrt(stoneCount)));

        const totalWidth = stonesPerRow * stoneSize;
        const totalHeight = Math.ceil(stoneCount / stonesPerRow) * stoneSize;
        const startX = (width - totalWidth) / 2;
        const startY = (height - totalHeight) / 2;

        for (let i = 0; i < stoneCount; i++) {
            const stone = document.createElement('div');
            stone.classList.add('stone');
            const row = Math.floor(i / stonesPerRow);
            const col = i % stonesPerRow;

            const posX = startX + col * stoneSize + stoneSize / 2 - 5;
            const posY = startY + row * stoneSize + stoneSize / 2 - 5;

            stone.style.left = `${posX}px`;
            stone.style.top = `${posY}px`;
            container.appendChild(stone);
        }
    }
}
/** Renders the stones in a specific cell.
 *
 * Updates the cell's UI to display small stones and mandarin stones based on the board state.
 *
 * Args:
 *   cell (HTMLElement): The DOM element representing the cell.
 *
 * Returns:
 *   Promise<void>: Resolves when rendering is complete.
 */
function renderIndex(cell) {
    const index = parseInt(cell.getAttribute('data-index'));
    let stoneCount = board[index]; 
    let hasQuanStone = quanStones[index] === 1;
    let quanValue = hasQuanStone ? quanPoints : 0; 
    cell.setAttribute('data-stone-count', (stoneCount + quanValue) > 0 ? (stoneCount + quanValue) : '');

    cell.innerHTML = '';

    const isQuan = cell.classList.contains('quan');
    const cellWidth = 60; 
    const cellHeight = isQuan ? 125 : 60; 

    let centerX = cellWidth / 2;
    const centerY = cellHeight / 2;

    if (isQuan && hasQuanStone) {
        const quanStone = document.createElement('div');
        quanStone.classList.add('quan-stone');
        quanStone.style.left = `${centerX - 10}px`;
        quanStone.style.top = `${centerY - 10}px`; 
        
        if (stoneCount > 0) {
            const radius = Math.min(cellWidth, cellHeight) / 1.5; 
            
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone');
                const smallRadius = radius / 2;
                const angle = (i / stoneCount) * 2 * Math.PI; 
                const posX = centerX + smallRadius * Math.cos(angle) - 3;
                const posY = centerY + smallRadius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        }
        cell.appendChild(quanStone);
    } else {
        if (stoneCount >= 7) {
            const radius = Math.min(cellWidth, cellHeight) / 6;
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone');
                const angle = (i / stoneCount) * 2 * Math.PI; 
                const posX = centerX + radius * Math.cos(angle) - 3;
                const posY = centerY + radius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        } else if (stoneCount >= 4) {
            const radius = Math.min(cellWidth, cellHeight) / 3;
            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); 
                const angle = (i / stoneCount) * 2 * Math.PI; 
                const posX = centerX + radius * Math.cos(angle) - 3;
                const posY = centerY + radius * Math.sin(angle) - 3;
                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        } else if (stoneCount > 0) {
            const stoneSize = 12;
            const maxCols = Math.floor(cellWidth / stoneSize);
            const stonesPerRow = Math.min(maxCols, Math.ceil(Math.sqrt(stoneCount)));

            const totalWidth = stonesPerRow * stoneSize;
            const totalHeight = Math.ceil(stoneCount / stonesPerRow) * stoneSize;
            const startX = (cellWidth - totalWidth) / 2;
            const startY = (cellHeight - totalHeight) / 2;

            for (let i = 0; i < stoneCount; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone');
                const row = Math.floor(i / stonesPerRow);
                const col = i % stonesPerRow;

                const posX = startX + col * stoneSize + stoneSize / 2 - 5;
                const posY = startY + row * stoneSize + stoneSize / 2 - 5;

                stone.style.left = `${posX}px`;
                stone.style.top = `${posY}px`;
                cell.appendChild(stone);
            }
        }
    }
}

/** Renders the entire game board.
 *
 * Updates all cells on the board and resets the stones-in-hand display.
 */
function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        renderIndex(cell);
    });
    updateStonesInHand(0);

}

/** Initializes the game state and UI.
 *
 * Sets up the board, scores, and player turn, rendering the board with animations for new
 * games or without for ongoing games. Starts the bot's turn if applicable.
 *
 * Returns:
 *   Promise<void>: Resolves when initialization is complete.
 */
async function initGame() {
    renderBoard();
    currentPlayer = FirstMove;
    scores[0] = scores[1] = 0;
    isFirstMove = 1;
    updateScores();
    if (newGame == 1) {
        board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        quanStones = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        renderBoard();
        quanStones[5] = 1;
        quanStones[11] = 1;
        let cells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
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

    if(currentPlayer === 2) {
        botMove();
    }
}

