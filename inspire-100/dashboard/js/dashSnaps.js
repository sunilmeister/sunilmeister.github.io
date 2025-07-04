// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardSnapshots() {
	rangeWindowDiv.style.display = "block";
	refreshSnapshot();
	updateVisiblePrevRange();
}

function movingSnapshotRange() {
	let range = createRangeBnum(true, 0, session.maxBreathNum);
	updateVisibleViewRangeObject(range);
}

function updateSnapshotRange() {
	updateRangeSliderWindow(session.snapshot.range);
  if (session.snapshot.range.moving) movingSnapshotRange();
}

function updateSnapshotRangeOnEntry() {
  changeRangeSliderColors(session.snapshot.range.moving);
  if (session.snapshot.range.moving) movingSnapshotRange();
}
