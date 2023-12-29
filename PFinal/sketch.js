var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Bounds = Matter.Bounds,
  Vertices = Matter.Vertices,
  Common = Matter.Common,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Render = Matter.Render;

var audio;
var fft;
var time_slider;
var play_button;
var td;
var read_over;
// var engine = Engine.create();
var ground;

var engine;
var world;
var boxes = [];
var TheBall;

var SB;
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode("degrees");
  SB = new Ball();
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
  ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
    isStatic: true,
  });
  World.add(world, ground);
  wallLeft = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
  World.add(world, wallLeft);
  wallRight = Bodies.rectangle(width + 50, height / 2, 100, height, {
    isStatic: true,
  });
  World.add(world, wallRight);

  console.log(SB.vertices, SB.position);
  World.add(world, SB.body);
  const render = Render.create({
    element: document.body,
    engine: engine,
  });
  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
    },
  });
  World.add(engine.world, mouseConstraint);
  noStroke();
}
class Ball {
  constructor() {
    this.position = createVector(width / 2, height / 2);
    this.vertices = [];
    for (var i = 0; i < 360; i += 3) {
      this.vertices.push({
        x: 300 + cos(i) * 100,
        y: 400 + sin(i) * 100,
      });
    }
    this.body = Bodies.fromVertices(this.position.x, this.position.y, [
      this.vertices,
    ]);
  }
  draw() {
    this.position = this.body.position;
    push();
    translate(this.position.x, this.position.y);
    rotate(this.body.angle);
    beginShape();
    for (var i = 0; i < this.vertices.length; i++) {
      vertex(this.vertices[i].x, this.vertices[i].y);
    }
    endShape();
    pop();
  }
}

function draw() {
  background(200, 190, 130);
  SB.draw();
  // noLoop();
}
