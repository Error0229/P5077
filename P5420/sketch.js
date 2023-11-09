var audio;
var fft;
var time_slider;
var play_button;
var td;
var read_over;
var max_r = 350;
var min_r = 150;
var long_axis = 400;
var short_axis = 200;
var basic_r = 100;
var ripple_time = 3;
var drip_len = 100;
var drip_time = 0.25;
var model;
class Eld {
  // ellipse data
  constructor(xr, yr) {
    this.xr = xr;
    this.yr = yr;
  }
}
class Ripple {
  // ellipse data
  constructor(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.rs = [];
    var wave = fft.waveform();
    for (var i = 0; i < PI; i += 0.01) {
      var index = floor(map(i, 0, PI, 0, wave.length - 1));
      var rx = floor(map(wave[index], -1, 1, basic_r, long_axis)) * sin(i);
      var ry = floor(map(wave[index], -1, 1, basic_r, short_axis)) * cos(i);
      this.rs.push(new Eld(rx, ry));
    }
    this.rs.push(
      new Eld(0, -floor(map(wave[index], -1, 1, basic_r, short_axis)))
    );
  }
  draw() {
    var mul = map(audio.currentTime() - this.t, 0, ripple_time, 0, 4);
    beginShape();
    this.rs.forEach(
      function (e) {
        vertex(e.xr * mul + this.x, e.yr * mul + this.y);
      }.bind(this)
    );
    endShape();

    beginShape();
    this.rs.forEach(
      function (e) {
        vertex(-e.xr * mul + this.x, e.yr * mul + this.y);
      }.bind(this)
    );
    endShape();
  }
}
class Drip {
  constructor(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.drop = false;
  }
  draw() {
    var l = map(
      abs(audio.currentTime() - this.t - drip_time / 2),
      0,
      drip_time / 2,
      drip_len,
      0
    );
    var sy = max(
      0,
      map(audio.currentTime() - this.t, 0, drip_time, -drip_len, drip_len)
    );
    line(this.x, this.y + sy, this.x, this.y + sy + l);
  }
}
class Model {
  constructor() {
    this.drips = [];
    this.ripples = [];
  }
  add_ripple(x, y, t) {
    this.ripples.push(new Ripple(x, y, t));
  }
  add_drip(x, y, t) {
    this.drips.push(new Drip(x, y, t));
  }
  draw() {
    this.drips.forEach(function (e) {
      e.draw();
    });
    this.ripples.forEach(function (e) {
      e.draw();
    });
  }
  update() {
    for (var i = 0; i < this.drips.length; i++) {
      if (
        this.drips[i].drop == false &&
        audio.currentTime() - this.drips[i].t > drip_time / 2
      ) {
        this.add_ripple(
          this.drips[i].x,
          this.drips[i].y + drip_len,
          this.drips[i].t
        );
        this.drips[i].drop = true;
      }
      if (
        audio.currentTime() - this.drips[i].t > drip_time ||
        audio.currentTime() < this.drips[i].t - 0.1
      ) {
        this.drips.splice(i, 1);
      }
    }
    for (var i = 0; i < this.ripples.length; i++) {
      if (
        audio.currentTime() - this.ripples[i].t > 3 ||
        audio.currentTime() < this.ripples[i].t - 0.1
      ) {
        this.ripples.splice(i, 1);
      }
    }
  }
}
function setup() {
  model = new Model();
  createCanvas(windowWidth, windowHeight);
  audio = loadSound("Sky_Clearing_Up.mp3", function () {
    read_over = true;
    td = audio.duration();
    time_slider = createSlider(0, td, 0, 0.01);
    time_slider.position(0, 0);
    time_slider.style("width", width + "px");
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
    audio.play();
  });
  fft = new p5.FFT(0.5);
}

function draw() {
  if (read_over == true && !mouseIsPressed) {
    time_slider.value(audio.currentTime());
  }
  background(0);
  noFill();
  stroke(255);
  var wave = fft.waveform();
  if (max(wave.slice(wave.length / 2)) > 0.1) {
    model.add_drip(width / 2, height / 2, audio.currentTime());
  }
  model.update();
  model.draw();
}
