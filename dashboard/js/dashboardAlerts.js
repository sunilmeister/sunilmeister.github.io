// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveAlertRange = null;

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
  saveAlertRange = app.reportRange;
  app.reportRange = createReportRange(false, bmin, bmax);

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
  if (saveAlertRange) {
    app.reportRange = saveAlertRange;
  } else {
    app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
  }
  stopSliderCallback = true;
  alertRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelChartTimeInterval();
  cancelShapeTimeInterval();
  sliderCommitPending = false;
}

function resetAlertTimeInterval(btn) {
  saveAlertRange = null;
  unflashBreathWindowButtons();
  app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
  alertRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);

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
  if (app.reportRange.rolling && !sliderCommitPending) {
    stopSliderCallback = true;
    alertRangeSlider.setSlider([1, app.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

function updateAlertRangeOnEntry() {
  if (app.reportRange.rolling) {
    resetAlertTimeInterval();
  }
}

