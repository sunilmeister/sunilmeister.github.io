// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createDashboardSnapshots() {
	rangeWindowDiv.style.display = "block";
 	updateSnapshot();
	updateVisiblePrevRange();
}

function movingSnapshotRange() {
  let minBnum = 1;
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateSnapshotRange() {
	updateVisibleRangeLimits();

  // if range is not "full"
  if (!session.snapshots.range.moving) return;
  if (session.snapshots.range.moving) movingSnapshotRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.snapshots.range.minBnum, session.snapshots.range.maxBnum]);
  stopSliderCallback = false;
}

function updateSnapshotRangeOnEntry() {
  if (!session.snapshots.range.moving) return;
  movingSnapshotRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.snapshots.range.minBnum, session.snapshots.range.maxBnum]);
  stopSliderCallback = false;
}
