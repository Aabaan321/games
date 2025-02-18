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
let trails = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

// Timer functionality
function startTimer() {
    const timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            // Change timer color when time is running out
            if (timeLeft <= 10) {
                timerElement.style.color = '#ff0000';
            }
        } else {
            clearInterval(timerInterval);
            gameActive = false;
        }
    }, 1000);
}

class Fruit {
    constructor() {
        this.reset();
        this.radius = 30;
        this.color = this.getRandomColor();
        this.sliced = false;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.scale = 0;
    }

    getRandomColor() {
        const colors = [
            { main: '#ff0000', inner: '#ff6666' }, // Red
            { main: '#ffa500', inner: '#ffd27f' }, // Orange
            { main: '#ffff00', inner: '#ffffa3' }, // Yellow
            { main: '#008000', inner: '#66cc66' }, // Green
            { main: '#800080', inner: '#cc99cc' }  // Purple
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    reset() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = -8 - (Math.random() * 3);
        this.gravity = 0.15;
        this.sliced = false;
        this.scale = 0;
        this.fadeOut = 1;
        this.active = true;
    }

    update() {
        if (!this.active) return;

        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;

        if (this.scale < 1) {
            this.scale += 0.05;
        }

        if (this.x < this.radius || this.x > canvas.width - this.radius) {
            this.speedX *= -0.8;
        }

        if (this.y > canvas.height + 50) {
            this.reset();
        }

        if (this.sliced) {
            this.fadeOut -= 0.05;
            if (this.fadeOut <= 0) this.active = false;
        }
    }

    draw() {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.fadeOut;

        // Shadow
        ctx.beginPath();
        ctx.arc(5, 5, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Fruit body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.main;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shine effect
        ctx.beginPath();
        ctx.arc(-this.radius/3, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        if (this.sliced) {
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

// ... [Previous Particle class code remains the same] ...

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
            createEffect(fruit.x, fruit.y, fruit.color.main, 15);
        }
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
        ctx.font = '36px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
        return;
    }

    ctx.fillStyle = 'rgba(51, 51, 51, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTrail();

    fruits.forEach(fruit => {
        fruit.update();
        fruit.draw();
        checkCollision(fruit);
    });

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    fruits = fruits.filter(fruit => fruit.active);
    while (fruits.length < 4) {
        fruits.push(new Fruit());
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    requestAnimationFrame(gameLoop);
}

// Initialize fruits and start game
for (let i = 0; i < 4; i++) {
    fruits.push(new Fruit());
}

// Start timer and game
startTimer();
gameLoop();
