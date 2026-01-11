// =====================
// DOM Elements
// =====================
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const finalScoreEl = document.getElementById('final-score');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// =====================
// Canvas Setup
// =====================
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =====================
// Assets
// =====================
const mouseImg = new Image();
mouseImg.src = 'mouse.gif';

const fatcatImg = new Image();
fatcatImg.src = 'fatcat.gif';

const cheeseImg = new Image();
cheeseImg.src = 'cheese.gif';

const eatCheeseSound = new Audio('eat_cheese.mp3');
const loseSound = new Audio('lose.mp3');
const soundtrack = new Audio('soundtrack.mp3');
soundtrack.loop = true;
soundtrack.playbackRate = 2.0; // 200% speed

// Fix background paths
document.querySelector('#start-screen .background').src = 'background_start.png';
document.querySelector('#end-screen .background').src = 'background_end.png';

// =====================
// Game State
// =====================
let gameRunning = false;
let score = 0;

let mouse = { x: 100, y: 100, width: 80, height: 80, dx: 0 }; // slightly bigger
let lastMouseX = mouse.x;

let fatcat = { x: 400, y: 300, width: 120, height: 120 }; // bigger
let cheese = null; // only one cheese at a time

// =====================
// Utility
// =====================
function getRandomPosition(objWidth, objHeight) {
    const x = Math.random() * (canvas.width - objWidth);
    const y = Math.random() * (canvas.height - objHeight);
    return { x, y };
}

// =====================
// Start Game
// =====================
function startGame() {
    score = 0;
    cheese = null;
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mouse.dx = 0;
    lastMouseX = mouse.x;

    fatcat.x = Math.random() * canvas.width;
    fatcat.y = Math.random() * canvas.height;

    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    gameRunning = true;
    soundtrack.currentTime = 0;
    soundtrack.play();

    spawnCheese();
    requestAnimationFrame(gameLoop);
}

// =====================
// Spawn Cheese
// =====================
function spawnCheese() {
    if (!gameRunning) return;
    const pos = getRandomPosition(60, 60); // slightly bigger
    cheese = { ...pos, width: 60, height: 60 };
}

// =====================
// Game Loop
// =====================
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw Cheese & check collision ---
    if (cheese) {
        ctx.drawImage(cheeseImg, cheese.x, cheese.y, cheese.width, cheese.height);

        if (
            mouse.x < cheese.x + cheese.width &&
            mouse.x + mouse.width > cheese.x &&
            mouse.y < cheese.y + cheese.height &&
            mouse.y + mouse.height > cheese.y
        ) {
            score += 100;
            eatCheeseSound.currentTime = 0;
            eatCheeseSound.play();
            spawnCheese(); // spawn new cheese immediately
        }
    }

    // --- Move Fatcat ---
    let dx = mouse.x - fatcat.x;
    let dy = mouse.y - fatcat.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let speed = 2 + Math.floor(score / 500) * 0.5;
    fatcat.x += (dx / dist) * speed;
    fatcat.y += (dy / dist) * speed;

    // --- Draw Fatcat ---
    ctx.save();
    if (dx < 0) { // moving left
        ctx.translate(fatcat.x + fatcat.width / 2, fatcat.y + fatcat.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(fatcatImg, -fatcat.width / 2, -fatcat.height / 2, fatcat.width, fatcat.height);
    } else {
        ctx.drawImage(fatcatImg, fatcat.x, fatcat.y, fatcat.width, fatcat.height);
    }
    ctx.restore();

    // --- Draw Mouse ---
    ctx.save();
    if (mouse.dx < 0) { // moving left
        ctx.translate(mouse.x + mouse.width / 2, mouse.y + mouse.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(mouseImg, -mouse.width / 2, -mouse.height / 2, mouse.width, mouse.height);
    } else {
        ctx.drawImage(mouseImg, mouse.x, mouse.y, mouse.width, mouse.height);
    }
    ctx.restore();

    // --- Collision with Fatcat ---
    if (
        mouse.x < fatcat.x + fatcat.width &&
        mouse.x + mouse.width > fatcat.x &&
        mouse.y < fatcat.y + fatcat.height &&
        mouse.y + mouse.height > fatcat.y
    ) {
        endGame();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// =====================
// End Game
// =====================
function endGame() {
    gameRunning = false;
    soundtrack.pause();
    loseSound.currentTime = 0;
    loseSound.play();

    finalScoreEl.textContent = score;

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// =====================
// Mouse Movement
// =====================
window.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    mouse.dx = e.clientX - lastMouseX;
    mouse.x = e.clientX - mouse.width / 2;
    mouse.y = e.clientY - mouse.height / 2;
    lastMouseX = e.clientX;
});

// =====================
// Start / Restart
// =====================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) startGame();
    }
});

// =====================
// Resize
// =====================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
