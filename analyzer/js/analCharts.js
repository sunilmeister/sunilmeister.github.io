// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

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
