saveStatXrange = null;

function createStatRangeSlider(div) {
  statRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  statRangeSlider.setChangeCallback(statRangeSliderCallback);
}

function setStatTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  values = statRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveStatXrange = reportsXrange;
  reportsXrange.doFull = false;
  reportsXrange.minBnum = bmin;
  reportsXrange.maxBnum = bmax;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setChartTimeInterval();
  setAlertTimeInterval();
}

function cancelStatTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  if (saveStatXrange) {
    reportsXrange = saveStatXrange;
  } else {
    reportsXrange.doFull = true;
    reportsXrange.minBnum = 1;
    reportsXrange.maxBnum = dashboardBreathNum;
  }
  stopSliderCallback = true;
  statRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelChartTimeInterval();
  cancelAlertTimeInterval();
}

function resetStatTimeInterval(btn) {
  saveStatXrange = null;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  reportsXrange.doFull = true;
  reportsXrange.minBnum = 1;
  reportsXrange.maxBnum = dashboardBreathNum;
  stopSliderCallback = true;
  statRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetChartTimeInterval();
  resetAlertTimeInterval();
}

function statRangeSliderCallback() {
  if (stopSliderCallback) return;
  console.log("statRangeSliderCallback");
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = statRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  chartRangeSlider.setSlider([bmin, bmax]);
  alertRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateStatRangeOnNewBreath(num) {
  if (dashboardBreathNum==1) {
    statRangeSlider.setRange([1, 2]);
  } else {
    statRangeSlider.setRange([1, dashboardBreathNum]);
  }
  if (reportsXrange.doFull && !sliderCommitPending) {
    stopSliderCallback = true;
    statRangeSlider.setSlider([1, dashboardBreathNum]);
    stopSliderCallback = false;
  }
}

