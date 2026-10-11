let n = 20;

let mx    = [], my     = [];
let speed = [], size   = [];
let type  = [], startX = [];

let px, py;
let score = 0;
let gameOver = false;
let gameStarted = false;
let playerSize = 25;

let bx = [], by = [];
let bulletSize = 8;
let bulletSpeed = 8;
let shootTimer = 0;
let shootInterval = 10; 
let destroyScore = 0;

function setup() {
  createCanvas(500, 500);

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
  background(10, 10, 30);

  if (!gameStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("클릭하면 시작!", width / 2, height / 2 - 30);
    textSize(16);
    text("WASD : 이동 / Shift : 집중 회피", width / 2, height / 2 + 10);
    text("Space : 연사 / R : 재시작", width / 2, height / 2 + 40);
    return;
  }

  if (!gameOver) {

    PlayerMove();                

    let playerColor = color(100, 200, 255);
    if (keyIsPressed && keyIsDown(SHIFT)) {
      playerColor = color(255, 200, 50);
    }
    fill(playerColor);
    ellipse(px, py, playerSize, playerSize);

    for (let i = 0; i < n; i++) {
      MeteorMove(i);
    }

    Shoot();
    BulletMove();
    BulletHit();

    for (let i = 0; i < n; i++) {
      fill(150);
      ellipse(mx[i], my[i], size[i], size[i]);
      if (CheckHit(i)) {
        gameOver = true;
      }
    }

    fill(color(255, 230, 80));
    for (let i = 0; i < bx.length; i++) {
      ellipse(bx[i], by[i], bulletSize, bulletSize);
    }
    if (!gameOver) score++;

    fill(255);
    textSize(18);
    textAlign(LEFT);
    text("생존 점수 : " + score, 15, 25);
    textAlign(RIGHT);
    text("파괴 점수 : " + destroyScore, width - 15, 25);

    textAlign(CENTER);
    textSize(14);
    if (keyIsPressed && keyIsDown(SHIFT)) {
      fill(color(255, 200, 50));
      text("집중 회피 중", width / 2, height - 15);
    } else {
      text("Shift : 집중 회피 / Space : 연사", width / 2, height - 15);
    }
  }

  else {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(35);
    text("GAME OVER", width / 2, height / 2 - 80);

    fill(255);
    textSize(18);
    text("생존 점수 : " + score, width / 2, height / 2 - 35);
    text("파괴 점수 : " + destroyScore, width / 2, height / 2 - 5);

    fill(color(255, 230, 80));
    textSize(24);
    text("최종 점수 : " + (score + destroyScore), width / 2, height / 2 + 35);

    fill(255);
    textSize(18);
    text("R : Restart", width / 2, height / 2 + 85);
  }
}

function PlayerMove() {

  let s = PlayerSpeed();

  let A = 65;
  let D = 68;
  let W = 87;
  let S = 83;

  if (keyIsDown(A)) px -= s;
  if (keyIsDown(D)) px += s;
  if (keyIsDown(W)) py -= s;
  if (keyIsDown(S)) py += s;

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

    mx[i] = startX[i] + sin(frameCount * 0.05 + i) * 40;
  }

  else {
    my[i] += speed[i];

    mx[i] += random(-1.5, 1.5);
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

  if (key == ' ') return false;

  if (key == 'r' || key == 'R') {

    gameOver = false;
    score = 0;
    destroyScore = 0;
    bx = [];
    by = [];
    shootTimer = 0;

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
  if (mouseButton == LEFT && mouseX >= 0 && mouseX < width &&
      mouseY >= 0 && mouseY < height) {
    gameStarted = true;
  }
}

function Shoot() {
  if (!gameStarted || gameOver) return;

  if (shootTimer > 0) {
    shootTimer--;
  }

  if (keyIsPressed && keyIsDown(32) && shootTimer == 0) {
    bx.push(px);
    by.push(py - playerSize / 2);
    shootTimer = shootInterval;
  }
}

function BulletMove() {
  for (let i = bx.length - 1; i >= 0; i--) {
    by[i] -= bulletSpeed;

    if (by[i] < -bulletSize / 2) {
      bx.splice(i, 1);
      by.splice(i, 1);
    }
  }
}

function BulletHit() {
  for (let b = bx.length - 1; b >= 0; b--) {
    for (let i = 0; i < n; i++) {
      let d = dist(bx[b], by[b], mx[i], my[i]);

      if (d < bulletSize / 2 + size[i] / 2) {
        bx.splice(b, 1);
        by.splice(b, 1);
        destroyScore += 100;

        mx[i] = random(width);
        startX[i] = mx[i];
        my[i] = random(-500, -50);
        speed[i] = random(2, 4);
        break; 
      }
    }
  }
}
