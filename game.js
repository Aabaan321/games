class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Game state
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.lives = 10;
        this.combo = 1;
        this.comboTimer = 0;
        this.gameState = 'menu';
        this.fruits = [];
        this.particles = [];
        this.trails = [];
        this.powerUps = [];
        
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Game settings
        this.fruitSpawnRate = 1500;
        this.lastFruitSpawn = 0;
        this.gravity = 0.01;
        this.difficultyMultiplier = 1;
        
        this.bindEvents();
        this.loadSounds();
        this.initializeGame();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.imageSmoothingEnabled = true;
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            if (this.gameState === 'playing') {
                this.addTrailPoint();
            }
        });

        document.getElementById('start-btn').onclick = () => this.startGame();
        document.getElementById('restart-btn').onclick = () => this.restartGame();
    }

    loadSounds() {
        this.sounds = {
            slice: new Audio('slice.mp3'),
            bonus: new Audio('bonus.mp3'),
            gameOver: new Audio('gameover.mp3')
        };
        
        // Preload and set volume
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3;
            sound.load();
        });
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('start-screen').style.display = 'none';
        this.initializeGame();
        this.gameLoop();
    }

    restartGame() {
        this.score = 0;
        this.lives = 10;
        this.combo = 1;
        this.comboTimer = 0;
        this.fruits = [];
        this.particles = [];
        this.trails = [];
        this.powerUps = [];
        this.difficultyMultiplier = 1;
        
        document.getElementById('game-over-screen').style.display = 'none';
        this.gameState = 'playing';
        this.updateUI();
        this.gameLoop();
    }

    initializeGame() {
        this.fruits = [];
        for (let i = 0; i < 3; i++) {
            this.spawnFruit();
        }
    }

    spawnFruit() {
        if (Math.random() < 0.1) { // 10% chance for power-up
            this.fruits.push(new PowerUp(this));
        } else {
            this.fruits.push(new Fruit(this));
        }
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('combo').textContent = `Combo: x${this.combo}`;
        document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
    }

    addTrailPoint() {
        this.trails.push(new TrailPoint(this.mouseX, this.mouseY));
        if (this.trails.length > 20) {
            this.trails.shift();
        }
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Spawn new fruits
        const now = Date.now();
        if (now - this.lastFruitSpawn > this.fruitSpawnRate) {
            this.spawnFruit();
            this.lastFruitSpawn = now;
        }

        // Update game objects
        this.updateFruits();
        this.updateParticles();
        this.updateTrail();
        this.updateCombo();
        
        // Increase difficulty over time
        this.difficultyMultiplier += 0.0001;
    }

    draw() {
        this.drawBackground();
        this.drawTrail();
        this.fruits.forEach(fruit => fruit.draw());
        this.particles.forEach(particle => particle.draw());
    }
}
// Fruit class
class Fruit {
    constructor(game) {
        this.game = game;
        this.reset();
        this.radius = 35;
        this.type = this.getRandomType();
        this.rotation = 0;
        this.scale = 0;
        this.sliced = false;
        this.fadeOut = 1;
    }

