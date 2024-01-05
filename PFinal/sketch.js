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
var td;
var read_over;
var ground;
var audioFileName = "Sacred Play Secret Place-XX2gPs44fxg.opus";
var engine;
var world;
var boxes = [];
var ballSize = 1;
var TheBall;
var forceFactor = 0.000001;
var defaultForce = 0.00001;
var rest = 0.4;
var KNN = 4;
var stiff = 0.06;
var radius = 100;
var outerCount = 60;
var innerCount = 200;
var parThresh = 190;
var updateCount = 0;
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

    // smooth by average
    var sum = 0;
    for (var j = lowerIndex; j <= Math.min(upperIndex, oldSize - 1); j++) {
      sum += originalArray[j];
    }
    newArray.push(sum / (Math.min(upperIndex, oldSize - 1) - lowerIndex + 1));
    // newArray.push(interpolatedValue);
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
  var ground = Matter.Bodies.rectangle(
    windowWidth / 2,
    windowHeight,
    windowWidth * 2,
    100,
    { isStatic: true }
  );
  var ceiling = Matter.Bodies.rectangle(
    windowWidth / 2,
    0,
    windowWidth * 2,
    100,
    {
      isStatic: true,
    }
  );
  var leftWall = Matter.Bodies.rectangle(
    0,
    windowHeight / 2,
    100,
    windowHeight * 2,
    { isStatic: true }
  );
  var rightWall = Matter.Bodies.rectangle(
    windowWidth,
    windowHeight / 2,
    100,
    windowHeight * 2,
    { isStatic: true }
  );
  World.add(world, [ground, ceiling, leftWall, rightWall]);

  SB = new Poly(windowWidth / 2, windowHeight / 2);
  audio = loadSound(audioFileName, function () {
    audio.playMode("restart");
    // audio.play();
  });
  fft = new p5.FFT(0.3);
  noStroke();
}
class Poly {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.innerBalls = [];
    this.outerBalls = [];
    this.bodies = [];
    this.rndIndex = [];
    this.particle = [];
    this.parColor = [];
    this.rndColor = color(random(0, 255), random(0, 255), random(0, 255));
    for (var i = 0; i < outerCount; i++) {
      var theta = (i / outerCount) * 360;
      this.bodies.push(
        Bodies.circle(
          x + radius * cos(theta),
          y + radius * sin(theta),
          ballSize,
          { restitution: rest, mass: 0, angle: theta, angularSpeed: 200 }
        )
      );
    }
    for (var i = 0; i < innerCount; i++) {
      var theta = (i / innerCount) * 360;
      var rndx = random(0.01, 0.98);
      var rndy = random(0.01, 0.98);
      this.bodies.push(
        Bodies.circle(
          x + rndx * radius * cos(theta),
          y + rndy * radius * sin(theta),
          ballSize,
          { restitution: rest, mass: 0, angle: theta }
        )
      );
    }
    this.edges = [];
    this.constraints = [];

    // for (var i = 0; i < outerCount; i++) {
    //   this.constraints.push(
    //     Constraint.create({
    //       bodyA: this.bodies[i],
    //       bodyB: this.bodies[(i + 1) % outerCount],
    //       stiffness: stiff,
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
    // this.constraints.push(
    //   Constraint.create({
    //     bodyA: this.bodies[0],
    //     bodyB: this.bodies[innerCount / 2],
    //     length: 5,
    //     damping: 0.1,
    //     stiffness: 0.1,
    //   })
    // );

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
    // for (var i = 0; i < this.bodies.length; i++) {
    //   if (i < outerCount) {
    //     // red
    //     fill(255, 0, 0);
    //   } else {
    //     // blue
    //     fill(0, 0, 255);
    //   }
    //   push();
    //   translate(this.bodies[i].position.x, this.bodies[i].position.y);
    //   rotate(this.bodies[i].angle);
    //   ellipse(0, 0, 4, 4);
    //   pop();
    // }
    // this.bodies.forEach((body) => {
    //   if (body.index in this.outerIndex) {
    //     // red
    //     fill(255, 0, 0);
    //   } else {
    //     // blue
    //     fill(0, 0, 255);
    //   }
    //   push();
    //   translate(body.position.x, body.position.y);
    //   rotate(body.angle);
    //   ellipse(0, 0, 4, 4);
    //   pop();
    // });

