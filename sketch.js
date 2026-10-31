// 주제명: 우주선 운석 피하기
// 주제설명: 운석을 피하며 별을 먹어 1,000점과 탄약 3발을 얻고, 가까운 운석을 자동으로 조준해 발사하는 게임
// 점수가 10,000점, 15,000점, 20,000점에 도달하면 난이도가 올라가고 운석의 낙하 속도가 빨라진다.
// 학번: 2023111663
// 이름: 박경민

let n = 12;
let c;

let mx = [], my = [];
let speed = [], size = [];
let type = [], startX = [];

let px, py;
let score = 0;
let stage = 1;
let meteorRate = 1;
let gameOver = false;
let gameStarted = false;
let buttonX = 130, buttonY = 185;
let buttonWidth = 240, buttonHeight = 48;
let playerSize = 25;
let playerImgs = [];
let direction = 2;
let count = 0;
let bullets = [], ammo = 0, ammoPerStar = 3;
let shootTime = 0;
let meteorPoint = 100;
let hitX, hitY, hitSize, hitTime = 0;

let starX, starY;
let starSize = 24;
let starPoint = 1000;
let starTime = 0, setTime = 4;

let bgm, burstSound;
let cosmosImg, bgY1, bgY2;

function stopGameAudio() {
  bgm.stop();
  burstSound.play();
}

async function setup() {
  bgm = await loadSound('assets/sounds/latin.mp3');
  burstSound = await loadSound('assets/sounds/burst.mp3');
  cosmosImg = await loadImage('assets/img/cosmos.jpg');

  playerImgs[0] = await loadImage('assets/img/rocket0.png');
  playerImgs[1] = await loadImage('assets/img/rocket1.png');
  playerImgs[2] = await loadImage('assets/img/rocket2.png');
  playerImgs[3] = await loadImage('assets/img/rocket3.png');

  createCanvas(500, 500);
  bgY1 = 0;
  bgY2 = -height;

  px = width / 2;
  py = height * 0.8;
  ResetStar();

  for (let i = 0; i < n; i++) {
    mx[i] = random(width);
    my[i] = random(-500, 0);
    speed[i] = random(0.5, 1);
    size[i] = random(15, 30);

    let r = random(0, 3);
    if      (r < 1) type[i] = 0;
    else if (r < 2) type[i] = 1;
    else            type[i] = 2;

    startX[i] = mx[i];
  }
}

function draw() {
  background(0);

  if (!gameStarted) {
    noStroke();
    fill(25);
    rect(50, 180, 400, 190);

    stroke(100);
    line(80, 240, 420, 240);
    noStroke();
    fill(45);
    rect(buttonX, buttonY, buttonWidth, buttonHeight);
    fill(255);
    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
      fill(255, 230, 80);
      rect(buttonX, buttonY, buttonWidth, buttonHeight);
      fill(0);
    }
    textAlign(CENTER);
    textSize(24);
    text("클릭하면 시작!", width / 2, height / 2 - 30);
    fill(255);
    textSize(16);
    text("방향키 : 이동 / Shift : 느리게 ", width / 2, height / 2 + 10);
    text("가까운 운석 자동 발사 / R : 재시작", width / 2, height / 2 + 40);
    text("별 : +" + starPoint + "점 / 탄약 +" + ammoPerStar, width / 2, height / 2 + 70);
    text("별은 " + setTime + "초마다 다른 위치에 생성", width / 2, height / 2 + 100);
  } else if (!gameOver) {
    BackgroundProcess();
    PlayerMove();
    count++;

    imageMode(CENTER);
    image(playerImgs[direction], px, py, playerSize, playerSize);

    for (let i = 0; i < n; i++)
      MeteorMove(i);

    AutoShoot();
    BulletProcess();

    for (let i = 0; i < n; i++) {
      if (type[i] == 0)      c = color(180, 180, 180);
      else if (type[i] == 1) c = color(140, 170, 200);
      else                   c = color(190, 155, 130);

      fill(c);
      ellipse(mx[i], my[i], size[i], size[i]);

      if (!gameOver && CheckHit(i)) {
        gameOver = true;
        stopGameAudio();
      }
    }

    if (!gameOver) {
      StarProcess();
      score++;
      StageChange();
    }

    fill(255);
    textSize(18);
    textAlign(LEFT);
    text("점수 : " + score + " / 단계 : " + stage, 15, 25);
    fill(100, 220, 255);
    text("탄약 : " + ammo + " / 자동 발사", 15, 50);

    fill(255);
    textAlign(CENTER);
    textSize(14);
    text("Shift : 느리게", width / 2, height - 15);
  }
  else {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(35);
    text("GAME OVER", width / 2, height / 2 - 80);

    fill(255, 230, 80);
    textSize(24);
    text("최종 점수 : " + score, width / 2, height / 2);

    fill(255);
    textSize(18);
    text("R : 다시하기", width / 2, height / 2 + 85);
  }
}

