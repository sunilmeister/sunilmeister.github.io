// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardWaves() {
  createAllWaves();
}

function rollingWaveRange() {
  var minBnum = 0;
  startWave = session.waves.pwData.length - WAVE_NUM_ROLLING_BREATHS;
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

  if (!session.reportRange.rolling || sliderCommitPending) return;
  if (session.reportRange.rolling) {
    if (session.reportRange.rolling && session.waves.pwData.length > WAVE_NUM_ROLLING_BREATHS) {
      rollingWaveRange();
    } else {
      session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
    }

    stopSliderCallback = true;
    rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateWaveRangeOnEntry() {
  if (!session.reportRange.rolling) return;

  rollingWaveRange();
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}
