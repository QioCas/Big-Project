/** Calculates the next position on the board.
 *
 * Determines the next cell index based on the current position, direction, and player.
 *
 * Args:
 *   i (number): The current cell index.
 *   direction (string): The direction to move ('right' or 'left').
 *   step (number, optional): The number of steps to move. Defaults to 1.
 *
 * Returns:
 *   number: The index of the next cell.
 */
function getNextPos(i, direction, step = 1) {
    step = (currentPlayer === 1 ? step : 12 - step);
    step = (direction === 'right' ? step : 12 - step);
    return (i + step) % 12;
}

/** Gets the adjacent cells for a given cell.
 *
 * Returns the indices of cells adjacent to the specified cell, based on the current player's
 * valid cells.
 *
 * Args:
 *   index (number): The index of the cell to check.
 *
 * Returns:
 *   Array<number>: List of adjacent cell indices.
 */
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
/** Displays an emoji overlay on a cell with animation.
 *
 * Adds an emoji to the cell and removes it after a short animation.
 *
 * Args:
 *   cell (HTMLElement): The DOM element to display the emoji on.
 *   emoji (string): The emoji to display.
 */
function showEmoji(cell, emoji) {
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'emoji-overlay';
    emojiDiv.textContent = emoji;
    cell.appendChild(emojiDiv);
    // Xóa emoji sau khi animation kết thúc
    setTimeout(() => {
        if (emojiDiv.parentNode) {
            emojiDiv.parentNode.removeChild(emojiDiv);
        }
    }, 400);
}

/** Creates a delay for asynchronous operations.
 *
 * Returns a promise that resolves after the specified time.
 *
 * Args:
 *   ms (number): The delay time in milliseconds.
 *
 * Returns:
 *   Promise<void>: Resolves after the specified delay.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
