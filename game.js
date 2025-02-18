// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 800;
canvas.height = 600;

let fruits = [];
let particles = [];
let score = 0;
let mouseTrail = [];
let lastMousePositions = [];

const FRUITS = [
    { name: 'apple', color: '#ff0000' },
    { name: 'orange', color: '#ffa500' },
    { name: 'watermelon', color: '#ff3366' },
    { name: 'pineapple', color: '#ffff00' },
    { name: 'kiwi', color: '#90EE90' }
];

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * -6 - 2;
        this.gravity = 0.1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.floor(this.life * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.closePath();
    }
}

class Fruit {
    constructor() {
        const fruitType = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.speed = {
            x: Math.random() * 8 - 4,
            y: -15 - Math.random() * 5
        };
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.rotation = 0;
        this.radius = 30;
        this.color = fruitType.color;
        this.sliced = false;
        this.hasGeneratedParticles = false;
    }

    update() {
        this.rotation += this.rotationSpeed;
        
        if (!this.sliced) {
            this.speed.y += 0.4;
        } else {
            this.speed.y += 0.8;
            if (!this.hasGeneratedParticles) {
                this.generateSliceParticles();
                this.hasGeneratedParticles = true;
            }
        }
        
        this.x += this.speed.x;
        this.y += this.speed.y;
    }

    generateSliceParticles() {
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw fruit shadow
        ctx.beginPath();
        ctx.arc(2, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        
        // Draw fruit
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw highlight
        ctx.beginPath();
        ctx.arc(-this.radius/3, -this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
        
        ctx.restore();

        if (this.sliced) {
            // Draw slice effect
            ctx.save();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius, this.y - this.radius);
            ctx.lineTo(this.x + this.radius, this.y + this.radius);
            ctx.stroke();
            ctx.restore();
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

function drawMouseTrail() {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    for (let i = 0; i < lastMousePositions.length - 1; i++) {
        const progress = i / lastMousePositions.length;
        const p1 = lastMousePositions[i];
        const p2 = lastMousePositions[i + 1];
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${progress})`;
        ctx.lineWidth = (progress * 3) + 1;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastMousePositions.push({ x, y });
    if (lastMousePositions.length > 10) {
        lastMousePositions.shift();
    }
});

function checkSlice() {
    if (lastMousePositions.length < 2) return;
    
    const last = lastMousePositions[lastMousePositions.length - 1];
    const prev = lastMousePositions[lastMousePositions.length - 2];
    
    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            const dx = last.x - prev.x;
            const dy = last.y - prev.y;
            const distance = Math.sqrt(
                Math.pow(fruit.x - last.x, 2) + 
                Math.pow(fruit.y - last.y, 2)
            );
            
            if (distance < fruit.radius + 10) {
                fruit.sliced = true;
                score += 1; // Changed from 5 to 1
                scoreElement.textContent = `Score: ${score}`;
            }
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn new fruits
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
    
    // Update and draw particles
    particles = particles.filter(particle => particle.life > 0);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Update and draw fruits
    fruits = fruits.filter(fruit => !fruit.isOffScreen());
    fruits.forEach(fruit => {
        fruit.update();
        fruit.draw();
    });
    
    checkSlice();
    drawMouseTrail();
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
