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
            cell.classList.add(
                "w-24", "h-24",
                "flex", "items-center", "justify-center",
                "text-5xl", "font-bold",
                "rounded-lg", "glass",
                "transition-all", "duration-300"
            );
            cell.style.transform = "translateZ(0px)";
            cell.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
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

        // Reset cell styles
        cell.textContent = "";
        cell.style.background = "rgba(30, 41, 59, 0.25)";
        cell.style.transform = "translateZ(0px)";
        cell.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";

        // Set cell content and styles based on grid state
        if (grid[row][col] !== 0) {
            // Placed blocks
            const value = grid[row][col];
            cell.textContent = value;

            // Calculate color based on value (logarithmic scale for better color distribution)
            const hue = 210 - Math.min(30 * Math.log2(value), 180); // From blue to red
            const saturation = 80;
            const lightness = 60;

            // Apply 3D and glass effect
            cell.style.background = `linear-gradient(135deg, hsla(${hue}, ${saturation}%, ${lightness}%, 0.8), hsla(${hue}, ${saturation}%, ${lightness - 20}%, 0.9))`;
            cell.style.transform = "translateZ(5px)";
            cell.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
            cell.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
            cell.style.color = "#ffffff";
            cell.style.border = "1px solid rgba(255, 255, 255, 0.1)";

        } else if (currentBlock && row === currentBlock.row && col === currentBlock.col) {
            // Active falling block
            cell.textContent = currentBlock.value;

            // Apply active block style with glow effect
            cell.style.background = "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.9))";
            cell.style.transform = "translateZ(10px)";
            cell.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
            cell.style.textShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
            cell.style.color = "#ffffff";
            cell.style.border = "1px solid rgba(255, 255, 255, 0.2)";
        }
    });
}

// Move the block left or right
function moveBlock(direction) {
    if (!currentBlock || !gameActive) return;

    const newCol = currentBlock.col + direction;
    if (newCol >= 0 && newCol < GRID_COLS && grid[currentBlock.row][newCol] === 0) {
        // Store old position for animation
        const oldCol = currentBlock.col;

        // Update position
        currentBlock.col = newCol;

        // Get cells for animation
        const cells = document.querySelectorAll("#game-grid div");
        const oldIndex = currentBlock.row * GRID_COLS + oldCol;
        const newIndex = currentBlock.row * GRID_COLS + newCol;

        // Animate movement
        const oldCell = cells[oldIndex];
        const newCell = cells[newIndex];

        // Create a temporary floating block for smooth animation
        if (direction === 1) { // Moving right
            oldCell.style.transform = "translateX(100%) translateZ(10px)";
        } else { // Moving left
            oldCell.style.transform = "translateX(-100%) translateZ(10px)";
        }

        // After a short delay, update the grid
        setTimeout(() => {
            updateGrid();
        }, 50);
    }
}

// Drop the block down
function dropBlock() {
    if (!currentBlock || !gameActive) return;

    const newRow = currentBlock.row + 1;
    if (newRow < GRID_ROWS && grid[newRow][currentBlock.col] === 0) {
        // Store old position for animation
        const oldRow = currentBlock.row;

        // Update position
        currentBlock.row = newRow;

        // Get cells for animation
        const cells = document.querySelectorAll("#game-grid div");
        const oldIndex = oldRow * GRID_COLS + currentBlock.col;
        const newIndex = newRow * GRID_COLS + currentBlock.col;

        // Animate movement
        const oldCell = cells[oldIndex];

        // Create a temporary floating block for smooth animation
        oldCell.style.transform = "translateY(100%) translateZ(10px)";

        // After a short delay, update the grid
        setTimeout(() => {
            updateGrid();
        }, 50);
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

    // Update final score
    document.getElementById('final-score').textContent = score;

    // Show game over screen with animation
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.style.display = 'block';
    gameOverScreen.classList.add('animate__animated', 'animate__fadeIn');

    // Add blur effect to the game grid
    document.getElementById('game-grid').style.filter = 'blur(3px)';
    document.getElementById('score-board').style.filter = 'blur(3px)';

    clearInterval(gameInterval);
}

// Restart the game
function restartGame() {
    // Reset game state
    grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));
    currentBlock = null;
    score = 0;
    gameActive = true;

    // Update UI
    document.getElementById('score-value').textContent = '0';

    // Hide game over screen with animation
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.classList.remove('animate__fadeIn');
    gameOverScreen.classList.add('animate__fadeOut');

    // After animation completes, hide the element
    setTimeout(() => {
        gameOverScreen.style.display = 'none';
        gameOverScreen.classList.remove('animate__fadeOut');
    }, 500);

    // Remove blur effect
    document.getElementById('game-grid').style.filter = 'none';
    document.getElementById('score-board').style.filter = 'none';

    // Reset all cells
    const cells = document.querySelectorAll("#game-grid div");
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.background = "rgba(30, 41, 59, 0.25)";
        cell.style.transform = "translateZ(0px)";
        cell.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
        cell.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        cell.classList.remove('pulse');
    });

    // Restart game interval
    clearInterval(gameInterval);
    gameInterval = setInterval(dropBlock, 1000);

    // Spawn new block with animation
    spawnBlock();
}

