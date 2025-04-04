// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardWaves() {
	rangeWindowDiv.style.display = "block";
	if (isVisibleRangeChanged()) {
    //console.log("----- range", session.waves.range);
    //console.log("isVisibleRangeChanged()",isVisibleRangeChanged());
    //console.log("lastWaveIndex",lastWaveIndex,"prevWaveIndex",prevWaveIndex);
  	createAllWaves();
		updateVisiblePrevRange();
	}
}

function movingWaveRange() {
  let minBnum = null;

  // find starting wave number searching backwards
  // remember there may be missing waves
  let numWaves = 0;
  for (let i=session.maxBreathNum-1; i>0; i--) {
    if (session.waves.pwData[i]) numWaves++;
    if (numWaves == WAVE_NUM_ROLLING_BREATHS) {
      minBnum = i;
      break;
    }
  }
  if (minBnum === null) minBnum = 1;

	let range = createRangeBnum(true, minBnum, session.maxBreathNum);
	updateVisibleViewRangeObject(range);
	showRangeOnSlider(range);
}

function updateWaveRange() {
	updateRangeSliderWindow(session.waves.range);
  if (session.waves.range.moving) movingWaveRange();
}

function updateWaveRangeOnEntry() {
  if (session.waves.range.moving) movingWaveRange();
}
