// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardSearch() {
	updateSearchResults();
}

function movingSearchRange() {
  let minBnum = session.dashboardBreathNum - SEARCH_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.search.range = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateSearchRange() {
  session.charts.rangeLimit = session.dashboardBreathNum;
  session.rangeSlider.setRange([1, session.charts.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.moving) return;
  if (session.reportRange.moving) movingSearchRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.search.range.minBnum, session.search.range.maxBnum]);
  stopSliderCallback = false;
}

function updateSearchRangeOnEntry() {
  if (!session.reportRange.moving) return;
  movingSearchRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.search.range.minBnum, session.search.range.maxBnum]);
  stopSliderCallback = false;
}
