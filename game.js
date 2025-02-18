const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let score = 0;
let lives = 3;
let fruits = [];
let particles = [];
let trails = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let gameStartTime = Date.now();

// Fruit class with improved animations
class Fruit {
    constructor() {
        this.reset();
        this.radius = 30;
        this.color = this.getRandomColor();
        this.sliced = false;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // Slower rotation
        this.scale = 0; // For scale animation
        this.scaleSpeed = 0.05;
    }

    reset() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 4; // Reduced horizontal speed
        this.speedY = -8 - Math.random() * 3; // Reduced vertical speed
        this.gravity = 0.2; // Reduced gravity
        this.sliced = false;
        this.scale = 0;
        this.rotation = 0;
    }

    getRandomColor() {
        const colors = [
            { fill: '#ff0000', stroke: '#660000' }, // red
            { fill: '#ffa500', stroke: '#664200' }, // orange
            { fill: '#ffff00', stroke: '#666600' }, // yellow
            { fill: '#008000', stroke: '#003300' }, // green
            { fill: '#800080', stroke: '#330033' }  // purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;

        // Scale animation
        if (this.scale < 1) {
            this.scale += this.scaleSpeed;
        }

        // Bounce off walls
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.speedX *= -0.8;
        }

        // Reset if fruit goes off screen
        if (this.y > canvas.height + 50) {
            if (!this.sliced) {
                lives--;
                livesElement.textContent = `Lives: ${lives}`;
                createParticles(this.x, canvas.height, '#ff0000', 5); // Red particles for life loss
            }
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);

        // Draw shadow
        ctx.beginPath();
        ctx.arc(5, 5, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Draw fruit
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.fill;
        ctx.fill();
        ctx.strokeStyle = this.color.stroke;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw shine
        ctx.beginPath();
        ctx.arc(-this.radius/3, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        ctx.restore();
    }
}

// Enhanced Particle class
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
        this.decay = 0.015;
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

// Trail class for blade effect
class Trail {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.decay = 0.05;
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Initialize fruits
function initializeFruits() {
    fruits = [];
    for (let i = 0; i < 4; i++) { // Reduced number of fruits
        const fruit = new Fruit();
        fruit.y = canvas.height - (i * 200); // Space them out vertically
        fruits.push(fruit);
    }
}

// Mouse movement tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    trails.push(new Trail(mouseX, mouseY));
});

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
            createParticles(fruit.x, fruit.y, fruit.color.fill, 15);
            setTimeout(() => fruit.reset(), 0);
        }
    }
}

function drawTrail() {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    trails.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
        point.life -= point.decay;
    });
    
    ctx.stroke();
    trails = trails.filter(point => point.life > 0);
}

function drawBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    if (lives <= 0) {
        drawGameOver();
        return;
    }

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(51, 51, 51, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw trail
    drawTrail();

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

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    requestAnimationFrame(gameLoop);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 40);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    
    ctx.font = '18px Arial';
    ctx.fillText('Click to play again', canvas.width/2, canvas.height/2 + 60);

    canvas.onclick = () => {
        score = 0;
        lives = 3;
        particles = [];
        trails = [];
        scoreElement.textContent = 'Score: 0';
        livesElement.textContent = 'Lives: 3';
        initializeFruits();
        canvas.onclick = null;
        gameLoop();
    };
}

// Start the game
initializeFruits();
gameLoop();
