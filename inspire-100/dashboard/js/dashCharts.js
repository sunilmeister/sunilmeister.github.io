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
  let minBnum = session.dashboardBreathNum - CHART_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.dashboardBreathNum);
}

function updateChartRange() {
  session.charts.rangeLimit = session.dashboardBreathNum;
  session.rangeSlider.setRange([1, session.charts.rangeLimit]);

  // if range is not "full"
  if (!session.charts.range.moving) return;
  if (session.charts.range.moving) movingChartRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.charts.range.minBnum, session.charts.range.maxBnum]);
  stopSliderCallback = false;
}

function updateChartRangeOnEntry() {
  if (!session.charts.range.moving) return;
  movingChartRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.charts.range.minBnum, session.charts.range.maxBnum]);
  stopSliderCallback = false;
}
