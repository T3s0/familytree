let fullTable;
fetch('https://cdn.jsdelivr.net/gh/ReuvenT/family_history@latest/data/familytreedata.csv')
    .then(response => response.text())
    .then(data => {
        const sourceData = processData(data);
        renderedTable.addRows(removeRemainingColumns(sourceData, 1));
        fullTable.addRows(sourceData);
        localStorage.setItem('chartFullTable', sourceData);
    })
    .catch(error => {
        document.getElementById("err_msg").innerHTML = "Error loading tree data: " + error;
        console.error("Error loading tree data: ", error);
    });

// Call this function instead of manually passing `data`
fetchDataAndInitializeChart();

function prepChartTable(data, newTable) {
    // prepere column properties 
    var renderedTable = new google.visualization.DataTable();
    //const fullTable = new google.visualization.DataTable();
    fullTable = newTable;

    renderedTable.addColumn('string', 'Key_Name');   // contains both the key and what's displayed in the box
    renderedTable.addColumn('string', 'Parent');    // links to the parent key (empty if root)
    // html for tool tip is not working, plain text populated in this (alwasy last) column
    renderedTable.addColumn('string', 'tooltip', { html: true });

    // create second table with same initial rows but not used for tooltip which is very finneky
    fullTable.addColumn('string', 'Key_Name');
    fullTable.addColumn('string', 'Parent');
    fullTable.addColumn('string', 'tooltip');
    fullTable.addColumn('string', 'TimelineUrl');   // timeline, with possible story hash 

    // compose source data into appropriate table values
    const sourceData = processData(data);
    try {
        renderedTable.addRows(removeRemainingColumns(sourceData, 1));
    } catch (error) {
        document.getElementById("err_msg").innerHTML = "Error loading tree data (row number does't count comment rows) " + error;
        console.log(error);
    }
    fullTable.addRows(sourceData);

    localStorage.setItem('chartFullTable', sourceData);
    // Create the chart.
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));  // popup test //

    return renderedTable;
}

function treeSelectHandler() {
    localStorage.setItem('selectedOrgItem', null);
    var selectedItem = chart.getSelection()[0];
    if (selectedItem && selectedItem.hasOwnProperty('row')) { //&& selectedItem.row) {
        if (selectedItem) {
            var val0 = fullTable.getValue(selectedItem.row, 0);
            var val1 = fullTable.getValue(selectedItem.row, 1);
            var val2 = fullTable.getValue(selectedItem.row, 2);
            var val3 = fullTable.getValue(selectedItem.row, 3);
            localStorage.setItem('selectedOrgItem', JSON.stringify({ 'row': selectedItem.row, 'url': val3 }));
            console.log('The user selected row ' + selectedItem.row + ' with values ' + val0 + ', ' + val1 + ', ' + val2 + ', ' + val3);
        }
    }
}


function processData(csvData, isForToolTip) {
    let rows = csvData.split(/\r?\n/);
    let data = [];
    let j = 0;
    // any row starting with # is informational only - not processed
    for (let i = 0; i < rows.length; i++) {
        rawRow = rows[i];
        if (rawRow.length > 1 && !rawRow.startsWith("#")) {
            let rowArray = processDataRow(rows[i], i, j++);
            if (rowArray.length > 2) {
                data.push(rowArray);
            }
        }
    }
    return data;
}
const timelineEmbedBaseUrl = 'https://www.tiki-toki.com/timeline/embed/';
const timelineLinkBtnHtml = '" class="tl-span-id"></span><a class="tl-link-btn" onclick="timelineLink(this)"></a><br/>';
const bodyInsertHtml = "-node'>";

