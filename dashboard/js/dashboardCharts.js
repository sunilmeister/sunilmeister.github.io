// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var prevMinBreathNum = 0;
var prevMaxBreathNum = 0;

var chartCreationInProgress = false;
function createDashboardCharts() {
  if (chartCreationInProgress) return;
  chartCreationInProgress = true;

  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  
  chartsXrange = {
    doFull: false,
    initBnum:0, 
    minBnum:minChartBreathNum , 
    maxBnum:maxChartBreathNum ,
    missingBnum:cloneObject(missingBreathWindows),
    initTime:startDate, 
    minTime:breathTimes[minChartBreathNum].time, 
    maxTime:breathTimes[maxChartBreathNum].time,
    missingTime:cloneObject(missingTimeWindows)
  };
  
  for (id in allChartContainerInfo) {
    allChartContainerInfo[id].render();
  }

  prevMinBreathNum = chartsXrange.minBnum;
  prevMaxBreathNum = chartsXrange.maxBnum;
  chartCreationInProgress = false;
}

////////////////////////////////////////////////////////

function createChartRangeSlider(div) {
  chartSliderPresent = true;
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
  chartRangeLimit = dashboardBreathNum;
  if (chartRangeLimit==1) chartRangeLimit=2; // max must be > min
  chartRangeSlider.setRange([1, chartRangeLimit]);

  // if range is not "full"
  if (!reportsXrange.doFull || sliderCommitPending) return;

  maxChartBreathNum = dashboardBreathNum;
  minChartBreathNum = maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (minChartBreathNum <= 0) {
    minChartBreathNum = 1;
  }

  stopSliderCallback = true;
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
  stopSliderCallback = false;
}

function setChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveChartXrange = reportsXrange;
  reportsXrange.doFull = false;
  reportsXrange.minBnum = bmin;
  reportsXrange.maxBnum = bmax;
  maxChartBreathNum = bmax;
  minChartBreathNum = bmin;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setStatTimeInterval();
  setAlertTimeInterval();
  createDashboardCharts();
}

function cancelChartTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  if (saveChartXrange) {
    reportsXrange = saveChartXrange;
    maxChartBreathNum = reportsXrange.maxBnum;
    minChartBreathNum = reportsXrange.minBnum;
  } else {
    reportsXrange.doFull = true;
    reportsXrange.minBnum = 1;
    reportsXrange.maxBnum = dashboardBreathNum;
    maxChartBreathNum = dashboardBreathNum;
    minChartBreathNum = maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
    if (minChartBreathNum <= 0) {
      minChartBreathNum = 1;
    }
  }
  stopSliderCallback = true;
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelAlertTimeInterval();
}

function resetChartTimeInterval(btn) {
  saveChartXrange = null;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  reportsXrange.doFull = true;
  reportsXrange.minBnum = 1;
  reportsXrange.maxBnum = dashboardBreathNum;
  maxChartBreathNum = dashboardBreathNum;
  minChartBreathNum = maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (minChartBreathNum <= 0) {
    minChartBreathNum = 1;
  }
  stopSliderCallback = true;
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetStatTimeInterval();
  resetAlertTimeInterval();
  createDashboardCharts();
}
