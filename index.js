// properties for board
let board;
let boardWidth = 360;
let boardHeight = 640; // width and height is this because our background has this dimension
let context;

// properties for bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2; // here birdX and birdY are the position of the bird according to board
let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// properties for pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// physics behind game
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jumping speed
let gravity = 0.4;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameStarted = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); // this is canvas and used for drawing on the board

  birdImg = new Image();
  birdImg.src = "img/Birdd.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "img/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "img/bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipes, 1500); // means we want the pipes to appear every 1.5s
  document.addEventListener("keydown", moveBird);

  // Mobile tap support
  board.addEventListener("touchstart", () => {
    if (!gameStarted) gameStarted = true;
    velocityY = -6;
    if (gameOver) resetGame();
  });
};

// main function that will update our canvas and all
function update() {
  requestAnimationFrame(update);
  if (gameOver) return;

  context.clearRect(0, 0, board.width, board.height);

  // bird
  if (gameStarted) {
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
  }
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (gameStarted && bird.y > board.height) gameOver = true;

  // pipes
  if (gameStarted) {
    for (let i = 0; i < pipeArray.length; i++) {
      let pipe = pipeArray[i];
      pipe.x += velocityX;
      context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

      if (!pipe.passed && bird.x > pipe.x + pipe.width) {
        score += 0.5; // since there are 2 pipe and both are counted
        pipe.passed = true;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
      }

      if (detectCollision(bird, pipe)) gameOver = true;
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
      pipeArray.shift(); // removes first element from the array
    }
  }

  // scores
  // scores
  context.fillStyle = "white";
  context.font = "30px sans-serif";
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText(score, 5, 30);

  context.fillStyle = "white";
  context.font = "20px sans-serif";
  context.fillText("HighScore: " + highScore, 220, 30);

  // show start message
  if (!gameStarted && !gameOver) {
    context.fillStyle = "white";
    context.font = "25px sans-serif";
    context.textAlign = "left";   // default rakha
    context.textBaseline = "alphabetic";
    context.fillText("Tap / Press Key to Start", 50, board.height / 2);
  }

  // show game over + restart message
  if (gameOver) {
    context.save(); // settings ko temporarily save karo

    context.fillStyle = "white";
    context.font = "25px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("Game Over", board.width / 2, board.height / 2);

    context.font = "18px sans-serif";
    context.fillText("Tap / Press Key to Restart", board.width / 2, board.height / 2 + 30);

    context.restore(); // purane alignment wapas aa jayenge
  }

}

// function for placing the pipes
function placePipes() {
  if (gameOver || !gameStarted) return;

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

// function for moving the bird
function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    if (!gameStarted) gameStarted = true;
    velocityY = -6;
    if (gameOver) resetGame();
  }
}

// function to detect the collision : means if bird collides in pipe then game over
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetGame() {
  bird.y = birdY;
  pipeArray = [];
  score = 0;
  gameOver = false;
  gameStarted = true;
}
