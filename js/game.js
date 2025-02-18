class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
        
        this.fruits = [];
        this.effects = new Effects(this);
        this.sounds = {};
        this.powerUps = [];
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.loadSounds();
        this.bindEvents();
        this.initializeFruits();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth * 0.8;
        this.canvas.height = window.innerHeight * 0.8;
    }

    loadSounds() {
        const soundFiles = ['slice', 'splash', 'gameover', 'bonus'];
        soundFiles.forEach(sound => {
            this.sounds[sound] = new Audio(`sounds/${sound}.mp3`);
        });
    }

    playSound(name) {
        this.sounds[name].currentTime = 0;
        this.sounds[name].play();
    }

    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.effects.updateTrail(this.mouseX, this.mouseY);
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    initializeFruits() {
        for (let i = 0; i < 5; i++) {
            this.fruits.push(new Fruit(this));
        }
    }

    start() {
        document.getElementById('menu').classList.add('hidden');
        this.gameLoop();
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.fruits = [];
        this.initializeFruits();
        document.getElementById('gameOver').classList.add('hidden');
        this.updateUI();
        this.gameLoop();
    }

    gameLoop() {
        if (this.lives <= 0) {
            this.gameOver();
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.update();
        this.draw();
        
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateCombo();
        this.effects.update();
        
        this.fruits.forEach(fruit => {
            fruit.update();
            this.checkCollision(fruit);
        });

        if (Math.random() < 0.005) {
            this.powerUps.push(new PowerUp(this));
        }

        this.powerUps.forEach((powerUp, index) => {
            powerUp.update();
            if (!powerUp.active) {
                this.powerUps.splice(index, 1);
            }
        });
    }

    draw() {
        this.effects.draw();
        this.fruits.forEach(fruit => fruit.draw());
        this.powerUps.forEach(powerUp => powerUp.draw());
    }

    checkCollision(fruit) {
        if (fruit.sliced) return;

        const dx = this.mouseX - this.lastMouseX;
        const dy = this.mouseY - this.lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const distToFruit = Math.sqrt(
                Math.pow(this.mouseX - fruit.x, 2) + 
                Math.pow(this.mouseY - fruit.y, 2)
            );

            if (distToFruit < fruit.radius) {
                fruit.slice();
            }
        }
    }

    updateCombo() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else {
            this.combo = 0;
            this.comboMultiplier = 1;
        }
        this.updateUI();
    }

    increaseCombo() {
        this.combo++;
        this.comboMultiplier = 1 + Math.floor(this.combo / 3);
        this.comboTimer = 60;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('combo').textContent = `Combo: x${this.comboMultiplier}`;
        this.updateLives();
    }

    updateLives() {
        document.getElementById('lives').textContent = '❤️'.repeat(this.lives);
    }

    gameOver() {
        this.playSound('gameover');
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
    }

    activateDoublePoints() {
        this.comboMultiplier *= 2;
        setTimeout(() => {
            this.comboMultiplier = Math.max(1, this.comboMultiplier / 2);
        }, 10000);
    }

    activateSlowMotion() {
        this.fruits.forEach(fruit => {
            fruit.speedX *= 0.5;
            fruit.speedY *= 0.5;
            fruit.gravity *= 0.5;
        });
        setTimeout(() => {
            this.fruits.forEach(fruit => {
                fruit.speedX *= 2;
                fruit.speedY *= 2;
                fruit.gravity *= 2;
            });
        }, 5000);
    }

    addLife() {
        if (this.lives < 3) {
            this.lives++;
            this.updateLives();
        }
    }
}

// Start the game when the window loads
window.onload = () => {
    const game = new Game();
};
