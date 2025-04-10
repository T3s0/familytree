const baseiFrameSrc = 'https://www.tiki-toki.com/timeline/embed/';
const rootTimeline = "2138285/2648138406/";


window.onload = function () {
    // Here is how you would call the libary
    PanZoom(".panzoom");
}

google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);

// popup test //document.getElementById("tree-popup").classList.add("hide-popup")

document.addEventListener('DOMContentLoaded', function () {
    console.log("parent document ready");
    const iframe = document.getElementById('tl-timeline-iframe');

    iframe.addEventListener('load', () => {
        console.log('iFrame loaded');
    });

    iframe.onload = function () {
        console.log('Iframe content loaded or reloaded');
    };


    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedTimeline = decodeURI(urlParams.get('newtimeline'));
        var displayPopup = false;
        var storedSelection = getChartViewState();
        if (redirectedTimeline && redirectedTimeline != "null") {
            urlParams.delete("redirectedTimeline");
            console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
            storedSelection.timelineId = redirectedTimeline;
        }
        else {
            console.log("default launch " + storedSelection.row + " with timelineId " + storedSelection.timelineId);
        }
        if (storedSelection.row >= 0){
            storedSelection.isSelected = true;
            if (storedSelection.popUpShown ){
                displayPopup = true;
                storedSelection.popUpShown = false;
            }
        }
        setChartViewState(storedSelection);
        redirectiFrames(baseiFrameSrc + storedSelection.timelineId, storedSelection.timelineId);

        // restore popup if needed
        if (showPopup){
            setTimeout((row) => {
                showNode(document.querySelector('[data-row="' + (row) + '"]'), false, true)
            }, 250, storedSelection.row);
        }
    }, 250);

}, false);

    async function drawChart() {
        let fName = "https://cdn.jsdelivr.net/gh/ReuvenT/family_history/data/familytreedata.csv";
        const response = await fetch(fName);
        const data = await response.text();

        if (response.status > 200) {
            document.getElementById("err_msg").innerHTML = data;
            //alert ("failed to load tree data from " + fName);
        }

        var renderedTable = prepChartTable(data, new google.visualization.DataTable())

        // Create the chart.
        chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

        google.visualization.events.addListener(chart, 'select', treeSelectHandler);

        var drawOptions = { allowHtml: true, allowCollapse: true, tooltip: { isHtml: true } };

        // Draw the chart, setting the allowHtml option to true for the tooltips.
        chart.draw(renderedTable, drawOptions);
        
        var storedSelection = getChartViewState();
        if (storedSelection.row >= 0 && storedSelection.isSelected ){
            selectChartItem(storedSelection.row);
            if (storedSelection.popUpShown ){
                selectChartItem(storedSelection.row);
                showNode(document.querySelector('[data-row="' + (storedSelection.row) + '"]'), false, true)
            }
        }

        console.log('chart drawn');
    }

if (window.postMessage) {
    var tlMouseupFunc = function () {
        var tlFrame = document.getElementById("tl-timeline-iframe");
        if (tlFrame.contentWindow && tlFrame.contentWindow.postMessage) {
            tlFrame.contentWindow.postMessage("mouseup", "*");
        }
    }
    if (typeof window.addEventListener != "undefined") {
        window.addEventListener("mouseup", tlMouseupFunc, false);
    }
    else if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onmouseup", tlMouseupFunc);
    }
}

function redirectiFrames(timeframeUrl, orgChartElId) {
    let timelineId = extractTimelineIdFromURL(timeframeUrl);
    redirectTimelineiFrame(timelineId);
    if (document.getElementById(orgChartElId)) {
        let currRow = document.getElementById(orgChartElId).getAttribute("data-row");
        console.log('redirectiFrames orgChartElId: data-row: ' + orgChartElId + ": " + currRow);
        selectChartItem(currRow);
        let cState = getChartViewState();;
        cState.row = currRow;
        cState.isSelected = true;
        cState.timelineId = timelineId;
        setChartViewState(cState);
        //captureAndSaveCurrentNodeState();
        handleViewChoiceClick("view-timeline", true);
    }
}

function extractTimelineIdFromURL(fullURL) {
    // eg https://www.tiki-toki.com/timeline/embed/2139216/5281753800/ ==> 2139216/5281753800/
    let start = fullURL.indexOf("embed/");
    if (start < 10) {
        return fullURL;
    }
    else {
        return fullURL.substring(start + 6);
    }
}

function redirectTimelineiFrame(newtimelineId) {
    // set timeline target
    newtimelineId = timelineEmbedBasetimelineId + newtimelineId;
    document.getElementById('tl-timeline-iframe').src = newtimelineId;
    handleViewChoiceClick("view-timeline", true);
}

function getChartViewState() {
    let cState = localStorage.getItem('chartViewState');
    if (cState != '[object Object]' && (typeof cState === 'string' || cState instanceof String)) {
        cState.row = parseInt(cState.row)
        return JSON.parse(cState);
    }
    else {
        return {
            "row": -1,
            "isSelected": false,
            "timelineId": null,
            "top": "80px",
            "left": "130px",
            "width": "350px",
            "height": "380px",
            "popUpShown": false,
            "popupScale": 1,
            "fullScale": 1
        }
    }
}

function setChartViewState(objChartViewState) {
    objChartViewState.row = parseInt(objChartViewState.row)
    // safeguards:
    if (objChartViewState.left == undefined || objChartViewState.left < 1) {
        objChartViewState.left = 70;
    }
    if (objChartViewState.top == undefined || objChartViewState.top < 1) {
        objChartViewState.top = 100;
    }
    if (objChartViewState.width == undefined || objChartViewState.width < 300 || objChartViewState.width > 800) {
        objChartViewState.width = 400;
    }
    if (objChartViewState.height == undefined || objChartViewState.height < 150 || objChartViewState.height > 800) {
        objChartViewState.height = 750;
    }
    localStorage.setItem('chartViewState', JSON.stringify(objChartViewState));
}


function handleViewChoiceClick(viewChoice, setChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setChecked: ' + setChecked)
    //captureAndSaveCurrentNodeState();
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        moveOrgChart(true)
        ocEle.style.display = "block"; //orgchart-container
        ocEle.classList.add("fullScreen");
        pu.style.display = "none";
        tpEle.style.display = "none";
        if (setChecked) {
            radiobtn = document.getElementById("view-tree");
            radiobtn.checked = true;
        }

        // move chart back home if it was in the popup
        //moveOrgChart(document.getElementById("tree_container"), true, 1)
    }
    else if (viewChoice == "view-timeline") {
        //console.log('handleViewChoiceClick viewChoice: ' + viewChoice);
        ocEle.classList.remove("fullScreen");
        tlFrame.classList.add("fullScreen");
        tlFrame.style.display = "block";
        pu.style.display = "inline";
        if (setChecked) {
            radiobtn = document.getElementById("view-timeline");
            radiobtn.checked = true;
        }

        if (getChartViewState().popUpShown) {
            openOrgChartPopup();
        }
        console.log('handleViewChoiceClick viewChoice: ' + viewChoice);
    }
    // clear timeline menu if open
    let cbx = document.getElementById("tl-menu-cbx");
    if (cbx.checked) {
        cbx.checked = false;
    }

}
