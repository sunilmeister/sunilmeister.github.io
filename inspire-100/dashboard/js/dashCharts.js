// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardCharts() {
  createAllCharts();
}

////////////////////////////////////////////////////////

function movingChartRange() {
  let minBnum = session.dashboardBreathNum - CHART_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateChartRange() {
  session.charts.rangeLimit = session.dashboardBreathNum;
  rangeSlider.setRange([1, session.charts.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.moving || sliderCommitPending) return;
  if (session.reportRange.moving) movingChartRange();

  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateChartRangeOnEntry() {
  if (!session.reportRange.moving) return;
  movingChartRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
