class Fruit {
    constructor(game) {
        this.game = game;
        this.reset();
        this.radius = 30;
        this.sliced = false;
        this.active = true;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.initializeType();
    }

    initializeType() {
        const types = [
            { name: 'apple', points: 10, color: '255, 0, 0' },
            { name: 'orange', points: 15, color: '255, 165, 0' },
            { name: 'watermelon', points: 20, color: '50, 200, 50' },
            { name: 'banana', points: 25, color: '255, 255, 0' }
        ];
        this.type = types[Math.floor(Math.random() * types.length)];
    }

    reset() {
        this.x = Math.random() * this.game.canvas.width;
        this.y = this.game.canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = -15 - Math.random() * 5;
        this.gravity = 0.4;
        this.sliced = false;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;

        if (this.y > this.game.canvas.height + 50) {
            if (!this.sliced) {
                this.game.lives--;
                this.game.updateLives();
            }
            this.reset();
        }
    }

    draw() {
        if (!this.active) return;

        const ctx = this.game.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw fruit
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.type.color}, 1)`;
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }

    slice() {
        if (this.sliced) return;
        
        this.sliced = true;
        this.game.score += this.type.points * this.game.comboMultiplier;
        this.game.increaseCombo();
        this.game.createSliceEffect(this.x, this.y, this.type.color);
        this.game.playSound('slice');
    }
}
