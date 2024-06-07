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
  let minBnum = session.dashboardBreathNum - STAT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.dashboardBreathNum);
}

function updateStatRange() {
  session.stats.rangeLimit = session.dashboardBreathNum;
  session.rangeSlider.setRange([1, session.stats.rangeLimit]);

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
