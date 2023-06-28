// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function rollingStatRange() {
  minBnum = session.dashboardBreathNum - STAT_NUM_ROLLING_BREATHS + 1;
  if (minBnum <= 0) minBnum = 1;
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateStatRange() {
  session.stats.rangeLimit = session.dashboardBreathNum;
  rangeSlider.setRange([1, session.stats.rangeLimit]);

  // if range is not "full"
  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) rollingStatRange();

  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function updateStatRangeOnEntry() {
  if (!session.reportRange.rolling) return;
  rollingStatRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
