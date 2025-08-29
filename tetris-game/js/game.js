const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');

const COLS = 12;
const ROWS = 20;
const BLOCK_SIZE = 20;

context.scale(BLOCK_SIZE, BLOCK_SIZE);
nextContext.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let board = createBoard();
let nextPiece = createPiece();

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(board, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
    drawNextPiece();
}

function drawNextPiece() {
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const matrix = nextPiece;
    const offset = {
        x: (nextCanvas.width / BLOCK_SIZE / 2) - (matrix[0].length / 2),
        y: (nextCanvas.height / BLOCK_SIZE / 2) - (matrix.length / 2)
    };
    drawMatrixOnNext(matrix, offset);
}

function drawMatrixOnNext(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                nextContext.fillStyle = COLORS[value];
                nextContext.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function createPiece() {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
}

function collide(board, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerReset() {
    player.matrix = nextPiece;
    nextPiece = createPiece();
    player.pos.y = 0;
    player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(board, player)) {
        gameOver();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        sweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function sweep() {
    let rowCount = 1;
    outer: for (let y = board.length - 1; y > 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;
        score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore() {
    scoreElement.innerText = score;
}

function checkHighScore() {
    const currentHighScore = localStorage.getItem('tetrisHighScore') || 0;
    if (score > currentHighScore) {
        localStorage.setItem('tetrisHighScore', score);
        updateHighScore(score);
    }
}

function updateHighScore(newHighScore) {
    highScoreElement.innerText = newHighScore;
}

function loadHighScore() {
    const savedHighScore = localStorage.getItem('tetrisHighScore') || 0;
    updateHighScore(savedHighScore);
}
