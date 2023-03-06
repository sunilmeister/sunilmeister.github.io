// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeChartsEntry = true;

function createAnalysisCharts() {
  if (firstTimeChartsEntry) {
    showEditIconReminder();
    firstTimeChartsEntry = false;
  }

  for (id in session.charts.allChartsContainerInfo) {
    session.charts.allChartsContainerInfo[id].render();
  }
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

function initCharts() {}
