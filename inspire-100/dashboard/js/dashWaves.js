// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var prevWaveIndex = 0;
function createDashboardWaves() {
	rangeWindowDiv.style.display = "block";
	let lastWaveIndex = session.waves.pwData.length;
	if (isVisibleRangeChanged()) {
    //console.log("----- range", session.waves.range);
    //console.log("isVisibleRangeChanged()",isVisibleRangeChanged());
    //console.log("lastWaveIndex",lastWaveIndex,"prevWaveIndex",prevWaveIndex);
  	createAllWaves();
		updateVisiblePrevRange();
	}
	prevWaveIndex = lastWaveIndex;
}

function movingWaveRange() {
  let minBnum = 0;
  let startWave = session.waves.pwData.length - WAVE_NUM_ROLLING_BREATHS;
  if (startWave < 0) startWave = 0;
  if (session.waves.pwData.length) {
    if (session.waves.pwData[startWave] === null) minBnum = 0;
    else minBnum = session.waves.pwData[startWave].systemBreathNum - session.startSystemBreathNum + 1
  } else {
    minBnum = 0;
  }
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
