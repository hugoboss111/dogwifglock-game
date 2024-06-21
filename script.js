const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mainMenu = document.getElementById('mainMenu');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const pauseMenu = document.getElementById('pauseMenu');
const resumeButton = document.getElementById('resumeButton');
const quitButton = document.getElementById('quitButton');
const gameOverMenu = document.getElementById('gameOverMenu');
const quitGameOverButton = document.getElementById('quitGameOverButton');
const playAgainButton = document.getElementById('playAgainButton');
const highScoreElement = document.getElementById('highScore');
const currentScoreElement = document.getElementById('currentScore');

let isPaused = false;
let spawnEnemyInterval;
let shootInterval;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = highScore;

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
resumeButton.addEventListener('click', resumeGame);
quitButton.addEventListener('click', quitGame);
quitGameOverButton.addEventListener('click', quitGame);
playAgainButton.addEventListener('click', startGameOver);

function playGunshotSound() {
    const gunshot = new Audio('gunshot.wav');
    gunshot.volume = 0.015;
    gunshot.play();
}

function playEnemyDeathSound() {
    const deathSound = new Audio('death.wav');
    deathSound.volume = 0.65;
    deathSound.play();
}

function startGame() {
    mainMenu.style.display = 'none';
    canvas.style.display = 'block';
    pauseButton.style.display = 'block';
    gameOverMenu.style.display = 'none';
    isPaused = false;
    score = 0;
    currentScoreElement.textContent = score;
    spawnEnemyInterval = setInterval(spawnEnemy, 1000);
    shootInterval = setInterval(shoot, 167); // ~6 bullets per second (1000 ms / 6 = ~167 ms)
    requestAnimationFrame(update);
}

function pauseGame() {
    isPaused = true;
    pauseMenu.style.display = 'flex';
    pauseButton.style.display = 'none';
    clearInterval(spawnEnemyInterval);
    clearInterval(shootInterval);
}

function resumeGame() {
    isPaused = false;
    pauseMenu.style.display = 'none';
    pauseButton.style.display = 'block';
    spawnEnemyInterval = setInterval(spawnEnemy, 1000);
    shootInterval = setInterval(shoot, 167); // ~6 bullets per second (1000 ms / 6 = ~167 ms)
    requestAnimationFrame(update);
}

function quitGame() {
    isPaused = true;
    pauseMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    pauseButton.style.display = 'none';
    canvas.style.display = 'none';
    mainMenu.style.display = 'flex';
    clearInterval(spawnEnemyInterval);
    clearInterval(shootInterval);
    resetGame();
}

function startGameOver() {
    isPaused = false;
    gameOverMenu.style.display = 'none';
    mainMenu.style.display = 'none';
    canvas.style.display = 'block';
    pauseButton.style.display = 'block';
    resetGame();
    spawnEnemyInterval = setInterval(spawnEnemy, 1000);
    shootInterval = setInterval(shoot, 167); // ~6 bullets per second (1000 ms / 6 = ~167 ms)
    requestAnimationFrame(update);
}

function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 150;
    bullets.length = 0;
    enemies.length = 0;
    enemyDeathEffects.length = 0;
}

const player = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    width: 150, // Updated size
    height: 150, // Updated size
    speed: 15,
    dx: 0,
    image: new Image(),
    facingRight: true // Default facing direction
};

player.image.src = 'dogwifglock.png';

const bullets = [];
const bulletSpeed = 30; // 2x the previous speed
const enemies = [];
const enemyImages = [
    'Pepe1.png',
    'Pepe2.png',
    'Pepe3.png',
    'Pepe4.png',
    'Pepe5.png',
    'Pepe6.png'
];

const muzzleFlash = new Image();
muzzleFlash.src = 'muzzle.png';
let showMuzzleFlash = false;
let muzzleFlashTimeout;

const deathEffectImage = new Image();
deathEffectImage.src = 'death.png';
let enemyDeathEffects = [];

const background = new Image();
background.src = 'street.png';

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 40;
        this.image = new Image();
        this.image.src = 'bullet.png';
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= bulletSpeed;
    }
}

class Enemy {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.image = new Image();
        this.image.src = image;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += 2;
    }
}

class EnemyDeathEffect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.creationTime = Date.now();
        this.duration = 100; // Reduced duration of the effect in ms
    }

    draw() {
        ctx.drawImage(deathEffectImage, this.x, this.y, this.width, this.height);
    }

    isExpired() {
        return Date.now() - this.creationTime > this.duration;
    }
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 100);
    const image = enemyImages[Math.floor(Math.random() * enemyImages.length)];
    enemies.push(new Enemy(x, -100, image));
}

function update() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw rotated background separately
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(background, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
    ctx.restore();

    // Draw player and other game elements
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

    if (showMuzzleFlash) {
        ctx.save();
        if (player.facingRight) {
            ctx.translate(player.x + player.width - 20, player.y + 20); // Adjusted position for right
        } else {
            ctx.translate(player.x + 20, player.y + 20); // Adjusted position for left
        }
        ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
        ctx.drawImage(muzzleFlash, -30, -40, 80, 100); // Adjust position and size
        ctx.restore();
    }

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();

        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();

        if (enemy.y + enemy.height >= canvas.height) { // Check collision with the bottom of the screen
            gameOver();
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemyDeathEffects.push(new EnemyDeathEffect(enemy.x, enemy.y, enemy.width, enemy.height));
                playEnemyDeathSound(); // Play enemy death sound
                enemies.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score++;
                currentScoreElement.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('highScore', highScore);
                }
            }
        });
    });

    enemyDeathEffects.forEach((effect, index) => {
        effect.draw();
        if (effect.isExpired()) {
            enemyDeathEffects.splice(index, 1);
        }
    });

    movePlayer();
    requestAnimationFrame(update);
}

function gameOver() {
    isPaused = true;
    gameOverMenu.style.display = 'flex';
    pauseButton.style.display = 'none';
    clearInterval(spawnEnemyInterval);
    clearInterval(shootInterval);
}

function movePlayer() {
    player.x += player.dx;

    // Check if moving left
    if (player.dx < 0) {
        player.image.src = 'dogwifglock_left.png'; // Replace with your mirrored left-facing image
        player.facingRight = false;
    }
    // Check if moving right
    else if (player.dx > 0) {
        player.image.src = 'dogwifglock_right.png'; // Replace with your right-facing image
        player.facingRight = true;
    }

    // Prevent player from moving out of canvas
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function keyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'a' ||
        e.key === 'd'
    ) {
        player.dx = 0;
    }
}

function shoot() {
    let bulletX;
    if (player.facingRight) {
        bulletX = player.x + player.width - 90; // Adjusted position for right
    } else {
        bulletX = player.x + 90; // Adjusted position for left
    }

    bullets.push(new Bullet(bulletX, player.y + 20)); // Adjusted position
    playGunshotSound(); // Play gunshot sound
    showMuzzleFlash = true;
    clearTimeout(muzzleFlashTimeout);
    muzzleFlashTimeout = setTimeout(() => {
        showMuzzleFlash = false;
    }, 50);
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

background.onload = () => {
    // Ensure the background image is loaded before starting the game
    startButton.addEventListener('click', startGame);
};

