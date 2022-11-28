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

function setStatTimeInterval() {
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
}

function cancelStatTimeInterval() {
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
  statRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
}

function resetStatTimeInterval() {
  saveStatXrange = null;
  sliderCommitPending = false;
  unflashBreathWindowButtons();
  reportsXrange.doFull = true;
  reportsXrange.minBnum = 1;
  reportsXrange.maxBnum = dashboardBreathNum;
  statRangeSlider.setSlider([reportsXrange.minBnum, reportsXrange.maxBnum]);
}

function statRangeSliderCallback() {
  flashBreathWindowButtons();
  sliderCommitPending = true;
}

function updateStatRangeOnNewBreath(num) {
  if (dashboardBreathNum==1) {
    statRangeSlider.setRange([1, 2]);
  } else {
    statRangeSlider.setRange([1, dashboardBreathNum]);
  }
  if (reportsXrange.doFull && !sliderCommitPending) {
    statRangeSlider.setSlider([1, dashboardBreathNum]);
  }
}

