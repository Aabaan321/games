// game.js
class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.highScoreElement = document.getElementById('high-score');
        this.soundToggle = document.getElementById('sound-toggle');

        // Canvas dimensions
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state
        this.fruits = [];
        this.particles = [];
        this.score = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.lives = 3;
        this.gameActive = true;
        this.lastMousePositions = [];
        this.difficulty = 1;
        this.spawnRate = 0.03;
        this.highScore = localStorage.getItem('highScore') || 0;

        // Bind event listeners
        this.bindEvents();
        
        // Start game loop
        this.gameLoop();
    }

    bindEvents() {
        // Mouse movement tracking
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.lastMousePositions.push({ x, y, timestamp: Date.now() });
            if (this.lastMousePositions.length > 10) {
                this.lastMousePositions.shift();
            }
        });

        this.canvas.addEventListener('mouseout', () => {
            this.lastMousePositions = [];
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());

        // Sound toggle
        this.soundToggle.addEventListener('click', () => {
            const isMuted = this.soundToggle.textContent === '🔊';
            this.soundToggle.textContent = isMuted ? '🔇' : '🔊';
        });
    }

    createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    checkSlice() {
        if (this.lastMousePositions.length < 2) return;
        
        const last = this.lastMousePositions[this.lastMousePositions.length - 1];
        const prev = this.lastMousePositions[this.lastMousePositions.length - 2];
        
        this.fruits.forEach(fruit => {
            if (!fruit.sliced) {
                const distance = Math.sqrt(
                    Math.pow(fruit.x - last.x, 2) + 
                    Math.pow(fruit.y - last.y, 2)
                );
                
                if (distance < fruit.radius + 10) {
                    fruit.sliced = true;
                    if (fruit.type === 'bomb') {
                        this.handleBombSlice(fruit);
                    } else {
                        this.handleFruitSlice(fruit);
                    }
                }
            }
        });
    }

    handleFruitSlice(fruit) {
        const points = fruit.points * this.combo;
        this.score += points;
        this.combo++;
        this.comboTimer = 60;
        this.createParticles(fruit.x, fruit.y, fruit.color);
        
        // Show floating score
        this.showFloatingScore(fruit.x, fruit.y, points);
        
        this.updateScore();
        this.updateCombo();
    }

    handleBombSlice(bomb) {
        this.lives--;
        this.combo = 1;
        this.createParticles(bomb.x, bomb.y, '#ff4444', 20);
        this.updateLives();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    showFloatingScore(x, y, points) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-score';
        floatingText.textContent = `+${points}`;
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            document.body.removeChild(floatingText);
        }, 1000);
    }

    drawMouseTrail() {
        if (this.lastMousePositions.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        for (let i = 0; i < this.lastMousePositions.length - 1; i++) {
            const p1 = this.lastMousePositions[i];
            const p2 = this.lastMousePositions[i + 1];
            const progress = i / this.lastMousePositions.length;
            
            this.ctx.globalAlpha = progress;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    spawnFruit() {
        if (Math.random() < this.spawnRate * this.difficulty) {
            this.fruits.push(new Fruit(this.canvas.width, this.canvas.height));
        }
    }

    updateGame() {
        // Update difficulty
        this.difficulty += 0.001;

        // Update fruits
        this.fruits = this.fruits.filter(fruit => !fruit.isOffScreen());
        this.fruits.forEach(fruit => fruit.update());

        // Update particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.combo = 1;
                this.updateCombo();
            }
        }
    }

    drawGame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw fruits
        this.fruits.forEach(fruit => fruit.draw(this.ctx));
        
        // Draw particles
        this.particles.forEach(p => p.draw(this.ctx));
        
        // Draw mouse trail
        this.drawMouseTrail();
    }

    updateScore() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    updateCombo() {
        this.comboElement.textContent = `Combo: x${this.combo}`;
    }

    updateLives() {
        this.livesElement.textContent = `Lives: ${'❤️'.repeat(this.lives)}`;
    }

    gameOver() {
        this.gameActive = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        this.gameOverElement.style.display = 'block';
        this.finalScoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }

    restart() {
        this.fruits = [];
        this.particles = [];
        this.score = 0;
        this.combo = 1;
        this.lives = 3;
        this.gameActive = true;
        this.difficulty = 1;
        this.gameOverElement.style.display = 'none';
        this.updateScore();
        this.updateCombo();
        this.updateLives();
    }

    gameLoop() {
        if (this.gameActive) {
            this.spawnFruit();
            this.updateGame();
            this.checkSlice();
        }
        
        this.drawGame();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Fruit class
class Fruit {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.reset();
        this.radius = 25;
        this.sliced = false;
        this.type = Math.random() < 0.2 ? 'bomb' : 'fruit';
        this.color = this.type === 'bomb' ? '#333' : 
            `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.points = this.type === 'fruit' ? 
            (Math.random() < 0.2 ? 2 : 1) : 0;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    reset() {
        this.x = Math.random() * this.canvasWidth;
        this.y = this.canvasHeight + 30;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = -15 - Math.random() * 5;
    }

    update() {
        this.speedY += 0.4;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw shadow
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        // Draw fruit/bomb
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        if (this.type === 'bomb') {
            // Draw fuse
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.quadraticCurveTo(10, -this.radius - 10, 20, -this.radius - 5);
            ctx.strokeStyle = '#brown';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (this.points === 2) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();

        if (this.sliced) {
            this.drawSlice(ctx);
        }
    }

    drawSlice(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y + this.radius);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    isOffScreen() {
        return this.y > this.canvasHeight + 50;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});
