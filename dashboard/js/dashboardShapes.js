// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveShapeXrange = null;

function createShapeRangeSlider(div) {
  shapeRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  shapeRangeSlider.setChangeCallback(shapeRangeSliderCallback);
}

function setShapeTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = shapeRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveShapeXrange = app.reportsXrange;
  app.reportsXrange.doFull = false;
  app.reportsXrange.minBnum = bmin;
  app.reportsXrange.maxBnum = bmax;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setChartTimeInterval();
  setAlertTimeInterval();
  setStatTimeInterval();
  createDashboardShapes();
  sliderCommitPending = false;
}

function cancelShapeTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveShapeXrange) {
    app.reportsXrange = saveShapeXrange;
  } else {
    app.reportsXrange.doFull = true;
    app.reportsXrange.minBnum = 1;
    app.reportsXrange.maxBnum = app.dashboardBreathNum;
  }
  stopSliderCallback = true;
  shapeRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelChartTimeInterval();
  cancelAlertTimeInterval();
  cancelStatTimeInterval();
  sliderCommitPending = false;
}

function resetShapeTimeInterval(btn) {
  saveShapeXrange = null;
  unflashBreathWindowButtons();
  app.reportsXrange.doFull = true;
  app.reportsXrange.minBnum = 1;
  app.reportsXrange.maxBnum = app.dashboardBreathNum;
  stopSliderCallback = true;
  shapeRangeSlider.setSlider([app.reportsXrange.minBnum, app.reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetChartTimeInterval();
  resetAlertTimeInterval();
  resetStatTimeInterval();
  createDashboardShapes();
  sliderCommitPending = false;
}

function shapeRangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = shapeRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  chartRangeSlider.setSlider([bmin, bmax]);
  alertRangeSlider.setSlider([bmin, bmax]);
  statRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateShapeRangeOnNewBreath(num) {
  if (app.dashboardBreathNum==1) {
    shapeRangeSlider.setRange([1, 2]);
  } else {
    shapeRangeSlider.setRange([1, app.dashboardBreathNum]);
  }
  if (app.reportsXrange.doFull && !sliderCommitPending) {
    stopSliderCallback = true;
    shapeRangeSlider.setSlider([1, app.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

function createDashboardShapes() {
  minBnum = app.reportsXrange.minBnum;
  maxBnum = app.reportsXrange.maxBnum;
  if ((!minBnum) || (!maxBnum)) return;
  app.reportsXrange.initTime = app.startDate;
  app.reportsXrange.minTime = session.breathTimes[minBnum].time;
  app.reportsXrange.maxTime = session.breathTimes[maxBnum].time;
}

