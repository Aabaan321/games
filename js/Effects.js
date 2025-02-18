class Effects {
    constructor(game) {
        this.game = game;
        this.particles = [];
        this.trail = [];
    }

    createSliceEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    updateTrail(x, y) {
        this.trail.push({ x, y, age: 1 });
    }

    update() {
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        // Update trail
        this.trail.forEach(point => {
            point.age -= 0.05;
        });
        this.trail = this.trail.filter(point => point.age > 0);
    }

    draw() {
        const ctx = this.game.ctx;

        // Draw trail
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        this.trail.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw particles
        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
    }
}
