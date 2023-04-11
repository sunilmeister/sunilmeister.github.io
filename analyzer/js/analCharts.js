// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createAnalysisCharts() {
  createAllCharts();
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }
  if (numberOfExistingCharts() == 0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }
  createAnalysisCharts();
}

function initCharts() {
  allChartDivs = [];
  for (id in session.charts.allChartsContainerInfo) {
    allChartDivs.push(id);
  }
  session.charts.allChartsContainerInfo = {};
  for (i=0; i<allChartDivs.length; i++) {
    id = allChartDivs[i];
    node = document.getElementById(id);
    node.remove();
  }
}