function processDataRow(csvDataRow, i, dataRowNbr) {
    let cells = csvDataRow.split(',');
    let dataRow = [];
    try {
        var body = cells[2];
        var insertPoint = body.indexOf(bodyInsertHtml) + 7;
        // insert link button if url is specified
        if (cells.length > 3 && cells[4] && insertPoint > 7) {
            body = body.slice(0, insertPoint) + '<span data-row="' + dataRowNbr + '" id="' + cells[4] + timelineLinkBtnHtml + body.slice(insertPoint);
        }
        else {
            insertPoint = body.indexOf("<div >") + 5;
            body = body.slice(0, insertPoint) + ' data-row="' + dataRowNbr + '" id="' + cells[0] + '"' + body.slice(insertPoint);
        }
        //console.log("tree load dataRowNbr " + dataRowNbr + " body: " + body)
        dataRow.push({ "v": cells[0], "f": body });         // Key_Name, Body
        dataRow.push(cells[1]);                             // Parent

        if (cells.length > 2) {
            if (cells[3]) {
                dataRow.push(cells[3]);                             // provided Tooltip
            }
            else {
                dataRow.push(removeTags(cells[2]));                             // use body as Tooltip (without html)
            }
        }
        if (cells[4]) {
            dataRow.push(timelineEmbedBaseUrl + cells[4]);
        }
        else {
            dataRow.push('');
        }


    } catch (error) {
        alert("tree load error in source file row " + i)
        console.log("tree load error in source file row " + i)
        console.error(error);
    }
    return dataRow;
}

function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in the input string. Replacing the identified HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}

function timelineLink(el) {
    var storedSelection = JSON.parse(localStorage.getItem('selectedOrgItem'));
    if (storedSelection) {
        console.log("timelineLink clicked for row(cell) " + storedSelection.row + " with url " + storedSelection.url);
        // Just fire the message through parent object (this is still used even though it was coded when this was in iFrame)
        if (window.parent) {
            window.parent.postMessage({ from: 'org-chart', node: storedSelection.row, url: storedSelection.url }, '*');
        }
        showNode(el, true);
        handleViewChoiceClick("view-timeline", true)
    }
};

function removeRemainingColumns(data, fromIndex) {
    return data.map(function (row) {
        return row.slice(0, -fromIndex);
    });
}

function selectChartItem(rowIndex) {
    var selectionArray = new Array(1).fill({ row: rowIndex, column: null });
    console.log("selectChartItem row(cell) " + JSON.stringify(selectionArray));
    chart.setSelection(selectionArray);
}

function navigateToNode(elementId, useScrollIntoView) {
    console.log('navigating to ' + elementId);
    const element = document.getElementById(elementId);
    if (element) {
        selectChartItem(element.dataset.row);
    }
}

function moveOrgChart(targetContainer, isFullPage, scale) {
    let ocSource = document.getElementById("orgchart-container");
    var selectedItem = JSON.parse(localStorage.getItem('selectedOrgItem'));
    console.log('moveOrgChart moving to target ' + targetContainer.id + ' to ' + (isFullPage ? 'full' : 'popup') + ' with selected item ' + JSON.stringify(selectedItem));
    let fromCenteredEl = (!selectedItem || selectedItem.row < 1)
        ? getCenterElement(ocSource).centerEl
        : document.querySelector('[data-row="' + (selectedItem.row) + '"]');
    try {
        if (ocSource.innerHTML.length > 1000) {
            targetContainer.appendChild(ocSource);
        }
        showNode(fromCenteredEl, isFullPage);
    } catch (error) {
        console.log(error);
    }
    // if (!isFullPage){
    //     document.getElementById("panzoom_container").style.transform = "matrix(.5, 0, 0, .5, 0, 0)";
    // }

}

