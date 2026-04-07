let canvas, minimap, ctx, minimapCtx;
let missileCounter, highScoreCounter;
let isTouchOnly;
let keys;
let lastDirection = 0;
let tgtDirection = 0;
let time = 0;
let missilesEvaded = 0;
let highScore = 0;
let player, missile, objects;
let withinBounds = false;
let tipPreference;
const missionArea = 3600;
const samCount = 3;
let img = document.createElement('img');
img.src = 'cloud-svgrepo-com.svg';
const wind = 0.5;
 
class Cloud {
  constructor() {
    this.xCoordinate = (Math.random() * 2 * missionArea) - missionArea;
    this.yCoordinate = (Math.random() * 2 * missionArea) - missionArea;
  }
}
const clouds = Array.from({ length: 200 }, () => new Cloud());
 
class Sam {
  constructor() {
    this.xCoordinate = (Math.random() * 2 * missionArea) - missionArea;
    this.yCoordinate = (Math.random() * 2 * missionArea) - missionArea;
  }
}
const samSites = Array.from({ length: samCount }, () => new Sam());
let nextSam = 0;
 
function determineMobile() {
  if (!isTouchOnly) {
    document.getElementById("keycontain2").style.display = "none";
    window.addEventListener('keydown', function (e) {
      keys = (keys || []);
      keys[e.keyCode] = true;
    })
    window.addEventListener('keyup', function (e) {
      keys[e.keyCode] = false;
    })
    // alert("Detected as desktop");
    console.log('Desktop detected')
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
    // alert("Detected as mobile");
    console.log('Mobile detected')
  }
}
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.setTransform(1, 0, 0, 1, window.innerWidth / 2, window.innerHeight / 2);
}
window.addEventListener('keydown', function (event) {
  if (event.key == "m") {
    isTouchOnly = !isTouchOnly;
    determineMobile();
    loseGame();
  }
})
window.addEventListener('keydown', function (event) {
  if (event.key == "z") {
    document.getElementById("main").style.display = "none"
    // turn off the dev tools with Z
  }
})
function missileGuide() {
  let deltax = player.xCoordinate - missile.xCoordinate;
  let deltay = player.yCoordinate - missile.yCoordinate;
  lastDirection = tgtDirection;
  tgtDirection = Math.atan2(deltay, deltax);
  let distance = Math.sqrt(deltay ** 2 + deltax ** 2);
  if (distance < 30) { loseGame(); }
  let closure = player.velocity * Math.cos(tgtDirection - player.atAngle);
  let angularVelocity = tgtDirection - lastDirection;
  let interceptTime = distance / (missile.velocity + closure);
  let target = tgtDirection + angularVelocity * interceptTime;
  if (/*closure < 1 && closure > -1*/ false) {
    missile.turnrate = 0;
  } else {
    missile.turnrate = (target - missile.atAngle) / 2 * Math.PI;
  }
}
function loseGame() {
  missilesEvaded = 0;
  recenter();
  resetGame();
}
function winGame() {
  missilesEvaded++;
  resetGame();
}
function recenter() {
  player.yCoordinate = 0;
  player.xCoordinate = 0;
  player.velocity = 0.01;
  player.atAngle = 0;
  resizeCanvas();
}
// The div movement script is not mine so uh, have fun trying to maintain it
dragElement(document.getElementById("main"));
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }
  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
