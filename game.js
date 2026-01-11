// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const finalScoreEl = document.getElementById('final-score');
const scoreboardEl = document.getElementById('scoreboard');

const mouseEl = document.getElementById('mouse');
const fatcatEl = document.getElementById('fatcat');
const cheeseEl = document.getElementById('cheese');

const eatCheeseSound = new Audio('eat_cheese.mp3');
const loseSound = new Audio('lose.mp3');
const letsGoSound = new Audio('letsgo.mp3');
const soundtrack = new Audio('soundtrack.mp3');
soundtrack.loop = true;
soundtrack.playbackRate = 2.0;

// Game state
let gameRunning = false;
let score = 0;

// Positions
let mouse = { x: 200, y: 200, width: 60, height: 60, dx: 0 };
let fatcat = { x: 400, y: 300, width: 140, height: 140 };
let cheese = null;

// Track last mouse position for flipping
let lastMouseX = mouse.x;

// =====================
// Utility
// =====================
function getRandomPosition(objWidth, objHeight) {
    const x = Math.random() * (window.innerWidth - objWidth);
    const y = Math.random() * (window.innerHeight - objHeight);
    return { x, y };
}

// =====================
// Start Game
// =====================
function startGame() {
    score = 0;
    updateScore();
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;
    mouse.dx = 0;
    lastMouseX = mouse.x;

    fatcat.x = Math.random() * window.innerWidth;
    fatcat.y = Math.random() * window.innerHeight;

    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    letsGoSound.currentTime = 0;
    letsGoSound.play();

    spawnCheese();
    gameRunning = true;
    soundtrack.currentTime = 0;
    soundtrack.play();

    requestAnimationFrame(gameLoop);
}

// =====================
// Spawn Cheese
// =====================
function spawnCheese() {
    const pos = getRandomPosition(60, 60);
    cheese = { ...pos, width: 60, height: 60 };
    cheeseEl.style.left = cheese.x + 'px';
    cheeseEl.style.top = cheese.y + 'px';
    cheeseEl.classList.remove('hidden');
}

// =====================
// Update Score
// =====================
function updateScore() {
    scoreboardEl.textContent = `SCORE: ${score}`;
}

// =====================
// Game Loop
// =====================
function gameLoop() {
    if (!gameRunning) return;

    // --- Mouse element ---
    mouseEl.style.left = mouse.x + 'px';
    mouseEl.style.top = mouse.y + 'px';
    // Flip correctly (opposite of movement)
    mouseEl.style.transform = mouse.dx < 0 ? 'scaleX(-1)' : 'scaleX(1)';

    // --- Fatcat movement ---
    let dx = mouse.x - fatcat.x;
    let dy = mouse.y - fatcat.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let speed = 2 + score / 500; // faster with more cheese
    fatcat.x += (dx / dist) * speed;
    fatcat.y += (dy / dist) * speed;

    fatcatEl.style.left = fatcat.x + 'px';
    fatcatEl.style.top = fatcat.y + 'px';
    fatcatEl.style.transform = dx > 0 ? 'scaleX(-1)' : 'scaleX(1)';

    // --- Cheese collision ---
    if (cheese) {
        if (
            mouse.x < cheese.x + cheese.width &&
            mouse.x + mouse.width > cheese.x &&
            mouse.y < cheese.y + cheese.height &&
            mouse.y + mouse.height > cheese.y
        ) {
            score += 100;
            updateScore();
            eatCheeseSound.currentTime = 0;
            eatCheeseSound.play();
            cheeseEl.classList.add('hidden');
            spawnCheese();
        }
    }

    // --- Fatcat collision ---
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
    cheeseEl.classList.add('hidden');
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
// Start / Restart with Space
// =====================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameRunning) startGame();
});

// =====================
// Handle Resize
// =====================
window.addEventListener('resize', () => {
    if (mouse.x + mouse.width > window.innerWidth) mouse.x = window.innerWidth - mouse.width;
    if (mouse.y + mouse.height > window.innerHeight) mouse.y = window.innerHeight - mouse.height;
    if (fatcat.x + fatcat.width > window.innerWidth) fatcat.x = window.innerWidth - fatcat.width;
    if (fatcat.y + fatcat.height > window.innerHeight) fatcat.y = window.innerHeight - fatcat.height;
});
