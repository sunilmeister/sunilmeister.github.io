// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardShapes() {
  createAllShapes();
}

function rollingShapeRange() {
  startShape = session.shapes.pwData.length - SHAPE_MAX_CHARTS;
  if (startShape < 0) startShape = 0;
  if (session.shapes.pwData.length) {
    minBnum = session.shapes.pwData[startShape].systemBreathNum - session.startSystemBreathNum + 1
  } else {
    minBnum = 0;
  }
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateShapeRange() {
  rangeSlider.setRange([1, session.dashboardBreathNum]);

  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) {
    if (session.reportRange.rolling && session.shapes.pwData.length > SHAPE_MAX_CHARTS) {
      rollingShapeRange();
    } else {
      session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
    }

    stopSliderCallback = true;
    rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateShapeRangeOnEntry() {
  if (!session.reportRange.rolling) return;

  rollingShapeRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
