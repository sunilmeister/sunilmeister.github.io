// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function movingAlertRange() {
  let minBnum = session.dashboardBreathNum - ALERT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateAlertRange() {
  session.alerts.rangeLimit = session.dashboardBreathNum;
  session.rangeSlider.setRange([1, session.alerts.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.moving) return;
  if (session.reportRange.moving) movingAlertRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateAlertRangeOnEntry() {
  if (!session.reportRange.moving) return;
  movingAlertRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
