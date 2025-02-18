// game.js
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.comboElement = document.getElementById('combo');
        this.livesElement = document.getElementById('lives');
        this.comboAlertElement = document.getElementById('combo-alert');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.highScoreElement = document.getElementById('high-score');
        this.soundToggle = document.getElementById('sound-toggle');

        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.8;

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.fruits = [];
        this.particles = new ParticleSystem();
        this.score = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.lives = 3;
        this.gameActive = true;
        this.lastMousePositions = [];
        this.highScore = localStorage.getItem('highScore') || 0;
        this.waveTimer = 0;
        this.difficulty = 1;
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseout', () => this.lastMousePositions = []);
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        this.soundToggle.addEventListener('click', () => {
            const isMuted = soundManager.toggleMute();
            this.soundToggle.textContent = isMuted ? '🔇' : '🔊';
        });
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.lastMousePositions.push({ x, y, timestamp: Date.now() });
        if (this.lastMousePositions.length > 10) {
            this.lastMousePositions.shift();
        }
    }

    handleResize() {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.8;
    }

    spawnFruit() {
        const fruitTypes = [
            { type: 'regular', chance: 0.7 },
            { type: 'special', chance: 0.2 },
            { type: 'bomb', chance: 0.1 }
        ];

        const random = Math.random();
        let cumulative = 0;
        const selectedType = fruitTypes.find(type => {
            cumulative += type.chance;
            return random <= cumulative;
        });

        if (selectedType.type === 'bomb') {
            this.fruits.push(new Bomb(this.canvas.width));
        } else {
            const isCritical = selectedType.type === 'special';
            this.fruits.push(new Fruit(this.canvas.width, isCritical));
        }
    }

    spawnWave() {
        const baseCount = Math.floor(this.difficulty);
        const count = baseCount + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.spawnFruit(), i * 200);
        }
    }

    checkCollisions() {
        if (this.lastMousePositions.length < 2) return;

        const last = this.lastMousePositions[this.lastMousePositions.length - 1];
        const prev = this.lastMousePositions[this.lastMousePositions.length - 2];

        this.fruits.forEach(fruit => {
            if (!fruit.sliced && !fruit.missed) {
                const dx = last.x - prev.x;
                const dy = last.y - prev.y;
                const distance = Math.sqrt(
                    Math.pow(fruit.x - last.x, 2) + 
                    Math.pow(fruit.y - last.y, 2)
                );

                if (distance < fruit.radius + 10) {
                    if (fruit instanceof Bomb) {
                        this.handleBombHit(fruit);
                    } else {
                        this.handleFruitSlice(fruit);
                    }
                }
            }
        });
    }

    handleFruitSlice(fruit) {
        fruit.slice();
        soundManager.playSound('slice');
        this.particles.emit(fruit.x, fruit.y, fruit.color, 20);
        
        const points = fruit.isCritical ? 2 : 1;
        this.score += points * this.combo;
        this.comboTimer = 60;
        this.combo++;
        
        if (this.combo > 3) {
            this.showComboAlert();
            soundManager.playSound('combo');
        }
        
        this.updateHUD();
    }

    handleBombHit(bomb) {
        bomb.slice();
        soundManager.playSound('bomb');
        this.particles.emit(bomb.x, bomb.y, '#ff0000', 30);
        this.lives--;
        this.combo = 1;
        this.updateHUD();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    showComboAlert() {
        this.comboAlertElement.textContent = `${this.combo}x COMBO!`;
        this.comboAlertElement.style.display = 'block';
        this.comboAlertElement.style.animation = 'none';
        this.comboAlertElement.offsetHeight;
        this.comboAlertElement.style.animation = 'comboAlert 1s ease-out';
        setTimeout(() => {
            this.comboAlertElement.style.display = 'none';
        }, 1000);
    }

    updateHUD() {
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.comboElement.textContent = `Combo: x${this.combo}`;
        this.livesElement.textContent = 'Lives: ' + '❤️'.repeat(this.lives);
    }

    gameOver() {
        this.gameActive = false;
        soundManager.playSound('gameOver');
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.score);
        }
        this.finalScoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
        this.gameOverElement.style.display = 'block';
    }

    restart() {
        this.init();
        this.gameOverElement.style.display = 'none';
        this.updateHUD();
        soundManager.startBgMusic();
    }

    update() {
        if (!this.gameActive) return;

        this.waveTimer++;
        if (this.waveTimer >= 120) {
            this.spawnWave();
            this.waveTimer = 0;
            this.difficulty += 0.1;
        }

        this.fruits = this.fruits.filter(fruit => !fruit.isOffScreen());
        this.fruits.forEach(fruit => fruit.update());
        this.particles.update();

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.combo = 1;
                this.updateHUD();
            }
        }

        this.checkCollisions();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw blade trail
        if (this.lastMousePositions.length >= 2) {
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

        this.fruits.forEach(fruit => fruit.draw(this.ctx));
        this.particles.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        soundManager.startBgMusic();
        this.gameLoop();
    }
}

// Start the game when assets are loaded
preloadAssets(() => {
    const game = new Game();
    game.start();
});
