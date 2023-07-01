// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function rollingAlertRange() {
  var minBnum = session.dashboardBreathNum - ALERT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateAlertRange() {
  session.alerts.rangeLimit = session.dashboardBreathNum;
  rangeSlider.setRange([1, session.alerts.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) rollingAlertRange();

  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateAlertRangeOnEntry() {
  if (!session.reportRange.rolling) return;
  rollingAlertRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