function getCenterElement(container) {
    // calculate the central point of the container
    let chartContainerBounds = container.getBoundingClientRect();
    let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
    //console.log(`getCenterElement: container ${container.id} bounds (top, right, bottom, and left) ${chartContainerBounds.top}px, ${chartContainerBounds.right}px, ${chartContainerBounds.bottom}px, ${chartContainerBounds.left}px center: ${JSON.stringify(containerCenter)}`);
    let sortedDist = [];
    let elements = document.querySelectorAll('[data-row]');
    let visibleCount = 0;
    elements.forEach((el) => {
        let elBounds = el.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = el.parentElement.getBoundingClientRect();
        }

        let { top, left, bottom, right } = el.getBoundingClientRect();
        let elCenter = { x: (left + ((right - left) / 2)), y: (top + ((bottom - top) / 2)) };
        if (elCenter.x > chartContainerBounds.left && elCenter.y < chartContainerBounds.bottom && elCenter.x < chartContainerBounds.right && elCenter.y > chartContainerBounds.top) {
            visibleCount++;
            let dist = ((containerCenter.x - elCenter.x) * (containerCenter.x - elCenter.x)) + ((containerCenter.y - elCenter.y) * (containerCenter.y - elCenter.y));
            sortedDist.push({ elId: el.id, row: el.getAttribute("data-row"), dist: Math.sqrt(dist) });
            //console.log('getCenterElement visible row ' + el.dataset.row + ' ' + JSON.stringify(elBounds));
        }
        else {
            //console.log('getCenterElement not vis row ' + el.dataset.row + ' ' + JSON.stringify(elBounds));
        }
    });
    orderedList = sortedDist.sort((a, b) => a.dist - b.dist)
    if (orderedList.length == 0) {
        console.log('for container: ' + container.id + ' no visible elements found');
        return { centerEl: null, visibleCount: 0 };
    }
    //console.log('for container: ' + container.id +  ' closest element: ' + orderedList[0].elId + ' row: ' + orderedList[0].row + " dist: " +  orderedList[0].dist + " visible " +  visibleCount  + "/" +  elements.length );
    return { centerEl: document.getElementById(orderedList[0].elId), visibleCount };
}

const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
        ? ((top > 0 && top < innerHeight) ||
            (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
        : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};


function showNode(nodeEl, isFullPage) {
    if (nodeEl) {
        console.log(`showNode nodeEl id:  ${nodeEl.id}, isFullPage: ${isFullPage}`);
        let elBounds = nodeEl.getBoundingClientRect();
        if (elBounds.right == 0) {
            elBounds = nodeEl.parentElement.getBoundingClientRect();
        }
        let chartContainerBounds = document.getElementById("chart_container").getBoundingClientRect();
        let centerEl = getCenterElement(document.getElementById("orgchart-container")).centerEl
        //console.log(`showNode: cont bounds (top, right, bottom, and left) ${chartContainerBounds.top}px, ${chartContainerBounds.right}px, ${chartContainerBounds.bottom}px, ${chartContainerBounds.left}px`);
        //console.log(`showNode: item bounds (top, right, bottom, and left) ${elBounds.top}px, ${elBounds.right}px, ${elBounds.bottom}px, ${elBounds.left}px`);
        let scale = 1;

        let containerCenter = { x: (chartContainerBounds.left + (chartContainerBounds.width / 2)), y: (chartContainerBounds.top + (chartContainerBounds.height / 2)) };
        let elCenter = { x: (elBounds.left + (elBounds.width / 2)), y: (elBounds.top + (elBounds.height / 2)) };
        let xTranslation = -(elCenter.x - containerCenter.x);
        let yTranslation = -(elCenter.y - containerCenter.y);

        // restore scale
        let popupStateItem = localStorage.getItem("treePopupState");
        if (popupStateItem != '[object Object]' && (typeof popupStateItem === 'string' || popupStateItem instanceof String)) {
            let pState = JSON.parse(popupStateItem);
            if (isFullPage) {
                scale = pState.fullScale;  // moving to full
            }
            else {
                scale = pState.popupScale;  // moving to popup
            }
            if (scale == 0 || Math.abs(scale) > 1) {
                scale = 1;
            }
        }

        let matrix = 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + xTranslation + ', ' + yTranslation + ')';
        console.log("transform matrix: " + matrix);
        document.getElementById("panzoom_container").style.transform = matrix;

        // log the "after"
        elBounds = nodeEl.getBoundingClientRect();
        //console.log(`showNode (after): item bounds (top, right, bottom, and left) ${elBounds.top}px, ${elBounds.right}px, ${elBounds.bottom}px, ${elBounds.left}px`);
    }
}
