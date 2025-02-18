const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let timeLeft = 60;
let gameActive = true;
let fruits = [];
let particles = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

class Fruit {
    constructor() {
        this.reset();
        this.radius = 30;
        this.color = this.getRandomColor();
        this.sliced = false;
        this.active = true;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    getRandomColor() {
        const colors = [
            { fill: '#ff0000', inner: '#ff6666' }, // Red
            { fill: '#ffa500', inner: '#ffd27f' }, // Orange
            { fill: '#ffff00', inner: '#ffffa3' }, // Yellow
            { fill: '#008000', inner: '#66cc66' }, // Green
            { fill: '#800080', inner: '#cc99cc' }  // Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    reset() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = -20 - (Math.random() * 5); // Higher initial velocity
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

        // Bounce off walls
        if (this.x < this.radius) {
            this.x = this.radius;
            this.speedX *= -0.8;
        }
        if (this.x > canvas.width - this.radius) {
            this.x = canvas.width - this.radius;
            this.speedX *= -0.8;
        }

        // Reset if off screen
        if (this.y > canvas.height + 50) {
            this.reset();
            this.sliced = false;
        }
    }

    draw() {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw shadow
        ctx.beginPath();
        ctx.arc(5, 5, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // Draw fruit
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.fill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
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
            ctx.strokeStyle = this.color.inner;
            ctx.lineWidth = this.radius * 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = (Math.random() - 0.5) * 10;
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

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Mouse movement tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function checkCollision(fruit) {
    if (fruit.sliced) return;

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const distToFruit = Math.sqrt(
            Math.pow(mouseX - fruit.x, 2) + 
            Math.pow(mouseY - fruit.y, 2)
        );

        if (distToFruit < fruit.radius) {
            fruit.sliced = true;
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
            createParticles(fruit.x, fruit.y, fruit.color.fill);
        }
    }
}

// Initialize fruits with staggered positions
for (let i = 0; i < 8; i++) {
    const fruit = new Fruit();
    fruit.y = canvas.height - (i * (canvas.height / 8));
    fruits.push(fruit);
}

// Start timer
const timerInterval = setInterval(() => {
    if (timeLeft > 0) {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 10) {
            timerElement.style.color = '#ff0000';
        }
    } else {
        gameActive = false;
        clearInterval(timerInterval);
    }
}, 1000);

function drawBlade() {
    if (lastMouseX && lastMouseY) {
        ctx.beginPath();
        ctx.moveTo(lastMouseX, lastMouseY);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Add glow effect to blade
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 6;
        ctx.stroke();
    }
}

function gameLoop() {
    if (!gameActive) {
        // Game Over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time\'s Up!', canvas.width/2, canvas.height/2 - 50);
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
        return;
    }

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(51, 51, 51, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw blade trail
    drawBlade();

    // Update and draw fruits
    fruits.forEach(fruit => {
        fruit.update();
        fruit.draw();
        checkCollision(fruit);
    });

    // Update and draw particles
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
