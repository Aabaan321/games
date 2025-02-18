class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // UI Elements
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over');
        
        // Game State
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = false;
        this.highScore = localStorage.getItem('highScore') || 0;
        
        // Game Objects
        this.fruits = [];
        this.particles = [];
        this.trails = [];
        
        // Mouse Tracking
        this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0 };
        
        this.bindEvents();
        this.showStartScreen();
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.imageSmoothingEnabled = true;
    }

    bindEvents() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.lastX = this.mouse.x;
            this.mouse.lastY = this.mouse.y;
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            if (this.gameActive) {
                this.addTrailPoint();
            }
        });

        // Start game
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        // Restart game
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = true;
        this.fruits = [];
        this.particles = [];
        this.trails = [];
        
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        this.updateScore();
        this.startTimer();
        this.spawnInitialFruits();
        this.gameLoop();
    }

    startTimer() {
        const timerInterval = setInterval(() => {
            if (this.timeLeft > 0 && this.gameActive) {
                this.timeLeft--;
                this.timerElement.textContent = this.timeLeft;
                
                // Change timer color when time is running out
                if (this.timeLeft <= 10) {
                    this.timerElement.style.color = '#ff0000';
                }
            } else {
                clearInterval(timerInterval);
                if (this.gameActive) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    spawnInitialFruits() {
        for (let i = 0; i < 4; i++) {
            this.fruits.push(new Fruit(this));
        }
    }

    spawnFruit() {
        if (Math.random() < 0.1) { // 10% chance for power-up
            this.fruits.push(new PowerUp(this));
        } else {
            this.fruits.push(new Fruit(this));
        }
    }

    addTrailPoint() {
        this.trails.push({
            x: this.mouse.x,
            y: this.mouse.y,
            life: 1
        });
        
        if (this.trails.length > 20) {
            this.trails.shift();
        }
    }

    updateScore(points = 0) {
        this.score += points;
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    endGame() {
        this.gameActive = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        
        // Show game over screen
        document.getElementById('final-score').textContent = `Final Score: ${this.score}`;
        document.getElementById('high-score').textContent = `High Score: ${this.highScore}`;
        this.gameOverScreen.classList.remove('hidden');
    }

    update() {
        // Update fruits
        this.fruits = this.fruits.filter(fruit => {
            fruit.update();
            return fruit.active;
        });

        // Spawn new fruits if needed
        while (this.fruits.length < 4) {
            this.spawnFruit();
        }

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // Update trail
        this.trails = this.trails.filter(point => {
            point.life -= 0.05;
            return point.life > 0;
        });
    }

    draw() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw trail
        if (this.trails.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            
            this.trails.forEach((point, index) => {
                this.ctx.globalAlpha = point.life;
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        }

        // Draw fruits
        this.fruits.forEach(fruit => fruit.draw());

        // Draw particles
        this.particles.forEach(particle => particle.draw());
    }

    gameLoop() {
        if (!this.gameActive) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
class Fruit {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.reset();
        this.radius = 30;
        this.type = this.getRandomType();
        this.rotation = 0;
        this.scale = 0;
        this.sliced = false;
        this.active = true;
        this.fadeOut = 1;
    }

    getRandomType() {
        const types = [
            {
                name: 'watermelon',
                color: '#ff4757',
                innerColor: '#2ed573',
                points: 10,
                size: 1.2
            },
            {
                name: 'orange',
                color: '#ffa502',
                innerColor: '#ff6348',
                points: 15,
                size: 0.9
            },
            {
                name: 'apple',
                color: '#ff4757',
                innerColor: '#eccc68',
                points: 20,
                size: 0.85
            },
            {
                name: 'pineapple',
                color: '#ffbe76',
                innerColor: '#f6e58d',
                points: 25,
                size: 1.1
            }
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    reset() {
        this.x = Math.random() * (this.game.canvas.width - 100) + 50;
        this.y = this.game.canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 3; // Reduced horizontal speed
        this.speedY = -8 - (Math.random() * 3); // Reduced upward speed
        this.gravity = 0.15; // Reduced gravity
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.scale = 0;
        this.sliced = false;
        this.active = true;
        this.fadeOut = 1;
    }

    update() {
        if (!this.active) return;

        // Position update
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;

        // Scale animation
        if (this.scale < 1) {
            this.scale += 0.05;
        }

        // Bounce off walls
        if (this.x < this.radius || this.x > this.game.canvas.width - this.radius) {
            this.speedX *= -0.8;
        }

        // Check if fruit is off screen
        if (this.y > this.game.canvas.height + 50) {
            this.active = false;
        }

        // Fade out when sliced
        if (this.sliced) {
            this.fadeOut -= 0.05;
            if (this.fadeOut <= 0) this.active = false;
        }

        // Check for slice collision
        if (!this.sliced) {
            this.checkSlice();
        }
    }

    checkSlice() {
        const dx = this.game.mouse.x - this.game.mouse.lastX;
        const dy = this.game.mouse.y - this.game.mouse.lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const distToFruit = Math.sqrt(
                Math.pow(this.game.mouse.x - this.x, 2) + 
                Math.pow(this.game.mouse.y - this.y, 2)
            );

            if (distToFruit < this.radius) {
                this.slice();
            }
        }
    }

    slice() {
        if (this.sliced) return;
        
        this.sliced = true;
        this.game.updateScore(this.type.points);
        this.game.createParticles(this.x, this.y, this.type.color, 15);
        
        // Create juice splash effect
        this.createJuiceSplash();
    }

    createJuiceSplash() {
        const splashCount = 8;
        const angleStep = (Math.PI * 2) / splashCount;
        
        for (let i = 0; i < splashCount; i++) {
            const angle = i * angleStep;
            const speed = 2 + Math.random() * 2;
            
            this.game.particles.push(new JuiceDrop(
                this.x,
                this.y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.type.innerColor
            ));
        }
    }

    draw() {
        if (!this.active) return;

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale * this.type.size, this.scale * this.type.size);
        this.ctx.globalAlpha = this.fadeOut;

        // Draw shadow
        this.ctx.beginPath();
        this.ctx.arc(5, 5, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();

        // Draw fruit body
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.type.color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw shine
        this.ctx.beginPath();
        this.ctx.arc(-this.radius/3, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();

        // Draw slice effect
        if (this.sliced) {
            this.ctx.beginPath();
            this.ctx.moveTo(-this.radius, 0);
            this.ctx.lineTo(this.radius, 0);
            this.ctx.strokeStyle = this.type.innerColor;
            this.ctx.lineWidth = this.radius * 1.5;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }
}

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
            {
                name: 'time_bonus',
                color: '#00ff00',
                innerColor: '#ffffff',
                points: 0,
                size: 0.8
            },
            {
                name: 'double_points',
                color: '#ffd700',
                innerColor: '#ffffff',
                points: 0,
                size: 0.8
            }
        ];
        return powerUps[Math.floor(Math.random() * powerUps.length)];
    }

    activate() {
        switch(this.type.name) {
            case 'time_bonus':
                this.game.timeLeft = Math.min(60, this.game.timeLeft + 5);
                this.game.timerElement.textContent = this.game.timeLeft;
                break;
            case 'double_points':
                // Implementation for double points
                break;
        }
    }

    slice() {
        super.slice();
        this.activate();
    }

    draw() {
        super.draw();
        // Add glow effect for power-ups
        if (this.active) {
            this.glowIntensity += this.glowDirection;
            if (this.glowIntensity >= 1 || this.glowIntensity <= 0) {
                this.glowDirection *= -1;
            }
            
            const glow = this.ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * 2
            );
            glow.addColorStop(0, `rgba(255, 255, 255, ${this.glowIntensity * 0.5})`);
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(
                this.x - this.radius * 2,
                this.y - this.radius * 2,
                this.radius * 4,
                this.radius * 4
            );
        }
    }
}

class Particle {
    constructor(x, y, color, size = 5) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = (Math.random() * size) + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.gravity = 0.3;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.decay;
        this.size *= 0.99;
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

class JuiceDrop extends Particle {
    constructor(x, y, speedX, speedY, color) {
        super(x, y, color);
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = 3;
        this.decay = 0.01;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.ellipse(
            this.x, this.y,
            this.size * 2,
            this.size,
            Math.atan2(this.speedY, this.speedX),
            0, Math.PI * 2
        );
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Initialize the game
const game = new Game();

