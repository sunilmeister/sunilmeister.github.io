// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardSnapshots() {
	rangeWindowDiv.style.display = "block";
	refreshSnapshot();
 	updateSidebar();
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
  if (session.snapshot.range.moving) movingSnapshotRange();
}
