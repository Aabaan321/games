const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let fruits = [];
let particles = [];
let trail = [];
let score = 0;
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

// Fruit images
const fruitTypes = ['apple', 'orange', 'watermelon', 'banana'];
const fruitImages = {};

// Load fruit images
fruitTypes.forEach(type => {
    const img = new Image();
    img.src = `fruits/${type}.png`;
    fruitImages[type] = img;
});

class Fruit {
    constructor() {
        this.reset();
        this.type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        this.radius = 30;
        this.sliced = false;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 50;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = -15 - Math.random() * 5;
        this.gravity = 0.4;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;

        // Reset if fruit goes off screen
        if (this.y > canvas.height + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(fruitImages[this.type], -this.radius, -this.radius, 
                     this.radius * 2, this.radius * 2);
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
        this.gravity = 0.5;
        this.life = 1;
        this.decay = 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
        ctx.fill();
    }
}

// Mouse movement tracking
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Add trail points
    trail.push({x: mouseX, y: mouseY, age: 1});
});

function createSliceEffect(x, y) {
    // Create particles
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, '255, 255, 255'));
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
            createSliceEffect(fruit.x, fruit.y);
            setTimeout(() => fruit.reset(), 0);
        }
    }
}

// Initialize fruits
for (let i = 0; i < 5; i++) {
    fruits.push(new Fruit());
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw trail
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    trail.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
        point.age -= 0.05;
    });
    ctx.stroke();
    trail = trail.filter(point => point.age > 0);

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

// Start the game
gameLoop();
