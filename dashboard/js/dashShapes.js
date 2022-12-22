// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeShapesEntry = true;
function createDashboardShapes() {
  if (app.shapeCreationInProgress) return;
  app.shapeCreationInProgress = true;

  if (numberOfExistingShapes()==0) {
    shapeInsertOnTop(); // always have shape box for user to start with
  }  

  if (firstTimeShapesEntry) {
    showEditIconReminder();
    firstTimeShapesEntry = false;
  }

  for (id in app.allShapesContainerInfo) {
    app.allShapesContainerInfo[id].render();
  }

  app.shapeCreationInProgress = false;
}

function updateShapeRange() {
  rangeSlider.setRange([1, app.dashboardBreathNum]);

  if (!app.reportRange.rolling || sliderCommitPending) return;
  if (app.reportRange.rolling) {
    if (app.reportRange.rolling && app.shapeData.length>SHAPE_MAX_CHARTS) {
      startShape = app.shapeData.length - SHAPE_MAX_CHARTS;
      minBnum = app.shapeData[startShape].systemBreathNum - app.startSystemBreathNum +1
      app.reportRange = createReportRange(true, minBnum, app.dashboardBreathNum);
    } else {
      app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
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