function BackgroundProcess() {
  imageMode(CORNER);
  image(cosmosImg, 0, bgY1, width, height);
  image(cosmosImg, 0, bgY2, width, height);

  bgY1 += 1;
  bgY2 += 1;
  if (bgY1 >= height) bgY1 = bgY2 - height;
  if (bgY2 >= height) bgY2 = bgY1 - height;
}

function StageChange() {
  if (score < 10000)      stage = 1;
  else if (score < 15000) stage = 2;
  else if (score < 20000) stage = 3;
  else                    stage = 4;

  meteorRate = 1 + (stage - 1) * 0.2;
}

function StarProcess() {
  starTime += 1 / 60;
  if (starTime >= setTime) ResetStar();

  let pos = map(starTime, 0, setTime, PI * 2, 0);

  noFill();
  stroke(255, 230, 80);
  arc(starX, starY, starSize + 16, starSize + 16,
      0, pos);

  noStroke();
  fill(255, 230, 80);
  beginShape();
  vertex(starX, starY - starSize / 2);
  vertex(starX + starSize / 2, starY);
  vertex(starX, starY + starSize / 2);
  vertex(starX - starSize / 2, starY);
  endShape(CLOSE);

  let d = dist(px, py, starX, starY);
  if (d < playerSize / 2 + starSize / 2) {
    score += starPoint;
    ammo += ammoPerStar;
    ResetStar();
  }
}

function ResetStar() {
  starTime = 0;

  starX = random(100,width-100);
  starY = random(100,height-100);
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
  switch (type[i]) {
    case 0:
      speed[i] += 0.1;
      if (speed[i] > 3) speed[i] = 3;
      my[i] += speed[i] * meteorRate;
      break;

    case 1:
      my[i] += speed[i] * meteorRate;
      mx[i] = startX[i] + sin(count * 0.05 + i) * 50;
      break;

    case 2:
      my[i] += speed[i] * meteorRate;
      let moveX = noise(count * 0.01 + i * 10);
      mx[i] += moveX * 6 - 3;
      break;
  }

  if (my[i] > height + 30) ResetMeteor(i);
}

function ResetMeteor(i) {
  mx[i] = random(width);
  my[i] = random(-150, 0);
  startX[i] = mx[i];
  speed[i] = random(1, 2);
}

function AutoShoot() {
  shootTime += 1 / 60;
  if (ammo > 0 && shootTime >= 0.5) {
    let target = -1;
    let distance = width + height;
    for (let i = 0; i < n; i++) {
      if (mx[i] >= 0 && mx[i] <= width && my[i] >= 0 && my[i] <= height) {
        let d = dist(px, py, mx[i], my[i]);
        if (d > 0 && d < distance) {
          distance = d;
          target = i;
        }
      }
    }

    if (target >= 0) {
      let dx = (mx[target] - px) / distance;
      let dy = (my[target] - py) / distance;
      let bullet = { x: px, y: py, size: 8, speedX: dx * 8, speedY: dy * 8 };
      bullets.push(bullet);
      ammo--;
      shootTime = 0;
    }
  }
}

function BulletProcess() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].speedX;
    bullets[i].y += bullets[i].speedY;

    noStroke();
    fill(100, 220, 255);
    ellipse(bullets[i].x, bullets[i].y, bullets[i].size, bullets[i].size);

    if (bullets[i].x < 0 || bullets[i].x > width ||
        bullets[i].y < 0 || bullets[i].y > height) {
      bullets.splice(i, 1);
    } else {
      for (let j = n - 1; j >= 0; j--) {
        let d = dist(bullets[i].x, bullets[i].y, mx[j], my[j]);
        if (d < (bullets[i].size + size[j]) / 2) {
          hitX = mx[j];
          hitY = my[j];
          hitSize = size[j] * 2;
          hitTime = 0.15;
          burstSound.play();
          score += meteorPoint;
          ResetMeteor(j);
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  if (hitTime > 0) {
    noStroke();
    fill(255, 100, 40);
    ellipse(hitX, hitY, hitSize, hitSize);
    hitTime -= 1 / 60;
  }
}

function PlayerSpeed() {
  if (keyIsDown(SHIFT)) {
    return 2;
  }
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

    if (gameStarted == true) bgm.play();

    score = 0;
    stage = 1;
    meteorRate = 1;
    count = 0;
    direction = 2;
    bullets = [];
    ammo = 0;
    shootTime = 0;
    hitTime = 0;
    bgY1 = 0;
    bgY2 = -height;

    px = width / 2;
    py = height * 0.8;

    ResetStar();

    for (let i = 0; i < n; i++) {
      mx[i] = random(width);
      startX[i] = mx[i];
      my[i] = random(-500, 0);
      speed[i] = random(0.5, 1);
    }
  }
}

function mousePressed() {
  if (mouseButton.left && gameStarted == false &&
      mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
      mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
    gameStarted = true;
    bgm.play();
  }
}
