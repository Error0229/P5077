function preload() {
  ak47 = loadModel("AK47.obj")
  ak47Texture = loadImage("AK47_UV_Map.png")
}

// Camera object for controlling the position, pan and tilt of the camera
let cam = {
  x: 0, y: 0, z: 0,
  th: 0, phi: 0.01,
}

// Walk spd
let spd = 10;

// Stores the mouse position on the previous frame
let mousePrev = {
  x: 0, y: 0
}
let mouseArray = [mousePrev];
let mousePos;

function setup() {
  createCanvas(1000, 600, WEBGL);
  perspective(PI / 3, width / height, 1, 5000);
  mousePrev.x = mouseX - width / 2;
  mousePrev.y = mouseY - height / 2;
  mousePos = { x: mouseX - width / 2, y: mouseY - height / 2 }
  // noStroke()
}

let mouseUpdate = 0;

function bullet(x, y, z, th, phi, mx, my) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.th = th;
  this.phi = phi;
  this.mx = mx;
  this.my = my;
  this.d = 0;
  this.hit = false;
  this.draw = function () {
    // push()
    //   translate(this.x, this.y, this.z)
    //   rotateZ(this.th - this.mx / 5000)
    //   rotateY(this.phi - this.my / 5000)
    //   translate(100, 75, -100)
    //   push()
    //     translate(300 + this.d, 0, 50)
    //     noStroke()
    //    ill(0)
    //     // sphere(10)
    //     if(this.d < 3000) this.d += 200;
    //   pop()
    // pop()
    let H = T(this)
    H = matrixMult(Rz(- (this.th - this.mx / 5000)), H)
    H = matrixMult(Ry(- (this.phi - this.my / 5000)), H)
    H = matrixMult(T({ x: 100 + 300 + this.d, y: 75, z: -100 + 50 }), H)
    let bulletPt = matrixMult([[0, 0, 0, 1]], H)
    push()
    translate(bulletPt[0][0], bulletPt[0][1], bulletPt[0][2])
    noStroke()
    fill(0, 0, 0)

    // Collision checks
    if (dist(bulletPt[0][0], bulletPt[0][1], bulletPt[0][2], 0, 0, 0) > 500) {
      if (this.d < 10000 && this.hit == false) this.d += 200
    } else {
      this.d -= (500 - dist(bulletPt[0][0], bulletPt[0][1], bulletPt[0][2], 0, 0, 0))
      this.hit = true;
    }
    if (bulletPt[0][2] < -500) {
      translate(0, 0, -bulletPt[0][2])
      translate(0, 0, -500)
      this.hit = true
      this.d -= 200
    }
    sphere(10)
    pop()
  }
}
let bullets = [];

let momentum = {
  x: 0,
  y: 0
}

let walkShake = {
  z: 0,
  x: 0
}

let walk = {
  x: 0,
  z: 0
}

let shoot = {
  fire: false,
  timer: 0
}

