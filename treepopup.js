let popup = document.getElementById("tree-popup");
//const popupStateItem = localStorage.getItem("treePopupState");
var r = document.getElementById('resizer');
r.addEventListener('mousedown', initDrag, false);



// restore previous popup state
function xinitChartPopup(callOpenPopup) {
  let popupState = getChartViewState();
  console.log("initChartPopup callOpenPopup: " + callOpenPopup + ", popupState: " + JSON.stringify(popupState));
  popup.style.top = (popupState.top) + "px";
  popup.style.left = (popupState.left) + "px";
  popup.style.width = (popupState.width) + "px";
  popup.style.height = (popupState.height) + "px";
  if (callOpenPopup && popupState.popUpShown) {
    let matrix = 'matrix(' + popup.style.popupScale + ', 0, 0, ' + popup.style.popupScale + ', 0, 0)';
    document.getElementById("panzoom_container").style.transform = matrix;
    openOrgChartPopup();
  }
  popupState.popUpShown = callOpenPopup;
  setChartViewState(popupState)
}

function captureAndSaveChartPopupState(shownFlag) {
  var pState;
  
  if (typeof popup !== 'undefined' && popup && popup.getBoundingClientRect) {
    let rect = popup.getBoundingClientRect();
    if (rect.width > 30 && rect.height > 50) {
      pState = {
        shown: shownFlag,
        left: rect.left,
        top: rect.top,
        height: rect.height,
        width: rect.width,
        scale: getTransformScale()
      };
    }
  }

  // If popup state was not defined from DOM, try getting from localStorage
  if (!pState) {
    let popupStateItem = localStorage.getItem("treePopupState");
    try {
      if (
        popupStateItem &&
        popupStateItem !== '[object Object]' &&
        (typeof popupStateItem === 'string' || popupStateItem instanceof String)
      ) {
        pState = JSON.parse(popupStateItem);
        pState.scale = getTransformScale();
        pState.shown = shownFlag;
      }
    } catch (e) {
      console.warn("Failed to parse popup state from localStorage", e);
    }
  }

  // If still no valid state, set default safe values
  if (!pState) {
    pState = {
      shown: shownFlag,
      left: 1,
      top: 1,
      height: 300,
      width: 300,
      scale: 1
    };
  }

  // Final safeguards
  if (pState.left < 1) pState.left = 1;
  if (pState.top < 1) pState.top = 1;
  if (pState.width < 300) pState.width = 300;
  if (pState.height < 150) pState.height = 150;

  console.log("captureChartPopupState popupState: " + JSON.stringify(pState));
  localStorage.setItem("treePopupState", JSON.stringify(pState));
}


function toggleOrgChartPopup() {
  if (popup.style.display == "none") {
    openOrgChartPopup();
  }
  else {
    closeChartPopup();
  }
}

function closeChartPopup() {
  popup.style.display = "none";
  console.log("closeChartPopup");
  captureAndSaveChartPopupState(false);
}

function openOrgChartPopup() {
  let popupState = getChartViewState();
  console.log("openOrgChartPopup popupState: " + JSON.stringify(popupState));
  popupState.popUpShown = true;
  setChartViewState(popupState);
  popup.style.top = (popupState.top) + "px";
  popup.style.left = (popupState.left) + "px";
  popup.style.width = (popupState.width) + "px";
  popup.style.height = (popupState.height) + "px";
  let matrix = 'matrix(' + popup.style.popupScale + ', 0, 0, ' + popup.style.popupScale + ', 0, 0)';
  document.getElementById("panzoom_container").style.transform = matrix;
  radiobtn = document.getElementById("view-timeline");
  let ocEle = document.getElementById("orgchart-container");
  if (radiobtn.checked) {
    //console.log('openOrgChartPopup radiobtn.checked: ' + radiobtn.checked)
    ocEle.style.display = "block";
    popup.style.display = "block";
    moveOrgChart(false) ;
  }
}


var startX, startY, startWidth, startHeight;

function initDrag(e) {
  console.log("init drag");
  startX = e.clientX;
  startY = e.clientY;
  startWidth = parseInt(document.defaultView.getComputedStyle(popup).width, 10);
  startHeight = parseInt(document.defaultView.getComputedStyle(popup).height, 10);
  popup.addEventListener('mousemove', doResizePopup, false);
  popup.addEventListener('mouseup', stopResizePopup, false);
}

function doResizePopup(e) {
  console.log("do drag");
  popup.style.width = (startWidth + e.clientX - startX) + 'px';
  popup.style.height = (startHeight + e.clientY - startY) + 'px';
}

function stopResizePopup(e) {
  popup.removeEventListener('mousemove', doResizePopup, false);
  popup.removeEventListener('mouseup', stopResizePopup, false);
  captureAndSaveChartPopupState(true);
  console.log("stop drag state");
}

dragElement(popup);

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
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
    captureAndSaveChartPopupState(true);
    console.log("closeDragElement");

  }
}
