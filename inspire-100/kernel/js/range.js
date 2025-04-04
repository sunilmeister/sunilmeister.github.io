// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var datePickerPickedDate = null;

// ////////////////////////////////////////////////////////////
// Below are many utility functions that manipulate ranges
// ////////////////////////////////////////////////////////////

// minBnum and maxBnum are breath numbers
function createRangeBnum(moving, minBnum, maxBnum) {
  let range = cloneObject(rangeTemplate);
	if (session.maxBreathNum > 0) {
		if (maxBnum == 0) {
			maxBnum = 1;
		}
	}

  if (minBnum < 1) {
    range.minTime = session.firstChirpDate;
  } else {
		while (isUndefined(session.loggedBreaths[minBnum])) {
			if (minBnum > 1) minBnum--;
		}
    range.minTime = session.loggedBreaths[minBnum].time;
  }
  if (maxBnum < 1) {
    range.maxTime = session.firstChirpDate;
  } else {
		while (isUndefined(session.loggedBreaths[maxBnum])) {
			if (maxBnum > 1) maxBnum--;
		}
  	if (maxBnum < 1) maxBnum = 1;
    range.maxTime = session.loggedBreaths[maxBnum].time;
  }

  range.moving = moving;
  range.minBnum = minBnum;
  range.maxBnum = maxBnum;

  return range;
}

// minTime and maxTime are Date objects
function createRangeTime(moving, minTime, maxTime) {
  let range = cloneObject(rangeTemplate);

  range.moving = moving;
  range.minTime = minTime;
  range.maxTime = maxTime;

	let minBnum = lookupBreathNum(minTime);
	let maxBnum = lookupBreathNum(maxTime);

  range.minBnum = minBnum;
  range.maxBnum = maxBnum;

  return range;
}

function updateSliderEndpoints(start, end) {
 	stopSliderCallback = true;
 	session.rangeSelector.rangeSlider.setSlider([start, end]);;
 	stopSliderCallback = false;
}

function showRangeOnSlider(range) {
	if (session.rangeSelector.timeBased) {
		updateSliderEndpoints(range.minTime, range.maxTime);
	} else {
		updateSliderEndpoints(range.minBnum, range.maxBnum);
	}
}

function findVisibleView() {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (session[view].visible) return view;
	}
	console.error("No visible view");
	return null;
}

// Each view's range is independant
function updateAllRanges(moving, sliderMin, sliderMax) {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		updateViewRange(view, moving, sliderMin, sliderMax);
	}
}

function updateAllRangesExceptSearch(moving, sliderMin, sliderMax) {
	for (let i=0; i<session.allSessionViews.length; i++) {
		let view = session.allSessionViews[i];
		if (view == "search") continue;
		updateViewRange(view, moving, sliderMin, sliderMax);
	}
}

// toggle between play and pause
function pauseVisibleRange() {
	let view = findVisibleView();
	session[view].range.moving = false;
}

// toggle between play and pause
function playVisibleRange() {
	let view = findVisibleView();
	session[view].range.moving = true;
}

