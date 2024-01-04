var Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Bounds = Matter.Bounds,
  Vertices = Matter.Vertices,
  Common = Matter.Common,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Render = Matter.Render,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Constraint = Matter.Constraint;

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
var dots = 314;
var ballSize = 1;
var TheBall;
var forceFactor = 0.0000001;
var defaultForce = 0.0;
var rest = 0.2;
var KNN = 7;
var stiff = 0.3;
var radius = 100;
var outerCount;
// Body.SetVelocity(TheBall, { x: 0, y: 0 });
var SB;
function resizeArray(originalArray, newSize) {
  let newArray = [];
  let oldSize = originalArray.length;
  let scaleFactor = (oldSize - 1) / (newSize - 1);

  for (let i = 0; i < newSize; i++) {
    let indexInOld = i * scaleFactor;
    let lowerIndex = Math.floor(indexInOld);
    let upperIndex = Math.ceil(indexInOld);
    let t = indexInOld - lowerIndex;

    // Linear interpolation
    let interpolatedValue =
      (1 - t) * originalArray[lowerIndex] +
      t * originalArray[Math.min(upperIndex, oldSize - 1)];
    newArray.push(interpolatedValue);
  }

  return newArray;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode("degrees");
  engine = Engine.create();
  world = engine.world;
  Engine.run(engine);
  engine.world.gravity.scale = 0.0;
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
  wallTop = Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true });
  World.add(world, wallTop);

  SB = new Poly(300, 300);

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
    this.innerBalls = [];
    var dd = sqrt(dots);
    var dr = (2 * radius) / dd;
    this.dr = dr;
    var flag = 1;
    this.outerIndex = [];
    var indexFlag = true;
    for (var i = 0; i < dd; i += 1) {
      for (var j = 0; j < dd; j += 1) {
        var rx = dr * i - radius + x + (flag * dr) / 2;
        var ry = dr * j - radius + y;
        if (dist(rx, ry, x, y) < radius) {
          this.balls.push({ x: rx, y: ry });
          if (indexFlag) {
            this.outerIndex.push(this.balls.length - 1);
            indexFlag = false;
          }
        }
        flag = flag == 1 ? 0 : 1;
      }
      this.outerIndex.push(this.balls.length - 1);
      // make each ball a body and connect them
    }
    var li = [];
    var rh = [];
    for (var i = 0; i < this.outerIndex.length; i++) {
      if (i % 2 == 0) {
        li.push(this.outerIndex[i]);
      } else {
        rh.push(this.outerIndex[i]);
      }
    }
    rh.reverse();
    this.outerIndex = li.concat(rh);
    outerCount = this.outerIndex.length;
    // create inner balls that use grid points and clip the outer balls
    // var points = [];
    // var dx = (2 * radius) / innerCount;
    // var flag = 1;
    // for (var i = -radius; i < radius; i += dx) {
    //   for (var j = -radius; j < radius; j += dx) {
    //     points.push({
    //       x: x + i + (flag * dx) / 2,
    //       y: y + j,
    //     });
    //     flag = flag == 1 ? 0 : 1;
    //   }
    // }
    // console.log(points);
    // for (var i = 0; i < points.length; i += 1) {
    //   // if the point is inside the polygon, add it to the inner balls
    //   if (dist(points[i].x, points[i].y, x, y) < radius) {
    //     this.innerBalls.push(points[i]);
    //   }
    // }
    this.edges = [];
    this.bodies = [];
    this.constraints = [];
    for (var i = 0; i < this.balls.length; i++) {
      this.bodies.push(
        Bodies.circle(this.balls[i].x, this.balls[i].y, ballSize, {
          restitution: rest,
          angle: (i / outerCount) * 360,
        })
      );
    }
    // for (var i = 0; i < this.innerBalls.length; i++) {
    //   this.bodies.push(
    //     Bodies.circle(this.innerBalls[i].x, this.innerBalls[i].y, ballSize, {
    //       // restitution: rest,
    //     })
    //   );
    // }
    // var a 2d array that stores the distance between each ball
    var distances = [];
    for (var i = 0; i < this.bodies.length; i++) {
      distances.push([]);
      for (var j = 0; j < this.bodies.length; j++) {
        if (i == j) continue;
        distances[i].push({
          index: j,
          dist: dist(
            this.bodies[i].position.x,
            this.bodies[i].position.y,
            this.bodies[j].position.x,
            this.bodies[j].position.y
          ),
        });
      }
    }
    // connect balls
    for (var i = 0; i < this.bodies.length; i++) {
      distances[i].sort(function (a, b) {
        return a.dist - b.dist;
      });
      for (var j = 0; j < min(KNN, distances[i].length); j++) {
        if (distances[i][j].dist == 0 || distances[i][j].dist > 1.5 * this.dr)
          continue;
        // if the edge already exists, skip
        var flag = false;
        for (var k = 0; k < this.edges.length; k++) {
          if (
            (this.edges[k].indexFirst == i &&
              this.edges[k].indexSecond == distances[i][j].index) ||
            (this.edges[k].indexFirst == distances[i][j].index &&
              this.edges[k].indexSecond == i)
          ) {
            flag = true;
            break;
          }
        }
        if (flag) continue;
        this.constraints.push(
          Constraint.create({
            bodyA: this.bodies[i],
            bodyB: this.bodies[distances[i][j].index],
            stiffness: stiff,
          })
        );
        this.edges.push({ indexFirst: i, indexSecond: distances[i][j].index });
      }
    }
    console.log(this.edges);
    // for (var i = 0; i < this.balls.length; i++) {
    //   this.constraints.push(
    //     Constraint.create({
    //       bodyA: this.bodies[i],
    //       bodyB: this.bodies[(i + 1) % this.balls.length],
    //       length: 5,
    //       stiffness: 0.4,
    //     })
    //   );
    // }

    for (var i = 0; i < this.bodies.length; i++) {
      World.add(world, this.bodies[i]);
    }
    // this.body = Bodies.fromVertices(this.position.x, this.position.y, [
    //   this.balls,
    // ]);
    // World.add(world, this.body);
    World.add(world, this.constraints);
  }
  draw() {
    // this.position = this.body.position;
    // push();
    // translate(this.position.x, this.position.y);
    // rotate(this.body.angle);
    // beginShape();
    // for (var i = 0; i < this.balls.length; i++) {
    //   vertex(this.balls[i].x, this.balls[i].y);
    // }
    // endShape();
    // pop();
    this.bodies.forEach((body) => {
      push();
      translate(body.position.x, body.position.y);
      rotate(body.angle);
      ellipse(0, 0, 1, 1);
      pop();
    });
    this.edges.forEach((edge) => {
      strokeWeight(1);
      stroke(255);
      line(
        this.bodies[edge.indexFirst].position.x,
        this.bodies[edge.indexFirst].position.y,
        this.bodies[edge.indexSecond].position.x,
        this.bodies[edge.indexSecond].position.y
      );
    });
  }
  update(fftArr) {
    // set current position to every bodies's average position
    this.position = createVector(0, 0);
    for (var i = 0; i < outerCount; i++) {
      this.position.x += this.bodies[this.outerIndex[i]].position.x;
      this.position.y += this.bodies[this.outerIndex[i]].position.y;
    }
    this.position.x /= outerCount;
    this.position.y /= outerCount;
    // smooth the fft array by averaging adjacent bands
    fftArr = resizeArray(fftArr, outerCount);
    // console.log(this.position);
    for (var i = 0; i < outerCount; i++) {
      var normVector = {
        x: this.bodies[this.outerIndex[i]].position.x - this.position.x,
        y: this.bodies[this.outerIndex[i]].position.y - this.position.y,
      };
      var norm = sqrt(
        normVector.x * normVector.x + normVector.y * normVector.y
      );
      normVector.x /= norm;
      normVector.y /= norm;
      Body.applyForce(this.bodies[this.outerIndex[i]], this.position, {
        x: normVector.x * (fftArr[i] * forceFactor + defaultForce),
        y: normVector.y * (fftArr[i] * forceFactor + defaultForce),
      });
    }
  }
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
