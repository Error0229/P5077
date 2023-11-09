var points = []
var space = 30
var dimX = 5
var dimY = 5
var x0 = 0
var y0 = 0

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(100);
  stroke(255, 255, 255)
  strokeWeight(2)
  x0 = width / 2
  y0 = height / 2
}

function draw() {
  background(100);
  fill(255, 255, 255)
  points = []
  for (let i = -5; i < dimX; i++) {
    for (let j = -5; j < dimY; j++) {
      let x = x0 - (dimX - 1) / 2 * space + i * space
      let y = y0 - (dimY - 1) / 2 * space + j * space
      let point = new p5.Vector(x, y)
      points.push(point)
    }
  }
  colorMode(HSB, 255)
  points.forEach((point) => {
    let distance = dist(point.x, point.y, mouseX, mouseY)
    let radius = map(distance, 0, 300, 0, 30)
    let h = map(distance, 0, width / 1.5, 0, 255)
    fill(0, 0, 0, 0)
    stroke(h, 255, 255)
    radius = min(radius, 30)
    rotateX(frameCount * 0.01);
    circle(point.x, point.y, radius)
    rotateY(frameCount * 0.01);
    rotateZ(frameCount * 0.01);
    cylinder(20, 50)
    for (let i = 0; i < points.length; i++) {
      let distance = dist(point.x, point.y, points[i].x, points[i].y)
      if (distance < 1500) {
        stroke(h, 255, 255)
        line(point.x, point.y, points[i].x, points[i].y)
      }
    }

  })
  fill(255, 0, 0)
  circle(mouseX, mouseY, 10)
}
