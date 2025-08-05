// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initCharts() {
  removeAllChartContainers();
  session.charts.allChartsContainerInfo = {};
  let node = document.getElementById(ALL_CHARTS_ID);
  node.innerHTML = "";
}
