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
	let numBreaths = session.loggedBreaths.length - 1;
  let minBnum = numBreaths - SEARCH_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 0;
	let range = createRangeBnum(true, minBnum, numBreaths);
	updateVisibleViewRangeObject(range);
	showRangeOnSlider(range);
}

function updateSearchRange() {
	updateRangeSliderWindow(session.search.range);
  if (session.search.range.moving) movingSearchRange();
}

function updateSearchRangeOnEntry() {
  if (session.search.range.moving) movingSearchRange();
}
