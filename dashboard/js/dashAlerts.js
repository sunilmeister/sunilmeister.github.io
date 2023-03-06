// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateAlertRange() {
  rangeSlider.setRange([1, session.dashboardBreathNum]);
  if (session.reportRange.rolling && !sliderCommitPending) {
    session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
    stopSliderCallback = true;
    rangeSlider.setSlider([1, session.dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

function updateAlertRangeOnEntry() {
  if (session.reportRange.rolling) {
    session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
    stopSliderCallback = true;
    rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}
