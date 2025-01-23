const GRID_ROWS = 6; // Changed from 8 to 6 rows
const GRID_COLS = 5; // 5 columns
const BLOCK_SIZE = 50; // Size of each block in pixels
let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));
let currentBlock = null;
let score = 0;
let gameActive = true;

// Initialize the game grid
function initGrid() {
    const gameGrid = document.getElementById("game-grid");
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("w-24", "h-24", "border", "border-gray-700", "flex", "items-center", "justify-center", "text-sm", "font-bold");
            gameGrid.appendChild(cell);
        }
    }
}

// Spawn a new block at the top
function spawnBlock() {
    const value = Math.random() > 0.5 ? 2 : 4;
    currentBlock = { row: 0, col: Math.floor(GRID_COLS / 2), value };
    updateGrid();
}

// Update the grid display
function updateGrid() {
    const cells = document.querySelectorAll("#game-grid div");
    cells.forEach((cell, index) => {
        const row = Math.floor(index / GRID_COLS);
        const col = index % GRID_COLS;
        if (grid[row][col] !== 0) {
            cell.textContent = grid[row][col];
            cell.classList.add("bg-blue-500");
        } else if (currentBlock && row === currentBlock.row && col === currentBlock.col) {
            cell.textContent = currentBlock.value;
            cell.classList.add("bg-green-500");
        } else {
            cell.textContent = "";
            cell.classList.remove("bg-blue-500", "bg-green-500");
        }
    });
}

// Move the block left or right
function moveBlock(direction) {
    if (!currentBlock) return;
    const newCol = currentBlock.col + direction;
    if (newCol >= 0 && newCol < GRID_COLS && grid[currentBlock.row][newCol] === 0) {
        currentBlock.col = newCol;
        updateGrid();
    }
}

// Drop the block down
function dropBlock() {
    if (!currentBlock) return;
    const newRow = currentBlock.row + 1;
    if (newRow < GRID_ROWS && grid[newRow][currentBlock.col] === 0) {
        currentBlock.row = newRow;
        updateGrid();
    } else {
        placeBlock();
    }
}

// Place the block on the grid
function placeBlock() {
    if (!currentBlock) return;
    const { row, col, value } = currentBlock;
    grid[row][col] = value;
    currentBlock = null;
    
    applyGravity();
    mergeAllBlocks();
    
    if (isGameOver()) {
        endGame();
        return;
    }
    
    spawnBlock();
}

// Check if any column is full
function isGameOver() {
    return grid[0].some(cell => cell !== 0);
}

// End the game
function endGame() {
    gameActive = false;
    document.getElementById('game-over').style.display = 'block';
    clearInterval(gameInterval);
}

// Restart the game
function restartGame() {
    grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));
    currentBlock = null;
    score = 0;
    gameActive = true;
    
    document.getElementById('score-value').textContent = '0';
    document.getElementById('game-over').style.display = 'none';
    
    const cells = document.querySelectorAll("#game-grid div");
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('bg-blue-500', 'bg-green-500');
    });

    clearInterval(gameInterval);
    gameInterval = setInterval(dropBlock, 1000);
    
    spawnBlock();
}

// Update the score
function updateScore(value) {
    score += value;
    document.getElementById('score-value').textContent = score;
}

// Apply gravity to the entire grid
function applyGravity() {
    for (let col = 0; col < GRID_COLS; col++) {
        for (let row = GRID_ROWS - 1; row >= 0; row--) {
            if (grid[row][col] !== 0) {
                let currentRow = row;
                while (currentRow + 1 < GRID_ROWS && grid[currentRow + 1][col] === 0) {
                    grid[currentRow + 1][col] = grid[currentRow][col];
                    grid[currentRow][col] = 0;
                    currentRow++;
                }
            }
        }
    }
}

// Merge all adjacent blocks with the same value
function mergeAllBlocks() {
    let merged = false;
    do {
        merged = false;
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (grid[row][col] !== 0) {
                    if (col + 1 < GRID_COLS && grid[row][col + 1] === grid[row][col]) {
                        const mergedValue = grid[row][col] * 2;
                        grid[row][col] = mergedValue;
                        grid[row][col + 1] = 0;
                        updateScore(mergedValue);
                        merged = true;
                    }
                    if (row + 1 < GRID_ROWS && grid[row + 1][col] === grid[row][col]) {
                        const mergedValue = grid[row][col] * 2;
                        grid[row][col] = mergedValue;
                        grid[row + 1][col] = 0;
                        updateScore(mergedValue);
                        merged = true;
                    }
                }
            }
        }
        if (merged) applyGravity();
    } while (merged);
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveBlock(-1);
    if (e.key === "ArrowRight") moveBlock(1);
    if (e.key === "ArrowDown") dropBlock();
});

// Start the game
let gameInterval;
initGrid();
spawnBlock();
gameInterval = setInterval(dropBlock, 1000);
