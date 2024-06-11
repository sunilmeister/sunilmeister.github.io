// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardCharts() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
  	createAllCharts();
		updateVisiblePrevRange();
	}
}

////////////////////////////////////////////////////////

function movingChartRange() {
	let numBreaths = session.loggedBreaths.length - 1;
  let minBnum = numBreaths - CHART_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 0;
	let range = createRangeBnum(true, minBnum, numBreaths);
	updateVisibleViewRangeObject(range);
	showRangeOnSlider(range);
}

function updateChartRange() {
	updateRangeSliderWindow(session.charts.range);
  if (session.charts.range.moving) movingChartRange();
}

function updateChartRangeOnEntry() {
  if (session.charts.range.moving) movingChartRange();
}
