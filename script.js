document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Game constants
    const GRID_SIZE = 20;
    const GRID_WIDTH = canvas.width / GRID_SIZE;
    const GRID_HEIGHT = canvas.height / GRID_SIZE;
    const GAME_SPEED = 150; // milliseconds
    
    // Game variables
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let isGameRunning = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    
    // Initialize high score display
    highScoreElement.textContent = highScore;
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Initialize game
    function initGame() {
        // Initialize snake at the center
        const centerX = Math.floor(GRID_WIDTH / 2);
        const centerY = Math.floor(GRID_HEIGHT / 2);
        
        snake = [
            {x: centerX, y: centerY},
            {x: centerX - 1, y: centerY},
            {x: centerX - 2, y: centerY}
        ];
        
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        
        // Generate initial food
        generateFood();
        
        // Draw initial state
        draw();
    }
    
    // Start game
    function startGame() {
        if (!isGameRunning) {
            initGame();
            isGameRunning = true;
            startButton.textContent = 'Pause';
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        } else {
            // Pause game
            isGameRunning = false;
            startButton.textContent = 'Resume';
            clearInterval(gameInterval);
        }
    }
    
    // Reset game
    function resetGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        startButton.textContent = 'Start Game';
        initGame();
    }
    
    // Main game loop
    function gameLoop() {
        // Update snake position
        moveSnake();
        
        // Check collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if snake eats food
        if (snake[0].x === food.x && snake[0].y === food.y) {
            eatFood();
        }
        
        // Draw everything
        draw();
    }
    
    // Move snake
    function moveSnake() {
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Add new head to the beginning of snake array
        snake.unshift(head);
        
        // Remove tail unless food was eaten (handled in eatFood)
        snake.pop();
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
            return true;
        }
        
        // Check self collision (start from index 1 to avoid checking head against itself)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Generate food at random position
    function generateFood() {
        // Generate random coordinates
        let foodX, foodY;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            foodX = Math.floor(Math.random() * GRID_WIDTH);
            foodY = Math.floor(Math.random() * GRID_HEIGHT);
            
            // Check if food is on snake
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        food = {x: foodX, y: foodY};
    }
    
    // Handle snake eating food
    function eatFood() {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Grow snake (don't remove tail in next move)
        snake.push({});
        
        // Generate new food
        generateFood();
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        startButton.textContent = 'Start Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Handle keyboard input
    function handleKeyPress(event) {
        // Prevent default behavior for arrow keys
        if ([37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
        
        // Update direction based on key press
        // Prevent 180-degree turns
        switch (event.keyCode) {
            case 38: // Up arrow
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 40: // Down arrow
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 37: // Left arrow
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 39: // Right arrow
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50'; // Green head
            } else {
                // Gradient from dark green to light green
                const colorValue = Math.floor(150 + (105 * index / snake.length));
                ctx.fillStyle = `rgb(0, ${colorValue}, 0)`;
            }
            
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            
            // Add eyes to the head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Position eyes based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                const eyeSize = GRID_SIZE / 5;
                const eyeOffset = GRID_SIZE / 3;
                
                switch (direction) {
                    case 'up':
                        leftEyeX = segment.x * GRID_SIZE + eyeOffset;
                        leftEyeY = segment.y * GRID_SIZE + eyeOffset;
                        rightEyeX = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        rightEyeY = segment.y * GRID_SIZE + eyeOffset;
                        break;
                    case 'down':
                        leftEyeX = segment.x * GRID_SIZE + eyeOffset;
                        leftEyeY = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        rightEyeX = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        rightEyeY = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                    case 'left':
                        leftEyeX = segment.x * GRID_SIZE + eyeOffset;
                        leftEyeY = segment.y * GRID_SIZE + eyeOffset;
                        rightEyeX = segment.x * GRID_SIZE + eyeOffset;
                        rightEyeY = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                    case 'right':
                        leftEyeX = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        leftEyeY = segment.y * GRID_SIZE + eyeOffset;
                        rightEyeX = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        rightEyeY = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                }
                
                ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
                ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
            }
        });
        
        // Draw food
        ctx.fillStyle = '#FF5252'; // Red food
        ctx.beginPath();
        const foodRadius = GRID_SIZE / 2;
        const foodCenterX = food.x * GRID_SIZE + foodRadius;
        const foodCenterY = food.y * GRID_SIZE + foodRadius;
        ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine to food
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(foodCenterX - foodRadius / 3, foodCenterY - foodRadius / 3, foodRadius / 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
        initGame();
});