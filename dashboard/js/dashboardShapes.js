// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function setRollingShapes() {
  updateShapeRangeOnNewBreath();
}

function updateShapeRangeOnNewBreath() {
  rangeSlider.setRange([1, app.dashboardBreathNum]);

  if (!app.reportRange.rolling || sliderCommitPending) return;
  if (app.reportRange.rolling) {
    if (app.reportRange.rolling && app.pwData.length>SHAPE_MAX_CHARTS) {
      startPw = app.pwData.length - SHAPE_MAX_CHARTS;
      minBnum = app.pwData[startPw].systemBreathNum - app.startSystemBreathNum +1
      app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);
    }

    stopSliderCallback = true;
    rangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateShapeRangeOnEntry() {
  if (app.reportRange.rolling) {
    app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
    stopSliderCallback = true;
    rangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
    stopSliderCallback = false;
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
    new BreathShapes("Breath Pressure Shapes",800,app.reportRange);
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

