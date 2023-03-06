// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeChartsEntry = true;

function createDashboardCharts() {
  if (session.charts.creationInProgress) return;
  session.charts.creationInProgress = true;

  if (numberOfExistingCharts() == 0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }

  if (firstTimeChartsEntry) {
    showEditIconReminder();
    firstTimeChartsEntry = false;
  }

  for (id in session.charts.allChartsContainerInfo) {
    console.log("dashCharts render");
    session.charts.allChartsContainerInfo[id].render();
  }

  session.charts.creationInProgress = false;
}

////////////////////////////////////////////////////////

function rollingChartRange() {
  //console.log("chart rolling=" + session.reportRange.rolling);
  minBnum = session.dashboardBreathNum - MAX_CHART_DATAPOINTS + 1;
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
