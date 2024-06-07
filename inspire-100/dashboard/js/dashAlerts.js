// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function movingAlertRange() {
  let minBnum = session.dashboardBreathNum - ALERT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.dashboardBreathNum);
}

function updateAlertRange() {
  session.alerts.rangeLimit = session.dashboardBreathNum;
  session.rangeSlider.setRange([1, session.alerts.rangeLimit]);

  // if range is not "full"
  if (!session.alerts.range.moving) return;
  if (session.alerts.range.moving) movingAlertRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.alerts.range.minBnum, session.alerts.range.maxBnum]);
  stopSliderCallback = false;
}

function updateAlertRangeOnEntry() {
  if (!session.alerts.range.moving) return;
  movingAlertRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.alerts.range.minBnum, session.alerts.range.maxBnum]);
  stopSliderCallback = false;
}
