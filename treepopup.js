let popup = document.getElementById("tree-popup");
//const popupStateItem = localStorage.getItem("treePopupState");
var r = document.getElementById('resizer');
r.addEventListener('mousedown', initDrag, false);

let popupState = {
  shown: false,
  left: 0,
  top: 0,
  height: 0,
  width: 0,
  scale: '1'
};

// restore previous popup state
function initChartPopup(callOpenPopup) {
  let popupStateItem = localStorage.getItem("treePopupState");
  if (popupStateItem != '[object Object]' && (typeof popupStateItem === 'string' || popupStateItem instanceof String)) {
    let popupState = JSON.parse(popupStateItem);
    if (popupState) {
      console.log("initChartPopup callOpenPopup, popupState: " + callOpenPopup + ", " + JSON.stringify(popupState));
      popup.style.top = (popupState.top) + "px";
      popup.style.left = (popupState.left) + "px";
      popup.style.width = (popupState.width) + "px";
      popup.style.height = (popupState.height) + "px";
      if (callOpenPopup && popupState && popupState.shown) {
        let matrix = 'matrix(' + popup.style.scale + ', 0, 0, ' + popup.style.scale + ', 0, 0)';
        //document.getElementById("panzoom_container").style.transform = matrix;
        openOrgChartPopup();
      }
    }
  }
}

 function getTransformScale() {
  let tScale = 1;
  try {
    transform = document.getElementById("panzoom_container").style.transform;
    console.log("getTransformScale transform: " + JSON.stringify(transform));
     let start = transform.indexOf("(") + 1;
    let end = transform.indexOf(")");
    let matrix = transform.slice(start, end).split(",");
     tScale =  +matrix[0]; 
   } catch (error) {
     console.log("getTransformScale matrix error: " + error);
   }
   return tScale;
 }

// restore previous popup state
function captureAndSaveChartPopupState(shownFlag) {
  var pState;
  let rect = popup.getBoundingClientRect();
  if (rect.width > 30 && rect.height > 50) {
    pState = { shown: shownFlag, left: rect.left, top: rect.top, height: rect.height, width: rect.width, scale: getTransformScale() };
  }
  else{
    // container is no longer available use values in localstorage
    let popupStateItem = localStorage.getItem("treePopupState");
    if (popupStateItem != '[object Object]' && (typeof popupStateItem === 'string' || popupStateItem instanceof String)) {
      pState = JSON.parse(popupStateItem);
      pState.scale = getTransformScale();
      pState.shown = shownFlag;
    }
  }
  // safeguards:
  if (pState.left < 1) {
    pState.left = 1;
  }
  if (pState.top < 1) {
    pState.top = 1;
  }
  if (pState.width < 300) {
    pState.width = 300;
  }
  if (pState.height < 150) {
    pState.height = 150;
  }

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
  initChartPopup(false);
  radiobtn = document.getElementById("view-timeline");
  //let tpTarget = document.getElementById("popup-content-target");
  let ocEle = document.getElementById("orgchart-container");
  //let ocSource = document.getElementById("tree_container"); //.firstChild;
  if (radiobtn.checked) {
    console.log('openOrgChartPopup radiobtn.checked: ' + radiobtn.checked)
    captureAndSaveChartPopupState(true);
    ocEle.style.display = "block";
    popup.style.display = "block";
    moveOrgChart(document.getElementById("popup-content-target"), false, 1) 
    // try {

    //   //let tpSource = document.getElementById("popup-content-target");
    //   //let ocTarget = document.getElementById("tree_container");
    //   if (ocSource.innerHTML.length > 1000){
    //       console.log('openOrgChartPopup moving to popup');
    //       ocSource.appendChild(tpTarget.firstElementChild);
    //   }




    //   let fragment = document.createDocumentFragment();
    //   fragment.appendChild(ocSource);
    //   // Append fragment to desired element:
    //   tpTarget.appendChild(fragment);
    //   //tpTarget.appendChild(ocSource.firstElementChild);
    // } catch (error) {
    //   console.log(error);
    // }
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
    // } else {
    //   /* otherwise, move the DIV from anywhere inside the DIV:*/
    //   elmnt.onmousedown = dragMouseDown;
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
