const baseTimelineUrl_Main =  'https://www.tiki-toki.com/timeline/embed/';
const rootTimeline = "2138285/2648138406/";


window.onload = function () {
    // Here is how you would call the libary
    PanZoom(".panzoom");
}

localStorage.setItem('selectedOrgItem', null);

google.charts.load('current', { packages: ["orgchart"] });
google.charts.setOnLoadCallback(drawChart);

// popup test //document.getElementById("tree-popup").classList.add("hide-popup")

document.addEventListener('DOMContentLoaded', function () {
    console.log("parent document ready");
    window.addEventListener('message',
        (event) => {
            console.log("someone's calling the parent method with event data " + JSON.stringify(event.data));
            if (event.data.from === 'org-chart' && event.data.url) {
                redirectTimelineiFrame(event.data.url)
            }
        },
        false
    );

    const iframe = document.getElementById('tl-timeline-iframe');
    //const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    iframe.addEventListener('load', () => {
        console.log('iFrame loaded');
    });

    iframe.onload = function () {
        if (document.getElementById("orgchart-container").innerHTML.length > 500){
            initChartPopup(true);
        }
        else{
            setTimeout(() => {
                initChartPopup(true);
            }, 250);
        }
        console.log('Iframe content loaded or reloaded');
    };


    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectedTimeline = decodeURI(urlParams.get('newtimeline'));
        //const redirectedTimeline = HttpContext.Current.Request.QueryString("newtimeline")
        if (redirectedTimeline && redirectedTimeline != "null") {
            urlParams.delete("redirectedTimeline");
            console.log('redirectedTimeline: ' + decodeURI(redirectedTimeline));
            redirectiFrames(baseTimelineUrl + redirectedTimeline, redirectedTimeline);
        }
        else {
            redirectiFrames(baseTimelineUrl_Main + rootTimeline, rootTimeline);
        }
         
    }, 250);
 }, false);




async function drawChart() {
    let fName = "https://cdn.jsdelivr.net/gh/ReuvenT/family_history@latest/data/familytreedata.csv"; // Updated data source

    const response = await fetch(fName);
    const data = await response.text();

    if (response.status > 200) {
        document.getElementById("err_msg").innerHTML = data;
        return; // Stop execution if the file failed to load
    }

    var renderedTable = prepChartTable(data, new google.visualization.DataTable());

    // Create the chart.
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

    google.visualization.events.addListener(chart, 'select', treeSelectHandler);

    var drawOptions = { allowHtml: true, allowCollapse: true, tooltip: { isHtml: true } };

    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(renderedTable, drawOptions);

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

function redirectTimelineiFrame(newUrl) {
    console.log("Redirecting timeline iframe to: " + newUrl);

    let iframe = document.getElementById('tl-timeline-iframe');

    // Force iframe to reset before setting the new URL
    iframe.src = "about:blank";  // This clears the iframe content first

    setTimeout(() => {
        iframe.src = newUrl;
        console.log("New iframe source set: " + iframe.src);
    }, 300); // Small delay ensures correct update
}

function handleViewChoiceClick(viewChoice, setChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setChecked: ' + setChecked)
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        moveOrgChart(document.getElementById("tree_container"), true, 1)
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
            ocEle.classList.remove("fullScreen");
            tlFrame.classList.add("fullScreen");
            tlFrame.style.display = "block";
            pu.style.display = "inline";
            if (setChecked) {
                radiobtn = document.getElementById("view-timeline");
                radiobtn.checked = true;
            }
            initChartPopup(true);
        }
}

