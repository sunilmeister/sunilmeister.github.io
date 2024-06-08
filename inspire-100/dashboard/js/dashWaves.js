// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardWaves() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
  	createAllWaves();
		updateVisiblePrevRange();
	}
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
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateWaveRange() {
	updateVisibleRangeLimits();

  if (!session.waves.range.moving) return;
  if (session.waves.range.moving) {
    if (session.waves.range.moving && session.waves.pwData.length > WAVE_NUM_ROLLING_BREATHS) {
      movingWaveRange();
    } else {
      updateVisibleViewRange(true, 1, session.maxBreathNum);
    }

    stopSliderCallback = true;
    session.rangeSlider.setSlider([session.waves.range.minBnum, session.waves.range.maxBnum]);
    stopSliderCallback = false;
  }
}

function updateWaveRangeOnEntry() {
  if (!session.waves.range.moving) return;

  movingWaveRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.waves.range.minBnum, session.waves.range.maxBnum]);
  stopSliderCallback = false;
}