function findVisibleViewRange() {
	let view = findVisibleView();
	return session[view].range;
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

function isVisibleRangeMoving() {
	let view = findVisibleView();
	return session[view].range.moving;
}

function findVisibleRangeMinBnum() {
	let view = findVisibleView();
	return session[view].range.minBnum;
}

function findVisibleRangeMaxBnum() {
	let view = findVisibleView();
	return session[view].range.maxBnum;
}

function findVisibleRangeMinTime() {
	let view = findVisibleView();
	return session[view].range.minTime;
}

function findVisibleRangeMaxTime() {
	let view = findVisibleView();
	return session[view].range.maxTime;
}

function findVisibleRangeTimeDuration() {
	let s = findVisibleRangeMinTime();
	let e = findVisibleRangeMaxTime();
	if ((s===null) || (e===null)) return 0;

	return e.getTime() - s.getTime();
}

// query - has the range changed since the time this view was displayed
function isVisibleRangeChanged() {
	let view = findVisibleView();
	return !equalObjects(session[view].range, session[view].prevRange);
}

// update the prevRange to reflect the currently displayed range
function updateVisiblePrevRange() {
	let view = findVisibleView();
	session[view].prevRange = cloneObject(session[view].range);
}

function enterBreathInterval () {
  document.getElementById("enterRangeDiv").style.display = "block";
	if (findVisibleView() == "snapshot") {
  	document.getElementById("pointBreathNum").style.display = "block";
  	document.getElementById("spanBreathRange").style.display = "none";
  	document.getElementById("pointBreathTime").style.display = "block";
  	document.getElementById("spanBreathTimeRange").style.display = "none";
	} else {
  	document.getElementById("pointBreathNum").style.display = "none";
  	document.getElementById("spanBreathRange").style.display = "block";
  	document.getElementById("pointBreathTime").style.display = "none";
  	document.getElementById("spanBreathTimeRange").style.display = "block";
	}
  if (document.getElementById("enterRangeBnum").checked) {
		enterRangeBnum();
	} else {
		enterRangeBtime();
	}
}

function updateViewRange(view, moving, sliderMin, sliderMax) {
	let range = null;
	if (view == "snapshot") sliderMin = 0; // only the max counts because it is a point in time
	if (session.rangeSelector.timeBased) {
		range = createRangeTime(moving, new Date(sliderMin), new Date(sliderMax));
	} else {
		range = createRangeBnum(moving, sliderMin, sliderMax);
	}

	session[view].range = cloneObject(range);
}

function updateVisibleViewRange(moving, sliderMin, sliderMax) {
	let view = findVisibleView();
	updateViewRange(view, moving, sliderMin, sliderMax);
	showRangeOnSlider(session[view].range);
}

function updateVisibleViewRangeObject(range) {
	let view = findVisibleView();
	session[view].range = cloneObject(range);
	showRangeOnSlider(session[view].range);
}

// ////////////////////////////////////////////////////////////
// Below are responses to buttons on the range selector
// ////////////////////////////////////////////////////////////
function acceptBreathNumRange() {
	let fromBreath = null;
  let numBreaths = null;
	let toBreath = null;

	if (session.snapshot.visible) {
		fromBreath = 0;
		toBreath = Number(document.getElementById("singleBreathNum").value);
	} else {
		fromBreath = Number(document.getElementById("rangeFromBnum").value);
  	numBreaths = Number(document.getElementById("rangeNumBreaths").value);
		toBreath = fromBreath + numBreaths - 1;
		let maxBnum = session.loggedBreaths.length - 1;
		if (toBreath > maxBnum) toBreath = maxBnum;

  	if ((fromBreath <= 0) || (toBreath <= 0)) {
    	modalAlert("Invalid Breath Range", "Try again!");
    	return;
  	}
	}

	let view = findVisibleView();
	session[view].range = createRangeBnum(false, fromBreath, toBreath);
	showRangeOnSlider(session[view].range);

  document.getElementById("enterRangeDiv").style.display = "none";
  editTimeInterval();
}

function acceptBreathTimeRange() {
	let fromTime = null;
	let toTime = null;

	console.log("datePickerPickedDate",datePickerPickedDate);
	if (!datePickerPickedDate) datePickerPickedDate = session.firstChirpDate;

	if (session.snapshot.visible) {
		fromTime = session.firstChirpDate;
		toTime = new Date(datePickerPickedDate);
	} else {
		fromTime = new Date(datePickerPickedDate);
		datePickerPickedDate = null;
		let duration = document.getElementById("rangeDuration").value;

		// duration is irreleveant for snapshot view
		let arr = duration.split(':'); // split it at the colons
		if (arr.length != 3) {
    	modalAlert("Invalid Range Duration", "Try again!");
			datePickerPickedDate = null;
    	return;
  	}

		let seconds = Number(arr[0]) * 60 * 60 + Number(arr[1]) * 60 + Number(arr[2]);
		if (!seconds) {
    	modalAlert("Invalid Range Duration", "Try again!");
			datePickerPickedDate = null;
    	return;
  	}
		toTime = addMsToDate(fromTime, seconds*1000);
	}

	let range = null;
	range = createRangeTime(false, fromTime, toTime);
	
	let view = findVisibleView();
	session[view].range = cloneObject(range);
	showRangeOnSlider(session[view].range);
 	document.getElementById("enterRangeDiv").style.display = "none";
  editTimeInterval();
}

function acceptBreathRange () {
  if (document.getElementById("enterRangeBnum").checked) acceptBreathNumRange();
	else acceptBreathTimeRange();
}

function cancelBreathRange () {
  document.getElementById("enterRangeDiv").style.display = "none";
}

function enterRangeBnum() {
	let minBnum = findVisibleRangeMinBnum();
	let maxBnum = findVisibleRangeMaxBnum();

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
	let startDate = session.firstChirpDate;
	if (!startDate) startDate = new Date();

	let minTime = findVisibleRangeMinTime();
	let maxTime = findVisibleRangeMaxTime();

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
			format: 'DD-MMM-YYYY HH:MM:SS'
        }
		}, function(start, end, label) {
			datePickerPickedDate = new Date(start);
  	});

  //console.log("startDate", minTime);
  //console.log("endDate", maxTime);
  //console.log("minDate", session.firstChirpDate);
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

	let minBnum = findVisibleRangeMinBnum();
	let maxBnum = findVisibleRangeMaxBnum();

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

	let minTime = findVisibleRangeMinTime();
	let maxTime = findVisibleRangeMaxTime();

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
  let min = parseInt(values[0]);
  let max = parseInt(values[1]);

	updateVisibleViewRange(false, min, max);
	autoRangeSliderChange();
}

