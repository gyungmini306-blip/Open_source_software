let n = 12;

let mx    = [], my     = [];
let speed = [], size   = [];
let type  = [], startX = [];

let px, py;
let score = 0;
let gameOver = false;
let gameStarted = false;
let playerSize = 25; 
let playerImgs = [];
let direction = 2;
let count = 0;

let starX, starY;
let starSize = 24;
let starPoint = 1000;

let bgm, burstSound, bakcgroundimg;

function stopGameAudio() {
  bgm.stop();
  burstSound.play();
}

async function setup() {
  bgm           = await loadSound('assets/sounds/latin.mp3');
  burstSound    = await loadSound('assets/sounds/burst.mp3');
  bakcgroundimg = await loadImage('assets/img/space.png');

  playerImgs[0] = await loadImage('assets/img/player-left.png');
  playerImgs[1] = await loadImage('assets/img/player-right.png');
  playerImgs[2] = await loadImage('assets/img/player-up.png');
  playerImgs[3] = await loadImage('assets/img/player-down.png');

  createCanvas(500,500);
  
  px = width / 2;
  py = height * 0.8;
  ResetStar();

  for (let i = 0; i < n; i++) {
    mx[i] = random(width);
    my[i] = random(-500, 0);
    speed[i] = random(1, 2);
    size[i] = random(15, 30);
    type[i] = int(random(0, 3));
    startX[i] = mx[i];
  }
}

function draw() {
  background(0);
  image(bakcgroundimg, 0, 0, width, height);

  if (!gameStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("클릭하면 시작!", width / 2, height / 2 - 30);
    textSize(16);
    text("방향키 : 이동 / Shift : 느리게 ", width / 2, height / 2 + 10);
    text("R : 재시작", width / 2, height / 2 + 40);
    text("노란 별 획득 : +" + starPoint + "점", width / 2, height / 2 + 70);
    return;
  }

  if (!gameOver) {
    PlayerMove(); count++;

    image(playerImgs[direction], px - 25, py - 25, 50, 50);
    
    for (let i = 0; i < n; i++) 
      MeteorMove(i);

    for (let i = 0; i < n; i++) {
      fill(150);
      ellipse(mx[i], my[i], size[i], size[i]);
      if (!gameOver && CheckHit(i)) {
        gameOver = true;
        stopGameAudio();
      }
    }

    if (!gameOver) {
      StarProcess();
      score++;
    }

    fill(255);
    textSize(18);
    textAlign(LEFT);
    text("점수 : " + score, 15, 25);

    textAlign(CENTER);
    textSize(14);
    if   (keyIsDown(SHIFT)) fill(color(255, 200, 50));
    else text("Shift : 느리게", width / 2, height - 15);
  }

  else {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(35);
    text("GAME OVER", width / 2, height / 2 - 80);
    fill(color(255, 230, 80));
    textSize(24);
    text("최종 점수 : " + score, width / 2, height / 2 );

    fill(255);
    textSize(18);
    text("R : 다시하기", width / 2, height / 2 + 85);
  }
}

function StarProcess() {

  fill(255, 230, 80);
  ellipse(starX, starY, starSize, starSize);

  let d = dist(px, py, starX, starY);
  if (d < playerSize / 2 + starSize / 2) {
    score += starPoint;
    ResetStar();
  }
}

function ResetStar() {
  starX = random(width);
  starY = random(height);
}

function PlayerMove() {
  let s = PlayerSpeed();

  if (keyIsDown(LEFT_ARROW)) {
    px -= s;
    direction = 0;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    px += s;
    direction = 1;
  }
  if (keyIsDown(UP_ARROW)) {
    py -= s;
    direction = 2;
  }
  if (keyIsDown(DOWN_ARROW)) {
    py += s;
    direction = 3;
  }

  px = constrain(px, playerSize / 2, width - playerSize / 2);
  py = constrain(py, playerSize / 2, height - playerSize / 2);
}

function MeteorMove(i) {

  if (type[i] == 0) {
    speed[i] += 0.1;
    if (speed[i] > 5) speed[i] = 5;
    my[i] += speed[i];
  }

  else if (type[i] == 1) {
    my[i] += speed[i];
    mx[i] = startX[i] + sin(count * 0.05 + i) * 100;
  }

  else {
    my[i] += speed[i];
    mx[i] += (noise(count * 0.01 + i * 10) - 0.5) * 6;
  }

  if (my[i] > height + 30) {
    mx[i] = random(width);
    my[i] = random(-150, 0);
    startX[i] = mx[i];

    speed[i] = random(1, 2);
  }
}

function PlayerSpeed() {
  if (keyIsDown(SHIFT))
    return 2;
  return 4;
}

function CheckHit(i) {

  let d = dist(px, py, mx[i], my[i]);

  if (d < playerSize / 2 + size[i] / 2)
    return true;
  return false;
}

function keyPressed() {
  if (key == 'r' || key == 'R') {
    burstSound.stop();
    bgm.stop();

    gameOver = false;

    if (gameStarted == true) {
      bgm.play();
    }

    score = 0;
    count = 0;
    direction = 2;
    
    px = width / 2;
    py = height * 0.8;

  ResetStar();

    for (let i = 0; i < n; i++) {
      mx[i] = random(width);
      startX[i] = mx[i];

      my[i] = random(-500, 0);
      speed[i] = random(1, 2);
    }
  }
}

function mousePressed() { 
  if (mouseButton.left && gameStarted == false) {
    gameStarted = true;
    bgm.play();
  }
}