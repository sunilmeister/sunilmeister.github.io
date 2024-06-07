// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var pickedDate = null;

// returns a range object
function createRange(moving, minBnum, maxBnum) {
  let range = cloneObject(rangeTemplate);
  range.moving = moving;
  range.initBnum = 1;
  range.minBnum = minBnum;
  range.maxBnum = maxBnum;
  if (!session.breathTimes[minBnum]) { // missing breath
    minBnum = closestNonNullEntryIndex(session.breathTimes, minBnum);
  }
  if (!session.breathTimes[maxBnum]) { // missing breath
    maxBnum = closestNonNullEntryIndex(session.breathTimes, maxBnum);
  }

  range.initTime = session.startDate;
  if (minBnum < 1) {
    range.minTime = session.startDate;
  } else {
    range.minTime = session.breathTimes[minBnum];
  }
  if (maxBnum < 1) {
    range.maxTime = session.startDate;
  } else {
    range.maxTime = session.breathTimes[maxBnum];
  }

  range.missingBnum = cloneObject(session.missingBreathWindows);
  range.missingTime = cloneObject(session.missingTimeWindows);
  return range;
}

function updateVisibleViewRange(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	if (session.snapshots.visible) 		session.snapshots.range = cloneObject(range);
	else if (session.charts.visible) 	session.charts.range = cloneObject(range);
	else if (session.waves.visible) 	session.waves.range = cloneObject(range);
	else if (session.stats.visible) 	session.stats.range = cloneObject(range);
	else if (session.alerts.visible) 	session.alerts.range = cloneObject(range);
	else if (session.search.visible) 	session.search.range = cloneObject(range);
	else if (session.record.visible) 	session.record.range = cloneObject(range);
}

function updateAllRanges(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	session.snapshots.range = cloneObject(range);
	session.charts.range = cloneObject(range);
	session.waves.range = cloneObject(range);
	session.stats.range = cloneObject(range);
	session.alerts.range = cloneObject(range);
	session.search.range = cloneObject(range);
	session.record.range = cloneObject(range);
}

function updateAllRangesExceptSearch(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	session.snapshots.range = cloneObject(range);
	session.charts.range = cloneObject(range);
	session.waves.range = cloneObject(range);
	session.stats.range = cloneObject(range);
	session.alerts.range = cloneObject(range);
	session.record.range = cloneObject(range);
}

function pauseVisibleRange() {
	if (session.snapshots.visible) 		session.snapshots.range.moving = false;
	else if (session.charts.visible) 	session.charts.range.moving = false;
	else if (session.waves.visible) 	session.waves.range.moving = false;
	else if (session.stats.visible) 	session.stats.range.moving = false;
	else if (session.alerts.visible) 	session.alerts.range.moving = false;
	else if (session.search.visible) 	session.search.range.moving = false;
	else if (session.record.visible) 	session.record.range.moving = false;
}

function playVisibleRange() {
	if (session.snapshots.visible) 		session.snapshots.range.moving = true;
	else if (session.charts.visible) 	session.charts.range.moving = true;
	else if (session.waves.visible) 	session.waves.range.moving = true;
	else if (session.stats.visible) 	session.stats.range.moving = true;
	else if (session.alerts.visible) 	session.alerts.range.moving = true;
	else if (session.search.visible) 	session.search.range.moving = true;
	else if (session.record.visible) 	session.record.range.moving = true;
}

function visibleViewRange() {
	if (session.snapshots.visible) 		return session.snapshots.range ;
	else if (session.charts.visible) 	return session.charts.range ;
	else if (session.waves.visible) 	return session.waves.range ;
	else if (session.stats.visible) 	return session.stats.range ;
	else if (session.alerts.visible) 	return session.alerts.range ;
	else if (session.search.visible) 	return session.search.range ;
	else if (session.record.visible) 	return session.record.range ;
	console.error("No visible view");
	return null;
}

function isVisibleRangeMoving() {
	if (session.snapshots.visible) 		return session.snapshots.range.moving ;
	else if (session.charts.visible) 	return session.charts.range.moving ;
	else if (session.waves.visible) 	return session.waves.range.moving ;
	else if (session.stats.visible) 	return session.stats.range.moving ;
	else if (session.alerts.visible) 	return session.alerts.range.moving ;
	else if (session.search.visible) 	return session.search.range.moving ;
	else if (session.record.visible) 	return session.record.range.moving ;
	console.error("No visible view");
	return false;
}

