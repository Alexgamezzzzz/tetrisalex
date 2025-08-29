let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameRunning = false;
let isPaused = false;
let elapsedTime = 0;
let gameMode = 'endless'; // 'endless' or 'challenge'
let timeExtended = false;

const rulesModal = document.getElementById('rules-modal');
const rulesButton = document.getElementById('rules-button');
const closeButton = document.querySelector('.close-button');
const pauseButton = document.getElementById('pause-button');
const timerElement = document.getElementById('timer');
const challengeModal = document.getElementById('challenge-modal');
const challengeDifficultySelector = document.getElementById('challenge-difficulty-selector');

function update(time = 0) {
    if (!gameRunning || isPaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    // Timer Logic
    if (gameMode === 'challenge') {
        elapsedTime -= deltaTime;
        if (score >= 100 && !timeExtended) {
            elapsedTime += 30000; // Add 30 seconds
            timeExtended = true;
        }
        if (elapsedTime <= 0) {
            gameOver(true); // Game over from time running out
            return; 
        }
    } else {
        elapsedTime += deltaTime;
    }
    updateTimerDisplay();

    // Game Logic
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function gameOver(isTimeUp = false) {
    gameRunning = false;
    checkHighScore();
    const message = isTimeUp ? 'Time is up!' : 'Game Over!';
    alert(message + ' Final Score: ' + score);
}

function formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerElement.innerText = formatTime(elapsedTime);
}

function startGame(difficulty, mode = 'endless') {
    gameMode = mode;
    dropInterval = difficulty;
    board.forEach(row => row.fill(0));
    score = 0;
    
    if (gameMode === 'challenge') {
        elapsedTime = 30000; // 30 seconds
        timeExtended = false;
    } else {
        elapsedTime = 0;
    }

    playerReset();
    updateScore();
    updateTimerDisplay();
    
    if (!gameRunning) {
        gameRunning = true;
        lastTime = performance.now();
        update();
    }
    isPaused = false;
    pauseButton.innerText = 'Pause';
}

// Modal Logic
rulesButton.addEventListener('click', () => {
    rulesModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    rulesModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == rulesModal) {
        rulesModal.style.display = 'none';
    }
    if (event.target == challengeModal) {
        challengeModal.style.display = 'none';
    }
});

// Pause Logic
pauseButton.addEventListener('click', () => {
    if (!gameRunning) return;

    isPaused = !isPaused;
    pauseButton.innerText = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        lastTime = performance.now(); // Prevent time jump
        update(); // Restart the game loop
    }
});

document.getElementById('easy').addEventListener('click', () => startGame(1000));
document.getElementById('medium').addEventListener('click', () => startGame(500));
document.getElementById('hard').addEventListener('click', () => startGame(250));
document.getElementById('extreme').addEventListener('click', () => startGame(100));

// Show challenge modal instead of starting game directly
document.getElementById('challenge').addEventListener('click', () => {
    challengeModal.style.display = 'block';
});

// Handle difficulty selection from within the challenge modal
challengeDifficultySelector.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const difficulty = parseInt(event.target.dataset.difficulty, 10);
        challengeModal.style.display = 'none';
        startGame(difficulty, 'challenge');
    }
});

document.addEventListener('keydown', event => {
    if (!gameRunning || isPaused) return;

    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate(1);
    }
});

loadHighScore();