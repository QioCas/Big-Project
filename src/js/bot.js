/** Evaluates the game state for the bot.
 *
 * Calculates the difference between the bot's and human's scores, including mandarin stones
 * (valued at 10 points each).
 *
 * Args:
 *   state (Object): The game state with a board array.
 *   scores (Object): The scores of Player1 and Player2.
 *
 * Returns:
 *   number: The evaluation score (positive favors the bot).
 */
function evaluate(state, scores) {
    const botScore = scores.Player2 + (state.board[11] * 10); // Sỏi nhỏ + sỏi quan Player2
    const humanScore = scores.Player1 + (state.board[5] * 10); // Sỏi nhỏ + sỏi quan Player1
    return botScore - humanScore; // Tối ưu cho bot
}

/** Generates valid moves for a player.
 *
 * Returns a list of possible moves (cell index and direction) for the player's turn.
 *
 * Args:
 *   state (Object): The game state with a board array.
 *   player (string): The player identifier ('Player1' or 'Player2').
 *
 * Returns:
 *   Array<Object>: List of move objects with index and direction.
 */
function getValidMoves(state, player) {
    const moves = [];
    const start = player === "Player1" ? 0 : 6;
    const end = player === "Player1" ? 4 : 10;
    for (let i = start; i <= end; i++) {
        if (state.board[i] > 0) {
            moves.push({ index: i, direction: "clockwise" });
            moves.push({ index: i, direction: "counterclockwise" });
        }
    }
    return moves;
}

/** Simulates a move and updates the game state.
 *
 * Spreads stones from the specified cell, captures stones if possible, and handles board
 * replenishment for the next player.
 *
 * Args:
 *   state (Object): The game state with a board array.
 *   scores (Object): The scores of Player1 and Player2.
 *   player (string): The player making the move ('Player1' or 'Player2').
 *   move (Object): The move to execute with index and direction.
 *
 * Returns:
 *   Object: Updated state with newBoard, newScores, nextPlayer, and gameOver flag.
 */
function makeMove(state, scores, player, move) {
    const newBoard = [...state.board];
    const newScores = { ...scores };
    let stones = newBoard[move.index];
    newBoard[move.index] = 0;
    let current = move.index;

    // Rải sỏi
    const step = move.direction === "clockwise" ? 1 : -1;
    while (stones > 0) {
        current = (current + step + 12) % 12;
        // Bỏ qua ô quan đối diện
        if ((player === "Player1" && current === 11) || (player === "Player2" && current === 5)) {
            current = (current + step + 12) % 12;
        }
        newBoard[current]++;
        stones--;
    }

    // Ăn sỏi
    while (true) {
        const next = (current + step + 12) % 12;
        const nextNext = (next + step + 12) % 12;
        if ((player === "Player1" && next === 11) || (player === "Player2" && next === 5)) break;
        if (newBoard[next] > 0 && newBoard[nextNext] === 0) {
            const eaten = newBoard[next] + (next === 5 || next === 11 ? newBoard[next] * 10 : 0);
            newScores[player] += eaten;
            newBoard[next] = 0;
            if (next === 5 || next === 11) newBoard[next] = 0; // Ăn sỏi quan
            current = nextNext;
        } else {
            break;
        }
    }

    // Kiểm tra cấp lại sỏi
    const nextPlayer = player === "Player1" ? "Player2" : "Player1";
    const { newBoard: finalBoard, newScores: finalScores, gameOver } = replenishBoard(newBoard, newScores, nextPlayer);
    return { newBoard: finalBoard, newScores: finalScores, nextPlayer, gameOver };
}

/** Replenishes the board if a player's cells are empty.
 *
 * Distributes stones from the player's score to their cells if they have enough points.
 *
 * Args:
 *   board (Array<number>): The current board state.
 *   scores (Object): The scores of Player1 and Player2.
 *   player (string): The player to check ('Player1' or 'Player2').
 *
 * Returns:
 *   Object: Updated state with newBoard, newScores, and gameOver flag.
 */
