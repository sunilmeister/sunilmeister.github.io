saveAlertXrange = null;

function createAlertRangeSlider(div) {
  alertRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  alertRangeSlider.setChangeCallback(alertRangeSliderCallback);
}

function setAlertTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  values = alertRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveAlertXrange = reportsXrange;
  reportsXrange.doFull = false;
  reportsXrange.minBnum = bmin;
  reportsXrange.maxBnum = bmax;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  setStatTimeInterval();
  setChartTimeInterval();
}

function cancelAlertTimeInterval(btn) {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  if (saveAlertXrange) {
    reportsXrange = saveAlertXrange;
  } else {
    reportsXrange.doFull = true;
    reportsXrange.minBnum = 1;
    reportsXrange.maxBnum = dashboardBreathNum;
  }
  stopSliderCallback = true;
  alertRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
  stopSliderCallback = false;

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  cancelStatTimeInterval();
  cancelChartTimeInterval();
}

function resetAlertTimeInterval(btn) {
  saveAlertXrange = null;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  reportsXrange.doFull = true;
  reportsXrange.minBnum = 1;
  reportsXrange.maxBnum = dashboardBreathNum;
  alertRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);

  // check if call is because of my button
  if (typeof btn == 'undefined') return;
  resetStatTimeInterval();
  resetChartTimeInterval();
}

function alertRangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = statRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  statRangeSlider.setSlider([bmin, bmax]);
  chartRangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function updateAlertRangeOnNewBreath(num) {
    if (dashboardBreathNum==1) {
    alertRangeSlider.setRange([1, 2]);
  } else {
    alertRangeSlider.setRange([1, dashboardBreathNum]);
  }
  if (reportsXrange.doFull && !sliderCommitPending) {
    stopSliderCallback = true;
    alertRangeSlider.setSlider([1, dashboardBreathNum]);
    stopSliderCallback = false;
  }
}


