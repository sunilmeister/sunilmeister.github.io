// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardCharts() {
  rangeWindowDiv.style.display = "block";
  changeRangeSliderColors(session.charts.range.moving);
  if (isVisibleRangeChanged()) {
    createAllCharts();
    updateVisiblePrevRange();
    updateParamSummary("Chart", session.charts.range);
  }
}

////////////////////////////////////////////////////////

function movingChartRange() {
  if (session.loggedBreaths.length <= 1) return;
  
  let numBreaths = session.loggedBreaths.length - 1;
  let minBnum = numBreaths - CHART_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  let range = createRangeBnum(true, minBnum, numBreaths);
  updateVisibleViewRangeObject(range);
  showRangeOnSlider(range);
}

function updateChartRange() {
  updateRangeSliderWindow(session.charts.range);
  if (session.charts.range.moving) movingChartRange();
}

function updateChartRangeOnEntry() {
  changeRangeSliderColors(session.charts.range.moving);
  if (session.charts.range.moving) movingChartRange();
}
