// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let fruits = [];
let score = 0;
let mouseTrail = [];
let lastMousePositions = [];

class Fruit {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.speed = {
            x: Math.random() * 8 - 4,
            y: -15 - Math.random() * 5
        };
        this.radius = 20;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.sliced = false;
    }

    update() {
        if (!this.sliced) {
            this.speed.y += 0.4; // gravity
            this.x += this.speed.x;
            this.y += this.speed.y;
        } else {
            // Split effect when sliced
            this.speed.y += 0.8;
            this.x += this.speed.x;
            this.y += this.speed.y;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// Mouse movement tracking
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
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        }
    });
}

function drawMouseTrail() {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < lastMousePositions.length - 1; i++) {
        const p1 = lastMousePositions[i];
        const p2 = lastMousePositions[i + 1];
        
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    }
    
    ctx.stroke();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn new fruits
    if (Math.random() < 0.03) {
        fruits.push(new Fruit());
    }
    
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

// Start the game
gameLoop();