function closeTip() {
  document.getElementById("popup").style.display = "none";
}
function closeWindow() {
  document.getElementById("main").style.display = "none"
}
function openTip() {
  document.getElementById("popup").style.display = "block";
}
function retreiveTipPreference() {
  try {
    tipPreference = JSON.parse(localStorage.getItem("tipPreference"));
  } catch (error) {
    console.error('Error retreiving tip preference:', error);
  }
  console.log('Tip preference retreived [', tipPreference, ']')
  if (tipPreference !== false) {
    openTip()
  }
}
function confirmPermClose() {
  let text = document.getElementsByClassName("tip")[0];
  text.innerHTML = `Are you sure you don't want to see this tip again? <button type="button" class="cancel cancel-confirm" onclick="saveTipPreference()">Yes</button> <a class="permaDismiss" onclick="revertChanges()">No</a>`;
}
function revertChanges() {
  let text = document.getElementsByClassName("tip")[0];
  text.innerHTML = `You can drag this window around by grabbing and moving the light gray bar on the top
<button type="button" class="cancel" onclick="closeTip()">Dismiss Tip</button>
<a class="permaDismiss" onclick="confirmPermClose()">Don't show this again</a>`
}
function saveTipPreference() {
  tipPreference = false;
  try {
    localStorage.setItem('tipPreference', tipPreference);
    console.log('Tip preference saved:', tipPreference);
  } catch (error) {
    console.log('Error saving tip preference:', error);
  }
  closeTip()
}
function updateDevTools() {
  if (player && missile) {
    document.getElementById("pv").innerHTML = player.velocity.toFixed(2);
    document.getElementById("px").innerHTML = Math.round(player.xCoordinate);
    document.getElementById("py").innerHTML = Math.round(player.yCoordinate);
    document.getElementById("pa").innerHTML = ((player.atAngle / Math.PI) * 180).toFixed(2);
    document.getElementById("mv").innerHTML = missile.velocity.toFixed(2);
    document.getElementById("mx").innerHTML = Math.round(missile.xCoordinate);
    document.getElementById("my").innerHTML = Math.round(missile.yCoordinate);
    document.getElementById("ma").innerHTML = ((missile.atAngle / Math.PI) * 180).toFixed(2);
  }
}
function retreiveHighScore() {
  try {
    highScore = parseInt(localStorage.getItem("highScore")) || 0;
  } catch (error) {
    console.error('Error retreiving highScore:', error);
  }
  console.log('Highscore retreived [', highScore, ']')
}
function updateHighScore() {
  if (missilesEvaded > highScore) {
    highScore = missilesEvaded;
    try {
      localStorage.setItem('highScore', highScore);
      console.log('New highscore saved [', missilesEvaded, ']');
    } catch (error) {
      console.log('Error saving highScore:', error);
    }
  }
  return highScore;
}
function borderHandling() {
  const boundDistance = 50;
  if (player.xCoordinate > ((canvas.width / 2) - boundDistance)) {
    ctx.setTransform(1, 0, 0, 1, (canvas.width / 2) - player.xCoordinate, canvas.innerHeight / 2);
  } else if (player.xCoordinate < (boundDistance - (canvas.width / 2))) {
    ctx.setTransform(1, 0, 0, 1, (canvas.width / 2) - player.xCoordinate, canvas.innerHeight / 2);
  }
  if (player.yCoordinate > ((canvas.height / 2) - boundDistance)) {
    ctx.setTransform(1, 0, 0, 1, canvas.width / 2, (canvas.innerHeight / 2) - player.yCoordinate);
  } else if (player.yCoordinate < (boundDistance - (canvas.height / 2))) {
    ctx.setTransform(1, 0, 0, 1, canvas.width / 2, (canvas.innerHeight / 2) - player.yCoordinate);
  }
}
function resetGame() {
  launcher = samSites[nextSam];
  nextSam = Math.floor(Math.random() * samCount)
  let deltax = player.xCoordinate - launcher.xCoordinate;
  let deltay = player.yCoordinate - launcher.yCoordinate;
  tgtDirection = Math.atan2(deltay, deltax);
  missile.xCoordinate = launcher.xCoordinate;
  missile.yCoordinate = launcher.yCoordinate;
  missile.atAngle = tgtDirection;
  missile.velocity = 4;
  time = 0;
  updateHighScore();
  missileCounter.innerText = `Missiles Evaded: ${missilesEvaded}`;
  highScoreCounter.innerText = `Highscore: ${highScore}`;
}
function update() {
  if (keys && (keys[40] || keys[83])) { player.velocity *= 0.95; }
  if (keys && (keys[38] || keys[87])) { player.velocity += 0.05; }
  if (keys && (keys[37] || keys[65])) { player.turnrate = -1; }
  if (keys && (keys[39] || keys[68])) { player.turnrate = 1; }
  player.velocity *= 0.99609375;
  missile.velocityRamp = time;
  missileGuide();
  for (let obj of objects) {
    //obj.theta %= (2 * Math.PI);
    obj.xCoordinate += obj.velocity * Math.cos(obj.atAngle);
    obj.yCoordinate += obj.velocity * Math.sin(obj.atAngle);
  }
  for (let cloud of clouds) {
    cloud.xCoordinate += wind;
    if (cloud.xCoordinate > missionArea) {
      cloud.xCoordinate = -missionArea;
    }
  }
}
function render() {
  ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  for (let cloud of clouds) {
    ctx.fillStyle = "light grey";
    //ctx.fillRect(cloud.xCoordinate, cloud.yCoordinate, 250, 150);
    ctx.drawImage(img, cloud.xCoordinate, cloud.yCoordinate, 250, 150);
  }
  for (let obj of objects) {
    ctx.save();
    ctx.translate(obj.xCoordinate, obj.yCoordinate);
    ctx.rotate(obj.atAngle);
    ctx.fillStyle = obj.background;
    ctx.fillRect((obj.width / -2), (obj.height / -2), obj.width, obj.height);
    ctx.restore();
  }
}
function renderMinimap() {
  minimapCtx.clearRect(-missionArea, -missionArea, missionArea * 2, missionArea * 2);
  minimapCtx.fillStyle = "magenta";
  for (let samSite of samSites) {
    minimapCtx.fillRect(samSite.xCoordinate, samSite.yCoordinate, 300, 200);
  }
  for (let obj of objects) {
    minimapCtx.fillStyle = obj.background;
    minimapCtx.fillRect(obj.xCoordinate, obj.yCoordinate, 100, 100);
  }
}
function gameLoop() {
  update();
  //borderHandling();
  render();
  renderMinimap();
  updateDevTools();
  requestAnimationFrame(gameLoop);
  time++;
  if (missile.velocity < 0) { winGame(); }
}
window.addEventListener("DOMContentLoaded", function () {
  window.addEventListener('resize', resizeCanvas);
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  minimap = document.getElementById('minimap');
  minimapCtx = minimap.getContext('2d');
  missileCounter = document.getElementById('evasion');
  highScoreCounter = document.getElementById('highscore');
  isTouchOnly = window.matchMedia("(hover: none)").matches;
  determineMobile();
  resizeCanvas();
  retreiveTipPreference();
  retreiveHighScore();
  highScoreCounter.innerText = `Highscore: ${highScore}`;
  minimapCtx.setTransform((150 / missionArea), 0, 0, (75 / missionArea), 150, 75);
  player = {
    xCoordinate: 0,
    yCoordinate: 0,
    width: 100,
    height: 50,
    background: 'grey',
    velocity: 1,
    atAngle: 0,
    set turnrate(sign) {
      this.atAngle += sign * 0.05 * Math.exp(-((3 * this.velocity - 13.6) ** 2) / 50); // Gaussian math for turnrate
      this.velocity *= 0.984375; // 0.984375 = 63/64, friction constant
    }
  };
  missile = {
    xCoordinate: 0,
    yCoordinate: 0,
    width: 30,
    height: 5,
    background: 'white',
    velocity: 0,
    atAngle: 0,
    set velocityRamp(time) {
      this.velocity += Math.exp(-((time - 1) ** 4) + (2 * (time - 1)) + 1) - 0.0078125; // 0.0078125 = 1/128, offset constant
    },
    set turnrate(command) {  //
      this.atAngle += command * 0.0625 * Math.exp(-((8 * this.velocity - 64) ** 2) / 128);
      this.velocity *= (0.9921875 ** Math.abs(command));
    }
  };
  objects = [player, missile];
  gameLoop();
})
