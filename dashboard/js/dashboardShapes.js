// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveShapeRange = null;

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
  saveShapeRange = app.reportRange;
  app.reportRange = createReportRange(false, bmin, bmax);

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
  if (saveShapeRange) {
    app.reportRange = saveShapeRange;
  } else {
    resetShapeTimeInterval();
  }
  stopSliderCallback = true;
  shapeRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelChartTimeInterval();
  cancelAlertTimeInterval();
  cancelStatTimeInterval();
  sliderCommitPending = false;
}

function resetShapeTimeInterval(btn) {
  saveShapeRange = null;
  unflashBreathWindowButtons();

  var minBnum = 1;
  if (app.reportRange.rolling && app.pwData.length>MAX_SHAPE_CHARTS) {
    startPw = app.pwData.length - MAX_SHAPE_CHARTS;
    minBnum = app.pwData[startPw].systemBreathNum - app.startSystemBreathNum +1
  }
  app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);

  stopSliderCallback = true;
  shapeRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
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
  shapeRangeSlider.setRange([1, app.dashboardBreathNum]);

  if (!app.reportRange.rolling || sliderCommitPending) return;
  if (app.reportRange.rolling) {
    var minBnum = 1;
    if (app.reportRange.rolling && app.pwData.length>MAX_SHAPE_CHARTS) {
      startPw = app.pwData.length - MAX_SHAPE_CHARTS;
      minBnum = app.pwData[startPw].systemBreathNum - app.startSystemBreathNum +1
    }
    app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);

    stopSliderCallback = true;
    shapeRangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateShapeRangeOnEntry() {
  if (app.reportRange.rolling) {
    resetShapeTimeInterval();
  }
}

var breathShapeGraph = null;
function createDashboardShapes() {
  if (breathShapeGraph) {
    breathShapeGraph.destroy();
    delete breathShapeGraph;
  }

  div = document.getElementById("shapeGraphBody");
  breathShapeGraph = 
    new BreathPressureGraph("Breath Pressure Shapes",800,app.reportRange);
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

