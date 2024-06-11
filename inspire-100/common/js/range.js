// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var pickedDate = null;

// returns a range object
function createRange(moving, minBnum, maxBnum) {
  let range = cloneObject(rangeTemplate);
	if (session.maxBreathNum > 0) {
		if (maxBnum == 0) {
			maxBnum = 1;
		}
	}

  range.moving = moving;
  range.minBnum = minBnum;
  range.maxBnum = maxBnum;

  if (minBnum < 1) {
    range.minTime = session.startDate;
  } else {
    range.minTime = session.loggedBreaths[minBnum].time;
  }
  if (maxBnum < 1) {
    range.maxTime = session.startDate;
  } else {
    range.maxTime = session.loggedBreaths[maxBnum].time;
  }

  range.missingBnum = cloneObject(session.missingBreathWindows);
  range.missingTime = cloneObject(session.missingTimeWindows);
	//console.error(range);
  return range;
}

// Each view's range is independant
function updateVisibleViewRange(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			session[view].range = cloneObject(range);
			break;
		}
	}
}

function updateAllRanges(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		session[view].range = cloneObject(range);
	}
}

function updateAllRangesExceptSearch(moving, minBnum, maxBnum) {
	let range = createRange(moving, minBnum, maxBnum);
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (view == "search") continue;
		session[view].range = cloneObject(range);
	}
}

function pauseVisibleRange() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			session[view].range.moving = false;
			break;
		}
	}
}

// toggle between play and pause
function playVisibleRange() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			session[view].range.moving = true;
			break;
		}
	}
}

// toggle between play and pause
function visibleViewRange() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range;
		}
	}
	console.error("No visible view");
	return null;
}

function isSomeViewVisible() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return true;
		}
	}
	return false;
}

// Query - is the visible range in play mode
function isVisibleRangeMoving() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range.moving;
		}
	}
	console.error("No visible view");
	return false;
}

function visibleRangeMinBnum() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range.minBnum;
		}
	}
	console.error("No visible view");
	return null;
}

function visibleRangeMaxBnum() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range.maxBnum;
		}
	}
	console.error("No visible view");
	return null;
}

function visibleRangeMinTime() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range.minTime;
		}
	}
	console.error("No visible view");
	return null;
}

function visibleRangeMaxTime() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return session[view].range.maxTime;
		}
	}
	console.error("No visible view");
	return null;
}

function visibleRangeTimeDuration() {
	let s = visibleRangeMinTime();
	let e = visibleRangeMaxTime();
	if ((s===null) || (e===null)) return 0;

	return e.getTime() - s.getTime();
}

// query - has the range changed since the time this view was displayed
function isVisibleRangeChanged() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			return !equalObjects(session[view].range, session[view].prevRange);
		}
	}
	console.error("No visible view");
	return null;
}

// update the prevRange to reflect the currently displayed range
function updateVisiblePrevRange() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			session[view].prevRange = cloneObject(session[view].range);
			return;
		}
	}
	console.error("No visible view");
}

function updateSelectedSliderMinMax(bmin, bmax) {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) {
			session[view].range = createRange(bmin, bmax);
			break;
		}
	}

 	stopSliderCallback = true;
 	session.rangeSelector.rangeSlider.setSlider([bmin, bmax]);;
 	stopSliderCallback = false;
}

function updateVisibleRangeLimits() {
  let rangeMax = session.maxBreathNum;
	if (rangeMax == 0) rangeMax = 1;
  session.rangeSelector.rangeSlider.setRange([0, rangeMax]);
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
	let toBreath = null;

	if (session.snapshot.visible) {
		toBreath = fromBreath;
		if (session.maxBreathNum > 0) fromBreath = 1;
		else fromBreath = 0;
	} else {
		toBreath = fromBreath + numBreaths - 1;
		let maxBnum = session.loggedBreaths.length - 1;
		if (toBreath > maxBnum) toBreath = maxBnum;

  	if ((fromBreath <= 0) || (toBreath <= 0)) {
    	modalAlert("Invalid Breath Range", "Try again!");
    	return;
  	}
	}

  stopSliderCallback = true;
  session.rangeSelector.rangeSlider.setSlider([fromBreath, toBreath]);
  stopSliderCallback = false;

  setTimeInterval();

  document.getElementById("enterRangeDiv").style.display = "none";
}

