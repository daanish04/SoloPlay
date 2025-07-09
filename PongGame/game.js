// Game constants
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const paddleW = 12,
  paddleH = 88;
const ballSize = 18;
const minBallSpeed = 3.2,
  maxBallSpeed = 7.2;
// Game settings (defaults)
let gameSettings = {
  difficulty: "medium",
  pointsToWin: 10,
  theme: "current",
};

// AI settings: only paddle speed changes with difficulty
const aiSettings = {
  easy: {
    paddleSpeedFactor: 0.4,
  },
  medium: {
    paddleSpeedFactor: 0.45,
  },
  hard: {
    paddleSpeedFactor: 0.5,
  },
};

function applyThemeFromSelect() {
  const theme = document.getElementById("theme").value;
  document.body.classList.remove("theme-neon", "theme-dark", "theme-classic");
  canvas.classList.remove("theme-neon", "theme-dark", "theme-classic");
  if (theme === "neon") {
    document.body.classList.add("theme-neon");
    canvas.classList.add("theme-neon");
  } else if (theme === "dark") {
    document.body.classList.add("theme-dark");
    canvas.classList.add("theme-dark");
  } else {
    document.body.classList.add("theme-classic");
    canvas.classList.add("theme-classic");
  }
}
window.applyThemeFromSelect = applyThemeFromSelect;

function applySettingsFromUI() {
  const diff = document.getElementById("difficulty").value;
  const pts = parseInt(document.getElementById("pointsToWin").value, 10);
  const theme = document.getElementById("theme").value;
  gameSettings.difficulty = diff;
  gameSettings.pointsToWin = pts;
  gameSettings.theme = theme;
  applyThemeFromSelect();
}

// Game state
let running = false,
  paused = false,
  winner = "";
let playerScore = 0,
  aiScore = 0;

function setButtonStates() {
  const startBtn = document.getElementById("startBtn");
  const startBtnText = document.getElementById("startBtnText");
  const pauseBtn = document.getElementById("pauseBtn");
  const pauseIcon = document.getElementById("pauseIcon");

  if (!running) {
    startBtnText.textContent = "Start";
    startBtn.querySelector("i").className = "fa-solid fa-play";
    pauseBtn.disabled = true;
    pauseIcon.className = "fa-solid fa-pause";
    document.getElementById("winner").textContent = "";
  } else if (paused) {
    startBtnText.textContent = "Resume";
    startBtn.querySelector("i").className = "fa-solid fa-play";
    pauseBtn.disabled = true;
    pauseIcon.className = "fa-solid fa-pause";
    document.getElementById("winner").textContent = "PAUSED";
  } else {
    startBtnText.textContent = "Start";
    startBtn.querySelector("i").className = "fa-solid fa-play";
    pauseBtn.disabled = false;
    pauseIcon.className = "fa-solid fa-pause";
    document.getElementById("winner").textContent = "";
  }
}

// Paddles
let playerY = (canvas.height - paddleH) / 2;
let aiY = (canvas.height - paddleH) / 2;
let aiPaddleSpeed = minBallSpeed * 0.91; // will be updated dynamically (always < ball speed)
const playerPaddleSpeed = 8;

// Ball
let ballX, ballY, ballVX, ballVY, ballSpeed;

// Input
let upPressed = false,
  downPressed = false;

function resetBall(direction = 1) {
  ballX = canvas.width / 2 - ballSize / 2;
  ballY = canvas.height / 2 - ballSize / 2;
  let angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
  ballSpeed =
    minBallSpeed + Math.random() * (maxBallSpeed - minBallSpeed) * 0.7;
  ballVX = direction * ballSpeed * Math.cos(angle);
  ballVY = ballSpeed * Math.sin(angle);
  // AI paddle speed relative to average ball speed
  const avgBallSpeed = (minBallSpeed + maxBallSpeed) / 2;
  aiPaddleSpeed =
    avgBallSpeed * aiSettings[gameSettings.difficulty].paddleSpeedFactor;
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  winner = "";
  updateScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  playerY = (canvas.height - paddleH) / 2;
  aiY = (canvas.height - paddleH) / 2;
}

function drawPaddle(x, y) {
  // Modern paddle with slight glow
  ctx.save();
  ctx.shadowColor = "#30cfd0";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#30cfd0";
  ctx.fillRect(x, y, paddleW, paddleH);
  ctx.restore();
}

