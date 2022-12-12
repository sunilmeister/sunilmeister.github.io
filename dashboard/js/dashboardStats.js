// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveStatXrange = null;

function createStatRangeSlider(div) {
  statRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  statRangeSlider.setChangeCallback(statRangeSliderCallback);
}

function setStatTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = statRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveStatXrange = app.reportsXrange;
  app.reportsXrange.doFull = false;
  app.reportsXrange.minBnum = bmin;
  app.reportsXrange.maxBnum = bmax;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setChartTimeInterval();
  setAlertTimeInterval();
  setShapeTimeInterval();
  createDashboardStats();
  sliderCommitPending = false;
}

function cancelStatTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveStatXrange) {
    app.reportsXrange = saveStatXrange;
  } else {
    app.reportsXrange.doFull = true;
    app.reportsXrange.minBnum = 1;
    app.reportsXrange.maxBnum = app.dashboardBreathNum;
  }
  stopSliderCallback = true;
  statRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelChartTimeInterval();
  cancelAlertTimeInterval();
  cancelShapeTimeInterval();
  sliderCommitPending = false;
}

function resetStatTimeInterval(btn) {
  saveStatXrange = null;
  unflashBreathWindowButtons();
  app.reportsXrange.doFull = true;
  app.reportsXrange.minBnum = 1;
  app.reportsXrange.maxBnum = app.dashboardBreathNum;
  stopSliderCallback = true;
  statRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetChartTimeInterval();
  resetAlertTimeInterval();
  resetShapeTimeInterval();
  createDashboardStats();
  sliderCommitPending = false;
}

function statRangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = statRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  chartRangeSlider.setSlider([bmin, bmax]);
  alertRangeSlider.setSlider([bmin, bmax]);
  shapeRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateStatRangeOnNewBreath(num) {
  if (app.dashboardBreathNum==1) {
    statRangeSlider.setRange([1, 2]);
  } else {
    statRangeSlider.setRange([1, app.dashboardBreathNum]);
  }
  if (app.reportsXrange.doFull && !sliderCommitPending) {
    stopSliderCallback = true;
    statRangeSlider.setSlider([1, app.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

