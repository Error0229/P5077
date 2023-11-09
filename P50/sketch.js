function setup() {
  createCanvas(1600, 800);
  background(220);
  noFill()
  points = []
  for (let i = 0; i < 1600 / 80; i++) {
    for (let j = 0; j < 800 / 80; j++) {
      points.push([i * 80, j * 80])
    }
    // random choose 10 points in points as bomb point
    bomb_points = []
    for (let i = 0; i < 10; i++) {
      bomb_points.push(points[floor(random(points.length))])
    }
  }
}
function draw() {
  background(220);
  points.forEach(element => {
    d = dist(mouseX, mouseY, element[0], element[1])
    map_np = map(d, 0, 100, 3, 20)
    map_rd = map(d, 0, 1200, 50, 20)
    fill(0, 0, 0, 0)
    if (bomb_points.includes(element) && d < 50) {
      fill(random(100, 255), random(100, 255), random(100, 255))
      polygon(element[0], element[1], map_rd * 3, 3)
      
    }
    else {
      polygon(element[0], element[1], map_rd, map_np)

    }
    
  });

function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
  
}