function drawBall(x, y) {
  // Modern rounded ball with ambient glow
  ctx.save();
  ctx.shadowColor = "#f9d923";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(x + ballSize / 2, y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#f9d923";
  ctx.fill();
  ctx.restore();
}

function drawNet() {
  // Ambient glowing net
  ctx.save();
  ctx.strokeStyle = "#ffffff33";
  ctx.shadowColor = "#f9d92333";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 3;
  for (let y = 0; y < canvas.height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2, y + 16);
    ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Net
  drawNet();

  // Draw paddles
  drawPaddle(18, playerY);
  drawPaddle(canvas.width - 18 - paddleW, aiY);

  // Draw ball
  drawBall(ballX, ballY);
}

function update() {
  // Player paddle move
  if (upPressed) playerY -= playerPaddleSpeed;
  if (downPressed) playerY += playerPaddleSpeed;
  playerY = Math.max(0, Math.min(canvas.height - paddleH, playerY));

  // AI paddle move: only paddle speed changes with difficulty
  let aiCenter = aiY + paddleH / 2;
  let targetY = ballY + ballSize / 2;
  let maxAIMove = aiPaddleSpeed;
  if (aiCenter < targetY - 10) aiY += maxAIMove;
  else if (aiCenter > targetY + 10) aiY -= maxAIMove;
  aiY = Math.max(0, Math.min(canvas.height - paddleH, aiY));

  // Ball move
  ballX += ballVX;
  ballY += ballVY;

  // Top/bottom collision
  if (ballY < 0) {
    ballY = 0;
    ballVY = -ballVY;
  }
  if (ballY + ballSize > canvas.height) {
    ballY = canvas.height - ballSize;
    ballVY = -ballVY;
  }

  // Player paddle collision
  if (
    ballX <= 18 + paddleW &&
    ballY + ballSize >= playerY &&
    ballY <= playerY + paddleH
  ) {
    ballX = 18 + paddleW;
    // Calculate hit position for "spin" effect
    let rel = (ballY + ballSize / 2 - (playerY + paddleH / 2)) / (paddleH / 2);
    let angle = (rel * Math.PI) / 3.2; // more spin
    ballSpeed = Math.min(
      maxBallSpeed,
      Math.max(minBallSpeed, Math.abs(ballVX) * 1.09)
    );
    ballVX = ballSpeed * Math.cos(angle);
    ballVY = ballSpeed * Math.sin(angle);
  }

  // AI paddle collision
  if (
    ballX + ballSize >= canvas.width - 18 - paddleW &&
    ballY + ballSize >= aiY &&
    ballY <= aiY + paddleH
  ) {
    ballX = canvas.width - 18 - paddleW - ballSize;
    let rel = (ballY + ballSize / 2 - (aiY + paddleH / 2)) / (paddleH / 2);
    let angle = (rel * Math.PI) / 3.2;
    ballSpeed = Math.min(
      maxBallSpeed,
      Math.max(minBallSpeed, Math.abs(ballVX) * 1.09)
    );
    ballVX = -ballSpeed * Math.cos(angle);
    ballVY = ballSpeed * Math.sin(angle);
  }

  // Score check
  if (ballX < 0) {
    aiScore++;
    updateScore();
    if (aiScore >= gameSettings.pointsToWin) {
      winner = "AI Wins!";
      running = false;
      document.getElementById("winner").textContent = winner;
    } else {
      resetBall(-1);
    }
  }
  if (ballX > canvas.width - ballSize) {
    playerScore++;
    updateScore();
    if (playerScore >= gameSettings.pointsToWin) {
      winner = "Player Wins!";
      running = false;
      document.getElementById("winner").textContent = winner;
    } else {
      resetBall(1);
    }
  }
}

function updateScore() {
  document.getElementById("score-player").textContent = playerScore;
  document.getElementById("score-ai").textContent = aiScore;
  document.getElementById("winner").textContent = "";
}

function gameLoop() {
  if (running && !paused) {
    update();
    draw();
  }
  requestAnimationFrame(gameLoop);
}

// Controls
function handleStart() {
  if (!running || paused) {
    applySettingsFromUI();
    running = true;
    paused = false;
    if (winner) {
      resetGame();
    } else if (ballVX === 0 && ballVY === 0) {
      // Ball was reset to center, give it velocity
      resetBall(Math.random() > 0.5 ? 1 : -1);
    }
    setButtonStates();
  }
}
function handlePause() {
  if (running && !paused) {
    paused = true;
    setButtonStates();
  }
}
function handleRestart() {
  // Only reset the board, do not start the game
  resetGame();
  // Reset ball to center
  ballX = canvas.width / 2 - ballSize / 2;
  ballY = canvas.height / 2 - ballSize / 2;
  ballVX = 0;
  ballVY = 0;
  running = false;
  paused = false;
  setButtonStates();
  draw(); // Redraw immediately to show ball in center
}
document.getElementById("startBtn").onclick = function () {
  handleStart();
};
document.getElementById("pauseBtn").onclick = function () {
  handlePause();
};
document.getElementById("restartBtn").onclick = function () {
  handleRestart();
};

// Keyboard
window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowUp") upPressed = true;
  if (e.key === "ArrowDown") downPressed = true;
});
window.addEventListener("keyup", function (e) {
  if (e.key === "ArrowUp") upPressed = false;
  if (e.key === "ArrowDown") downPressed = false;
});

// Init
applySettingsFromUI();
updateScore();
resetGame();
setButtonStates();
draw();
gameLoop();
