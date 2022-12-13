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
  saveShapeRollingRange = null;
  app.rollingRange = false;
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
    app.rollingRange = saveShapeRollingRange;
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
  saveShapeRollingRange = null;
  app.rollingRange = true;
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

var breathShapeGraph = null;
function createDashboardShapes() {
  if (app.rollingRange && app.pwData.length>MAX_SHAPE_CHARTS) {
    startPw = app.pwData.length - MAX_SHAPE_CHARTS;
    minBnum = app.pwData[startPw].systemBreathNum - app.startSystemBreathNum +1
  } else {
    minBnum = app.reportsXrange.minBnum;
  }
  app.reportsXrange.minBnum = minBnum;
  app.reportsXrange.minTime = session.breathTimes[minBnum].time;
  maxBnum = app.reportsXrange.maxBnum;
  app.reportsXrange.initTime = app.startDate;
  app.reportsXrange.maxTime = session.breathTimes[maxBnum].time;

  if (breathShapeGraph) {
    breathShapeGraph.destroy();
    delete breathShapeGraph;
  }

  div = document.getElementById("shapeGraphBody");
  breathShapeGraph = new BreathPressureGraph("Breath Pressure Shapes",800,app.reportsXrange);
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

