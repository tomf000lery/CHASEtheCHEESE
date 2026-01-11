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
// Entities (GIFs controlled via JS)
// =====================
let mouseEl, fatcatEl, cheeseEl;

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
// Spawn Cheese
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

        // Corrected flip: now right = look right
        if (mouse.x > mouse.prevX) {
            mouseEl.style.transform = 'scaleX(1)'; // moving right
        } else {
            mouseEl.style.transform = 'scaleX(-1)'; // moving left
        }
        mouse.prevX = mouse.x;
    }

    // --- Move Fatcat towards mouse ---
    let dx = mouse.x - fatcat.x;
    let dy = mouse.y - fatcat.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let speed = 2 + score/500;
    fatcat.x += (dx/dist)*speed;
    fatcat.y += (dy/dist)*speed;

    if (fatcatEl) {
        fatcatEl.style.left = fatcat.x + "px";
        fatcatEl.style.top = fatcat.y + "px";
        fatcatEl.style.transform = dx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
    }

    // --- Cheese collision ---
    if (cheese.active) {
        const mp = 20, cp = 10;
        if (
            mouse.x+mp < cheese.x+100-cp &&
            mouse.x+100-mp > cheese.x+cp &&
            mouse.y+mp < cheese.y+100-cp &&
            mouse.y+100-mp > cheese.y+cp
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

    // --- Fatcat collision ---
    const mp = 20, fp = 30;
    if (
        mouse.x+mp < fatcat.x+200-fp &&
        mouse.x+100-mp > fatcat.x+fp &&
        mouse.y+mp < fatcat.y+200-fp &&
        mouse.y+100-mp > fatcat.y+fp
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
window.addEventListener('mousemove', (e)=>{
    if (!gameRunning) return;
    mouse.dx = e.clientX - mouse.x;
    mouse.dy = e.clientY - mouse.y;
    mouse.x = e.clientX - 50;
    mouse.y = e.clientY - 50;
});

// =====================
// Start / Restart
// =====================
window.addEventListener('keydown',(e)=>{
    if (e.code==='Space'){
        if(startScreen.classList.contains('hidden') && endScreen.classList.contains('hidden')) return;
        startGame();
    }
});

// =====================
// Resize
// =====================
window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

