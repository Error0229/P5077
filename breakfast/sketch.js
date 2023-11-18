var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Bounds = Matter.Bounds,
  Vertices = Matter.Vertices,
  Common = Matter.Common;

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
var bowl;
var bowlCurve;
let bowl_vertices = [];
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
        data.get(r, "Tired") - 1,
        1 ? data.get(r, "Breakfast") == "Yes" : 0,
        createVector(
          parseInt(150 + (1 ? data.get(r, "Breakfast") == "Yes" : 0) * 700) +
            (posx % 500),
          parseInt(posx / 10) - 1000
        )
      )
    );
    posx += 100;
  }
  angleMode("degrees");
  // the outline of the bowl
  for (let i = 0; i <= 180; i += 3) {
    let x = cos(i) * 300 + 400;
    let y = sin(i) * 300 + 600;
    bowl_vertices.push({
      x: x,
      y: y,
    });
  }
  // // the inner curve of the bowl
  for (let i = 180; i >= 0; i -= 3) {
    let x = cos(i) * 280 + 400;
    let y = sin(i) * 280 + 600;
    bowl_vertices.push({
      x: x,
      y: y,
    });
  }

  // bowl_vertices.sort((a, b) => a.x - b.x);
  // Vertices.clockwiseSort(bowl_vertices);
  // bowl_vertices = [
  //   { x: 100, y: 600 },
  //   { x: 100, y: 900 },
  //   { x: 700, y: 900 },
  //   { x: 700, y: 600 },
  //   { x: 690, y: 600 },
  //   { x: 690, y: 890 },
  //   { x: 110, y: 890 },
  //   { x: 110, y: 600 },
  // ];
  for (let i = 0; i <= 180; i++) {
    console.log(bowl_vertices[i]);
  }
  // bowl = Bodies.rectangle(400, 500, 400, 20, { isStatic: true });
  bowlCurve = Bodies.fromVertices(400, 800, [bowl_vertices], {
    isStatic: true,
  });
  // World.add(world, bowl);
  World.add(world, bowlCurve);
  noStroke();
  console.log(hourStatus);
}

function draw() {
  background(200, 190, 130);
  DrawBowl(300, createVector(400, 600));
  dataPoints.forEach((element) => {
    element.drawDot();
  });
  drawBreakfast(100, createVector(100, 100));
  DrawBox(createVector(300, 400), createVector(1200, -200));
  // bowlCurve.
  // noLoop();
}

class DataPoint {
  constructor(hours, tired, breakfast, posVec2) {
    // console.log(hours, tired, breakfast, posVec2);
    this.body = Bodies.circle(posVec2.x, posVec2.y, parseInt(hours) * 5);
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
    // console.log(pos, angle);
    push();
    // translate(pos.x, pos.y);
    rectMode(CENTER);
    // print(angle)
    textSize(this.r);
    // rotate(angle);
    // ellipse(pos.x, pos.y, this.r, this.r);
    text(emojiArr[this.tired], pos.x - this.r * 0.685, pos.y + this.r * 0.35);
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
    // vertex(bowl_vertices[i].x, bowl_vertices[i].y);
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
// show the current mouse position when clicked
function mousePressed() {
  console.log(mouseX, mouseY);
}
