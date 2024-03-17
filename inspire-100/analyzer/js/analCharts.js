// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initCharts() {
  let allChartDivs = [];
  for (let id in session.charts.allChartsContainerInfo) {
    allChartDivs.push(id);
  }
  session.charts.allChartsContainerInfo = {};
  for (let i=0; i<allChartDivs.length; i++) {
    let id = allChartDivs[i];
    let node = document.getElementById(id);
    node.remove();
  }
}