    // random choose 30% of the dots
    var rndPoints = [];
    for (var i = 0; i < this.rndIndex.length; i++) {
      rndPoints.push({
        x: this.bodies[this.rndIndex[i]].position.x,
        y: this.bodies[this.rndIndex[i]].position.y,
      });
    }
    // for (var i = 0; i < outerCount; i++) {
    //   rndPoints.push({
    //     x: this.bodies[i].position.x,
    //     y: this.bodies[i].position.y,
    //   });
    // }
    Vertices.clockwiseSort(rndPoints);

    // sort the points clockwise
    // draw the curve
    // set color to random bright color
    strokeWeight(0);
    fill(this.rndColor);
    beginShape();
    rndPoints.forEach((point) => {
      vertex(point.x, point.y);
    });
    endShape(CLOSE);
    this.particle.forEach((particle) => {
      fill(this.parColor[this.particle.indexOf(particle)]);
      circle(particle.position.x, particle.position.y, 4);
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
  update(fftArr, sum) {
    if (sum > 3000) {
      this.rndIndex = [];
      for (var i = 0; i < this.bodies.length; i++) {
        if (i > outerCount && random() < 0.01 + updateCount / 2000)
          this.rndIndex.push(i);
        else if (i <= outerCount && random() < 0.02 + updateCount / 1000) {
          this.rndIndex.push(i);
        }
      }
      this.rndColor = color(
        this.rndColor.levels[0] + random(-10, 10),
        this.rndColor.levels[1] + random(-10, 10),
        this.rndColor.levels[2] + random(-10, 10)
      );
      updateCount++;
    }
    // set current position to every bodies's average position
    this.position = createVector(0, 0);
    for (var i = 0; i < outerCount; i++) {
      this.position.x += this.bodies[i].position.x;
      this.position.y += this.bodies[i].position.y;
    }
    this.position.x /= outerCount;
    this.position.y /= outerCount;
    // smooth the fft array by averaging adjacent bands
    fftArr = resizeArray(fftArr, outerCount);
    // console.log(this.position);
    for (var i = 0; i < outerCount; i++) {
      var normVector = {
        x: this.bodies[i].position.x - this.position.x,
        y: this.bodies[i].position.y - this.position.y,
      };
      var norm = sqrt(
        normVector.x * normVector.x + normVector.y * normVector.y
      );
      normVector.x /= norm;
      normVector.y /= norm;
      Body.applyForce(this.bodies[i], this.position, {
        x: normVector.x * (fftArr[i] * forceFactor + defaultForce),
        y: normVector.y * (fftArr[i] * forceFactor + defaultForce),
      });
      Body.setAngularVelocity(this.bodies[i], 50);
      if (fftArr[i] > parThresh) {
        this.particle.push(
          Bodies.circle(
            this.bodies[i].position.x,
            this.bodies[i].position.y,
            2,
            { restitution: rest }
          )
        );
        this.particle[this.particle.length - 1].force.x =
          normVector.x * 0.1 * forceFactor * 10000;
        this.particle[this.particle.length - 1].force.y =
          normVector.y * 0.1 * forceFactor * 10000;
        World.add(world, this.particle[this.particle.length - 1]);
        this.parColor.push(this.rndColor);
      }
    }
  }
}
function keyPressed() {
  if (keyCode == 32) {
    audio.play();
  }
}
var freq_buffer = [];
var threshold = 0.1;
function draw() {
  background(0);
  noFill();
  // stroke(255);
  var fs = fft.analyze();
  freq_buffer.push(fs);
  if (freq_buffer.length > 2) {
    freq_buffer.splice(0, 1);
  }
  var sum = 0;
  for (var i = 0; i < fs.length; i++) {
    sum += fs[i] - freq_buffer[0][i];
  }
  if (sum > 2500) SB.update(fs, sum);
  SB.draw();
  // noLoop();
}
