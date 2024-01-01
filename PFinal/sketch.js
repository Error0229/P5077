var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Bounds = Matter.Bounds,
  Vertices = Matter.Vertices,
  Common = Matter.Common,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Render = Matter.Render,
  Composite = Matter.Composite,
  Composites = Matter.Composites;

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
// Body.SetVelocity(TheBall, { x: 0, y: 0 });
var SB;
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode("degrees");
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
  engine.world.gravity.scale = 0.0001;
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

  SB = new Poly(200, 5);

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
  audio = loadSound("Flower_dance.mp3", function () {
    read_over = true;
    td = audio.duration();
    time_slider = createSlider(0, td, 0, 0.01);
    time_slider.position(0, 0);
    time_slider.style("width", windowWidth + "px");
    time_slider.mouseReleased(function () {
      audio.jump(time_slider.value());
    });
    play_button = createButton("⏯️");
    play_button.position(0, 20);
    play_button.mousePressed(function () {
      if (audio.isPlaying()) {
        audio.pause();
      } else {
        audio.play();
      }
    });
    audio.playMode("restart");
    // audio.play();
  });
  fft = new p5.FFT(0.3);
  noStroke();
}
class Poly {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.balls = [];
    for (var i = 0; i < 360; i += 3) {
      this.balls.push({
        x: x + cos(i) * 100,
        y: y + sin(i) * 100,
      });
      // make each ball a body and connect them
    }
    this.body = Bodies.fromVertices(this.position.x, this.position.y, [
      this.balls,
    ]);
    World.add(world, this.body);
  }
  draw() {
    this.position = this.body.position;
    push();
    translate(this.position.x, this.position.y);
    rotate(this.body.angle);
    beginShape();
    for (var i = 0; i < this.balls.length; i++) {
      vertex(this.balls[i].x, this.balls[i].y);
    }
    endShape();
    pop();
  }
  update(fftArr) {}
}

function draw() {
  if (read_over == true && !mouseIsPressed && audio.isPlaying()) {
    time_slider.value(audio.currentTime());
  }
  background(0);
  noFill();
  stroke(255);
  var fs = fft.analyze();
  SB.update(fs);
  SB.draw();
  // noLoop();
}
