// =====================
// DOM Elements
// =====================
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const finalScoreEl = document.getElementById('final-score');
const scoreboard = document.getElementById('scoreboard');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const mouseEl = document.getElementById('mouse');
const fatcatEl = document.getElementById('fatcat');
const cheeseEl = document.getElementById('cheese');

// =====================
// Audio
// =====================
const eatCheeseSound = new Audio('eat_cheese.mp3');
const loseSound = new Audio('lose.mp3');
const soundtrack = new Audio('soundtrack.mp3');
soundtrack.loop = true;
soundtrack.playbackRate = 2.0;
const letsGoSound = new Audio('letsgo.mp3');

// =====================
// Canvas Setup
// =====================
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =====================
// Game State
// =====================
let gameRunning = false;
let score = 0;
let mouse = { x: 100, y: 100, lastDirection: 1 };
let fatcat = { x: 400, y: 300 };
let cheese = { x: 0, y: 0, active: false };

// =====================
// Start Game
// =====================
function startGame() {
    score = 0;
    scoreboard.textContent = "CHEESE: 0";

    mouse.x = canvas.width / 2 - 50;
    mouse.y = canvas.height / 2 - 50;
    mouse.lastDirection = 1;

    fatcat.x = Math.random() * (canvas.width - 200);
    fatcat.y = Math.random() * (canvas.height - 200);

    cheese.active = false;
    cheeseEl.classList.add('hidden');

    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    gameRunning = true;
    soundtrack.currentTime = 0;
    soundtrack.play();
    letsGoSound.play();

    spawnCheese();
    requestAnimationFrame(gameLoop);
}

// =====================
// Spawn Cheese
// =====================
function spawnCheese() {
    if (!gameRunning || cheese.active) return;

    cheese.x = Math.random() * (canvas.width - 100);
    cheese.y = Math.random() * (canvas.height - 100);
    cheese.active = true;

    cheeseEl.style.left = cheese.x + "px";
    cheeseEl.style.top = cheese.y + "px";
    cheeseEl.classList.remove('hidden');
}

// =====================
// Game Loop
// =====================
function gameLoop() {
    if (!gameRunning) return;

    // Mouse
    mouseEl.style.left = mouse.x + "px";
    mouseEl.style.top = mouse.y + "px";
    mouseEl.style.transform = `scaleX(${mouse.lastDirection})`;

    // Fatcat
    let dx = mouse.x - fatcat.x;
    let dy = mouse.y - fatcat.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let speed = 2 + score / 500;
    if (dist !== 0) {
        fatcat.x += (dx / dist) * speed;
        fatcat.y += (dy / dist) * speed;
    }
    fatcatEl.style.left = fatcat.x + "px";
    fatcatEl.style.top = fatcat.y + "px";
    fatcatEl.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';

    // Collision with cheese
    const mPad = 20, cPad = 10;
    if (cheese.active &&
        mouse.x + mPad < cheese.x + 100 - cPad &&
        mouse.x + 100 - mPad > cheese.x + cPad &&
        mouse.y + mPad < cheese.y + 100 - cPad &&
        mouse.y + 100 - mPad > cheese.y + cPad
    ) {
        score += 100;
        scoreboard.textContent = "CHEESE: " + score;
        eatCheeseSound.currentTime = 0;
        eatCheeseSound.play();
        cheese.active = false;
        cheeseEl.classList.add('hidden');
        spawnCheese();
    }

    // Collision with fatcat
    const fPad = 30;
    if (mouse.x + mPad < fatcat.x + 200 - fPad &&
        mouse.x + 100 - mPad > fatcat.x + fPad &&
        mouse.y + mPad < fatcat.y + 200 - fPad &&
        mouse.y + 100 - mPad > fatcat.y + fPad
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
    let dx = e.clientX - (mouse.x + 50);
    mouse.x = e.clientX - 50;
    mouse.y = e.clientY - 50;
    if (dx > 0) mouse.lastDirection = -1; // right → flipped
    else if (dx < 0) mouse.lastDirection = 1; // left → default
});

// =====================
// Start / Restart with Space
// =====================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!startScreen.classList.contains('hidden') || !endScreen.classList.contains('hidden')) {
            startGame();
        }
    }
});

// =====================
// Resize
// =====================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
