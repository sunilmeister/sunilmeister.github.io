// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardSearch() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
		updateSearchResults();
		updateVisiblePrevRange();
	}
}

function movingSearchRange() {
  let minBnum = session.maxBreathNum - SEARCH_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateSearchRange() {
	updateVisibleRangeLimits();

  // if range is not "full"
  if (!session.search.range.moving) return;
  if (session.search.range.moving) movingSearchRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.search.range.minBnum, session.search.range.maxBnum]);
  stopSliderCallback = false;
}

function updateSearchRangeOnEntry() {
  if (!session.search.range.moving) return;
  movingSearchRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.search.range.minBnum, session.search.range.maxBnum]);
  stopSliderCallback = false;
}
