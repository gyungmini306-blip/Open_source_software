// 주제명: 우주선 운석 피하기
// 주제설명: 운석을 피하며 별을 먹어 1,000점을 얻고, 벽에서 튕기는 운석과 최고 점수 기록을 추가한 게임
// 점수가 10,000점, 15,000점, 20,000점에 도달하면 난이도가 올라가고 운석의 낙하 속도가 빨라진다.
// 학번: 2023111663
// 이름: 박경민


//11주차 객체 리터럴 C언어의 구조체와 동일한 역할 변수를 엮은게 함수까지 엮음, 클래스 객체 들어감

let n = 18;
let c;

let meteors = [];

let player;
let score = 0;
let bestScore = 0;
let stage = 1;
let meteorRate = 1;
let gameOver = false;
let gameStarted = false;
let buttonX = 130, buttonY = 185;
let buttonWidth = 240, buttonHeight = 48;
let playerImgs = [];
let count = 0;
let bullets = [], ammo = 0, ammoPerStar = 3;
let meteorPoint = 100;

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

  player = new Player();
  ResetStar();

  for (let i = 0; i < n; i++) {
    meteors[i] = new Meteor(i);

    let r = random(0, 4);
    if      (r < 1) meteors[i].type = 0;
    else if (r < 2) meteors[i].type = 1;
    else if (r < 3) meteors[i].type = 2;
    else            meteors[i].type = 3;

  }
}

function draw() {
  background(0);

  if (!gameStarted) {
    noStroke();
    fill(25);
    rect(50, 180, 400, 175);

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
    text("스페이스 : 발사 / R : 재시작", width / 2, height / 2 + 40);
    text("별 : +" + starPoint + "점 / 탄약 +" + ammoPerStar, width / 2, height / 2 + 70);
  } else if (!gameOver) {
    BackgroundProcess();
    player.move();
    count++;

    player.display();

    for (let i = 0; i < n; i++)
      meteors[i].move(meteorRate);

    BulletProcess();

    for (let i = 0; i < n; i++) {
      meteors[i].display();

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

    if (score > bestScore) bestScore = score;

    fill(255);
    textSize(18);
    textAlign(LEFT);
    text("점수 : " + score + " / 단계 : " + stage, 15, 25);
    text("최고 점수 : " + bestScore, 15, 50);
    fill(100, 220, 255);
    text("탄약 : " + ammo, 15, 75);
    fill(255);

    textAlign(CENTER);
    textSize(14);
    text("스페이스 : 발사 / Shift : 느리게", width / 2, height - 15);
  }
  else {
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(35);
    text("GAME OVER", width / 2, height / 2 - 80);

    fill(255, 230, 80);
    textSize(24);
    text("최종 점수 : " + score, width / 2, height / 2);
    text("최고 점수 : " + bestScore, width / 2, height / 2 + 40);

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

  let d = dist(player.x, player.y, starX, starY);
  if (d < player.size / 2 + starSize / 2) {
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

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height * 0.8;
    this.size = 25;
    this.direction = 2;
  }

  move() {
    let s = PlayerSpeed();

    if (keyIsDown(LEFT_ARROW)) {
      this.x -= s;
      this.direction = 0;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += s;
      this.direction = 1;
    }
    if (keyIsDown(UP_ARROW)) {
      this.y -= s;
      this.direction = 2;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y += s;
      this.direction = 3;
    }

    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, height - this.size / 2);
  }

  display() {
    imageMode(CENTER);
    image(playerImgs[this.direction], this.x, this.y, this.size, this.size);
  }

  reset() {
    this.x = width / 2;
    this.y = height * 0.8;
    this.direction = 2;
  }
}

class Meteor {
  constructor(i) {
    this.x = random(width);
    this.y = random(-500, 0);
    this.speed = random(0.5, 1);
    this.size = random(15, 30);
    this.speedX = random(1, 2);
    this.type = 0;
    this.startX = this.x;
    this.index = i;
  }

  move(rate) {
    switch (this.type) {
      case 0:
        this.speed += 0.1;
        if (this.speed > 3) this.speed = 3;
        this.y += this.speed * rate;
        break;

      case 1:
        this.y += this.speed * rate;
        this.x = this.startX + sin(count * 0.05 + this.index) * 50;
        break;

      case 2:
        this.y += this.speed * rate;
        let moveX = noise(count * 0.01 + this.index * 10);
        this.x += moveX * 6 - 3;
        break;

      case 3:
        this.y += this.speed * rate;
        this.x += this.speedX;
        if (this.x < this.size / 2 || this.x > width - this.size / 2) {
          this.x = constrain(this.x, this.size / 2,
                             width - this.size / 2);
          this.speedX *= -1;
        }
        break;
    }

    if (this.y > height + 30) this.reset();
  }

  display() {
    if      (this.type == 0) c = color(180, 180, 180);
    else if (this.type == 1) c = color(140, 170, 200);
    else if (this.type == 2) c = color(190, 155, 130);
    else                     c = color(190, 140, 240);

    fill(c);
    ellipse(this.x, this.y,
            this.size, this.size);
  }

  reset() {
    this.x = random(width);
    this.y = random(-150, 0);
    this.startX = this.x;
    this.speed = random(1, 2);
    this.speedX = random(1, 2);
  }
}

function Shoot() {
  if (ammo > 0) {
    let bullet = { x: player.x, y: player.y, size: 8, speed: 8 };
    bullets.push(bullet);
    ammo--;
  }
}

function BulletProcess() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;

    noStroke();
    fill(100, 220, 255);
    ellipse(bullets[i].x, bullets[i].y, bullets[i].size, bullets[i].size);

    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    } else {
      for (let j = n - 1; j >= 0; j--) {
        let d = dist(bullets[i].x, bullets[i].y,
                     meteors[j].x, meteors[j].y);
        if (d < (bullets[i].size + meteors[j].size) / 2) {
          burstSound.play();
          score += meteorPoint;
          meteors[j].reset();
          bullets.splice(i, 1);
          break;
        }
      }
    }
  }
}

function PlayerSpeed() {
  if (keyIsDown(SHIFT)) {
    return 2;
  }
  return 4;
}

function CheckHit(i) {
  let d = dist(player.x, player.y, meteors[i].x, meteors[i].y);

  if (d < player.size / 2 + meteors[i].size / 2)
    return true;
  return false;
}

function keyPressed() {
  if (key == ' ' && gameStarted && !gameOver) {
    Shoot();
  }
  if (key == 'r' || key == 'R') {
    burstSound.stop();
    bgm.stop();

    gameOver = false;

    if (gameStarted == true) bgm.play();

    score = 0;
    stage = 1;
    meteorRate = 1;
    count = 0;
    bullets = [];
    ammo = 0;
    bgY1 = 0;
    bgY2 = -height;

    player.reset();

    ResetStar();

    for (let i = 0; i < n; i++) {
      meteors[i].x = random(width);
      meteors[i].startX = meteors[i].x;
      meteors[i].y = random(-500, 0);
      meteors[i].speed = random(0.5, 1);
      meteors[i].speedX = random(1, 2);
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