function replenishBoard(board, scores, player) {
    const start = player === "Player1" ? 0 : 6;
    const end = player === "Player1" ? 4 : 10;
    let hasStones = false;
    for (let i = start; i <= end; i++) {
        if (board[i] > 0) hasStones = true;
    }
    if (!hasStones && scores[player] >= 5) {
        const newBoard = [...board];
        for (let i = start; i <= end; i++) {
            newBoard[i] = 5;
            scores[player] -= 5;
        }
        return { newBoard, newScores: scores, gameOver: false };
    }
    return { newBoard: board, newScores: scores, gameOver: !hasStones };
}
/** Checks if the game has ended.
 *
 * Returns true if both mandarin cells are empty.
 *
 * Args:
 *   board (Array<number>): The current board state.
 *
 * Returns:
 *   boolean: True if the game is over, false otherwise.
 */
function isGameOver(board) {
    return board[5] === 0 && board[11] === 0; // Hai ô quan hết sỏi
}

/** Performs Alpha-Beta Pruning to select the best move for the bot.
 *
 * Evaluates possible moves to depth, pruning branches to optimize search, and returns the
 * best move and its score.
 *
 * Args:
 *   state (Object): The game state with a board array.
 *   scores (Object): The scores of Player1 and Player2.
 *   player (string): The current player ('Player1' or 'Player2').
 *   depth (number): The remaining search depth.
 *   alpha (number): The best score for the maximizer.
 *   beta (number): The best score for the minimizer.
 *   botPlayer (string, optional): The bot's identifier ('Player2'). Defaults to 'Player2'.
 *
 * Returns:
 *   Object: Contains the best score and move (or null if no move).
 */
function alphaBeta(state, scores, player, depth, alpha, beta, botPlayer = "Player2") {
    if (depth === 0 || isGameOver(state.board)) {
        return { score: evaluate(state, scores), move: null };
    }

    const moves = getValidMoves(state, player);
    if (moves.length === 0) {
        const result = replenishBoard(state.board, scores, player);
        if (result.gameOver) return { score: evaluate(state, scores), move: null };
        return alphaBeta({ board: result.newBoard }, result.newScores, player, depth - 1, alpha, beta, botPlayer);
    }

    let bestMove = null;
    if (player === botPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const { newBoard, newScores, nextPlayer, gameOver } = makeMove(state, scores, player, move);
            if (gameOver) {
                const score = evaluate({ board: newBoard }, newScores);
                if (score > maxEval) {
                    maxEval = score;
                    bestMove = move;
                }
            } else {
                const evalResult = alphaBeta({ board: newBoard }, newScores, nextPlayer, depth - 1, alpha, beta, botPlayer);
                if (evalResult.score > maxEval) {
                    maxEval = evalResult.score;
                    bestMove = move;
                }
            }
            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) break;
        }
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const { newBoard, newScores, nextPlayer, gameOver } = makeMove(state, scores, player, move);
            if (gameOver) {
                const score = evaluate({ board: newBoard }, newScores);
                if (score < minEval) {
                    minEval = score;
                    bestMove = move;
                }
            } else {
                const evalResult = alphaBeta({ board: newBoard }, newScores, nextPlayer, depth - 1, alpha, beta, botPlayer);
                if (evalResult.score < minEval) {
                    minEval = evalResult.score;
                    bestMove = move;
                }
            }
            beta = Math.min(beta, minEval);
            if (beta <= alpha) break;
        }
        return { score: minEval, move: bestMove };
    }
}


/** Executes the bot's move.
 *
 * Selects the best move using Alpha-Beta Pruning for Player 2 (bot) and executes it. Falls
 * back to a random move if no valid move is found.
 */
function botMove() {
    if (currentPlayer !== 2) return;

    // Chuyển board và scores sang định dạng state
    const state = { board: [...board] };
    state.board[5] = quanStones[5]; // Thêm sỏi quan
    state.board[11] = quanStones[11];
    const gameScores = { Player1: scores[0], Player2: scores[1] };

    // Gọi Alpha-Beta với độ sâu 3
    const result = alphaBeta(state, gameScores, "Player2", 3, -Infinity, Infinity, "Player2");
    const move = result.move;

    if (move) {
        selectedIndex = move.index;
        moveStones(move.index, move.direction);
    } else {
        let validIndices = [];
        for (let i = 6; i <= 10; i++) {
            if (board[i] > 0) validIndices.push(i);
        }

        // Lựa chọn chỉ số ngẫu nhiên để chơi
        move.index =  validIndices[Math.floor(Math.random() * validIndices.length)];
        
        // Mặc định đi bên phải
        move.direction = 1;
        selectedIndex = move.index;
        moveStones(move.index, move.direction);
    }
}