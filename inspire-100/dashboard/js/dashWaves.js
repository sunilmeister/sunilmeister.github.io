// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardWaves() {
  createAllWaves();
}

function movingWaveRange() {
  let minBnum = 0;
  let startWave = session.waves.pwData.length - WAVE_NUM_ROLLING_BREATHS;
  if (startWave < 0) startWave = 0;
  if (session.waves.pwData.length) {
    minBnum = session.waves.pwData[startWave].systemBreathNum - session.startSystemBreathNum + 1
  } else {
    minBnum = 0;
  }
  session.reportRange = createReportRange(true, minBnum, session.dashboardBreathNum);
}

function updateWaveRange() {
  rangeSlider.setRange([1, session.dashboardBreathNum]);

  if (!session.reportRange.moving || sliderCommitPending) return;
  if (session.reportRange.moving) {
    if (session.reportRange.moving && session.waves.pwData.length > WAVE_NUM_ROLLING_BREATHS) {
      movingWaveRange();
    } else {
      session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
    }

    stopSliderCallback = true;
    rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateWaveRangeOnEntry() {
  if (!session.reportRange.moving) return;

  movingWaveRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
