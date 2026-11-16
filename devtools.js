let tipPreference;

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
  text.innerHTML = `Are you sure you don't want to see this tip again? <button type="button" class="cancel cancel-confirm" onclick="saveTipPreference()">Yes</button>
   <a class="permaDismiss" onclick="revertChanges()">No</a>`;
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
