<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Trabin Family History</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Load Google Fonts -->
  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
  <script>
    WebFont.load({ google: { families: ["Montserrat:400,700"] } });
  </script>

  <!-- Load External CSS -->
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/ReuvenT/family_history@main/index.css">
</head>
<body>

  <!-- Tree Popup -->
  <div id="tree-popup" class="resizable" style="display: none;">
    <div id="tree-popup-header">
      <button class="close-popup-btn" onclick="toggleOrgChartPopup()">X</button>
      <button onclick="handleViewChoiceClick('view-tree', true);">View Tree</button>
    </div>
    <div id="popup-content-target"></div>
    <div id="resizer" class="resizer"></div>
  </div>

  <!-- Timeline Container -->
  <div id="timeline_container">
    <iframe frameborder="0" scrolling="no" style="border-width:0; width: 100%; height: 99%;" id="tl-timeline-iframe"></iframe>
  </div>

  <!-- Tree Container -->
  <div id="tree_container">
    <div id="orgchart-container">
      <div class="panzoom" id="panzoom_container">
        <div id="chart_container" style="height: 100%;"></div>
      </div>
    </div>
  </div>

  <!-- Image Fix -->
  <img src="https://cdn.jsdelivr.net/gh/ReuvenT/family_history@main/img/tree_view.png" alt="Tree View">

  <!-- Load JavaScript Files -->
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/T3s0/familytree@latest/treechart.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/T3s0/familytree@latest/main.js?nocache=<?= time() ?>"></script>
  <script src="https://cdn.jsdelivr.net/gh/T3s0/familytree@latest/treepopup.js"></script>

  <!-- Load CSV and Render Tree -->
  <script>
    let chart;

    // ✅ Ensure Google Charts Loads Before Drawing
    google.charts.load("current", { packages: ["orgchart"] });
    google.charts.setOnLoadCallback(() => {
        console.log("✅ Google Charts Loaded. Now initializing family tree...");

        if (typeof initializeFamilyTree === "function") {
            fetch("https://cdn.jsdelivr.net/gh/ReuvenT/family_history@latest/data/familytreedata.csv")
              .then(response => response.text())
              .then(data => {
                  console.log("✅ CSV Loaded:", data.split("\n").slice(0, 5));
                  initializeFamilyTree(data);
              })
              .catch(error => console.error("❌ Error loading CSV:", error));
        } else {
            console.error("❌ initializeFamilyTree() is still undefined!");
        }
    });

    // ✅ Function to Initialize Family Tree
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

        if (typeof google.visualization === "undefined") {
            console.error("❌ Google Charts library is not loaded!");
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

        console.log("✅ Processed Data Array:", data);
        return data;
    }

    // ✅ Process Individual CSV Row
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

    // ✅ Toggle Tree Popup
    function toggleOrgChartPopup() {
        let popup = document.getElementById("tree-popup");
        if (!popup) {
            console.error("❌ Popup element does not exist!");
            return;
        }

        let isVisible = popup.style.display === "block";
        popup.style.display = isVisible ? "none" : "block";
        console.log("✅ Popup visibility set to:", popup.style.display);
    }

    // ✅ Utility: Remove HTML Tags
    function removeTags(str) {
        if (!str) return false;
        return str.replace(/(<([^>]+)>)/ig, '');
    }

    // ✅ Remove Remaining Columns for OrgChart
    function removeRemainingColumns(data, fromIndex) {
        return data.map(function (row) {
            return row.slice(0, -fromIndex);
        });
    }

  </script>

</body>
</html>
