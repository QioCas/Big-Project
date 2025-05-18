let hideTimeout1, hideTimeout2;

/** Shows the score box for a player.
 *
 * Displays the score box by removing the hidden class and clears any hide timeout.
 *
 * Args:
 *   player (number): The player number (1 or 2).
 */
function showScoreBox(player) {
    const container = document.getElementById(`player${player}-container`);
    container.classList.remove('hidden');
    clearTimeout(hideTimeout1);
    clearTimeout(hideTimeout2);
}

/** Hides the score box after a delay.
 *
 * Adds the hidden class to the score box after the specified delay, unless the box is hovered.
 *
 * Args:
 *   player (number): The player number (1 or 2).
 *   delay (number, optional): The delay in milliseconds. Defaults to 200.
 */
function hideScoreBox(player, delay = 200) {
    const container = document.getElementById(`player${player}-container`);
    if (!container.matches(':hover')) {
        if (player === 1) {
            hideTimeout1 = setTimeout(() => {
                container.classList.add('hidden');
            }, delay);
        } else {
            hideTimeout2 = setTimeout(() => {
                container.classList.add('hidden');
            }, delay);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('player1-container').classList.add('hidden');
    document.getElementById('player2-container').classList.add('hidden');
});

document.querySelectorAll('.score-tab, .score-container').forEach(element => {
    element.addEventListener('mouseenter', () => {
        const player = element.closest('.score-container').id.includes('player1') ? 1 : 2;
        showScoreBox(player);
    });
    element.addEventListener('mouseleave', () => {
        const player = element.closest('.score-container').id.includes('player1') ? 1 : 2;
        hideScoreBox(player);
    });
});

/** Handles score updates when a player captures stones.
 *
 * Updates the score box with animations, shows it, and hides it after a delay.
 *
 * Args:
 *   player (number): The player number (1 or 2).
 *   stoneCount (number): The number of stones captured.
 */
function onPlayerEat(player, stoneCount) {
    const scoreBox = document.getElementById(`score${player}-display`);
    scoreBox.classList.add('updated');
    showScoreBox(player);
    renderScoreBox(scoreBox, stoneCount); // Cập nhật số sỏi
    setTimeout(() => {
        scoreBox.classList.remove('updated');
        hideScoreBox(player, 300); // Ẩn sau 3 giây
    }, 300);
}