function acceptBreathTimeRange() {
	if (!pickedDate) pickedDate = session.startDate;
	let fromTime = new Date(pickedDate);
	pickedDate = null;

	let duration = document.getElementById("rangeDuration").value;
	let seconds = 0;

	// duration is irreleveant for snapshot view
	if (!session.snapshot.visible) {
		let arr = duration.split(':'); // split it at the colons
		//console.log("arr", arr);
		if (arr.length != 3) {
    	modalAlert("Invalid Range Duration", "Try again!");
    	return;
  	}

		seconds = Number(arr[0]) * 60 * 60 + Number(arr[1]) * 60 + Number(arr[2]);
		if (!seconds) {
    	modalAlert("Invalid Range Duration", "Try again!");
    	return;
  	}
	}

	let toTime = addMsToDate(fromTime, seconds*1000);
	
	//console.log("fromTime", fromTime);
	//console.log("toTime", toTime);
	let fromBreath = null;
	let toBreath = null;
	if (session.snapshot.visible) {
		if (session.maxBreathNum > 0) fromBreath = 1;
		else fromBreath = 0;
		toBreath = lookupBreathNum(fromTime);
	} else {
		fromBreath = lookupBreathNum(fromTime);
		toBreath = lookupBreathNum(toTime);
	}
	//console.log("fromBreath", fromBreath);
	//console.log("toBreath", toBreath);

	if (!fromBreath || !toBreath) {
    modalAlert("Invalid Breath Range", "Try again!");
    return;
	}

  stopSliderCallback = true;
  session.rangeSelector.rangeSlider.setSlider([fromBreath, toBreath]);
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
	if (session.snapshot.visible) {
  	document.getElementById("rangeNumBreaths").value = "--";
		document.getElementById("rangeNumBreaths").disabled = true;
		document.getElementById("rangeNumBreaths").style.cursor = "not-allowed";
	} else {
  	document.getElementById("rangeNumBreaths").value = maxBnum - minBnum + 1;
		document.getElementById("rangeNumBreaths").disabled = false;
		document.getElementById("rangeNumBreaths").style.cursor = "default";
	}
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

	if (session.snapshot.visible) {
  	document.getElementById("rangeDuration").value = "--";
		document.getElementById("rangeDuration").disabled = true;
		document.getElementById("rangeDuration").style.cursor = "not-allowed";
	} else {
		document.getElementById("rangeDuration").disabled = false;
		document.getElementById("rangeDuration").style.cursor = "default";
	}

	document.getElementById('enterRangeBnumDiv').style.display = "none";
	document.getElementById('enterRangeBtimeDiv').style.display = "block";
}

function showCurrentRangeTimes() {
	if (!isSomeViewVisible()) return;

	let minBnum = visibleRangeMinBnum();
	let maxBnum = visibleRangeMaxBnum();

	if (maxBnum < minBnum) {
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

	if ((minTime === null) || (maxTime === null)) {
		document.getElementById('fromRangeDay').innerHTML = "--";
		document.getElementById('fromRangeDate').innerHTML = "--";
		document.getElementById('fromRangeTime').innerHTML = "--";
		document.getElementById('toRangeDay').innerHTML = "--";
		document.getElementById('toRangeDate').innerHTML = "--";
		document.getElementById('toRangeTime').innerHTML = "--";
		document.getElementById('spanRangeBtime').innerHTML = "--";
	} else {
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
	}

	document.getElementById('breathRangePopup').style.display = "block";
}

function fullRange() {
  let values = session.rangeSelector.rangeSlider.getRange();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);

	updateSelectedSliderMinMax(bmin, bmax);
}

function forwardRange() {
  let values = session.rangeSelector.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

	let bmin = visibleRangeMinBnum();
	let bmax = visibleRangeMaxBnum();
	let span = bmax - bmin + 1;

	if (session.snapshot.visible) {
		bmax++;
		if (bmax > session.maxBreathNum) bmax = session.maxBreathNum;
	} else if ((bmax + span) > maxRange) {
		bmax = maxRange;
	} else {
		bmax += span;
	}

	if (session.snapshot.visible) {
		bmin = 0;
	} else {
		bmin = bmax - span + 1;
	}
	updateSelectedSliderMinMax(bmin, bmax);
}

function rewindRange() {
  let values = session.rangeSelector.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

	let bmin = visibleRangeMinBnum();
	let bmax = visibleRangeMaxBnum();
	let span = bmax - bmin + 1;

	if (session.snapshot.visible) {
		bmin = 0;
	} else if ((bmin - span) < minRange) {
		bmin = minRange;
	} else {
		bmin -= span;
	}

	if (session.snapshot.visible) {
		bmax--;
		if (bmax < 1) bmax = 1;
	} else {
		bmax = bmin + span - 1;
	}

	updateSelectedSliderMinMax(bmin, bmax);
}

function updateRangeSliderWindow(range) {
	if (isUndefined(range)) return;
	if (range === null) return;

	stopSliderCallback = true;
	if (session.rangeSelector.timeBased) {
		let min = range.minTime.getTime();
		let max = range.maxTime.getTime();
		let start = session.startDate.getTime();
		let end = session.lastChirpDate.getTime();
		if (end === null) end = start;
		session.rangeSelector.rangeSlider.setRange([start, end]);;
 		session.rangeSelector.rangeSlider.setSlider([min, max]);;
	} else {
		let minBnum = range.minBnum;
		let maxBnum = range.maxBnum;
 		session.rangeSelector.rangeSlider.setSlider([minBnum, maxBnum]);;
		session.rangeSelector.rangeSlider.setRange([0, session.maxBreathNum]);;
	}
	stopSliderCallback = false;
}

function rangeTimeBased() {
	document.getElementById("btnNumBased").style.backgroundColor = "white";
	document.getElementById("btnTimeBased").style.backgroundColor = palette.blue;
	session.rangeSelector.timeBased = true;
	updateRangeSliderWindow(visibleViewRange());
}

function rangeNumBased() {
	document.getElementById("btnNumBased").style.backgroundColor = palette.blue;
	document.getElementById("btnTimeBased").style.backgroundColor = "white";
	session.rangeSelector.timeBased = false;
	updateRangeSliderWindow(visibleViewRange());
}

window.addEventListener("load", function() {
  new KeypressEnterSubmit('rangeFromBnum', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeNumBreaths', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeDuration', 'acceptRangeBtn');
});