function visibleRangeMinBnum() {
	if (session.snapshots.visible) 		return session.snapshots.range.minBnum ;
	else if (session.charts.visible) 	return session.charts.range.minBnum ;
	else if (session.waves.visible) 	return session.waves.range.minBnum ;
	else if (session.stats.visible) 	return session.stats.range.minBnum ;
	else if (session.alerts.visible) 	return session.alerts.range.minBnum ;
	else if (session.search.visible) 	return session.search.range.minBnum ;
	else if (session.record.visible) 	return session.record.range.minBnum ;
	console.error("No visible view");
	return null;
}

function visibleRangeMaxBnum() {
	if (session.snapshots.visible) 		return session.snapshots.range.maxBnum ;
	else if (session.charts.visible) 	return session.charts.range.maxBnum ;
	else if (session.waves.visible) 	return session.waves.range.maxBnum ;
	else if (session.stats.visible) 	return session.stats.range.maxBnum ;
	else if (session.alerts.visible) 	return session.alerts.range.maxBnum ;
	else if (session.search.visible) 	return session.search.range.maxBnum ;
	else if (session.record.visible) 	return session.record.range.maxBnum ;
	console.error("No visible view");
	return null;
}

function visibleRangeMinTime() {
	if (session.snapshots.visible) 		return session.snapshots.range.minTime ;
	else if (session.charts.visible) 	return session.charts.range.minTime ;
	else if (session.waves.visible) 	return session.waves.range.minTime ;
	else if (session.stats.visible) 	return session.stats.range.minTime ;
	else if (session.alerts.visible) 	return session.alerts.range.minTime ;
	else if (session.search.visible) 	return session.search.range.minTime ;
	else if (session.record.visible) 	return session.record.range.minTime ;
	console.error("No visible view");
	return null;
}

function visibleRangeMaxTime() {
	if (session.snapshots.visible) 		return session.snapshots.range.maxTime ;
	else if (session.charts.visible) 	return session.charts.range.maxTime ;
	else if (session.waves.visible) 	return session.waves.range.maxTime ;
	else if (session.stats.visible) 	return session.stats.range.maxTime ;
	else if (session.alerts.visible) 	return session.alerts.range.maxTime ;
	else if (session.search.visible) 	return session.search.range.maxTime ;
	else if (session.record.visible) 	return session.record.range.maxTime ;
	console.error("No visible view");
	return null;
}

function isVisibleRangeChanged() {
	if (session.snapshots.visible) 		{ 
		return !equalObjects(session.snapshots.range, session.snapshots.prevRange) ;
	} else if (session.charts.visible) 	{
		return !equalObjects(session.charts.range, session.charts.prevRange) ;
	} else if (session.waves.visible) 	{
		return !equalObjects(session.waves.range, session.waves.prevRange) ;
	} else if (session.stats.visible) 	{
		return !equalObjects(session.stats.range, session.stats.prevRange) ;
	} else if (session.alerts.visible) 	{
		return !equalObjects(session.alerts.range, session.alerts.prevRange) ;
	} else if (session.search.visible) 	{
		return !equalObjects(session.search.range, session.search.prevRange) ;
	} else if (session.record.visible) 	{
		return !equalObjects(session.record.range, session.record.prevRange) ;
	}
	console.error("No visible view");
	return null;
}

function updateVisiblePrevRange() {
	if (session.snapshots.visible) 		{ 
		session.snapshots.prevRange  = session.snapshots.range;
	} else if (session.charts.visible) 	{
		session.charts.prevRange  = session.charts.range;
	} else if (session.waves.visible) 	{
		session.waves.prevRange  = session.waves.range;
	} else if (session.stats.visible) 	{
		session.stats.prevRange  = session.stats.range;
	} else if (session.alerts.visible) 	{
		session.alerts.prevRange  = session.alerts.range;
	} else if (session.search.visible) 	{
		session.search.prevRange  = session.search.range;
	} else if (session.record.visible) 	{
		session.record.prevRange  = session.record.range;
	}
}

function updateSelectedSliderMinMax(bmin, bmax) {
	if (session.snapshots.visible) 		session.snapshots.range = createRange(false, bmin, bmax);
	else if (session.charts.visible) 	session.charts.range = createRange(false, bmin, bmax);
	else if (session.waves.visible) 	session.waves.range = createRange(false, bmin, bmax);
	else if (session.stats.visible) 	session.stats.range = createRange(false, bmin, bmax);
	else if (session.alerts.visible) 	session.alerts.range = createRange(false, bmin, bmax);
	else if (session.search.visible) 	session.search.range = createRange(false, bmin, bmax);
	else if (session.record.visible) 	session.record.range = createRange(false, bmin, bmax);

 	stopSliderCallback = true;
 	session.rangeSlider.setSlider([bmin, bmax]);;
 	stopSliderCallback = false;
}

