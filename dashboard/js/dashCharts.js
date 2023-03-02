// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeChartsEntry = true;

function createDashboardCharts() {
  if (app.chartCreationInProgress) return;
  app.chartCreationInProgress = true;

  if (numberOfExistingCharts() == 0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }

  if (firstTimeChartsEntry) {
    showEditIconReminder();
    firstTimeChartsEntry = false;
  }

  for (id in app.allChartsContainerInfo) {
    app.allChartsContainerInfo[id].render();
  }

  app.chartCreationInProgress = false;
}

////////////////////////////////////////////////////////

function rollingChartRange() {
  //console.log("chart rolling=" + app.reportRange.rolling);
  minBnum = app.dashboardBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (minBnum <= 0) minBnum = 1;
  app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);
}

function updateChartRange() {
  app.chartRangeLimit = app.dashboardBreathNum;
  rangeSlider.setRange([1, app.chartRangeLimit]);

  // if range is not "full"
  if (!app.reportRange.rolling || sliderCommitPending) return;
  if (app.reportRange.rolling) rollingChartRange();

  stopSliderCallback = true;
  rangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateChartRangeOnEntry() {
  if (!app.reportRange.rolling) return;
  rollingChartRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;
}
