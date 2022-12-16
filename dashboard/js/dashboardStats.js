// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateStatRangeOnNewBreath() {
  rangeSlider.setRange([1, app.dashboardBreathNum]);
  if (app.reportRange.rolling && !sliderCommitPending) {
    app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
    stopSliderCallback = true;
    rangeSlider.setSlider([1, app.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

function updateStatRangeOnEntry() {
  if (app.reportRange.rolling) {
    app.reportRange = createReportRange(true, 1, app.dashboardBreathNum);
    stopSliderCallback = true;
    rangeSlider.setSlider([app.reportRange.minBnum, app.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