function forwardRange() {
  let values = session.rangeSelector.rangeSlider.getRange();
  let sliderMinRange = parseInt(values[0]); // could be time-based or breath numbers
  let sliderMaxRange = parseInt(values[1]); // could be time-based or breath numbers
	if (sliderMaxRange <= 1) return;

  values = session.rangeSelector.rangeSlider.getSlider();
  let sliderMin = parseInt(values[0]); // could be time-based or breath numbers
  let sliderMax = parseInt(values[1]); // could be time-based or breath numbers
	let sliderSpan = sliderMax - sliderMin + 1;
	//console.log("forward sliderMin",sliderMin,"sliderMax",sliderMax,"sliderSpan",sliderSpan);

	if (session.rangeSelector.timeBased) {
		// All slider values are time-based
		// calculate sliderMax
		if (session.snapshot.visible) {
			sliderMax += (SNAPSHOT_FORWARD_SPAN_IN_SECS * 1000);
			if (sliderMax > sliderMaxRange) sliderMax = sliderMaxRange;
		} else if ((sliderMax + sliderSpan) > sliderMaxRange) {
			sliderMax = sliderMaxRange;
		} else {
			sliderMax += sliderSpan;
		}

		// calculate sliderMin
		if (session.snapshot.visible) {
			sliderMin = 0;
		} else {
			sliderMin = sliderMax - sliderSpan + 1;
		}
	} else {

		// All slider values are breath numbers
		// calculate sliderMax
		if (session.snapshot.visible) {
			sliderMax++;
			if (sliderMax > session.sliderMaxBreathNum) {
				sliderMax = session.sliderMaxBreathNum;
			}
		} else if ((sliderMax + sliderSpan) > sliderMaxRange) {
			sliderMax = sliderMaxRange;
		} else {
			sliderMax += sliderSpan;
		}

		// calculate sliderMin
		if (session.snapshot.visible) {
			sliderMin = 0;
		} else {
			sliderMin = sliderMax - sliderSpan + 1;
		}
	}

	updateVisibleViewRange(false, sliderMin, sliderMax);
	autoRangeSliderChange();
}

function rewindRange() {
  let values = session.rangeSelector.rangeSlider.getRange();
  let sliderMinRange = parseInt(values[0]); // could be time-based or breath numbers
  let sliderMaxRange = parseInt(values[1]); // could be time-based or breath numbers
	if (sliderMaxRange <= 1) return;

  values = session.rangeSelector.rangeSlider.getSlider();
  let sliderMin = parseInt(values[0]); // could be time-based or breath numbers
  let sliderMax = parseInt(values[1]); // could be time-based or breath numbers
	let sliderSpan = sliderMax - sliderMin + 1;
	//console.log("rewind sliderMin",sliderMin,"sliderMax",sliderMax,"sliderSpan",sliderSpan);

	if (session.rangeSelector.timeBased) {
		// All slider values are time-based
		// calculate sliderMin
		if (session.snapshot.visible) {
			sliderMin -= (SNAPSHOT_REWIND_SPAN_IN_SECS * 1000);
			if (sliderMin < sliderMinRange) sliderMin = sliderMinRange;
		} else if ((sliderMin - sliderSpan) < sliderMinRange) {
			sliderMin = sliderMinRange;
		} else {
			sliderMin -= sliderSpan;
		}

		// calculate sliderMax
		if (session.snapshot.visible) {
			sliderMax -= (SNAPSHOT_REWIND_SPAN_IN_SECS * 1000);
			if (sliderMax<sliderMinRange) {
				sliderMax = sliderMinRange + SNAPSHOT_REWIND_SPAN_IN_SECS;
			}
		} else {
			sliderMax = sliderMin + sliderSpan - 1;
		}
	} else {
		if (session.snapshot.visible) {
			sliderMin = 0;
		} else if ((sliderMin - sliderSpan) < sliderMinRange) {
			sliderMin = sliderMinRange;
		} else {
			sliderMin -= sliderSpan;
		}

		if (session.snapshot.visible) {
			sliderMax--;
			if (sliderMax < 1) sliderMax = 1;
		} else {
			sliderMax = sliderMin + sliderSpan - 1;
		}
	}

	updateVisibleViewRange(false, sliderMin, sliderMax);
	autoRangeSliderChange();
}

function updateRangeSliderWindow(range) {
	if (isUndefined(range)) return;
	if (range === null) return;

	stopSliderCallback = true;
	if (session.rangeSelector.timeBased) {
		let min = range.minTime.getTime();
		let max = range.maxTime.getTime();
		let start = session.firstChirpDate.getTime();
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
	updateRangeSliderWindow(findVisibleViewRange());
}

function rangeNumBased() {
	document.getElementById("btnNumBased").style.backgroundColor = palette.blue;
	document.getElementById("btnTimeBased").style.backgroundColor = "white";
	session.rangeSelector.timeBased = false;
	updateRangeSliderWindow(findVisibleViewRange());
}

window.addEventListener("load", function() {
  new KeypressEnterSubmit('singleBreathNum', 'acceptRangeBtn');
  new KeypressEnterSubmit('singleBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBnum', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeNumBreaths', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeDuration', 'acceptRangeBtn');
});

