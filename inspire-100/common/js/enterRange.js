// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var pickedDate = null;

function enterBreathInterval () {
  document.getElementById("enterRangeDiv").style.display = "block";
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

  sliderCommitPending = true;
  setTimeInterval();

  document.getElementById("enterRangeDiv").style.display = "none";
}

function acceptBreathTimeRange() {
	if (!pickedDate) pickedDate = session.startDate;
	let fromTime = new Date(pickedDate);
	pickedDate = null;

	let duration = document.getElementById("rangeDuration").value;

	let arr = duration.split(':'); // split it at the colons
	if (arr.length != 2) {
    modalAlert("Invalid Range Duration", "Try again!");
    return;
  }

	let seconds = (+arr[0]) * 60 * 60 + (+arr[1]) * 60;
	if (!seconds) {
    modalAlert("Invalid Range Duration", "Try again!");
    return;
  }

	let toTime = addMsToDate(fromTime, seconds*1000);
	//console.log(fromTime,duration,toTime);
	
	let fromBreath = lookupBreathNum(fromTime);
	let toBreath = lookupBreathNum(toTime);
	if (!fromBreath || !toBreath) {
    modalAlert("Invalid Breath Range", "Try again!");
    return;
	}

  stopSliderCallback = true;
  session.rangeSlider.setSlider([fromBreath, toBreath]);
  stopSliderCallback = false;

  sliderCommitPending = true;
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
	document.getElementById('enterRangeBnumDiv').style.display = "block";
	document.getElementById('enterRangeBtimeDiv').style.display = "none";
}

function enterRangeBtime() {
	let startDate = session.startDate;
	if (!startDate) startDate = new Date();
	$('input[name="rangeFromBtime"]').daterangepicker({
    singleDatePicker: true,
    timePicker: true,
    timePickerSeconds: true,
		startDate: session.reportRange.minTime,
		endDate: session.reportRange.maxTime,
		minDate: session.startDate,
		maxDate: addMsToDate(startDate,session.sessionDurationInMs),
    showDropdowns: true,
		}, function(start, end, label) {
			pickedDate = new Date(start);
    	alert("You are here");
  	});
	document.getElementById('enterRangeBnumDiv').style.display = "none";
	document.getElementById('enterRangeBtimeDiv').style.display = "block";
}

function showCurrentRangeTimes() {
	let minBnum = session.reportRange.minBnum;
	let maxBnum = session.reportRange.maxBnum;
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

	let minTime = session.reportRange.minTime;
	let maxTime = session.reportRange.maxTime;

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
	document.getElementById('spanRangeBtime').innerHTML = msToTimeStr(tspan);

	document.getElementById('breathRangePopup').style.display = "block";
}

function fullRange() {
  let values = session.rangeSlider.getRange();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);
  session.reportRange = createReportRange(false, bmin, bmax);
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function forwardRange() {
  let values = session.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

  let bmin = session.reportRange.minBnum;
  let bmax = session.reportRange.maxBnum;
	let span = bmax - bmin + 1;

	if ((bmax + span) > maxRange) {
		bmax = maxRange;
	} else {
		bmax += span;
	}
	bmin = bmax - span + 1;

  session.reportRange = createReportRange(false, bmin, bmax);
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

function rewindRange() {
  let values = session.rangeSlider.getRange();
  let minRange = parseInt(values[0]);
  let maxRange = parseInt(values[1]);
	if (maxRange <= 1) return;

  let bmin = session.reportRange.minBnum;
  let bmax = session.reportRange.maxBnum;
	let span = bmax - bmin + 1;

	if ((bmin - span) < minRange) {
		bmin = minRange;
	} else {
		bmin -= span;
	}
	bmax = bmin + span - 1;

  session.reportRange = createReportRange(false, bmin, bmax);
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
}

window.addEventListener("load", function() {
  new KeypressEnterSubmit('rangeFromBnum', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeNumBreaths', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeDuration', 'acceptRangeBtn');
});

