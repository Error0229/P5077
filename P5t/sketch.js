var game;
function setup() {
  createCanvas(1200, 900);
  // fill background with black
  background(0);
  game = new Game(1);
  game.start();
}

function draw() {
  background(0);
  game.display();
}
function mousePressed() {
  game.handleMouseClick();
}
class Target {
  constructor(difficulty) {
    this.diff = difficulty;
    this.x = random(0, width);
    this.y = random(0, height);
    this.size = 60 / difficulty;
    this.seed = random(-100, 100);
  }
}
class MovingTarget extends Target {
  constructor(difficulty) {
    super(difficulty);
    this.speed = difficulty * 4;
    this.direction = random(0, 360);
  }
  display() {
    this.update();
    circle(this.x, this.y, this.size / this.diff);
  }
  update() {
    // keep moving with same speed in a direction, after a random period of time, change direction
    // and keep moving in that direction
    console.log(frameCount + this.seed, 50 / this.diff)
    if ((frameCount + this.seed) % (50 / this.diff) < 1) {
      this.direction = random(0, 360);
    }
    this.x += cos(this.direction) * this.speed;
    if (this.x > width || this.x < 0) {
      this.x -= cos(this.direction) * this.speed * 2;
      this.direction = random(0, 360);
    }
    this.y += sin(this.direction) * this.speed;
    if (this.y > height || this.y < 0) {
      this.y -= sin(this.direction) * this.speed * 2;
      this.direction = random(0, 360);
    }
  }

}

class TargetFactory {
  constructor() {

  }

  createTarget(movingFunction) {
    return new MovingTarget(movingFunction);
  }
}

// create a dynamic clicking target game
class Game {
  constructor(difficulty) {
    this.targets = [];
    this.targetFactory = new TargetFactory();
    this.diff = difficulty;
    this.score = 0;
    this.time = -1;
    this.STATE = Game.STATE.START;
  }
  // game state enum
  static get STATE() {
    return {
      START: 0,
      CHOOSE_MODE: 1,
      PLAYING: 2,
      END: 3
    }
  }
  static get MODE() {
    return {
      DYNAMIC_CLICK: 0,
      STATIC_CLICK: 1,
      TARGET_SWITCHING: 2,
      TRACKING: 3
    }
  }
  addTarget() {
    this.targets.push(this.targetFactory.createTarget(this.diff));
  }
  start() {
    for (let i = 0; i < 5; i++) {
      this.addTarget();
    }
    setInterval(function () {
      if (game.targets.length < 6) {
        game.addTarget();
      }

    }
      , 1000);
  }
  display() {
    if (this.STATE == Game.STATE.START) {
      fill(255);
      rect(100, 100, 200, 100);
      textSize(80);
      // red
      fill(255, 0, 0);
      text("Start", 110, 180);
    }
    if (this.STATE == Game.STATE.PLAYING) {
      fill(255);
      this.time = floor((1800 - frameCount + this.startTime) / 60);
      for (let i = 0; i < this.targets.length; i++) {
        this.targets[i].display();
      }
      textSize(80);
      fill(255);
      text("Score: " + this.score, 600, 100);
      text("Time: " + this.time, 600, 200);
    }
    if (this.time == 0) {
      this.STATE = Game.STATE.END;
    }
    if (this.STATE == Game.STATE.END) {

      if (this.score > 40) {
        fill(255, 0, 0);
        textSize(80);
        text("Incredible!", 400, 300);
      }
      else if (this.score > 30) {
        fill(255, 0, 0);
        textSize(80);
        text("Great!", 400, 300);
      }
      else {
        fill(255, 0, 0);
        textSize(80);
        text("You so bad!", 400, 300);
      }
      // restart button
      fill(255);
      rect(100, 100, 200, 100);
      textSize(80);
      // red
      fill(255, 0, 0);
      text("Restart", 110, 180);
    }

    // show start button with rect
  }
  handleMouseClick() {
    if (this.STATE == Game.STATE.START) {
      if (dist(mouseX, mouseY, 200, 150) < 100) {
        this.STATE = Game.STATE.PLAYING;
        this.startTime = frameCount;
      }
    }
    if (this.STATE == Game.STATE.PLAYING) {
      for (let i = 0; i < this.targets.length; i++) {
        if (dist(mouseX, mouseY, this.targets[i].x, this.targets[i].y) < this.targets[i].size / 2) {
          this.targets.splice(i, 1);
          this.score++;
        }
      }
    }
    if (this.STATE == Game.STATE.END) {
      if (dist(mouseX, mouseY, 200, 150) < 100) {
        this.STATE = Game.STATE.PLAYING;
        this.score = 0;
        this.time = -1;
        this.startTime = frameCount;
      }
    }
  }
}