function draw() {
  background(220);
  // scale(0.1)
  // lights()
  lights()
  pointLight(255, 255, 255, 1000, 1000, 1000)
  pointLight(255, 255, 255, -1000, 1000, 1000)
  pointLight(255, 255, 255, 1000, -1000, 1000)
  pointLight(255, 255, 255, -1000, -1000, 1000)

  // mousePos.x += ((mouseX - width/2) - (mousePrev.x)) / 10;
  // mousePos.y += ((mouseY - height/2) - (mousePrev.y)) / 10;
  // mousePos = {x: mouseX - width/2, y: mouseY - height/2}

  let currentMouseX = mousePos.x;
  let currentMouseY = mousePos.y;

  mousePos.x += ((mouseX - width / 2) - currentMouseX) / 10;
  mousePos.y += ((mouseY - height / 2) - currentMouseY) / 10;

  momentum.x += ((mouseX - width / 2) - mouseArray[0].x)
  momentum.y += ((mouseY - height / 2) - mouseArray[0].y)

  momentum.x *= 0.9
  momentum.y *= 0.9

  // Press 'C' to shoot
  if (keyIsDown(67) && shoot.fire == false) {
    shoot.fire = true;
  }

  if (shoot.fire) {
    if (shoot.timer < 6) {
      momentum.y += (6 - shoot.timer) * 50
      momentum.x += random(-100, 100) * (6 - shoot.timer) / 6
      shoot.timer += 1
    } else {
      shoot.timer = 0;
      shoot.fire = false;
    }
  } else {
    momentum.x *= random(1.0, 1.1)
    momentum.y *= random(1.0, 1.1)
  }

  cam.th += ((mouseX - width / 2) - mouseArray[0].x) / 1000;

  if (abs((mousePos.y - mousePrev.y) / 100) < PI) {
    cam.phi += ((mouseY - height / 2) - mouseArray[0].y) / 1000;
    if (abs(cam.phi) > PI / 2) {
      cam.phi -= ((mouseY - height / 2) - mouseArray[0].y) / 1000;
    }
  }

  // Move forward
  if (keyIsDown(87)) {
    cam.x += spd * cos(cam.th)
    cam.y += spd * sin(cam.th)
  }
  // Move backward
  if (keyIsDown(83)) {
    cam.x -= spd * cos(cam.th)
    cam.y -= spd * sin(cam.th)
  }

  if (keyIsDown(87) || keyIsDown(83)) {
    walk.z += 0.225;
    walk.x += 0.225;
    walkShake.z = 2 * sin(walk.z)
    walkShake.x = 0.3 * sin(walk.x / 2)
  } else if (keyIsDown(65) || keyIsDown(68)) {
    walk.z += 0.225;
    walk.x += 0.225;
    walkShake.z = 1.65 * sin(walk.z)
    walkShake.x = 0.15 * sin(walk.x / 2)
  } else {
    walk.x = 0;
    walk.z = 0
    walkShake.z *= 0.9;
    walkShake.x *= 0.9
  }

  // Strafe left
  if (keyIsDown(65)) {
    cam.x -= spd * cos(cam.th + PI / 2)
    cam.y -= spd * sin(cam.th + PI / 2)
  }
  // Strafe right
  if (keyIsDown(68)) {
    cam.x -= spd * cos(cam.th - PI / 2)
    cam.y -= spd * sin(cam.th - PI / 2)
  }

  camera(cam.x + walkShake.x * cos(cam.th + PI / 2), cam.y + walkShake.x * sin(cam.th + PI / 2), cam.z + walkShake.z,
    cam.x + 10 * cos(cam.phi) * cos(cam.th), cam.y + 10 * cos(cam.phi) * sin(cam.th), cam.z + walkShake.z - 10 * sin(cam.phi),
    0, 0, -1)
  push()
  translate(cam.x, cam.y, cam.z)
  rotateZ(cam.th - momentum.x / 5000)
  rotateY(cam.phi - momentum.y / 5000)
  translate(100, 75, -100)
  push()
  if (shoot.timer == 1) {
    bullets.push(new bullet(cam.x, cam.y, cam.z, cam.th, cam.phi, momentum.x, momentum.y))
  }
  if (bullets.length > 100) bullets.shift()
  pop()
  texture(ak47Texture)
  model(ak47)
  pop()
  sphere(500)

  push()
  translate(0, 0, -500)
  // rotateX(PI/2)
  plane(10000)
  pop()

  mousePrev = { x: mouseX - width / 2, y: mouseY - height / 2 }
  mouseArray.push(mousePrev)
  if (mouseArray.length > 10) {
    mouseArray.shift()
  }

  // Draw all bullets
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].draw();
  }

}

// MATRIX MATH
function Rx(th) {
  return [[1, 0, 0, 0],
  [0, cos(th), -sin(th), 0],
  [0, sin(th), cos(th), 0],
  [0, 0, 0, 1]]
}

function Ry(th) {
  return [[cos(th), 0, sin(th), 0],
  [0, 1, 0, 0],
  [-sin(th), 0, cos(th), 0],
  [0, 0, 0, 1]]
}

function Rz(th) {
  return [[cos(th), -sin(th), 0, 0],
  [sin(th), cos(th), 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1]]
}

function Tx(d) {
  return [[1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [d, 0, 0, 1]]
}

function Ty(d) {
  return [[1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, d, 0, 1]]
}

function Tz(d) {
  return [[1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, d, 1]]
}

function T(v) {
  return [[1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [v.x, v.y, v.z, 1]]
}

function matrixMult(A, B) {
  if (A[0].length !== B.length) return "A col != B row"
  l = A.length;      // Number of rows in A
  m = A[0].length;   // Number of columns in A and number of rows in B
  n = B[0].length;   // Number of columns in B

  // console.log("A is an :" + l + "x" + m + " Matrix ")
  // console.log("B is an :" + m + "x" + n + " Matrix ")

  let C = []
  for (let i = 0; i < l; i++) {
    C[i] = [];
    for (let j = 0; j < n; j++) {
      C[i][j] = [];
    }
  }

  for (let row = 0; row < l; row++) {
    for (let col = 0; col < n; col++) {
      let v = [];
      let w = [];
      for (let i = 0; i < m; i++) {
        v.push(A[row][i])
        w.push(B[i][col])
      }
      C[row][col] = dot(v, w)
    }
  }
  return C;
}

function dot(v, w) {
  if (v.length != w.length) return "Error, vector lengths do not match"
  let sum = 0;
  for (i = 0; i < v.length; i++) {
    sum += v[i] * w[i];
  }
  return sum;
}

// Vector magnitude of a two vectors [[x, y, z, 1]]
function vecNorm(v) {
  let vmag = sqrt(v[0][0] ** 2 + v[0][1] ** 2 + v[0][2] ** 2)
  return [[v[0][0] / vmag, v[0][1] / vmag, v[0][2] / vmag, 1]]
}