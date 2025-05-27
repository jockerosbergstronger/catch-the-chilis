
const bag = document.getElementById('bag');
const game = document.getElementById('game-container');
const scoreBoard = document.getElementById('score');
const livesContainer = document.getElementById('lives');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');

let score = 0;
let lives = 3;
let highScore = localStorage.getItem('highScore') || 0;
let dropInterval = 2000;
let chiliSpeed = 2;
let gameRunning = false;
let chiliTimer;
let chiliStormMode = false;

function updateLives() {
  livesContainer.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const chiliLife = document.createElement('img');
    chiliLife.src = 'assets/chili-small.png';
    chiliLife.classList.add('life');
    livesContainer.appendChild(chiliLife);
  }
}

function updateScoreBoard() {
  scoreBoard.textContent = `Score: ${score} | Highscore: ${highScore}`;
}

function flashEffect(type) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '1000';
  overlay.style.pointerEvents = 'none';
  overlay.style.backgroundColor = type === 'miss' ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  game.appendChild(overlay);
  setTimeout(() => game.removeChild(overlay), 200);
}

function showTextEffect(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.position = 'absolute';
  el.style.top = '50%';
  el.style.left = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.color = 'white';
  el.style.fontSize = '48px';
  el.style.fontWeight = 'bold';
  el.style.textShadow = '2px 2px 6px black';
  el.style.zIndex = '999';
  el.style.opacity = '1';
  game.appendChild(el);

  setTimeout(() => {
    el.style.transition = 'opacity 1s';
    el.style.opacity = '0';
  }, 500);
  setTimeout(() => game.removeChild(el), 1500);
}

function spawnChili(isGhost = false) {
  if (!gameRunning) return;

  const chili = document.createElement('img');
  chili.src = 'assets/chili.png';
  chili.classList.add('chili');

  const containerWidth = game.clientWidth;
  const chiliWidth = 40;
  const buffer = 80;
  const spawnX = buffer + Math.random() * (containerWidth - 2 * buffer - chiliWidth);
  chili.style.left = `${spawnX}px`;
  chili.style.top = '0px';
  if (isGhost) chili.classList.add('trail');
  if (isGhost) chili.style.filter = 'grayscale(100%) brightness(1.8)';
  game.appendChild(chili);

  let y = 0;
  const thisSpeed = isGhost ? chiliSpeed * 1.3 : chiliSpeed;

  const fall = setInterval(() => {
    y += thisSpeed;
    chili.style.top = `${y}px`;

    const bagRect = bag.getBoundingClientRect();
    const chiliRect = chili.getBoundingClientRect();

    if (
      chiliRect.bottom >= bagRect.top &&
      chiliRect.left < bagRect.right &&
      chiliRect.right > bagRect.left
    ) {
      clearInterval(fall);
      game.removeChild(chili);
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      updateScoreBoard();
      if (score % 10 === 0) {
        flashEffect('catch');
        let text = '';
        switch(score) {
          case 10: text = 'HOT!'; break;
          case 20: text = 'SPICY!'; break;
          case 30: text = 'BLAZING!'; break;
          case 40: text = 'TOO HOT!'; break;
          case 50: text = 'CHILI STORM!'; break;
          case 60: text = 'FIRE BREATHER!'; break;
          default: text = '🔥🔥🔥'; break;
        }
        showTextEffect(text);
        showTextEffect(score === 10 ? 'HOT!' : score === 20 ? 'SPICY!' : '🔥');
      }
      if (score % 3 === 0) {
        chiliSpeed += 0.4;
        dropInterval = Math.max(400, dropInterval - 120);
      }
      if (score === 10) {
        game.style.animation = "pulse-bg 1s infinite alternate";
      }
      if (score === 20) {
        spawnChili(true);
      }
      if (score === 50 && !chiliStormMode) {
        chiliStormMode = true;
        for (let i = 0; i < 10; i++) {
          setTimeout(() => spawnChili(), i * 150);
        }
      }
    } else if (y > game.clientHeight) {
      clearInterval(fall);
      game.removeChild(chili);
      lives--;
      updateLives();
      flashEffect('miss');
      if (lives <= 0) gameOver();
    }
  }, 20);
}


function startGame() {  chiliSpeed = 2;
  dropInterval = 2000;

  if (gameRunning) return;
  gameRunning = true;
  startBtn.style.display = 'none';
  updateLives();
  score = 0;
  lives = 3;
  chiliSpeed = 2;
  dropInterval = 2000;
  chiliStormMode = false;
  game.style.animation = '';
  updateScoreBoard();

  function gameLoop() {
    if (!gameRunning) return;
    spawnChili();
    if (Math.random() < 0.08) {
      spawnChili(true); // toned down ghost chili boost
    }
    chiliTimer = setTimeout(gameLoop, dropInterval);
  }
  gameLoop();
}

function gameOver() {
  gameRunning = false;
  clearTimeout(chiliTimer);
  updateScoreBoard();
  setTimeout(() => {
    
document.getElementById('final-score').textContent = `Final Score: ${score}`;
document.getElementById('game-over-screen').style.display = 'block';
document.getElementById('game-over-restart').onclick = () => {
  window.location.reload();
};

    startBtn.style.display = 'block';
  }, 300);
}

// Correct bag centering logic
document.addEventListener('mousemove', e => {
  const containerRect = game.getBoundingClientRect();
  const mouseX = e.clientX - containerRect.left;
  const bagWidth = bag.offsetWidth;
  const maxX = containerRect.width - bagWidth;
  const clampedX = Math.min(Math.max(mouseX - bagWidth / 2, 0), maxX);
  bag.style.left = `${clampedX}px`;
});


function spawnBonusChili() {
  const bonus = document.createElement('img');
  bonus.src = 'assets/chili.png';
  bonus.classList.add('chili');
  bonus.style.filter = 'sepia(1) saturate(5) hue-rotate(60deg)'; // golden color

  const containerWidth = game.clientWidth;
  const chiliWidth = 40;
  const buffer = 80;
  const spawnX = buffer + Math.random() * (containerWidth - 2 * buffer - chiliWidth);
  bonus.style.left = `${spawnX}px`;
  bonus.style.top = '0px';
  game.appendChild(bonus);

  let y = 0;
  const fall = setInterval(() => {
    y += chiliSpeed * 0.9;
    bonus.style.top = `${y}px`;

    const bagRect = bag.getBoundingClientRect();
    const bonusRect = bonus.getBoundingClientRect();

    if (
      bonusRect.bottom >= bagRect.top &&
      bonusRect.left < bagRect.right &&
      bonusRect.right > bagRect.left
    ) {
      clearInterval(fall);
      game.removeChild(bonus);
      const bonusType = Math.random() < 0.5 ? 'score' : 'life';
      if (bonusType === 'score') {
        score += 2;
        showTextEffect('💰 DOUBLE POINTS!');
      } else {
        if (lives < 3) lives++;
        updateLives();
        showTextEffect('❤️ +1 LIFE!');
      }
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      updateScoreBoard();
    } else if (y > game.clientHeight) {
      clearInterval(fall);
      game.removeChild(bonus);
    }
  }, 20);
}

startBtn.addEventListener('click', startGame);

restartBtn.addEventListener('click', () => window.location.reload());
