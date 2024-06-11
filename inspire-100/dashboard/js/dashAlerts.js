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
	let numBreaths = session.loggedBreaths.length - 1;
  let minBnum = numBreaths - ALERT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 0;
	let range = createRangeBnum(true, minBnum, numBreaths);
	updateVisibleViewRangeObject(range);
	showRangeOnSlider(range);
}

function updateAlertRange() {
	updateRangeSliderWindow(session.alerts.range);
  if (session.alerts.range.moving) movingAlertRange();
}

function updateAlertRangeOnEntry() {
  if (session.alerts.range.moving) movingAlertRange();
}
