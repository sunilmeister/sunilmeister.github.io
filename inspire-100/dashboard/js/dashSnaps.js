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
  let minBnum = 1;
	if (session.maxBreathNum < 1) minBnum = 0;
  updateVisibleViewRange(true, minBnum, session.maxBreathNum);
}

function updateSnapshotRange() {
	updateVisibleRangeLimits();

  // if range is not "full"
  if (!session.snapshot.range.moving) return;
  if (session.snapshot.range.moving) movingSnapshotRange();

  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.snapshot.range.minBnum, session.snapshot.range.maxBnum]);
  stopSliderCallback = false;
}

function updateSnapshotRangeOnEntry() {
  if (!session.snapshot.range.moving) return;
  movingSnapshotRange();
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.snapshot.range.minBnum, session.snapshot.range.maxBnum]);
  stopSliderCallback = false;
}
