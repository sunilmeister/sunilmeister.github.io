// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeShapesEntry = true;

function createDashboardShapes() {
  if (session.inProgress.shapes) return;
  session.inProgress.shapes = true;

  if (numberOfExistingShapeBoxes() == 0) {
    shapeInsertOnTop(); // always have shape box for user to start with
  }

  if (firstTimeShapesEntry) {
    showEditIconReminder();
    firstTimeShapesEntry = false;
  }

  for (id in session.shapes.allShapesContainerInfo) {
    session.shapes.allShapesContainerInfo[id].render();
  }

  session.inProgress.shapes = false;
}

function rollingShapeRange() {
  startShape = session.shapes.data.length - SHAPE_MAX_CHARTS;
  if (startShape < 0) startShape = 0;
  if (session.shapes.data.length) {
    minBnum = session.shapes.data[startShape].systemBreathNum - session.startSystemBreathNum + 1
  } else {
    minBnum = 0;
  }
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateShapeRange() {
  rangeSlider.setRange([1, session.dashboardBreathNum]);

  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) {
    if (session.reportRange.rolling && session.shapes.data.length > SHAPE_MAX_CHARTS) {
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
