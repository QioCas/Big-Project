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
