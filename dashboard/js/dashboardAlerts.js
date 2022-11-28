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

function setAlertTimeInterval() {
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
}

function cancelAlertTimeInterval() {
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
  alertRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
}

function resetAlertTimeInterval() {
  saveAlertXrange = null;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  reportsXrange.doFull = true;
  reportsXrange.minBnum = 1;
  reportsXrange.maxBnum = dashboardBreathNum;
  alertRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
}

function alertRangeSliderCallback() {
  flashBreathWindowButtons();
  sliderCommitPending = true;
}

function updateAlertRangeOnNewBreath(num) {
    if (dashboardBreathNum==1) {
    alertRangeSlider.setRange([1, 2]);
  } else {
    alertRangeSlider.setRange([1, dashboardBreathNum]);
  }
  if (reportsXrange.doFull && !sliderCommitPending) {
    alertRangeSlider.setSlider([1, dashboardBreathNum]);
  }
}


