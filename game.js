// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const finalScoreEl = document.getElementById('final-score');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Assets
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

// Start / End screen backgrounds
document.querySelector('#start-screen .background').src = 'background_start.png';
document.querySelector('#end-screen .background').src = 'xbackground_end.png';


// Game State
let gameRunning = false;
let mouse = { x: 100, y: 100, width: 50, height: 50 };
let fatcat = { x: 400, y: 300, width: 80, height: 80 };
let cheeseArray = [];
let score = 0;

// Utility
function getRandomPosition() {
    const x = Math.random() * (canvas.width - 50);
    const y = Math.random() * (canvas.height - 50);
    return { x, y };
}

// Start Game
function startGame() {
    score = 0;
    cheeseArray = [];
    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;
    fatcat.x = Math.random() * canvas.width;
    fatcat.y = Math.random() * canvas.height;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameRunning = true;
    soundtrack.play();
    spawnCheese();
    requestAnimationFrame(gameLoop);
}

// Spawn Cheese
function spawnCheese() {
    if (!gameRunning) return;
    const pos = getRandomPosition();
    cheeseArray.push({ ...pos, width: 40, height: 40 });
    setTimeout(spawnCheese, 2000); // spawn every 2 sec
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Cheese
    cheeseArray.forEach((cheese, index) => {
        ctx.drawImage(cheeseImg, cheese.x, cheese.y, cheese.width, cheese.height);
        // Check collision with mouse
        if (
            mouse.x < cheese.x + cheese.width &&
            mouse.x + mouse.width > cheese.x &&
            mouse.y < cheese.y + cheese.height &&
            mouse.y + mouse.height > cheese.y
        ) {
            cheeseArray.splice(index, 1);
            score += 100;
            eatCheeseSound.currentTime = 0;
            eatCheeseSound.play();
        }
    });

    // Move Fatcat towards mouse
    const dx = mouse.x - fatcat.x;
    const dy = mouse.y - fatcat.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = 2;
    fatcat.x += (dx / dist) * speed;
    fatcat.y += (dy / dist) * speed;

    // Draw Fatcat
    ctx.drawImage(fatcatImg, fatcat.x, fatcat.y, fatcat.width, fatcat.height);

    // Draw Mouse
    ctx.drawImage(mouseImg, mouse.x, mouse.y, mouse.width, mouse.height);

    // Collision with fatcat
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

// End Game
function endGame() {
    gameRunning = false;
    soundtrack.pause();
    loseSound.play();
    finalScoreEl.textContent = score;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Mouse Movement
window.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;
    mouse.x = e.clientX - mouse.width/2;
    mouse.y = e.clientY - mouse.height/2;
});

// Start & Restart with Space
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (startScreen.classList.contains('hidden') && endScreen.classList.contains('hidden')) return;
        startGame();
    }
});

// Handle Window Resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
