// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveAlertXrange = null;

function createAlertRangeSlider(div) {
  alertRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  alertRangeSlider.setChangeCallback(alertRangeSliderCallback);
}

function setAlertTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = alertRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveAlertXrange = app.reportsXrange;
  app.reportsXrange.doFull = false;
  app.reportsXrange.minBnum = bmin;
  app.reportsXrange.maxBnum = bmax;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setStatTimeInterval();
  setChartTimeInterval();
  setShapeTimeInterval();
  createDashboardAlerts();
  sliderCommitPending = false;
}

function cancelAlertTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveAlertXrange) {
    app.reportsXrange = saveAlertXrange;
  } else {
    app.reportsXrange.doFull = true;
    app.reportsXrange.minBnum = 1;
    app.reportsXrange.maxBnum = app.dashboardBreathNum;
  }
  stopSliderCallback = true;
  alertRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelChartTimeInterval();
  cancelShapeTimeInterval();
  sliderCommitPending = false;
}

function resetAlertTimeInterval(btn) {
  saveAlertXrange = null;
  unflashBreathWindowButtons();
  app.reportsXrange.doFull = true;
  app.reportsXrange.minBnum = 1;
  app.reportsXrange.maxBnum = app.dashboardBreathNum;
  alertRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetStatTimeInterval();
  resetChartTimeInterval();
  resetShapeTimeInterval();
  createDashboardAlerts();
  sliderCommitPending = false;
}

function alertRangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = alertRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  statRangeSlider.setSlider([bmin, bmax]);
  chartRangeSlider.setSlider([bmin, bmax]);
  shapeRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateAlertRangeOnNewBreath(num) {
    if (app.dashboardBreathNum==1) {
    alertRangeSlider.setRange([1, 2]);
  } else {
    alertRangeSlider.setRange([1, app.dashboardBreathNum]);
  }
  if (app.reportsXrange.doFull && !sliderCommitPending) {
    stopSliderCallback = true;
    alertRangeSlider.setSlider([1, app.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

