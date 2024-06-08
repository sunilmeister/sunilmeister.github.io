// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardAlerts() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
  	createAllAlerts();
		updateVisiblePrevRange();
	}
}

function movingAlertRange() {
  let minBnum = session.maxBreathNum - ALERT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateAlertRange() {
	updateVisibleRangeLimits();

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
