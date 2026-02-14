let canvas;
let ctx;
let missileCounter;
window.addEventListener("DOMContentLoaded", function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  missileCounter = document.getElementById('evasion');
})
let isTouchOnly = window.matchMedia("(hover: none)").matches;
let keys;
let lastDirection = 0;
let tgtDirection = 0;
let time = 0;
let missilesEvaded = 0; 
resizeCanvas();
function determineMobile() {
if (!isTouchOnly) {
  document.getElementsByClass("keycontain2").style.display = "none";
  window.addEventListener('keydown', function (e) {
    keys = (keys || []);
    keys[e.keyCode] = true;
  })
  window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;
  })
  alert("Detected as desktop");
} else {
  keys = new Array(41);
  document.getElementById("keyup").addEventListener('touchstart', function () { keys[40] = true; })
  document.getElementById("keyleft").addEventListener('touchstart', function () { keys[39] = true; })
  document.getElementById("keyright").addEventListener('touchstart', function () { keys[37] = true; })
  document.getElementById("keydown").addEventListener('touchstart', function () { keys[38] = true; })
 
  document.getElementById("keyup").addEventListener('touchend', function () { keys[40] = false; })
  document.getElementById("keyleft").addEventListener('touchend', function () { keys[39] = false; })
  document.getElementById("keyright").addEventListener('touchend', function () { keys[37] = false; })
  document.getElementById("keydown").addEventListener('touchend', function () { keys[38] = false; })
  alert("Detected as mobile");
}
}
const objects = [
  {
    x: (canvas.width / 2), y: (canvas.height / 2), sizex: 100, sizey: 50, color: 'grey', v: 1, theta: 0,
    set turnrate(sign) {
      this.theta += sign * 0.05 * Math.exp(-((3 * this.v - 13.6) ** 2) / 50);
      this.v *= 0.984375;
    }
  },
  {
    x: 20, y: (canvas.height / 2), sizex: 30, sizey: 5, color: 'white', v: 0.01, theta: 0,
    set velocityRamp(time) {
      this.v += Math.exp(-((time - 1) ** 4) + (2 * (time - 1)) + 1) - 0.015625;
    },
    set turnrate(command) {
      this.theta += command * 0.0625 * Math.exp(-((8 * this.v - 64) ** 2) / 128);
      this.v *= (0.984375 ** Math.abs(command));
    }
  },
];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  /*if (window.innerWidth > mobileWidth) {
    canvas.height = window.innerHeight
  } else {
    canvas.height = window.innerHeight;
  }*/
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', function(event) {
  if (event.key == "Tab") {
    isTouchOnly = !isTouchOnly;
    determineMobile();
  }
}
function missileGuide() {
  let deltax = objects[0].x - objects[1].x;
  let deltay = objects[0].y - objects[1].y;
  lastDirection = tgtDirection;
  tgtDirection = Math.atan2(deltay, deltax);
  let distance = Math.sqrt(deltay ** 2 + deltax ** 2);
  if (distance < 30) { loseGame(); }
  let closure = objects[0].v * Math.cos(tgtDirection - objects[0].theta);
  let angularVelocity = tgtDirection - lastDirection;
  //if (keys && keys[32]) {alert(angularVelocity); keys[32] = false}
  let interceptTime = distance / (objects[1].v + closure);
  let target = tgtDirection + angularVelocity * interceptTime;
  if (closure < 1 && closure > -1) {
    objects[1].turnrate = 0;
  } else {
    objects[1].turnrate = (target - objects[1].theta) / 2 * Math.PI;
  }
}
function loseGame() {
  missilesEvaded = 0;
  resetGame();
}
function winGame() {
  missilesEvaded++;
  resetGame();
}
function resetGame() {
  objects[1].x = -200;
  objects[1].y = (canvas.height / 2);
  objects[1].theta = 0;
  objects[1].v = 0.01;
  time = 0;
  keys.forEach(key => {
    key = false;
  });
  missileCounter.innerText = `Missiles Evaded: ${missilesEvaded}`;
}
function update() {
  if (keys && (keys[40] || keys[83])) { objects[0].v *= 0.95; }
  if (keys && (keys[38] || keys[87])) { objects[0].v += 0.05; }
  if (keys && (keys[37] || keys[65])) { objects[0].turnrate = -1; }
  if (keys && (keys[39] || keys[68])) { objects[0].turnrate = 1; }
  objects[1].velocityRamp = time;
  missileGuide();
  for (let obj of objects) {
    //obj.theta %= (2 * Math.PI);
    obj.x += obj.v * Math.cos(obj.theta);
    obj.y += obj.v * Math.sin(obj.theta);
  }
}
function render() {
  //if(50 > objects[0].x || (canvas.width - 50) < objects[0].x) {ctx.scale((Math.abs(objects[0].v * Math.cos(objects[0].theta)), 0))}
  //if(50 > objects[0].y || (canvas.height - 50) < objects[0].y) {ctx.scale(0, Math.abs((objects[0].v * Math.sin(objects[0].theta))))}
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let obj of objects) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.theta);
    ctx.fillStyle = obj.color;
    ctx.fillRect((obj.sizex / -2), (obj.sizey / -2), obj.sizex, obj.sizey);
    ctx.restore();
  }
}
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
  time++;
  if (objects[1].v < 0) { winGame(); }
}
gameLoop();