    getRandomType() {
        const types = [
            { name: 'watermelon', color: '#ff4757', innerColor: '#2ed573', points: 10 },
            { name: 'orange', color: '#ffa502', innerColor: '#ff6b6b', points: 15 },
            { name: 'apple', color: '#ff4757', innerColor: '#eccc68', points: 20 },
            { name: 'banana', color: '#ffd32a', innerColor: '#ffffff', points: 25 },
            { name: 'pineapple', color: '#ffbe76', innerColor: '#f6e58d', points: 30 }
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    reset() {
        this.x = Math.random() * (this.game.canvas.width - 100) + 50;
        this.y = this.game.canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 5 * this.game.difficultyMultiplier;
        this.speedY = -12 - (Math.random() * 4);
        this.rotationSpeed = (Math.random() - 0.5) * 0.06;
        this.scale = 0;
        this.scaleSpeed = 0.03;
        this.sliced = false;
        this.fadeOut = 1;
    }

    update() {
        if (this.sliced) {
            this.fadeOut -= 0.05;
            if (this.fadeOut <= 0) this.active = false;
            return;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.game.gravity;
        this.rotation += this.rotationSpeed;

        // Scale animation when appearing
        if (this.scale < 1) {
            this.scale += this.scaleSpeed;
        }

        // Bounce off walls
        if (this.x < this.radius || this.x > this.game.canvas.width - this.radius) {
            this.speedX *= -0.8;
        }

        // Check if fruit is missed
        if (this.y > this.game.canvas.height + 50 && !this.sliced) {
            this.game.lives--;
            this.game.combo = 1;
            this.game.updateUI();
            this.createMissEffect();
            if (this.game.lives <= 0) {
                this.game.gameOver();
            }
            this.reset();
        }
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.fadeOut;

        // Draw shadow
        ctx.beginPath();
        ctx.arc(5, 5, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Draw fruit body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw shine
        ctx.beginPath();
        ctx.arc(-this.radius/3, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        if (this.sliced) {
            // Draw slice effect
            ctx.beginPath();
            ctx.moveTo(-this.radius, 0);
            ctx.lineTo(this.radius, 0);
            ctx.strokeStyle = this.type.innerColor;
            ctx.lineWidth = this.radius * 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    createMissEffect() {
        for (let i = 0; i < 10; i++) {
            this.game.particles.push(new Particle(
                this.x,
                this.game.canvas.height,
                'rgba(255, 0, 0, 0.5)',
                8
            ));
        }
    }

    slice() {
        if (this.sliced) return;
        
        this.sliced = true;
        this.game.score += this.type.points * this.game.combo;
        this.game.combo++;
        this.game.comboTimer = 60;
        this.game.updateUI();
        
        // Create particle effect
        for (let i = 0; i < 15; i++) {
            this.game.particles.push(new Particle(
                this.x,
                this.y,
                this.type.color,
                6
            ));
        }
        
        // Play sound
        this.game.sounds.slice.currentTime = 0;
        this.game.sounds.slice.play();
    }
}

// PowerUp class
class PowerUp extends Fruit {
    constructor(game) {
        super(game);
        this.radius = 25;
        this.type = this.getRandomPowerUp();
        this.glowIntensity = 0;
        this.glowDirection = 0.05;
    }

    getRandomPowerUp() {
        const powerUps = [
            { name: 'double_points', color: '#ffd700', innerColor: '#ffffff', points: 0 },
            { name: 'extra_life', color: '#ff0000', innerColor: '#ffffff', points: 0 },
            { name: 'slow_time', color: '#00ffff', innerColor: '#ffffff', points: 0 }
        ];
        return powerUps[Math.floor(Math.random() * powerUps.length)];
    }

    update() {
        super.update();
        // Glow animation
        this.glowIntensity += this.glowDirection;
        if (this.glowIntensity >= 1 || this.glowIntensity <= 0) {
            this.glowDirection *= -1;
        }
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Draw glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.glowIntensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.radius * 2, -this.radius * 2, this.radius * 4, this.radius * 4);

        // Draw power-up
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.type.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw symbol
        ctx.fillStyle = 'white';
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getSymbol(), 0, 0);

        ctx.restore();
    }

    getSymbol() {
        switch(this.type.name) {
            case 'double_points': return '2x';
            case 'extra_life': return '❤️';
            case 'slow_time': return '⏰';
            default: return '?';
        }
    }

    activate() {
        switch(this.type.name) {
            case 'double_points':
                this.game.combo *= 2;
                setTimeout(() => this.game.combo = Math.max(1, this.game.combo / 2), 10000);
                break;
            case 'extra_life':
                if (this.game.lives < 3) this.game.lives++;
                break;
            case 'slow_time':
                this.game.difficultyMultiplier *= 0.5;
                setTimeout(() => this.game.difficultyMultiplier *= 2, 8000);
                break;
        }
        this.game.updateUI();
        this.game.sounds.bonus.play();
    }

    slice() {
        if (this.sliced) return;
        super.slice();
        this.activate();
    }
}

// Particle class
class Particle {
    constructor(x, y, color, size = 5) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = (Math.random() * size) + 2;
        this.speedX = (Math.random() - 0.5) * 15;
        this.speedY = (Math.random() - 0.5) * 15;
        this.gravity = 0.5;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.decay;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Trail Point class for blade effect
class TrailPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.decay = 0.05;
    }
}

// Initialize the game
const game = new Game();
