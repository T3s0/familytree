function PanZoom() {
    let ele = document.getElementById("panzoom_container");
    return new AttachPanZoom(ele, 0.1, 5, 0.05, false);
}

function AttachPanZoom(ele, minScale, maxScale, increment, liner) {
    this.increment = increment;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.liner = liner;
    this.panning = false;
    this.oldX = this.oldY = 0;
    this.touchDistance = 0;
    this.currentScale = 1;
    let self = this;

    ele.style.transform = "matrix(1, 0, 0, 1, 0, 0)";

    this.getTransformMatrix = function () {
        let trans = ele.style.transform;
        let start = trans.indexOf("(") + 1;
        let end = trans.indexOf(")");
        let matrix = trans.slice(start, end).split(",");
        return {
            "scale": +matrix[0],
            "transX": +matrix[4],
            "transY": +matrix[5]
        };
    };

    this.setTransformMatrix = function (o) {
        let matrix = `matrix(${o.scale}, 0, 0, ${o.scale}, ${o.transX}, ${o.transY})`;
        ele.style.transform = matrix;
        this.currentScale = o.scale;
        console.log("setTransformMatrix ->", matrix);
    };

    this.applyTranslate = function (dx, dy) {
        let newTrans = this.getTransformMatrix();
        newTrans.transX += dx;
        newTrans.transY += dy;
        console.log("applyTranslate -> dx:", dx, "dy:", dy);
        this.setTransformMatrix(newTrans);
    };

    this.applyScale = function (dscale, x, y) {
        let newTrans = this.getTransformMatrix();
        let width = ele.offsetWidth;
        let height = ele.offsetHeight;
        let tranX = x - (width / 2);
        let tranY = y - (height / 2);
        dscale = this.liner ? dscale : dscale * newTrans.scale;

        newTrans.scale += dscale;
        if (newTrans.scale < this.minScale) newTrans.scale = this.minScale;
        if (newTrans.scale > this.maxScale) newTrans.scale = this.maxScale;

        console.log("applyScale -> dscale:", dscale, "center:", x, y);

        this.applyTranslate(tranX, tranY);
        this.setTransformMatrix(newTrans);
        this.applyTranslate(-tranX, -tranY);
    };

    ele.addEventListener("mousedown", function (e) {
        e.preventDefault();
        self.touchDistance = 0;
        self.panning = true;
        self.oldX = e.clientX;
        self.oldY = e.clientY;
        console.log("mousedown");
    });

    ele.addEventListener("mouseup", function () {
        self.panning = false;
        console.log("mouseup");
    });

    ele.addEventListener("mouseleave", function () {
        self.panning = false;
        console.log("mouseleave");
    });

    ele.addEventListener("mousemove", function (e) {
        if (self.panning) {
            let deltaX = e.clientX - self.oldX;
            let deltaY = e.clientY - self.oldY;
            self.applyTranslate(deltaX, deltaY);
            self.oldX = e.clientX;
            self.oldY = e.clientY;
        }
    });

    ele.addEventListener("touchstart", function (e) {
        e.preventDefault();
        if (e.touches.length >= 2) {
            self.touchDistance = getDistance(e.touches);
            self.panning = false;
            console.log("touchstart -> pinch start, distance:", self.touchDistance);
        } else {
            self.panning = true;
            self.oldX = e.touches[0].clientX;
            self.oldY = e.touches[0].clientY;
            console.log("touchstart -> pan start");
        }
    });

    ele.addEventListener("touchmove", function (e) {
        if (e.touches.length >= 2) {
            e.preventDefault();
            let newDistance = getDistance(e.touches);
            let delta = newDistance - self.touchDistance;
            let scaleFactor = delta * 0.005;
            let centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            let centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            console.log("touchmove -> pinch zoom, scaleFactor:", scaleFactor);
            self.applyScale(scaleFactor, centerX, centerY);
            self.touchDistance = newDistance;
        } else if (self.panning) {
            let deltaX = e.touches[0].clientX - self.oldX;
            let deltaY = e.touches[0].clientY - self.oldY;
            self.applyTranslate(deltaX, deltaY);
            self.oldX = e.touches[0].clientX;
            self.oldY = e.touches[0].clientY;
            console.log("touchmove -> panning");
        }
    });

    ele.addEventListener("touchend", function () {
        self.panning = false;
        self.touchDistance = 0;
        console.log("touchend");
    });

    ele.addEventListener("touchcancel", function () {
        self.panning = false;
        self.touchDistance = 0;
        console.log("touchcancel");
    });

    this.getScrollDirection = function (e) {
        let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
        let x = e.offsetX || (e.clientX - ele.getBoundingClientRect().left);
        let y = e.offsetY || (e.clientY - ele.getBoundingClientRect().top);
        console.log("scroll -> delta:", delta, "at", x, y);
        self.applyScale(delta < 0 ? -self.increment : self.increment, x, y);
    };

    ele.addEventListener("wheel", this.getScrollDirection, { passive: false });
    ele.addEventListener("mousewheel", this.getScrollDirection, false);
    ele.addEventListener("DOMMouseScroll", this.getScrollDirection, false);
}

function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTransformScale(isPopup, currentScale) {
    let tScale = 1;
    try {
        let transform = document.getElementById("panzoom_container").style.transform;
        let matrix = transform.slice(transform.indexOf("(") + 1, transform.indexOf(")")).split(",");
        if (matrix[4] == " 0") {
            tScale = currentScale;
        } else {
            tScale = matrix[0] * 1 > 1 ? 1 : matrix[0];
        }
    } catch (error) {
        console.log("getTransformScale matrix error:", error);
    }
    return tScale;
}
