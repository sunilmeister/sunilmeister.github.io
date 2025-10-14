// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardStats() {
	rangeWindowDiv.style.display = "block";
  changeRangeSliderColors(session.stats.range.moving);
	if (isVisibleRangeChanged() || session.stats.range.moving) {
  	createAllStats();
		updateVisiblePrevRange();
	}
}

function movingStatRange() {
 	let numBreaths = session.loggedBreaths.length - 1;
  let minBnum = numBreaths - STAT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 0;
	let range = createRangeBnum(true, minBnum, numBreaths);
	updateVisibleViewRangeObject(range);
	showRangeOnSlider(range);
}

function updateStatRange() {
	updateRangeSliderWindow(session.stats.range);
  if (session.stats.range.moving) movingStatRange();
}

function updateStatRangeOnEntry() {
  changeRangeSliderColors(session.stats.range.moving);
  if (session.stats.range.moving) movingStatRange();
}
