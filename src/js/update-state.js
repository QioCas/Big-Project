function updateScores(x = 0) {
    if(x === 0 | x === 1) {
        renderScoreBox(document.getElementById('score1-display'), scores[0]);
    }
    if(x === 0 | x === 2) {
        renderScoreBox(document.getElementById('score2-display'), scores[1]);
    }
}


function updateStonesInHand(stones) {
    document.getElementById('stones-in-hand').innerText = `Sỏi trên tay: ${stones}`;
}

async function updateGameData(wins, totals) {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wins, totals })
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
