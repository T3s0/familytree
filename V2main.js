const baseiFrameSrc = 'https://www.tiki-toki.com/timeline/embed/';
var rootTimeline = "2138285/2648138406/";   // can be overridden by value in root node in chart
// The Auth0 client, initialized in configureClient()
let auth0Client = null;
let isAuthenticated = false;

window.onload = async () => {
    await configureClient();
    await refreshLoginStatus();

    let chartNodes = prepChartTable(familyTreeSource, isAuthenticated)
    //let itemCount = (JSON.stringify(chartNodes).match(/\"id\":/g) || []).length;
    //let leafCount = (JSON.stringify(chartNodes).match(/isLeaf\":true/g) || []).length; // (JSON.stringify(result).match(/isLeaf\":true /g) || []).length;;
    //console.log("chartTable row count: " + itemCount + ", leaf count: " + leafCount);

    if (chartNodes.length) {
        let htmlTable = createTable(chartNodes[0], chartNodes[0].children.length, 0, isAuthenticated);
        let container = document.getElementById("chart_container");
        container.appendChild(htmlTable);

        let rootDiv = document.querySelectorAll("[data-parentId='root']")[0];
        rootTimeline = rootDiv.getAttribute('data-timelineid');
        var style = rootDiv.currentStyle || window.getComputedStyle(rootDiv);
        rootMarginDiff = 12; //style.marginTop;

        alignChildrenRows('root');
    }

    PanZoom(".panzoom");

}

document.addEventListener('DOMContentLoaded', function () {
    console.log("parent document ready");
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
            console.log("default launch " + storedSelection.currentId + " with timelineId " + storedSelection.timelineId);
            if (storedSelection.timelineId == null) {
                storedSelection.timelineId = "2138285/2648138406/";
            }
        }

        if (storedSelection.currentId) {
            if (storedSelection.isSelected) {
                nodeIdSetSelected(storedSelection.currentId);
            }
            if (storedSelection.showPopUp) {
                displayPopup = true;
                storedSelection.showPopUp = false;
            }
        }
        if (!storedSelection.timelineId) {
            storedSelection.timelineId = rootTimeline;
        }
        setChartViewState(storedSelection);
        redirectiFrames(baseiFrameSrc + storedSelection.timelineId, storedSelection.timelineId);

        // restore popup if needed
        setTimeout((id, isSelected) => {
            if (!isAuthenticated && storedSelection.timelineId != rootTimeline) {
                storedSelection.timelineId = rootTimeline;
                setChartViewState(storedSelection);
                redirectiFrames(baseiFrameSrc + storedSelection.timelineId, storedSelection.timelineId);
            }

            document.getElementById("tl-menu-bar").style.visibility = 'visible';
            document.getElementById("tl-select-view").style.visibility = 'visible';
            console.log("initializing, " + boundsDisplay(document.getElementById("chart_container").getBoundingClientRect()));
            //showNode(document.getElementById(id), true)
            if (displayPopup) {
                openOrgChartPopup();
                if (isSelected) {
                    nodeIdSetSelected(id);
                    showNode(document.getElementById(id), false);
                }
                else {
                    if (!id) {
                        id = "LOU_TRA";
                    }
                    showNode(document.getElementById(id), true);
                }
            }
            else {
                setTimeout((id, isSelected) => {
                    document.getElementById("orgchart-container").style.display = "block";
                    if (isSelected) {
                        nodeIdSetSelected(id);
                        showNode(document.getElementById(id), true);
                    }
                    else {
                        if (!id) {
                            id = "LOU_TRA";
                        }
                        showNode(document.getElementById(id), true);
                    }
                }, 1500, id, isSelected);
            }

        }, 500, storedSelection.currentId, storedSelection.isSelected);

    }, 250);

}, false);

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
    let auth0State = localStorage.getItem('auth0flag');
    if (auth0State == null) {
        console.log("configureClient (auth0) bypassed");
        document.getElementById("login_label").style.visibility = 'hidden';
        isAuthenticated = true;
        return;
    }
    console.log("configureClient (auth0) start");
    // const response = await fetchAuthConfig();
    // const config = await response.json();

    auth0Client = await auth0.createAuth0Client({
        domain: "dev-0wdjqy32gp3ia376.us.auth0.com", //config.domain,
        clientId: "cBmTOThE35AZ8R5uEsmiVKDop9Jgax7p" //config.clientId
    });
    console.log("configureClient null?" + (auth0Client == null));
};


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
    //captureAndSaveChartState();
    let timelineId = extractTimelineIdFromURL(timeframeUrl);
    redirectTimelineiFrame(timelineId);
    if (orgChartElId) {
        let chartNodeEl = document.getElementById(orgChartElId);
        if (chartNodeEl) {
            console.log('redirectiFrames orgChartElId: ' + orgChartElId);
            nodeClick(chartNodeEl, true);
            let cState = getChartViewState();
            cState.currentId = orgChartElId;
            cState.isSelected = true;
            cState.timelineId = timelineId;
            setChartViewState(cState);
            //captureAndSaveCurrentNodeState();
            handleViewChoiceClick("view-timeline", true);
        }
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
    newtimelineId = baseiFrameSrc + newtimelineId;
    document.getElementById('tl-timeline-iframe').src = newtimelineId;
    handleViewChoiceClick("view-timeline", true);
}

