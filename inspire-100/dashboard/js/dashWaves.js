// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var prevPwLen = 0;
function createDashboardWaves() {
	rangeWindowDiv.style.display = "block";
  changeRangeSliderColors(session.waves.range.moving);
  let pwLen = session.waves.pwData.length;
  let forceDisplay = session.waves.range.moving && (prevPwLen != pwLen);
	if (isVisibleRangeChanged() || forceDisplay) {
  	createAllWaves();
		updateVisiblePrevRange();
	}
  prevPwLen = pwLen;
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
  changeRangeSliderColors(session.waves.range.moving);
  if (session.waves.range.moving) movingWaveRange();
}
