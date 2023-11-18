var Engine = Matter.Engine,
  // Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies;

var engine = Engine.create();
var ground;

var engine;
var world;
var boxes = [];
function setup() {
  createCanvas(400, 400);
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
  ground = Bodies.rectangle(width / 2, height + 50, width, 100, {
    isStatic: true,
  });
  World.add(world, ground);
  wallLeft = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
  World.add(world, wallLeft);
  for (let i = 0; i < 100; i++) {
    boxes.push(new Box((sin(i) * width) / 2 + width / 2, 0, 5, 10));
  }
  noStroke();
  fill(255);
}
class Box {
  constructor(x, y, w, h) {
    this.body = Bodies.circle(x, y, w / 2);
    World.add(world, this.body);
    this.w = w;
    this.h = h;
  }
  show() {
    var pos = this.body.position;
    var angle = this.body.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    // print(angle)
    ellipse(0, 0, this.w, this.w);
    pop();

    // this.body.
  }
}

function draw() {
  background(0);
  boxes.forEach(function (d) {
    d.show();
  });
  // boxes.push(new Box(sin(frameCount/100)*width/2+width/2, 0, 5, 10))
}

function mousePressed() {
  boxes.push(new Box(mouseX, mouseY, 4, 4));
}
