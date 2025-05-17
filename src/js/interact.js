
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleClick); 
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
    cell.addEventListener('dragend', handleDragEnd);
    cell.setAttribute('draggable', 'true');

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
        this.classList.remove('drag-over');
    });
});

function handleClick(e) {
    if (numberClick > 0) {
        return;
    }
    const index = parseInt(e.currentTarget.getAttribute('data-index'));


    // Step 1: Select a cell
    if (selectedIndex === -1) {
        const isPlayer1 = currentPlayer === 1 && index >= 0 && index <= 4;
        const isPlayer2 = currentPlayer === 2 && index >= 6 && index <= 10;
        if (!isPlayer1 && !isPlayer2) { return; }
        if (board[index] === 0) { return; }

        selectedIndex = index;
        highlightCell(index);
        highlightAdjacentCells(index);
    }
    // Step 2: Select an adjacent cell for direction
    else {
        const adjacents = getAdjacentCells(selectedIndex);
        if (index == selectedIndex) {
            selectedIndex = -1;
            highlightCell(-1); // Xoá highlight
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

function handleDragStart(e) {
    if (numberClick > 0) {
        return;
    }
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    const isPlayer1 = currentPlayer === 1 && index >= 0 && index <= 4;
    const isPlayer2 = currentPlayer === 2 && index >= 6 && index <= 10;


    if (!isPlayer1 && !isPlayer2) { return; }
    if (board[index] === 0) { return; }

    draggedIndex = index;
    e.dataTransfer.setData('text/plain', index); // Set the dragged index
    highlightCell(index); // Highlight the dragged cell
    highlightAdjacentCells(index); // Highlight adjacent cells as drop targets
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

}

const popup = document.getElementById('popup-overlay');
const menuButton = document.getElementById('menu-button');
const popupClose = document.getElementById('popup-close');

menuButton.addEventListener('click', () => {
    popup.style.display = 'flex';
});

popupClose.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Bấm ESC để mở hoặc đóng
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        popup.style.display = (popup.style.display === 'flex') ? 'none' : 'flex';
    }
});
