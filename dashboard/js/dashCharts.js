// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardCharts() {
  createAllCharts();
}

////////////////////////////////////////////////////////

function rollingChartRange() {
  //console.log("chart rolling=" + session.reportRange.rolling);
  minBnum = session.dashboardBreathNum - CHART_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateChartRange() {
  session.charts.rangeLimit = session.dashboardBreathNum;
  rangeSlider.setRange([1, session.charts.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) rollingChartRange();

  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateChartRangeOnEntry() {
  if (!session.reportRange.rolling) return;
  rollingChartRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
