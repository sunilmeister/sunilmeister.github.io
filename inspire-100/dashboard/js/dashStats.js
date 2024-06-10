// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardStats() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
  	createAllStats();
		updateVisiblePrevRange();
	}
}

function movingStatRange() {
  let minBnum = session.maxBreathNum - STAT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 0;
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateStatRange() {
	updateVisibleRangeLimits();

  // if range is not "full"
  if (!session.stats.range.moving) return;
  if (session.stats.range.moving) movingStatRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.stats.range.minBnum, session.stats.range.maxBnum]);
  stopSliderCallback = false;
}

function updateStatRangeOnEntry() {
  if (!session.stats.range.moving) return;
  movingStatRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.stats.range.minBnum, session.stats.range.maxBnum]);
  stopSliderCallback = false;
}
