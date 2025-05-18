/** Highlights a specific cell on the board.
 *
 * Removes existing highlights from all cells and applies a highlight or adjacent-highlight
 * class to the specified cell.
 *
 * Args:
 *   index (number): The index of the cell to highlight (-1 to clear all highlights).
 *   isAdjacent (boolean, optional): If true, applies adjacent-highlight class. Defaults to false.
 */
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

/** Highlights cells adjacent to the specified cell.
 *
 * Removes existing adjacent highlights and applies the adjacent-highlight class to cells
 * adjacent to the given index, based on the current player's valid adjacent cells.
 *
 * Args:
 *   index (number): The index of the cell whose adjacent cells are to be highlighted.
 */
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
