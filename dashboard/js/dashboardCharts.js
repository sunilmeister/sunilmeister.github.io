// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var prevMinBreathNum = 0;
var prevMaxBreathNum = 0;

function createDashboardCharts() {
  if (app.chartCreationInProgress) return;
  app.chartCreationInProgress = true;

  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  

  app.chartsXrange = {
    doFull: false,
    initBnum:0, 
    minBnum:app.minChartBreathNum , 
    maxBnum:app.maxChartBreathNum ,
    missingBnum:cloneObject(session.missingBreathWindows),
    initTime:app.startDate, 
    minTime:session.breathTimes[app.minChartBreathNum].time, 
    maxTime:session.breathTimes[app.maxChartBreathNum].time,
    missingTime:cloneObject(session.missingTimeWindows)
  };
  
  for (id in app.allChartsContainerInfo) {
    app.allChartsContainerInfo[id].render();
  }

  prevMinBreathNum = app.chartsXrange.minBnum;
  prevMaxBreathNum = app.chartsXrange.maxBnum;
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
  stopSliderCallback = false;
}

function updateChartRangeOnNewBreath(num) {
  app.chartRangeLimit = app.dashboardBreathNum;
  if (app.chartRangeLimit==1) app.chartRangeLimit=2; // max must be > min
  chartRangeSlider.setRange([1, app.chartRangeLimit]);

  // if range is not "full"
  if (!app.reportsXrange.doFull || sliderCommitPending) return;

  app.maxChartBreathNum = app.dashboardBreathNum;
  app.minChartBreathNum = app.maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (app.minChartBreathNum <= 0) {
    app.minChartBreathNum = 1;
  }

  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.minChartBreathNum, app.maxChartBreathNum]);
  stopSliderCallback = false;
}

function setChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveChartXrange = app.reportsXrange;
  app.reportsXrange.doFull = false;
  app.reportsXrange.minBnum = bmin;
  app.reportsXrange.maxBnum = bmax;
  app.maxChartBreathNum = bmax;
  app.minChartBreathNum = bmin;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setStatTimeInterval();
  setAlertTimeInterval();
  createDashboardCharts();
  sliderCommitPending = false;
}

function cancelChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveChartXrange) {
    app.reportsXrange = saveChartXrange;
    app.maxChartBreathNum = app.reportsXrange.maxBnum;
    app.minChartBreathNum = app.reportsXrange.minBnum;
  } else {
    app.reportsXrange.doFull = true;
    app.reportsXrange.minBnum = 1;
    app.reportsXrange.maxBnum = app.dashboardBreathNum;
    app.maxChartBreathNum = app.dashboardBreathNum;
    app.minChartBreathNum = app.maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
    if (app.minChartBreathNum <= 0) {
      app.minChartBreathNum = 1;
    }
  }
  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.minChartBreathNum, app.maxChartBreathNum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelAlertTimeInterval();
  sliderCommitPending = false;
}

function resetChartTimeInterval(btn) {
  saveChartXrange = null;
  unflashBreathWindowButtons();
  app.reportsXrange.doFull = true;
  app.reportsXrange.minBnum = 1;
  app.reportsXrange.maxBnum = app.dashboardBreathNum;
  app.maxChartBreathNum = app.dashboardBreathNum;
  app.minChartBreathNum = app.maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (app.minChartBreathNum <= 0) {
    app.minChartBreathNum = 1;
  }
  stopSliderCallback = true;
  chartRangeSlider.setSlider([app.minChartBreathNum, app.maxChartBreathNum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetStatTimeInterval();
  resetAlertTimeInterval();
  createDashboardCharts();
  sliderCommitPending = false;
}
