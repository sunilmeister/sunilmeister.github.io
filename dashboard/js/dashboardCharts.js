// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardCharts() {
  if (app.chartCreationInProgress) return;
  app.chartCreationInProgress = true;

  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  

  for (id in app.allChartsContainerInfo) {
    app.allChartsContainerInfo[id].render();
  }

  app.chartCreationInProgress = false;
}

////////////////////////////////////////////////////////

function createChartRangeSlider(div) {
  chartRangeSlider = new IntRangeSlider(
    div,
    0,
    MAX_CHART_DATAPOINTS,
    0,
    0,
    1
  );
  chartRangeSlider.setChangeCallback(chartRangeSliderCallback);
}

function chartRangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  alertRangeSlider.setSlider([bmin, bmax]);
  statRangeSlider.setSlider([bmin, bmax]);
  shapeRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateChartRangeOnNewBreath(num) {
  app.chartRangeLimit = app.dashboardBreathNum;
  chartRangeSlider.setRange([1, app.chartRangeLimit]);

  // if range is not "full"
  if (!app.reportRange.rolling || sliderCommitPending) return;
  var minBnum = 1;
  if (app.reportRange.rolling) {
    app.reportRange.maxBnum = app.dashboardBreathNum;
    minBnum = app.dashboardBreathNum - MAX_CHART_DATAPOINTS + 1;
    if (minBnum <= 0) minBnum = 1;
  }
  app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);

  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function setChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveChartRange = app.reportRange;
  app.reportRange = createReportRange(false, bmin, bmax);

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setStatTimeInterval();
  setAlertTimeInterval();
  setShapeTimeInterval();
  createDashboardCharts();
  sliderCommitPending = false;
}

function cancelChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveChartRange) {
    app.reportRange = saveChartRange;
  } else {
    resetShapeTimeInterval();
    return;
  }
  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelAlertTimeInterval();
  cancelShapeTimeInterval();
  sliderCommitPending = false;
}

function resetChartTimeInterval(btn) {
  saveChartRange = null;
  unflashBreathWindowButtons();

  var minBnum = 1;
  if (app.reportRange.rolling) {
    minBnum = app.dashboardBreathNum - MAX_CHART_DATAPOINTS + 1;
    if (minBnum <= 0) minBnum = 1;
  }
  app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);

  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetStatTimeInterval();
  resetAlertTimeInterval();
  resetShapeTimeInterval();
  createDashboardCharts();
  sliderCommitPending = false;
}

function updateChartRangeOnEntry() {
  if (app.reportRange.rolling) {
    resetChartTimeInterval();
  }
}


