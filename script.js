const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const startButton = document.getElementById("startButton");
const splashScreen = document.getElementById("splashScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const resetButton = document.getElementById("resetButton");
const gameOverText = document.getElementById("gameOverText");
const highScoreText = document.getElementById("highScoreText");
const newRecordText = document.getElementById("newRecordText");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let score = 0;
let highScore = 0;
let gameRunning = false;

let charImage = new Image();
let bulletImage = new Image();
let backgroundImage = new Image();
let charFlipped = false;

charImage.src = "marioLadoEsquerdo.png";
bulletImage.src = "bala.png";
backgroundImage.src = "cenario.png";

let charWidth = 80;
let charHeight = 100;
let charX = canvasWidth / 2 - charWidth / 2;
let charY = canvasHeight - charHeight - 130;
let charSpeed = 5;

let bulletWidth = 50;
let bulletHeight = 50;
let bulletX = Math.random() * (canvasWidth - bulletWidth);
let bulletY = -bulletHeight;
let bulletSpeed = 4;
let bulletY2 = null; // segunda bala
let bulletX2 = null;
let nextBulletReady = false;

let keys = {};
let collisionDetected = false;

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

startButton.addEventListener("click", () => {
    splashScreen.style.display = "none";
    startGame();
});

resetButton.addEventListener("click", () => {
    resetGame();
});

function resetGame() {
    gameOverScreen.style.display = "none";
    charX = canvasWidth / 2 - charWidth / 2;
    bulletX = Math.random() * (canvasWidth - bulletWidth);
    bulletY = -bulletHeight;
    bulletSpeed = 3;
    score = 0;
    gameRunning = true;
    collisionDetected = false;
    requestAnimationFrame(update);
}

function startGame() {
    gameRunning = true;
    resetGame();
}

function update() {
    if (!gameRunning) return;

    if (keys["ArrowLeft"]) {
        charX -= charSpeed;
        charFlipped = false;
    }
    if (keys["ArrowRight"]) {
        charX += charSpeed;
        charFlipped = true;
    }

    // Limites da tela
    if (charX < 0) charX = 0;
    if (charX + charWidth > canvasWidth) charX = canvasWidth - charWidth;

    bulletY += bulletSpeed;

    // Se bala sair da tela
    if (!nextBulletReady && bulletY > canvasHeight / 2) {
        // Começa a criar a segunda bala
        bulletX2 = Math.random() * (canvasWidth - bulletWidth);
        bulletY2 = -bulletHeight;
        nextBulletReady = true;
    }
    
    if (bulletY > canvasHeight) {
        score++;
        bulletSpeed = 3 + Math.floor(score / 5) * 0.6;
        bulletX = bulletX2;
        bulletY = bulletY2;
        bulletX2 = null;
        bulletY2 = null;
        nextBulletReady = false;
    }
    draw();
    checkCollision();

    if (!collisionDetected) {
        requestAnimationFrame(update);
    } else {
        gameOver();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // Score com fundo
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(5, 5, 140, 40);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(5, 5, 140, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial Black";
    ctx.fillText("Score: " + score, 15, 32);

    // Desenhar personagem (com flip)
    ctx.save();
    if (charFlipped) {
        ctx.translate(charX + charWidth / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(charImage, -charWidth / 2, charY, charWidth, charHeight);
    } else {
        ctx.drawImage(charImage, charX, charY, charWidth, charHeight);
    }
    ctx.restore();

    // Rotação da bala
    ctx.save();
    ctx.translate(bulletX + bulletWidth / 2, bulletY + bulletHeight / 2);
    ctx.rotate((bulletY / 20) % (2 * Math.PI));
    ctx.drawImage(bulletImage, -bulletWidth / 2, -bulletHeight / 2, bulletWidth, bulletHeight);
    ctx.restore();

    // Desenhar segunda bala (se existir)
    if (nextBulletReady && bulletY2 !== null) {
        bulletY2 += bulletSpeed;
        ctx.save();
        ctx.translate(bulletX2 + bulletWidth / 2, bulletY2 + bulletHeight / 2);
        ctx.rotate((bulletY2 / 20) % (2 * Math.PI));
        ctx.drawImage(bulletImage, -bulletWidth / 2, -bulletHeight / 2, bulletWidth, bulletHeight);
        ctx.restore();
    }

}

function checkCollision() {
    // Verifica pixel a pixel apenas na área do personagem
    let charImageData = ctx.getImageData(charX, charY, charWidth, charHeight).data;
    let bulletImageData = ctx.getImageData(bulletX, bulletY, bulletWidth, bulletHeight).data;

    for (let y = 0; y < bulletHeight; y++) {
        for (let x = 0; x < bulletWidth; x++) {
            let bulletIndex = (y * bulletWidth + x) * 4;
            let bulletAlpha = bulletImageData[bulletIndex + 3];
            if (bulletAlpha > 0) {
                let canvasX = bulletX + x - charX;
                let canvasY = bulletY + y - charY;
                if (canvasX >= 0 && canvasX < charWidth && canvasY >= 0 && canvasY < charHeight) {
                    let charIndex = (Math.floor(canvasY) * charWidth + Math.floor(canvasX)) * 4;
                    let charAlpha = charImageData[charIndex + 3];
                    if (charAlpha > 0) {
                        collisionDetected = true;
                        return;
                    }
                }
            }
        }
    }
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = "flex";

    if (score > highScore) {
        highScore = score;
        newRecordText.style.display = "block";
    } else {
        newRecordText.style.display = "none";
    }

    highScoreText.textContent = "High Score: " + highScore;
}

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

if (leftBtn && rightBtn) {
    leftBtn.addEventListener("touchstart", () => keys["ArrowLeft"] = true);
    leftBtn.addEventListener("touchend", () => keys["ArrowLeft"] = false);
    rightBtn.addEventListener("touchstart", () => keys["ArrowRight"] = true);
    rightBtn.addEventListener("touchend", () => keys["ArrowRight"] = false);
}
