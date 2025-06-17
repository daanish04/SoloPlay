// Game constants
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const paddleW = 12,
  paddleH = 88;
const ballSize = 18;
const minBallSpeed = 3.2,
  maxBallSpeed = 7.2;
const aiMistakeChance = 0.18; // More chance for AI to blunder
const winScore = 10;

// Game state
let running = false,
  paused = false,
  winner = "";
let playerScore = 0,
  aiScore = 0;

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
  // Start ball at random angle toward the scoring player
  let angle = (Math.random() * Math.PI) / 3 - Math.PI / 6; // [-30deg, 30deg]
  ballSpeed =
    minBallSpeed + Math.random() * (maxBallSpeed - minBallSpeed) * 0.7;
  ballVX = direction * ballSpeed * Math.cos(angle);
  ballVY = ballSpeed * Math.sin(angle);
  // Update AI paddle speed to always be a tad slower than current ball speed
  aiPaddleSpeed = Math.max(minBallSpeed * 0.9, ballSpeed * 0.86);
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

  // AI paddle move with mistake chance
  let aiCenter = aiY + paddleH / 2;
  let targetY = ballY + ballSize / 2;
  let mistake =
    Math.random() < aiMistakeChance &&
    ((ballVX > 0 && ballX > canvas.width / 2) || aiScore < playerScore);
  // AI paddle is always slower than the ball
  let maxAIMove = aiPaddleSpeed;
  if (!mistake) {
    if (aiCenter < targetY - 10) aiY += maxAIMove;
    else if (aiCenter > targetY + 10) aiY -= maxAIMove;
  } else {
    // AI purposely moves wrong direction
    if (aiCenter < targetY) aiY -= maxAIMove * 0.6;
    else aiY += maxAIMove * 0.6;
  }
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
    aiPaddleSpeed = Math.max(minBallSpeed * 0.9, ballSpeed * 0.86);
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
    aiPaddleSpeed = Math.max(minBallSpeed * 0.9, ballSpeed * 0.86);
  }

  // Score check
  if (ballX < 0) {
    aiScore++;
    updateScore();
    if (aiScore >= winScore) {
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
    if (playerScore >= winScore) {
      winner = "Player Wins!";
      running = false;
      document.getElementById("winner").textContent = winner;
    } else {
      resetBall(1);
    }
  }
}

function updateScore() {
  document.getElementById(
    "score"
  ).textContent = `Player: ${playerScore}  |  AI: ${aiScore}`;
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
document.getElementById("startBtn").onclick = function () {
  if (!running) {
    running = true;
    paused = false;
    if (winner) resetGame();
  } else {
    paused = false;
  }
};
document.getElementById("pauseBtn").onclick = function () {
  paused = true;
};
document.getElementById("restartBtn").onclick = function () {
  running = true;
  paused = false;
  winner = "";
  resetGame();
  draw();
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
resetGame();
draw();
gameLoop();
