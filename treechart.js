
let chart;

// ✅ Initialize Family Tree
function initializeFamilyTree(csvData) {
    console.log("✅ Family tree data received:", csvData.split("\n").slice(0, 5));

    let processedData = processData(csvData);
    if (!processedData || processedData.length === 0) {
        console.error("❌ Error: No valid data found in CSV.");
        return;
    }

    console.log("✅ Processed Family Tree Data:", processedData);

    let chartContainer = document.getElementById("chart_container");
    if (!chartContainer) {
        console.error("❌ Error: chart_container does not exist!");
        return;
    }

    let dataTable = new google.visualization.DataTable();
    dataTable.addColumn("string", "Key_Name");
    dataTable.addColumn("string", "Parent");
    dataTable.addColumn("string", "Tooltip");

    try {
        dataTable.addRows(removeRemainingColumns(processedData, 1));
    } catch (error) {
        console.error("❌ Error processing tree data:", error);
        return;
    }

    chart = new google.visualization.OrgChart(chartContainer);
    chart.draw(dataTable, { allowHtml: true });

    console.log("✅ Family Tree Successfully Rendered!");
}

// ✅ Prepare Chart Table
function prepChartTable(data, newTable) {
    var renderedTable = new google.visualization.DataTable();
    fullTable = newTable;

    renderedTable.addColumn('string', 'Key_Name'); 
    renderedTable.addColumn('string', 'Parent');    
    renderedTable.addColumn('string', 'tooltip', { html: true });

    fullTable.addColumn('string', 'Key_Name');
    fullTable.addColumn('string', 'Parent');
    fullTable.addColumn('string', 'tooltip');
    fullTable.addColumn('string', 'TimelineUrl');

    const sourceData = processData(data);
    try {
        renderedTable.addRows(removeRemainingColumns(sourceData, 1));
    } catch (error) {
        document.getElementById("err_msg").innerHTML = "Error loading tree data: " + error;
        console.error(error);
    }
    fullTable.addRows(sourceData);

    localStorage.setItem('chartFullTable', sourceData);
    chart = new google.visualization.OrgChart(document.getElementById('chart_container'));

    return renderedTable;
}

// ✅ Process CSV Data
function processData(csvData) {
    let rows = csvData.split(/\r?\n/);
    let data = [];
    
    for (let i = 0; i < rows.length; i++) {
        let rawRow = rows[i].trim();
        if (!rawRow || rawRow.startsWith("#")) continue;

        let rowArray = processDataRow(rawRow, i, data.length);
        if (rowArray.length > 2) {
            data.push(rowArray);
        }
    }
    return data;
}

// ✅ Process Individual Row
function processDataRow(csvDataRow, i, dataRowNbr) {
    let cells = csvDataRow.split(',');
    let dataRow = [];

    try {
        var body = cells[2];

        if (cells.length > 3 && cells[4]) {
            var insertPoint = body.indexOf("-node'>") + 7;
            if (insertPoint > 7) {
                body = body.slice(0, insertPoint) + '<span data-row="' + dataRowNbr + '" id="' + cells[4] + '" class="tl-span-id"></span><a class="tl-link-btn" onclick="timelineLink(this)"></a><br/>' + body.slice(insertPoint);
            }
        }
        dataRow.push({ "v": cells[0], "f": body });  
        dataRow.push(cells[1]);  

        if (cells.length > 2) {
            dataRow.push(cells[3] ? cells[3] : removeTags(cells[2]));
        }
        dataRow.push(cells[4] ? 'https://www.tiki-toki.com/timeline/embed/' + cells[4] : '');

    } catch (error) {
        console.error("❌ Error processing CSV row:", i, error);
    }
    return dataRow;
}

// ✅ Utility: Remove HTML Tags
function removeTags(str) {
    if (!str) return false;
    return str.replace(/(<([^>]+)>)/ig, '');
}

// ✅ Handle Google Charts Loading
google.charts.load("current", { packages: ["orgchart"] });
google.charts.setOnLoadCallback(() => {
    console.log("✅ Google Charts Loaded. Waiting for data...");
});

// ✅ Handle CSV Loading from Webflow Footer Code
fetch("https://cdn.jsdelivr.net/gh/ReuvenT/family_history@latest/data/familytreedata.csv")
  .then(response => response.text())
  .then(data => {
      console.log("✅ CSV Loaded:", data.split("\n").slice(0, 5));
      if (typeof initializeFamilyTree === "function") {
          initializeFamilyTree(data);
      } else {
          console.error("❌ initializeFamilyTree() is still undefined!");
      }
  })
  .catch(error => console.error("❌ Error loading CSV:", error));

// ✅ Remove Remaining Columns for OrgChart
function removeRemainingColumns(data, fromIndex) {
    return data.map(function (row) {
        return row.slice(0, -fromIndex);
    });
}

// ✅ Handle Chart Selection
function treeSelectHandler() {
    var selectedItem = chart.getSelection()[0];
    if (selectedItem && selectedItem.hasOwnProperty('row')) {
        var val0 = fullTable.getValue(selectedItem.row, 0);
        var val1 = fullTable.getValue(selectedItem.row, 1);
        var val2 = fullTable.getValue(selectedItem.row, 2);
        var val3 = fullTable.getValue(selectedItem.row, 3);
        localStorage.setItem('selectedOrgItem', JSON.stringify({ 'row': selectedItem.row, 'url': val3 }));
        console.log('Selected row ' + selectedItem.row + ': ' + val0 + ', ' + val1 + ', ' + val2 + ', ' + val3);
    }
}

// ✅ Handle Node Navigation
function navigateToNode(elementId, useScrollIntoView) {
    console.log('Navigating to ' + elementId);
    const element = document.getElementById(elementId);
    if (element) {
        selectChartItem(element.dataset.row);
    }
}

// ✅ Select Chart Item
function selectChartItem(rowIndex) {
    var selectionArray = [{ row: rowIndex, column: null }];
    console.log("Selecting row(cell) " + JSON.stringify(selectionArray));
    chart.setSelection(selectionArray);
}

// ✅ Show Node in View
function showNode(nodeEl, useScrollIntoView) {
    if (!nodeEl) return;
    let elBounds = nodeEl.getBoundingClientRect();
    let chartContainerBounds = document.getElementById("chart_container").getBoundingClientRect();

    console.log("showNode: item bounds (top, right, bottom, left)", elBounds.top, elBounds.right, elBounds.bottom, elBounds.left);

    let xTranslation = chartContainerBounds.width * 0.5 - elBounds.left;
    let yTranslation = chartContainerBounds.height * 1.5 - elBounds.bottom;

    let matrix = `matrix(1, 0, 0, 1, ${xTranslation}, ${yTranslation})`;
    console.log("Transform matrix:", matrix);
    document.getElementById("panzoom_container").style.transform = matrix;

    if (useScrollIntoView) nodeEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

function drawChart() {
    console.log("✅ drawChart() is running...");

    let chartContainer = document.getElementById("chart_container");
    if (!chartContainer) {
        console.error("❌ Error: chart_container does not exist!");
        return;
    }

    try {
        google.charts.load("current", { packages: ["orgchart"] });
        google.charts.setOnLoadCallback(() => {
            console.log("✅ Google Charts Loaded. Attempting to draw...");
            initializeFamilyTree();
        });
    } catch (error) {
        console.error("❌ Error drawing chart:", error);
    }
}
