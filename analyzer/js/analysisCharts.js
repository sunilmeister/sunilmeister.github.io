// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createAnalysisCharts() {
  cleanupCharts();
  for (id in app.allChartsContainerInfo) {
    app.allChartsContainerInfo[id].render();
  }
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!app.sessionDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  
  createAnalysisCharts();
}

function cleanupCharts() {
}

function initCharts() {
}

