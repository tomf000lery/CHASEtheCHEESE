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

// Mouse
let mouse = { x: 100, y: 100, dx: 0, dy: 0, prevX: 100 };
// Fatcat
let fatcat = { x: 400, y: 300 };
// Cheese
let cheese = { x: 0, y: 0, active: false };

// =====================
// Entities (using <img> to keep GIFs animated)
// =====================
let mouseEl, fatcatEl, cheeseEl;

// Create image elements when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    mouseEl = document.createElement('img');
    mouseEl.id = 'mouse';
    mouseEl.src = 'mouse.gif';
    mouseEl.classList.add('game-entity');
    mouseEl.style.width = '100px';
    mouseEl.style.height = '100px';
    gameScreen.appendChild(mouseEl);

    fatcatEl = document.createElement('img');
    fatcatEl.id = 'fatcat';
    fatcatEl.src = 'fatcat.gif';
    fatcatEl.classList.add('game-entity');
    fatcatEl.style.width = '200px';
    fatcatEl.style.height = '200px';
    gameScreen.appendChild(fatcatEl);

    cheeseEl = document.createElement('img');
    cheeseEl.id = 'cheese';
    cheeseEl.src = 'cheese.gif';
    cheeseEl.classList.add('game-entity', 'hidden');
    cheeseEl.style.width = '100px';
    cheeseEl.style.height = '100px';
    gameScreen.appendChild(cheeseEl);
});

// =====================
// Start Game
// =====================
function startGame() {
    score = 0;
    if (scoreboard) scoreboard.textContent = "CHEESE: 0";

    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    mouse.prevX = mouse.x;
    mouse.dx = 0;
    mouse.dy = 0;

    fatcat.x = Math.random() * canvas.width;
    fatcat.y = Math.random() * canvas.height;

    cheese.active = false;
    if (cheeseEl) cheeseEl.classList.add('hidden');

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
// Spawn Cheese (only 1 at a time)
// =====================
function spawnCheese() {
    if (!gameRunning || cheese.active) return;
    cheese.x = Math.random() * (canvas.width - 100);
    cheese.y = Math.random() * (canvas.height - 100);
    cheese.active = true;
    if (cheeseEl) {
        cheeseEl.style.left = cheese.x + "px";
        cheeseEl.style.top = cheese.y + "px";
        cheeseEl.classList.remove('hidden');
    }
}

// =====================
// Game Loop
// =====================
function gameLoop() {
    if (!gameRunning) return;

    // --- Update Mouse ---
    if (mouseEl) {
        mouseEl.style.left = mouse.x + "px";
        mouseEl.style.top = mouse.y + "px";

        // Flip only when moving right; else default left
        if (mouse.x > mouse.prevX) {
            mouseEl.style.transform = 'scaleX(-1)'; // moving right
        } else {
            mouseEl.style.transform = 'scaleX(1)'; // default left
        }
        mouse.prevX = mouse.x;
    }

    // --- Move Fatcat towards mouse ---
    let dx = mouse.x - fatcat.x;
    let dy = mouse.y - fatcat.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let speed = 2 + score / 500; // faster with more cheese
    fatcat.x += (dx / dist) * speed;
    fatcat.y += (dy / dist) * speed;

    if (fatcatEl) {
        fatcatEl.style.left = fatcat.x + "px";
        fatcatEl.style.top = fatcat.y + "px";
        fatcatEl.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)'; // flip instantly
    }

    // --- Check collision with cheese (precise hitbox) ---
    if (cheese.active) {
        const mousePadding = 20;
        const cheesePadding = 10;
        if (
            mouse.x + mousePadding < cheese.x + 100 - cheesePadding &&
            mouse.x + 100 - mousePadding > cheese.x + cheesePadding &&
            mouse.y + mousePadding < cheese.y + 100 - cheesePadding &&
            mouse.y + 100 - mousePadding > cheese.y + cheesePadding
        ) {
            score += 100;
            if (scoreboard) scoreboard.textContent = "CHEESE: " + score;
            eatCheeseSound.currentTime = 0;
            eatCheeseSound.play();
            cheese.active = false;
            if (cheeseEl) cheeseEl.classList.add('hidden');
            spawnCheese();
        }
    }

    // --- Check collision with fatcat (precise hitbox) ---
    const mousePadding = 20;
    const fatcatPadding = 30;
    if (
        mouse.x + mousePadding < fatcat.x + 200 - fatcatPadding &&
        mouse.x + 100 - mousePadding > fatcat.x + fatcatPadding &&
        mouse.y + mousePadding < fatcat.y + 200 - fatcatPadding &&
        mouse.y + 100 - mousePadding > fatcat.y + fatcatPadding
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
    mouse.dx = e.clientX - mouse.x;
    mouse.dy = e.clientY - mouse.y;
    mouse.x = e.clientX - 50; // offset for bigger mouse
    mouse.y = e.clientY - 50;
});

// =====================
// Start & Restart with Space
// =====================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (startScreen.classList.contains('hidden') && endScreen.classList.contains('hidden')) return;
        startGame();
    }
});

// =====================
// Handle Window Resize
// =====================
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

