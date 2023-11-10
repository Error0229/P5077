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
var ripple_time = 2;
var drip_len = 100;
var drip_time = 0.05;
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
  constructor(x, y, t, color) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.color = color;
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
    stroke(this.color);
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
  constructor(x, y, t, color) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.drop = false;
    this.color = color;
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
    stroke(this.color);
    line(this.x, this.y + sy, this.x, this.y + sy + l);
  }
}
class Model {
  constructor() {
    this.drips = [];
    this.ripples = [];
  }
  add_ripple(x, y, t, color) {
    this.ripples.push(new Ripple(x, y, t, color));
  }
  add_drip(x, y, t, color) {
    this.drips.push(new Drip(x, y, t, color));
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
          this.drips[i].t,
          this.drips[i].color
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
  colorMode(HSB);
  model = new Model();
  createCanvas(windowWidth, windowHeight);
  audio = loadSound("Flower_dance.mp3", function () {
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
    // audio.play();
  });
  fft = new p5.FFT();
}
// c major 16.35 Hz	32.70 Hz	65.41 Hz	130.81 Hz	261.63 Hz	523.25 Hz	1046.50 Hz	2093.00 Hz	4186.01 Hz
// var pf = [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5];
var freq_buffer = [];
var threshold = 0.1;
var last_drip_time = 0;
function draw() {
  if (read_over == true && !mouseIsPressed) {
    time_slider.value(audio.currentTime());
  }
  background(0);
  noFill();
  stroke(255);
  var wave = fft.waveform();

  // if (max(wave) > 0.1) {
  //   // using HSB color mode
  //   var h = map(audio.currentTime(), 0, td, 0, 360);
  //   var s = map(max(wave), 0, 1, 0, 100);
  //   var cr = color(h, s, 100);
  //   // model.add_drip(width / 2, height / 2, audio.currentTime(), cr);
  // }
  var fs = fft.analyze();
  freq_buffer.push(fs);
  if (freq_buffer.length > 4) {
    freq_buffer.splice(0, 1);
  }
  var sum = 0;
  for (var i = 0; i < fs.length; i++) {
    if (fs[i] - freq_buffer[0][i] > 0) {
      sum += fs[i] - freq_buffer[0][i];
    }
  }
  console.log(sum);
  if (sum > 900) {
    model.add_drip(
      width / 2,
      height / 2,
      audio.currentTime(),
      color(map(sum, 50, 7000, 0, 100), 100, 100)
    );
    // clear the buffer
    freq_buffer = [];
  }
  // var cr = color(100, 100, 100);
  // var max_h = 0;
  // // draw lines
  // // 20 to 20000 Hz
  // // all the piano notes frequency

  // var flag = false;
  // for (var i = 0; i < fs.length; i++) {
  //   var paf = false;
  //   var cr_tmp = color(255, 255, 255);
  //   var x = map(i, 0, fs.length, 0, width);
  //   var y = height / 2;
  //   var h = map(fs[i], 0, 255, 0, 600);
  //   // if (h < max_h) {
  //   //   continue;
  //   // }
  //   var f = map(i, 0, fs.length, 20, 20000);
  //   // if the frequency is in the piano notes change the color
  //   for (var j = 0; j < pf.length; j++) {
  //     if (abs(f - pf[j]) < 20) {
  //       r = map(h, 0, 600, 0, 100);
  //       g = map(h, 0, 600, 0, 100);
  //       b = 100;
  //       cr_tmp = color(r, g, b);
  //       paf = true;
  //       break;
  //     }
  //   }
  //   if (paf && h > max_h) {
  //     max_h = h;
  //     cr = cr_tmp;
  //     flag = true;
  //   }
  //   if (paf) {
  //   }
  //   stroke(cr_tmp);
  //   line(x, y - h / 2, x, y + h / 2);
  // }
  // if (flag && max_h > 400 && audio.currentTime() - last_drip_time > 0.1) {
  //   last_drip_time = audio.currentTime();
  //   model.add_drip(width / 2, height / 2, audio.currentTime(), cr);
  // }

  model.update();
  model.draw();
}
