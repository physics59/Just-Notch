let canvas;
let ctx;
let missileCounter;
let highScoreCounter;
let isTouchOnly;
let keys;
let lastDirection = 0;
let tgtDirection = 0;
let time = 0;
let missilesEvaded = 0;
let highScore = 0;
let player;
let missile;
let objects;
let withinBounds = false;
let tipPreference;

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
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', function (event) {
  if (event.key == "m") {
    isTouchOnly = !isTouchOnly;
    determineMobile();
    loseGame();
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
  let interceptTime = distance / (objects[1].v + closure);
  let target = tgtDirection + angularVelocity * interceptTime;
  if (/*closure < 1 && closure > -1*/ false) {
    objects[1].turnrate = 0;
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
  player.yCoordinate = canvas.height / 2;
  player.xCoordinate = canvas.width / 2;
  player.velocity = 0.01;
  player.atAngle = 0;
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
  console.log('Tip preference retreived [',tipPreference,']')
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


function outOfBounds() {
  const boundDistance = 100;

  // virtualDistance was aadded because average speed is 5px/s (hence multiplication by 5)

  if (player.xCoordinate > (canvas.width - boundDistance)) {
    let playerDistance = canvas.width - player.xCoordinate;
    let virtualDistance = playerDistance;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } else if (player.xCoordinate < boundDistance) {
    let playerDistance = player.xCoordinate;
    let virtualDistance = playerDistance;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } else if (player.yCoordinate > (canvas.height - boundDistance)) {
    let playerDistance = canvas.height - player.yCoordinate;
    let virtualDistance = playerDistance;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } else if (player.yCoordinate < boundDistance) {
    let playerDistance = player.yCoordinate;
    let virtualDistance = playerDistance;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;
  }
}

function rebound() {
  findSideClosest()
  if (withinBounds == true) {
    if (sideClosest == 'left' || sideClosest == 'right') {
      player.atAngle = Math.PI - player.atAngle;
    } else if (sideClosest == 'top' || sideClosest == 'bottom') {
      player.atAngle = -player.atAngle;
    }
    player.velocity = player.velocity / 4;
  }
}

function findSideClosest() { 
  let distanceLeft = player.xCoordinate;
  let distanceRight = canvas.width - player.xCoordinate;
  let distanceBottom = player.yCoordinate;
  let distanceTop = canvas.height - player.yCoordinate; 

  let closestToSideCheck = Math.min(distanceLeft, distanceRight, distanceTop, distanceBottom);

  if (closestToSideCheck == distanceLeft) {
    sideClosest = 'left';
  } else if (closestToSideCheck == distanceRight) {
    sideClosest = 'right';
  } else if (closestToSideCheck == distanceTop) {
    sideClosest = 'top';
  } else if (closestToSideCheck == distanceBottom)
    sideClosest = 'bottom';

  return sideClosest;
}

function detectRebound() {
  const reboundSize = 5;

  let playerX = parseInt(player.xCoordinate);
  let playerY = parseInt(player.yCoordinate);

  if ((canvas.height - reboundSize) <= playerY || (canvas.width - reboundSize) <= playerX || playerX <= reboundSize || playerY <= reboundSize) {
    rebound()
    withinBounds = true;
  } else {
    withinBounds = false;
  }
}

function retreiveHighScore() {
    try {
      highScore = parseInt(localStorage.getItem("highScore")) || 0;
  } catch (error) {
    console.error('Error retreiving highScore:', error);
  }
  console.log('Highscore retreived [',highScore,']')
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

function resetGame() {
  missile.xCoordinate = -200;
  missile.yCoordinate = (canvas.height / 2);
  missile.atAngle = 0;
  missile.velocity = 0.01;
  time = 0;
  keys.forEach(key => {
  key = false;
  });
  updateHighScore();
  missileCounter.innerText = `Missiles Evaded: ${missilesEvaded}`;
  highScoreCounter.innerText = `Highscore: ${highScore}`;
}

function update() {
  if (keys && (keys[40] || keys[83])) { player.velocity *= 0.95; }
  if (keys && (keys[38] || keys[87])) { player.velocity += 0.05; }
  if (keys && (keys[37] || keys[65])) { player.turnrate = -1; }
  if (keys && (keys[39] || keys[68])) { player.turnrate = 1; }
  missile.velocityRamp = time;
  missileGuide();
  for (let obj of objects) {
    //obj.theta %= (2 * Math.PI);
    obj.xCoordinate += obj.velocity * Math.cos(obj.atAngle);
    obj.yCoordinate += obj.velocity * Math.sin(obj.atAngle);
  }
}

function render() {
  //if(50 > objects[0].x || (canvas.width - 50) < objects[0].x) {ctx.scale((Math.abs(objects[0].v * Math.cos(objects[0].theta)), 0))}
  //if(50 > objects[0].y || (canvas.height - 50) < objects[0].y) {ctx.scale(0, Math.abs((objects[0].v * Math.sin(objects[0].theta))))}
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let obj of objects) {
    ctx.save();
    ctx.translate(obj.xCoordinate, obj.yCoordinate);
    ctx.rotate(obj.atAngle);
    ctx.fillStyle = obj.background;
    ctx.fillRect((obj.width / -2), (obj.height / -2), obj.width, obj.height);
    ctx.restore();
  }
}

function gameLoop() {
  update();
  render();
  detectRebound();
  requestAnimationFrame(gameLoop);
  time++;
  if (missile.velocity < 0) { winGame(); }
}

window.addEventListener("DOMContentLoaded", function () {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  missileCounter = document.getElementById('evasion');
  highScoreCounter = document.getElementById('highscore');
  isTouchOnly = window.matchMedia("(hover: none)").matches;
  determineMobile();
  resizeCanvas();
  retreiveTipPreference();
  retreiveHighScore();
  highScoreCounter.innerText = `Highscore: ${highScore}`;

  player = {
    xCoordinate: canvas.width / 2,
    yCoordinate: canvas.height / 2,
    width: 100,
    height: 50,
    background: 'grey',
    velocity: 1,
    atAngle: 0,
    set turnrate(sign) {
      this.atAngle += sign * 0.05 * Math.exp(-((3 * this.velocity -13.6) ** 2) / 50); // Gaussian math for turnrate
      this.velocity *= 0.984375; // 0.984375 = 63/64, friction constant
    }
  };

  missile = {
    xCoordinate: 20,
    yCoordinate: canvas.height / 2,
    width: 30,
    height: 5,
    background: 'white',
    velocity: 0.01,
    atAngle: 0,
    set velocityRamp(time) {
      this.velocity += Math.exp(-((time -1) ** 4) + (2 * (time -1)) + 1) - 0.015625; // 0.015625 = 1/64, offset constant
    },
    set turnrate(command) {  //
      this.atAngle += command * 0.0625 * Math.exp(-((8 * this.velocity - 64) ** 2) / 128);
      this.velocity *= (0.984375 ** Math.abs(command));
    }
  };

  objects = [player, missile];

  gameLoop();

  })