function getChartViewState() {
    let cState = localStorage.getItem('chartViewState');
    if (cState != '[object Object]' && (typeof cState === 'string' || cState instanceof String)) {
        return JSON.parse(cState);
    }
    else {
        return {
            "currentId": null,
            "isSelected": false,
            "timelineId": null,
            "top": 80,
            "left": 130,
            "width": 350,
            "height": 380,
            "showPopUp": false,
            "popupScale": 1,
            "fullScale": 1
        }
    }
}

function setChartViewState(objChartViewState) {
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
    objChartViewState.left = parseInt(objChartViewState.left);
    objChartViewState.top = parseInt(objChartViewState.top);
    objChartViewState.width = parseInt(objChartViewState.width);
    objChartViewState.height = parseInt(objChartViewState.height);
    localStorage.setItem('chartViewState', JSON.stringify(objChartViewState));
}


function handleViewChoiceClick(viewChoice, setChecked) {
    let tlFrame = document.getElementById("tl-timeline-iframe");
    let ocEle = document.getElementById("orgchart-container");
    let tpEle = document.getElementById("tree-popup");
    let pu = document.getElementById("tree-popup-btn");
    //console.log('handleViewChoiceClick to viewChoice: ' + viewChoice + ', setChecked: ' + setChecked)
    if (viewChoice == "view-tree") {
        tlFrame.classList.remove("fullScreen");
        tlFrame.style.display = "none";
        moveOrgChart(true)
        ocEle.style.display = "block"; //orgchart-container
        ocEle.style.removeProperty('height');
        ocEle.classList.add("fullScreen");
        pu.style.display = "none";
        tpEle.style.display = "none";
        if (setChecked) {
            radiobtn = document.getElementById("view-tree");
            radiobtn.checked = true;
        }
    }
    else if (viewChoice == "view-timeline") {
        captureAndSaveChartState();
        ocEle.classList.remove("fullScreen");
        tlFrame.classList.add("fullScreen");
        tlFrame.style.display = "block";
        pu.style.display = "inline";
        if (setChecked) {
            radiobtn = document.getElementById("view-timeline");
            radiobtn.checked = true;
        }

        if (getChartViewState().showPopUp) {
            openOrgChartPopup();
        }
    }
    // clear timeline menu if open
    let cbx = document.getElementById("tl-menu-cbx");
    if (cbx.checked) {
        cbx.checked = false;
    }
}

async function refreshLoginStatus() {
    const query = window.location.search;
    const shouldParseResult = query.includes("code=") && query.includes("state=");

    if (shouldParseResult) {
        console.log("> Parsing redirect");
        try {
            const result = await auth0Client.handleRedirectCallback();

            if (result.appState && result.appState.targetUrl) {
                showContentFromUrl(result.appState.targetUrl);
            }

            console.log("Logged in!");
        } catch (err) {
            console.log("Error parsing redirect:", err);
        }

        window.history.replaceState({}, document.title, "/");
    }
    let auth0State = localStorage.getItem('auth0flag');
    if (auth0State == null) {
        isAuthenticated = true;
    }
    else{
        isAuthenticated = await auth0Client.isAuthenticated();
    }
    document.getElementById("login_label").innerHTML = isAuthenticated ? "LOGOUT" : "LOGIN";
    document.getElementById("timeline_menus").innerHTML = isAuthenticated ? "-----Timeline Links------------" : "- Timeline Links available after login -";
    console.log("refreshLoginStatus isAuthenticated: ", isAuthenticated);
    return (isAuthenticated);
}

async function log_in_out() {
    let auth0State = localStorage.getItem('auth0flag');
    if (auth0State == null) {
        return;
    }
    await refreshLoginStatus();
    console.log("log_in_out isAuthenticated: " + isAuthenticated);
    if (isAuthenticated) {
        try {
            if (confirm("Are you sure you want to logout?")) {
                console.log("Logging out");
                await auth0Client.logout({
                    logoutParams: {
                        returnTo: window.location.origin
                    }
                });
            }
            await refreshLoginStatus();
        } catch (err) {
            console.log("Log out failed", err);
        }
    }
    else {
        try {
            let targetUrl = "";
            console.log("Logging in", targetUrl);

            const options = {
                authorizationParams: {
                    redirect_uri: window.location.origin
                }
            };

            if (targetUrl) {
                options.appState = { targetUrl };
            }
            await auth0Client.loginWithRedirect(options);
        } catch (err) {
            console.log("Log in failed", err);
        }

    }
}

function print_tl() {
    let timelineId = getChartViewState().timelineId;
    // https://www.tiki-toki.com/timeline/entry/2141156/Helene-Trabin-Berne-Family/print/
    console.log('pdf btn clicked for timeline \n' + timelineId + ", " + JSON.stringify(getMenuObj(timelineId)));
    let printLink = baseiFrameSrc.replace('embed', 'entry') + getMenuObj(timelineId).tikiPath + "/print/"

    //alert("pdf btn clicked for timeline "  + printLink);


    prompt(`This manual step allows you to open a browser page with the 
content of this timeline in a printable format. It will only show the 
default media image, and may be limited in other ways. 

To use this, copy the link below and paste it into the address bar of 
a new browser window. If the print dialog box doesn't display in 
the new tab, use the browser print command, e.g. Ctrl+P. 
 (The Ok button below doesn't do anything). ` , printLink);

    return;
}