// Update the score
function updateScore(value) {
    score += value;
    const scoreElement = document.getElementById('score-value');

    // Update score text
    scoreElement.textContent = score;

    // Add animation to score
    scoreElement.classList.remove('animate__pulse');
    void scoreElement.offsetWidth; // Trigger reflow to restart animation
    scoreElement.classList.add('animate__pulse');

    // Show floating score indicator
    const gameGrid = document.getElementById('game-grid');
    const floatingScore = document.createElement('div');
    floatingScore.textContent = '+' + value;
    floatingScore.style.position = 'absolute';
    floatingScore.style.color = '#4ade80';
    floatingScore.style.fontWeight = 'bold';
    floatingScore.style.fontSize = '2rem';
    floatingScore.style.textShadow = '0 0 10px rgba(74, 222, 128, 0.5)';
    floatingScore.style.zIndex = '10';
    floatingScore.style.pointerEvents = 'none';

    // Position near the score display
    const scoreRect = scoreElement.getBoundingClientRect();
    floatingScore.style.top = `${scoreRect.top - 20}px`;
    floatingScore.style.left = `${scoreRect.left + scoreRect.width / 2}px`;
    floatingScore.style.transform = 'translate(-50%, 0)';

    // Add to body
    document.body.appendChild(floatingScore);

    // Animate and remove
    floatingScore.animate(
        [
            { opacity: 1, transform: 'translate(-50%, 0)' },
            { opacity: 0, transform: 'translate(-50%, -50px)' }
        ],
        {
            duration: 1000,
            easing: 'ease-out'
        }
    ).onfinish = () => {
        document.body.removeChild(floatingScore);
    };
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
    let mergedPositions = []; // Track positions of merged blocks for animation

    do {
        merged = false;
        mergedPositions = []; // Reset for each iteration

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (grid[row][col] !== 0) {
                    // Check horizontal merge
                    if (col + 1 < GRID_COLS && grid[row][col + 1] === grid[row][col]) {
                        const mergedValue = grid[row][col] * 2;
                        grid[row][col] = mergedValue;
                        grid[row][col + 1] = 0;
                        updateScore(mergedValue);
                        merged = true;
                        mergedPositions.push({row, col, value: mergedValue});
                    }

                    // Check vertical merge
                    if (row + 1 < GRID_ROWS && grid[row + 1][col] === grid[row][col]) {
                        const mergedValue = grid[row][col] * 2;
                        grid[row][col] = mergedValue;
                        grid[row + 1][col] = 0;
                        updateScore(mergedValue);
                        merged = true;
                        mergedPositions.push({row, col, value: mergedValue});
                    }
                }
            }
        }

        if (merged) {
            applyGravity();

            // Apply animation to merged blocks
            updateGrid(); // Update grid first

            // Add animation to merged blocks
            const cells = document.querySelectorAll("#game-grid div");
            mergedPositions.forEach(pos => {
                const index = pos.row * GRID_COLS + pos.col;
                const cell = cells[index];

                // Add pulse animation
                cell.classList.add("pulse");

                // Add glow effect
                const originalBoxShadow = cell.style.boxShadow;
                cell.style.boxShadow = originalBoxShadow + ", 0 0 30px rgba(255, 255, 255, 0.8)";

                // Remove animation classes after animation completes
                setTimeout(() => {
                    cell.classList.remove("pulse");
                    cell.style.boxShadow = originalBoxShadow;
                }, 500);
            });
        }
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
