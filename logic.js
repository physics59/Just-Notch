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
let sideFacing;
let sideClosest;

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

 // Redundant function, might use later for escaping outOfBounds()

function findSideClosest() { 
  let distanceLeft = player.xCoordinate;
  let distanceRight = canvas.width - player.xCoordinate;
  let distanceBottom = player.yCoordinate;
  let distanceTop = canvas.height - player.yCoordinate; 

  // Couldn't get these to work usefully, might want to consider later
  let closestToX = Math.min(distanceLeft, distanceRight);
  let closestToY = Math.min(distanceTop, distanceBottom);

  if (distanceBottom <= (canvas.width / 2)) {
    sideClosest = 'bottom';
  } else if (distanceBottom > (canvas.width / 2)) {
    sideClosest = 'top';
  }

  if (distanceLeft <= (canvas.width / 2)) {
    sideClosest = 'left';
  } else if (distanceLeft > (canvas.width / 2)) {
    sideClosest = 'right';
  }

  return sideClosest;
}

function findSideFacing() {  // Also redundant, might use later for escaping outOfBounds()
  let sideFacing;
  if (player.atAngle <= 180) {
    sideFacing = bottom;
  } elif (player.atAngle > 180) {
    sideFacing = top;
  }
}

function escapeBounds() {
  // Need to work on this
}

function outOfBounds() {
  const boundDistance = 100;

  // virtualDistance was aadded because average speed is 5px/s (hence multiplication by 5)

  if (player.xCoordinate > (canvas.width - boundDistance)) {
    let playerDistance = canvas.width - player.xCoordinate;
    let virtualDistance = playerDistance * 5;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } elif (player.xCoordinate < boundDistance) {
    let playerDistance = player.xCoordinate;
    let virtualDistance = playerDistance * 5;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } elif (player.yCoordinate > (canvas.height - boundDistance)) {
    let playerDistance = canvas.height - player.yCoordinate;
    let virtualDistance = playerDistance * 5;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;

  } elif (player.yCoordinate < boundDistance) {
    let playerDistance = player.yCoordinate;
    let virtualDistance = playerDistance * 5;
    let speedScale = virtualDistance / boundDistance;
    player.velocity = speedScale * player.velocity;
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
    console.log('');
  }
}

function gameLoop() {
  update();
  render();
  outOfBounds();
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