function enterBreathInterval () {
  document.getElementById("enterRangeDiv").style.display = "block";
  if (document.getElementById("enterRangeBnum").checked) {
		enterRangeBnum();
	} else {
		enterRangeBtime();
	}
}

function acceptBreathNumRange() {
	let fromBreath = Number(document.getElementById("rangeFromBnum").value);
  let numBreaths = Number(document.getElementById("rangeNumBreaths").value);

	let toBreath = fromBreath + numBreaths - 1;
	let maxBnum = session.breathTimes.length - 1;
	if (toBreath > maxBnum) toBreath = maxBnum;

  if ((fromBreath <= 0) || (toBreath <= 0)) {
    modalAlert("Invalid Breath Range", "Try again!");
    return;
  }

  stopSliderCallback = true;
  session.rangeSlider.setSlider([fromBreath, toBreath]);
  stopSliderCallback = false;

  setTimeInterval();

  document.getElementById("enterRangeDiv").style.display = "none";
}

function acceptBreathTimeRange() {
	if (!pickedDate) pickedDate = session.startDate;
	let fromTime = new Date(pickedDate);
	pickedDate = null;

	let duration = document.getElementById("rangeDuration").value;

	let arr = duration.split(':'); // split it at the colons
	//console.log("arr", arr);
	if (arr.length != 3) {
    modalAlert("Invalid Range Duration", "Try again!");
    return;
  }

	let seconds = Number(arr[0]) * 60 * 60 + Number(arr[1]) * 60 + Number(arr[2]);
	if (!seconds) {
    modalAlert("Invalid Range Duration", "Try again!");
    return;
  }
	console.log("seconds", seconds);

	let toTime = addMsToDate(fromTime, seconds*1000);
	
	//console.log("fromTime", fromTime);
	//console.log("toTime", toTime);
	let fromBreath = lookupBreathNum(fromTime);
	let toBreath = lookupBreathNum(toTime);
	//console.log("fromBreath", fromBreath);
	//console.log("toBreath", toBreath);

	if (!fromBreath || !toBreath) {
    modalAlert("Invalid Breath Range", "Try again!");
    return;
	}

  stopSliderCallback = true;
  session.rangeSlider.setSlider([fromBreath, toBreath]);
  stopSliderCallback = false;

  setTimeInterval();

 document.getElementById("enterRangeDiv").style.display = "none";
}

function acceptBreathRange () {
  if (document.getElementById("enterRangeBnum").checked) acceptBreathNumRange();
	else acceptBreathTimeRange();
}

function cancelBreathRange () {
  document.getElementById("enterRangeDiv").style.display = "none";
}

function enterRangeBnum() {
	let minBnum = visibleRangeMinBnum();
	let maxBnum = visibleRangeMaxBnum();

	document.getElementById("rangeFromBnum").value = minBnum;
  document.getElementById("rangeNumBreaths").value = maxBnum - minBnum + 1;
	document.getElementById('enterRangeBnumDiv').style.display = "block";
	document.getElementById('enterRangeBtimeDiv').style.display = "none";
}

function enterRangeBtime() {
	let selectName = 'input[name="rangeFromBtime"]';
	let startDate = session.startDate;
	if (!startDate) startDate = new Date();

	let minTime = visibleRangeMinTime();
	let maxTime = visibleRangeMaxTime();

	let ms, msStr;
	if (minTime) { // for dashboard before any breath logged
		ms = maxTime.getTime() - minTime.getTime();
		msStr = msToHHMMSS(ms);
	} else {
		msStr = "00:00:00";
		minTime = maxTime = new Date();
	}
	document.getElementById("rangeDuration").value = msStr;

	$(selectName).daterangepicker({
    singleDatePicker: true,
    timePicker: true,
    timePickerSeconds: true,
		startDate: minTime,
		endDate: maxTime,
		minDate: startDate,
		maxDate: addMsToDate(startDate,session.sessionDurationInMs),
    showDropdowns: true,
		locale: {
			format: 'DD/MMM/YYYY HH:MM:SS'
        }
		}, function(start, end, label) {
			pickedDate = new Date(start);
  	});

  //console.log("startDate", minTime);
  //console.log("endDate", maxTime);
  //console.log("minDate", session.startDate);
  //console.log("maxDate", addMsToDate(startDate,session.sessionDurationInMs));

	document.getElementById('enterRangeBnumDiv').style.display = "none";
	document.getElementById('enterRangeBtimeDiv').style.display = "block";
}

