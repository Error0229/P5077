var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

// var engine = Engine.create();
var ground;

var engine;
var world;
var boxes = [];
let emojiArr = ["😝", "🙂", "😐", "🥱", "😴"];
let data = {};
let breakfastStatus = [];
let tiredStatus = [];
let hourStatus = [];
let dataPoints = [];
// let enterPoint=
function preload() {
  data = loadTable("./SleepStudyData.csv", "csv", "header");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log(data);
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
  ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
    isStatic: true,
  });
  World.add(world, ground);
  wallLeft = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
  World.add(world, wallLeft);
  let rowCount = data.getRowCount();
  let posx = 0;
  for (let r = 0; r < rowCount; r++) {
    breakfastStatus.push(data.get(r, "Breakfast"));
    tiredStatus.push(data.get(r, "Tired"));
    hourStatus.push(data.get(r, "Hours"));
    dataPoints.push(
      new DataPoint(
        data.get(r, "Hours") ? data.get(r, "Hours") : 5,
        data.get(r, "Tired"),
        data.get(r, "Breakfast"),
        createVector(parseInt(posx % 1000), parseInt(posx / 10))
      )
    );
    posx += 100;
  }
  noStroke();
  console.log(hourStatus);
}

function draw() {
  background(200, 190, 130);
  dataPoints.forEach((element) => {
    element.drawDot();
  });
  DrawBowl(300, createVector(400, 600));
  drawBreakfast(100, createVector(100, 100));
  DrawBox(createVector(300, 400), createVector(1200, -200));
  // noLoop();
}

class DataPoint {
  constructor(hours, tired, breakfast, posVec2) {
    // console.log(hours, tired, breakfast, posVec2);
    this.body = Bodies.circle(posVec2.x, posVec2.y, parseInt(hours) * 6);
    World.add(world, this.body);
    this.hours = hours;
    this.tired = tired;
    this.breakfast = breakfast;
    this.posVec2 = posVec2;
    this.a;
    this.r = parseInt(hours) * 10;
  }
  update() {}
  drawDot() {
    var pos = this.body.position;
    var angle = this.body.angle;
    console.log(pos, angle);
    push();
    // translate(pos.x, pos.y);
    rotate(angle);
    // rectMode(CENTER);
    // print(angle)
    textSize(this.r / 1.1);
    rotate(angle);
    text(emojiArr[this.tired], pos.x, pos.y, 1000, 1000);
    // ellipse(0, 0, this.r * 2, this.r * 2);
    pop();

    // drawEmoji(
    //   this.tired,
    //   this.hours,
    //   createVector(this.posVec2.x, this.posVec2.y)
    // );
  }
}
function drawEmoji(type, size, posVec2) {
  textSize(parseInt(size) * 10);
  text(emojiArr[type], posVec2.x, posVec2.y, 1000, 1000);
}
function DrawBowl(r, posVec2) {
  angleMode("degrees");
  beginShape();
  for (let i = 0; i < 180; i++) {
    vertex(cos(i) * r + posVec2.x, sin(i) * r + posVec2.y);
  }
  endShape();
}

function drawBreakfast(size, posVec2) {
  textSize(size);
  text("BREAKFAST🥐", posVec2.x, posVec2.y, 2000, 2000);
}

function DrawBox(sizeVec2, posVec2) {
  angleMode("degrees");
  translate(posVec2.x, posVec2.y);
  rotate(60);
  rect(0, 0, sizeVec2.x, sizeVec2.y);
}

function Emoji(x, y, r) {}
