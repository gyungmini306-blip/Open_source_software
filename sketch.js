let n = 20;

let mx    = [], my     = [];
let speed = [], size   = [];
let type  = [], startX = [];

let px, py;
let score = 0;
let gameOver = false;
let gameStarted = false;
let playerSize = 25;


let bgm, burstSound, img;

function stopGameAudio() {
  bgm.stop();
  burstSound.play();
}

async function setup() {
  bgm        = await loadSound('assets/sounds/latin.mp3');
  burstSound = await loadSound('assets/sounds/burst.mp3');
  img        = await loadImage('assets/img/space.png');
  createCanvas(500,500);

  px = width / 2;
  py = height * 0.8;

  for (let i = 0; i < n; i++) {
    mx[i] = random(width);
    my[i] = random(-500, 0);
    speed[i] = random(2, 4);
    size[i] = random(15, 30);
    type[i] = int(random(0, 3));
    startX[i] = mx[i];
  }
}

function draw() {
  background(0);
  image(img, 0, 0, width, height);

  if (!gameStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("클릭하면 시작!", width / 2, height / 2 - 30);
    textSize(16);
    text("WASD : 이동 / Shift : 느리게 ", width / 2, height / 2 + 10);
    text("R : 재시작", width / 2, height / 2 + 40);
    return;
  }

  if (!gameOver) {
    PlayerMove();                
    let playerColor = color(100, 200, 255);
    if (keyIsDown(SHIFT)) 
      playerColor = color(255, 200, 50);
    fill(playerColor);
    ellipse(px, py, playerSize, playerSize);
    
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

    if (gameOver == false) {
      score++;
    }

    fill(255);
    textSize(18);
    textAlign(LEFT);
    text("점수 : " + score, 15, 25);

    textAlign(CENTER);
    textSize(14);
    if (keyIsDown(SHIFT)) {
      fill(color(255, 200, 50));
    } else {
      text("Shift : 느리게", width / 2, height - 15);
    }
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
    text("R : Restart", width / 2, height / 2 + 85);
  }
}

function PlayerMove() {

  let s = PlayerSpeed();

  if (keyIsDown('KeyA')) px -= s;
  if (keyIsDown('KeyD')) px += s;
  if (keyIsDown('KeyW')) py -= s;
  if (keyIsDown('KeyS')) py += s;

  if (px < playerSize / 2)
    px = playerSize / 2;
  if (px > width - playerSize / 2)
    px = width - playerSize / 2;
  if (py < playerSize / 2)
    py = playerSize / 2;
  if (py > height - playerSize / 2)
    py = height - playerSize / 2;
}

function MeteorMove(i) {

  if (type[i] == 0) {
    speed[i] += 0.1;
    my[i] += speed[i];
  }

  else if (type[i] == 1) {
    my[i] += speed[i];
    mx[i] = startX[i] + sin(frameCount * 0.05 + i) * 100;
  }

  else {
    my[i] += speed[i];
    mx[i] += random(-3,3);
  }

  if (my[i] > height + 30) {
    mx[i] = random(width);
    my[i] = random(-150, 0);
    startX[i] = mx[i];

    speed[i] = random(2, 4);
  }
}

function PlayerSpeed() {
  if (keyIsPressed && keyIsDown(SHIFT))
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

    px = width / 2;
    py = height * 0.8;

    for (let i = 0; i < n; i++) {
      mx[i] = random(width);
      startX[i] = mx[i];

      my[i] = random(-500, 0);
      speed[i] = random(2, 4);
    }
  }
}

function mousePressed() { 
  if (mouseButton.left == true && gameStarted == false) {
    gameStarted = true;
    bgm.play();
  }
}