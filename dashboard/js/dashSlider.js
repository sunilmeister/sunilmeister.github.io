// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

saveRange = null;

function createRangeSlider(div) {
  dashboardRangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  dashboardRangeSlider.setChangeCallback(dashboardRangeSliderCallback);
}

function setTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = dashboardRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveRange = session.reportRange;
  session.reportRange = createReportRange(false, bmin, bmax);

  createDashboards();
  sliderCommitPending = false;
}

function cancelTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveRange) {
    session.reportRange = saveRange;
  } else {
    session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  }
  dashboardRangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);

  sliderCommitPending = false;
}

function resetTimeInterval(btn) {
  saveRange = null;
  unflashBreathWindowButtons();
  session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  dashboardRangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);

  createDashboards();
  sliderCommitPending = false;
}

function dashboardRangeSliderCallback() {
  flashBreathWindowButtons();
  sliderCommitPending = true;
}