function showCurrentRangeTimes() {
	let minBnum = visibleRangeMinBnum();
	let maxBnum = visibleRangeMaxBnum();

	if (maxBnum <= minBnum) {
		document.getElementById('fromRangeDay').innerHTML = "---";
		document.getElementById('fromRangeDate').innerHTML = "---";
		document.getElementById('fromRangeTime').innerHTML = "---";
		document.getElementById('toRangeDay').innerHTML = "---";
		document.getElementById('toRangeDate').innerHTML = "---";
		document.getElementById('toRangeTime').innerHTML = "---";
		document.getElementById('fromRangeBnum').innerHTML = "---";
		document.getElementById('toRangeBnum').innerHTML = "---";
		document.getElementById('spanRangeBnum').innerHTML = "---";
		document.getElementById('spanRangeBtime').innerHTML = "---";
		document.getElementById('breathRangePopup').style.display = "block";
		return;
	}
	document.getElementById('fromRangeBnum').innerHTML = minBnum;
	document.getElementById('toRangeBnum').innerHTML = maxBnum;
	document.getElementById('spanRangeBnum').innerHTML = maxBnum - minBnum + 1;

	let minTime = visibleRangeMinTime();
	let maxTime = visibleRangeMaxTime();

 	let mm = minTime.getMonth();
	let dd = minTime.getDate();
	let yyyy = minTime.getFullYear();
	let ddStr = String(dd).padStart(2, "0");
	let dateStr = ddStr+'-'+months[mm]+'-'+yyyy;
  let hour = minTime.getHours();
  let minute = minTime.getMinutes();
  let second = minTime.getSeconds();
  let hourStr = hour.toString().padStart(2, "0");
  let minuteStr = minute.toString().padStart(2, "0");
  let secondStr = second.toString().padStart(2, "0");
  let timeStr = `${hourStr}:${minuteStr}:${secondStr}`;
	document.getElementById('fromRangeDay').innerHTML = weekDays[minTime.getDay()];
	document.getElementById('fromRangeDate').innerHTML = dateStr;
	document.getElementById('fromRangeTime').innerHTML = timeStr;

 	mm = maxTime.getMonth();
	dd = maxTime.getDate();
	yyyy = maxTime.getFullYear();
	ddStr = String(dd).padStart(2, "0");
	dateStr = ddStr+'-'+months[mm]+'-'+yyyy;
  hour = maxTime.getHours();
  minute = maxTime.getMinutes();
  second = maxTime.getSeconds();
  hourStr = hour.toString().padStart(2, "0");
  minuteStr = minute.toString().padStart(2, "0");
  secondStr = second.toString().padStart(2, "0");
  timeStr = `${hourStr}:${minuteStr}:${secondStr}`;
	document.getElementById('toRangeDay').innerHTML = weekDays[maxTime.getDay()];
	document.getElementById('toRangeDate').innerHTML = dateStr;
	document.getElementById('toRangeTime').innerHTML = timeStr;

	let tspan = maxTime.getTime() - minTime.getTime();
	document.getElementById('spanRangeBtime').innerHTML = msToHHMMSS(tspan);

	document.getElementById('breathRangePopup').style.display = "block";
}

function fullRange() {
  let values = session.rangeSlider.getRange();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);

	updateSelectedSliderMinMax(bmin, bmax);
}

function forwardRange() {
  let values = session.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

	let bmin = visibleRangeMinBnum();
	let bmax = visibleRangeMaxBnum();
	let span = bmax - bmin + 1;

	if ((bmax + span) > maxRange) {
		bmax = maxRange;
	} else {
		bmax += span;
	}
	bmin = bmax - span + 1;

	updateSelectedSliderMinMax(bmin, bmax);
}

function rewindRange() {
  let values = session.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

	let bmin = visibleRangeMinBnum();
	let bmax = visibleRangeMaxBnum();
	let span = bmax - bmin + 1;

	if ((bmin - span) < minRange) {
		bmin = minRange;
	} else {
		bmin -= span;
	}
	bmax = bmin + span - 1;

	updateSelectedSliderMinMax(bmin, bmax);
}

window.addEventListener("load", function() {
  new KeypressEnterSubmit('rangeFromBnum', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeNumBreaths', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeDuration', 'acceptRangeBtn');
});

