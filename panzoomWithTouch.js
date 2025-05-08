function PanZoom(selector, opts) {
  let panZoomEles = []
  opts = opts || {};
  let minScale = opts.minScale || 0.1;
  let maxScale = opts.maxScale || 5;
  let increment = opts.increment || 0.05;
  let liner = opts.liner || false;

  document.querySelectorAll(selector).forEach(function (ele) {
    panZoomEles.push(new AttachPanZoom(ele, minScale, maxScale, increment, liner));
  });

  return panZoomEles.length === 1 ? panZoomEles[0] : panZoomEles;
}

function AttachPanZoom(ele, minScale, maxScale, increment, liner) {
  this.increment = increment;
  this.minScale = minScale;
  this.maxScale = maxScale;
  this.liner = liner;
  this.panning = false;
  this.oldX = this.oldY = 0;
  let self = this;

  ele.style.transform = "matrix(1, 0, 0, 1, 0, 0)";

  this.getTransformMatrix = function () {
    let trans = ele.style.transform;
    let matrix = trans.slice(trans.indexOf("(") + 1, trans.indexOf(")")).split(",");
    return {
      scale: +matrix[0],
      transX: +matrix[4],
      transY: +matrix[5]
    };
  }

  this.setTransformMatrix = function (o) {
    ele.style.transform = `matrix(${o.scale}, 0, 0, ${o.scale}, ${o.transX}, ${o.transY})`;
  }

  this.applyTranslate = function (dx, dy) {
    let newTrans = this.getTransformMatrix();
    newTrans.transX += dx;
    newTrans.transY += dy;
    this.setTransformMatrix(newTrans);
  }

  this.applyScale = function (dscale, x, y) {
    let newTrans = this.getTransformMatrix();
    let width = ele.width || ele.offsetWidth;
    let height = ele.height || ele.offsetHeight;

    let tranX = x - (width / 2);
    let tranY = y - (height / 2);
    dscale = this.liner ? dscale : dscale * newTrans.scale;

    newTrans.scale += dscale;
    const hitLimit = newTrans.scale <= this.minScale || newTrans.scale >= this.maxScale;

    if (newTrans.scale < this.minScale) newTrans.scale = this.minScale;
    if (newTrans.scale > this.maxScale) newTrans.scale = this.maxScale;

    if (!hitLimit) {
      let centEl = getCenterElement().centerEl;
      let cendElRect = centEl.getBoundingClientRect();

      if (cendElRect.right === 0) {
        centEl = centEl.parentElement;
        cendElRect = centEl.getBoundingClientRect();
      }

      let cendPos = { x: cendElRect.left, y: cendElRect.top };
      this.applyTranslate(tranX, tranY);
      this.setTransformMatrix(newTrans);

      cendElRect = centEl.getBoundingClientRect();
      let diffX = cendPos.x - cendElRect.left;
      let diffY = cendPos.y - cendElRect.top;
      this.applyTranslate(diffX, diffY);
    }
  }

  // Mouse Events
  ele.addEventListener("mousedown", function (e) {
    e.preventDefault();
    this.panning = true;
    this.oldX = e.clientX;
    this.oldY = e.clientY;
  });

  ele.addEventListener("mouseup", function () { this.panning = false; });
  ele.addEventListener("mouseleave", function () { this.panning = false; });

  ele.addEventListener("mousemove", function (e) {
    if (this.panning) {
      let deltaX = e.clientX - this.oldX;
      let deltaY = e.clientY - this.oldY;
      self.applyTranslate(deltaX, deltaY);
      this.oldX = e.clientX;
      this.oldY = e.clientY;
    }
  });

  // Touch Events
  ele.addEventListener("touchstart", function (e) {
    if (e.touches.length === 1) {
      e.preventDefault();
      this.panning = true;
      this.oldX = e.touches[0].clientX;
      this.oldY = e.touches[0].clientY;
    }
  });

  ele.addEventListener("touchmove", function (e) {
    if (this.panning && e.touches.length === 1) {
      e.preventDefault();
      let touch = e.touches[0];
      let deltaX = touch.clientX - this.oldX;
      let deltaY = touch.clientY - this.oldY;
      self.applyTranslate(deltaX, deltaY);
      this.oldX = touch.clientX;
      this.oldY = touch.clientY;
    }
  });

  ele.addEventListener("touchend", function () { this.panning = false; });
  ele.addEventListener("touchcancel", function () { this.panning = false; });

  // Scroll Zoom
  this.getScrollDirection = function (e) {
    let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    self.applyScale(delta < 0 ? -self.increment : self.increment, e.offsetX, e.offsetY);
  }

  ele.addEventListener('DOMMouseScroll', this.getScrollDirection, false);
  ele.addEventListener('mousewheel', this.getScrollDirection, false);
}

// Helper function (preserved from original)
function getTransformScale(isPopup, currentScale) {
  let tScale = 1;
  try {
    let transform = document.getElementById("panzoom_container").style.transform;
    let matrix = transform.slice(transform.indexOf("(") + 1, transform.indexOf(")")).split(",");
    if (matrix[4] === " 0") {
      tScale = currentScale;
    } else {
      tScale = matrix[0] * 1 > 1 ? 1 : matrix[0];
    }
  } catch (error) {
    console.log("getTransformScale matrix error: " + error);
  }
  return tScale;
}
