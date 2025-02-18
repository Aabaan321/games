// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let fruits = [];
let score = 0;
let lives = 3;
let gameActive = true;
let mouseTrail = [];

class Fruit {
    constructor() {
        this.reset();
        this.radius = 20;
        this.sliced = false;
        this.type = Math.random() < 0.2 ? 'bomb' : 'fruit';
        this.color = this.type === 'bomb' ? '#333' : `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = -15 - Math.random() * 5;
    }

    update() {
        this.speedY += 0.4; // gravity
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.sliced) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius, this.y - this.radius);
            ctx.lineTo(this.x + this.radius, this.y + this.radius);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// Mouse movement tracking
let lastMousePositions = [];
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastMousePositions.push({ x, y });
    if (lastMousePositions.length > 10) {
        lastMousePositions.shift();
    }
});

canvas.addEventListener('mouseout', () => {
    lastMousePositions = [];
});

function checkSlice() {
    if (lastMousePositions.length < 2) return;
    
    const last = lastMousePositions[lastMousePositions.length - 1];
    const prev = lastMousePositions[lastMousePositions.length - 2];
    
    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            const distance = Math.sqrt(
                Math.pow(fruit.x - last.x, 2) + 
                Math.pow(fruit.y - last.y, 2)
            );
            
            if (distance < fruit.radius + 10) {
                fruit.sliced = true;
                if (fruit.type === 'bomb') {
                    lives--;
                    updateLives();
                    if (lives <= 0) {
                        gameOver();
                    }
                } else {
                    score++;
                    updateScore();
                }
            }
        }
    });
}

function drawMouseTrail() {
    if (lastMousePositions.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    for (let i = 0; i < lastMousePositions.length - 1; i++) {
        const p1 = lastMousePositions[i];
        const p2 = lastMousePositions[i + 1];
        
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
    
    ctx.stroke();
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function updateLives() {
    livesElement.textContent = `Lives: ${'❤️'.repeat(lives)}`;
}

function gameOver() {
    gameActive = false;
    gameOverElement.style.display = 'block';
    finalScoreElement.textContent = score;
}

function restartGame() {
    score = 0;
    lives = 3;
    fruits = [];
    gameActive = true;
    gameOverElement.style.display = 'none';
    updateScore();
    updateLives();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameActive) {
        // Spawn new fruits
        if (Math.random() < 0.03) {
            fruits.push(new Fruit());
        }
        
        // Update and draw fruits
        fruits = fruits.filter(fruit => !fruit.isOffScreen());
        fruits.forEach(fruit => {
            fruit.update();
            fruit.draw();
        });
        
        checkSlice();
        drawMouseTrail();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
