// ///////////////////////////////////////////////////////////////
// Author: Sunil Nanda
// ///////////////////////////////////////////////////////////////

function gatherSnapshotData() {
	session.snapshot.content = {};
	let snap = session.snapshot.content;
	let params = session.params;

	// keep track of the snapshot time
	if (session.snapshot.range.moving) {
		snap.time = session.lastChirpDate;
	} else {
		snap.time = session.snapshot.range.maxTime;
	}
	if (snap.time === null) return;

	// Patient info
	snap.patientName = "--" ;
	if (session.patientData.fname) snap.patientName = session.patientData.fname;
	if (session.patientData.lname) snap.patientName += " " + session.patientData.lname;
	snap.patientAge = "";
	if (session.patientData.gender) {
	  snap.patientAge = "Gender: " + session.patientData.gender;
	} else {
	  snap.patientAge = "Gender: ?";
	}
	if (session.patientData.age) {
	  snap.patientAge += "&nbsp&nbspAge: " + session.patientData.age + "yr";
	} else {
	  snap.patientAge += "&nbsp&nbspAge: ?";
	}
	snap.patientStats = "";
	if (session.patientData.weight) {
	  snap.patientStats = "Weight: " + session.patientData.weight + "kg";
	} else {
	  snap.patientStats = "Weight: ?";
	}
	if (session.patientData.height) {
	  snap.patientStats += "&nbsp&nbspHeight: " + session.patientData.height + "cm";
	} else {
	  snap.patientStats += "&nbsp&nbspHeight: ?";
	}

	// Message lines
	snap.lcdLine1 = params.lcdLine1.ValueAtTime(snap.time);
	snap.lcdLine2 = params.lcdLine2.ValueAtTime(snap.time);
	snap.lcdLine3 = params.lcdLine3.ValueAtTime(snap.time);
	snap.lcdLine4 = params.lcdLine4.ValueAtTime(snap.time);

	// state
	snap.state = params.state.ValueAtTime(snap.time);
	snap.breathNum = params.breathNum.ValueAtTime(snap.time);

	// input settings
	snap.mode 		= params.mode.ValueAtTime(snap.time);
	snap.vt 			= params.vt.ValueAtTime(snap.time);
	snap.mv 			= params.mv.ValueAtTime(snap.time);
	snap.rr 			= params.rr.ValueAtTime(snap.time);
	snap.ie 			= params.ie.ValueAtTime(snap.time);
	snap.ipeep 		= params.ipeep.ValueAtTime(snap.time);
	snap.pmax 		= params.pmax.ValueAtTime(snap.time);
	snap.ps 			= params.ps.ValueAtTime(snap.time);
	snap.tps 			= params.tps.ValueAtTime(snap.time);
	snap.fiO2 		= params.fiO2.ValueAtTime(snap.time);
	snap.o2Purity = params.o2Purity.ValueAtTime(snap.time);
	snap.tps 			= params.tps.ValueAtTime(snap.time);

	// pending input settings
	snap.pendingMode 		= params.pendingMode.ValueAtTime(snap.time);
	snap.pendingVt 			= params.pendingVt.ValueAtTime(snap.time);
	snap.pendingMv 			= params.pendingMv.ValueAtTime(snap.time);
	snap.pendingRr 			= params.pendingRr.ValueAtTime(snap.time);
	snap.pendingIe 			= params.pendingIe.ValueAtTime(snap.time);
	snap.pendingIpeep 	= params.pendingIpeep.ValueAtTime(snap.time);
	snap.pendingPmax 		= params.pendingPmax.ValueAtTime(snap.time);
	snap.pendingPs 			= params.pendingPs.ValueAtTime(snap.time);
	snap.pendingTps 		= params.pendingTps.ValueAtTime(snap.time);

	// measured parameters
	snap.vtdel 			= params.vtdel.ValueAtTime(snap.time);
	snap.mvdel 			= params.mvdel.ValueAtTime(snap.time);
	snap.mmvdel			= params.mmvdel.ValueAtTime(snap.time);
	snap.smvdel			= params.smvdel.ValueAtTime(snap.time);
	snap.sbpm 			= params.sbpm.ValueAtTime(snap.time);
	snap.mbpm 			= params.mbpm.ValueAtTime(snap.time);
	snap.btype 			= params.btype.ValueAtTime(snap.time);
	snap.bcontrol		= params.bcontrol.ValueAtTime(snap.time);
	snap.scomp 			= params.scomp.ValueAtTime(snap.time);
	snap.dcomp 			= params.dcomp.ValueAtTime(snap.time);
	snap.peak 			= params.peak.ValueAtTime(snap.time);
	snap.plat 			= params.plat.ValueAtTime(snap.time);
	snap.mpeep 			= params.mpeep.ValueAtTime(snap.time);
	snap.cmvSpont		= params.cmvSpont.ValueAtTime(snap.time);
	snap.o2FlowX10	= params.o2FlowX10.ValueAtTime(snap.time);

	// errors and warnings
	snap.errorTag 	= params.errorTag.ValueAtTime(snap.time);
	snap.warningTag	= params.warningTag.ValueAtTime(snap.time);
	snap.attention	= params.attention.ValueAtTime(snap.time);
	snap.somePending= params.somePending.ValueAtTime(snap.time);
}

function refreshSnapshot() {
	// collect all data at the time specified by the range
	gatherSnapshotData();

	// now refresh the display
	refreshMessageLines();
	refreshStateImage();
	refreshAlertImage();
	refreshPatientInfo();
	refreshInputSettings();
	refreshMeasuredParameters();

	// now refresh the front panel
	fpRefresh();
}

function resizeSnapshots() {
	installPeakGauge();
	installPlatGauge();
	installPeepGauge();
}

// ////////////////////////////////////////////////////////////////
// Utility functions
// ////////////////////////////////////////////////////////////////
function animateDivValue(div, value) {
  if (div.innerText === null) {
    div.innerHTML = "--";
    return;
  }
	if (!isValidValue(value)) {
    div.innerHTML = "--";
    return;
	}
  if (Number(div.innerText) == value) return;
  animateNumberValue(div, 0, value, ANIMATE_NUMBER_DURATION);
}

function animateDivToValue(div, value) {
  if (div.innerText === null) {
    div.innerHTML = "--";
    return;
  }
	if (!isValidValue(value)) {
    div.innerHTML = "--";
    return;
	}
  if (Number(div.innerText) == value) return;
  animateNumberValueTo(div, value);
}

function updateDivText(div, value) {
	let txt = value;
  if (isUndefined(value)) txt = "--";
  if (value === null) txt = "--";
  div.innerHTML = txt;
}

function updateDivValue(div, value) {
  let txt;
  if (!isValidValue(value)) txt = "--";
  else txt = value;
  div.innerHTML = txt;
}

// ////////////////////////////////////////////////////////////////
// Pending change warning
// ////////////////////////////////////////////////////////////////
var pendingOrange = false;
function updatePendingIndividualSetting(blink, div, pendingParam) {
	let snap = session.snapshot.content;
	let pendParam = pendingParam.ValueAtTime(snap.time);

  let elm = document.getElementById(div);
  if (snap.somePending) {
    if (pendParam && blink) {
      if (!pendingOrange) {
        elm.style.backgroundColor = palette.orange;
				pendingOrange = true;
      } else {
        elm.style.backgroundColor = palette.mediumblue;
				pendingOrange = false;
      }
    }
  } else {
    elm.style.backgroundColor = palette.mediumblue;
		pendingOrange = false;
  }
}

function updatePendingSettings(blink) {
  let params = session.params;
  updatePendingIndividualSetting(blink, "MODEDiv", 	params.pendingMode);
  updatePendingIndividualSetting(blink, "VTDiv", 		params.pendingVt);
  updatePendingIndividualSetting(blink, "VTDiv", 		params.pendingMv);
  updatePendingIndividualSetting(blink, "RRDiv", 		params.pendingRr);
  updatePendingIndividualSetting(blink, "IEDiv", 		params.pendingIe);
  updatePendingIndividualSetting(blink, "IPEEPDiv", params.pendingIpeep);
  updatePendingIndividualSetting(blink, "PMAXDiv", 	params.pendingPmax);
  updatePendingIndividualSetting(blink, "PSDiv", 		params.pendingPs);
  updatePendingIndividualSetting(blink, "TPSDiv", 	params.pendingTps);
}

function updatePending(blink) {
	let snap = session.snapshot.content;
  let elm;

  updatePendingSettings(blink);
  if (snap.somePending) {
    elm = document.getElementById("Pending");
    elm.innerHTML = "Pending Changes";
    if (pendingBackground != "ORANGE") {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = palette.orange;
      pendingBackground = "ORANGE";
    } else if (blink) {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = palette.darkblue;
      pendingBackground = "DARKBLUE";
    }
  } else {
    elm = document.getElementById("PendingDiv");
    elm.style.backgroundColor = palette.darkblue;
    elm = document.getElementById("Pending");
    elm.innerHTML = "No Pending Changes";
    pendingBackground = "DARKBLUE";
  }
}

// ////////////////////////////////////////////////////////////////
// Alerts
// ////////////////////////////////////////////////////////////////
function refreshAlertImage() {
	let snap = session.snapshot.content;
	updateAlert(snap.attention);
}

var alertImage = "OK";
var alertBackground = "GREEN";
function updateAlert(blink) {
	let params = session.params;
	let snap = session.snapshot.content;

  let elm = document.getElementById("AlertDiv");
  if ((snap.state == ERROR_STATE) || (snap.errorTag == true)) {
    if (alertBackground != "DARKRED") {
      elm.style.backgroundColor = palette.darkred;
      alertBackground = "DARKRED";
    } else if (blink) {
      elm.style.backgroundColor = palette.green;
      alertBackground = "GREEN";
    }
    if (alertImage != "ERROR") {
      document.getElementById("AlertImg").src = "../common/img/Error.png";
      alertImage = "ERROR";
    }
  } else if (snap.attention) {
    if (alertBackground != "ORANGE") {
      elm.style.backgroundColor = palette.orange;
      alertBackground = "ORANGE";
    } else if (blink) {
      elm.style.backgroundColor = palette.green;
      alertBackground = "GREEN";
    }
    if (alertImage != "WARNING") {
      document.getElementById("AlertImg").src = "../common/img/Warning.png";
      alertImage = "WARNING";
    }
  } else {
    if (alertBackground != "GREEN") {
      elm.style.backgroundColor = palette.green;
      alertBackground = "GREEN";
    }
    if (alertImage != "OK") {
      document.getElementById("AlertImg").src = "../common/img/OK.png";
      alertImage = "OK";
    }
  }
}

// ////////////////////////////////////////////////////////////////
// System State
// ////////////////////////////////////////////////////////////////
var blankStateImg = true;
function blinkStateImage() {
	if (!session) return;
	if (blankStateImg) {
		refreshStateImage();
		blankStateImg = false;
	} else {
    imgStateDIV.src = "../common/img/BlankLED.png";
		blankStateImg = true;
	}
}

function refreshStateImage() {
	if (!session) return;

	let snap = session.snapshot.content;
	let state = snap.state;

	if (state == INITIAL_STATE) {
    stateDIV.innerHTML = "<b>INITIALIZE</b>";
    imgStateDIV.src = "../common/img/InitialLED.png";
  } else if (state == STANDBY_STATE) {
    stateDIV.innerHTML = "<b>STANDBY</b>";
    imgStateDIV.src = "../common/img/StandbyLED.png";
  } else if (state == ACTIVE_STATE) {
    stateDIV.innerHTML = "<b>ACTIVE</b>";
    imgStateDIV.src = "../common/img/ActiveLED.png";
  } else if (state == ERROR_STATE) {
    stateDIV.innerHTML = "<b>ERROR</b>";
    imgStateDIV.src = "../common/img/ErrorLED.png";
  } else {
    imgStateDIV.src = "../common/img/BlankLED.png";
    stateDIV.innerHTML = "<b>UNKNOWN</b>";
  }
}

// ////////////////////////////////////////////////////////////////
// LCD Messages
// ////////////////////////////////////////////////////////////////
function formMessageLine(str) {
	if (str === null) return "";
	if (isUndefined(str)) return "";

	const spanBegin = "<span class=UniMono>";
	const spanEnd = "</span>";

	let mstr = "";
	for (let i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		let isASCII = (code >= 0) && (code <= 127);
		let cstr = String.fromCodePoint(code);
		if (isASCII) {
	  	if (cstr == ' ') cstr = '&nbsp';
	  	mstr += cstr;
		} else {
			mstr += spanBegin + cstr + spanEnd;
		}
	}
	if (mstr == "") mstr = "&nbsp" ;
	return mstr;
}

function updateMessageLine(value) {
	if (!value) value = "&nbsp";
	return value;
}

function displayMessageLine(lineTag, value) {
  let elm;
  if (messagesBackground != "MEDIUMGREEN") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = palette.mediumgreen;
    elm.style.color = palette.darkblue;
    messagesBackground = "MEDIUMGREEN";
  }
  elm = document.getElementById(lineTag);
  elm.style.color = palette.darkblue;
  let mvalue = formMessageLine(value);
  elm.innerHTML = mvalue;
}

function refreshMessageLines() {
	let snap = session.snapshot.content;
	displayMessageLine("Mline1", updateMessageLine(snap.lcdLine1));
	displayMessageLine("Mline2", updateMessageLine(snap.lcdLine2));
	displayMessageLine("Mline3", updateMessageLine(snap.lcdLine3));
	displayMessageLine("Mline4", updateMessageLine(snap.lcdLine4));
}

// ////////////////////////////////////////////////////////////////
// Patient info
// ////////////////////////////////////////////////////////////////
function refreshPatientInfo() {
	let snap = session.snapshot.content;
  updateDivText(pline1DIV, snap.patientName);
  updateDivText(pline2DIV, snap.patientAge);
  updateDivText(pline3DIV, snap.patientStats);
}

// ////////////////////////////////////////////////////////////////
// Input Settings
// ////////////////////////////////////////////////////////////////
function refreshInputSettings() {
	let snap = session.snapshot.content;

  // Switch between PSV and other modes
  if (MODE_DECODER[snap.mode] == "PSV") {
    vtMvTitleELM.innerHTML = "Minute Volume";
    vtMvUnitsELM.innerHTML = "(litres/min)";
    updateDivValue(ieValELM, null);
    updateDivValue(rrValELM, null);
		if (snap.mv) {
    	updateDivValue(vtValELM, snap.mv);
		} else {
    	updateDivValue(vtValELM, null);
		}
  } else {
    vtMvTitleELM.innerHTML = "Tidal Volume";
    vtMvUnitsELM.innerHTML = "(ml)";
    updateDivText(ieValELM, EI_DECODER[snap.ie]);
    animateDivValue(rrValELM, snap.rr);
    animateDivValue(vtValELM, snap.vt);
  }
  animateDivValue(pmaxValELM, snap.pmax);
  animateDivValue(ipeepValELM, snap.ipeep);
  animateDivValue(psValELM, snap.ps);
  updateDivText(modeValELM, MODE_DECODER[snap.mode]);
  updateDivValue(tpsValELM, snap.tps);
  updateDivValue(tpsUnitsValELM, snap.tpsUnits);

	refreshFiO2Settings();
}

function refreshFiO2Settings() {
	let snap = session.snapshot.content;

	if (session.fiO2Data.externalMixer) {
		document.getElementById("reservoirFiO2").style.display = "none";
		document.getElementById("externalFiO2").style.display = "block";
	} else {
		document.getElementById("reservoirFiO2").style.display = "block";
		document.getElementById("externalFiO2").style.display = "none";
  	updateFiO2Display(snap.fiO2, snap.o2Purity, snap.o2FlowX10);
	}
}

function updateFiO2Display(fiO2, o2Purity, o2Flow) {
  let elm = document.getElementById("fiO2Value");
	if ((fiO2 === null) || isUndefined(fiO2)) {
  	elm.innerHTML = "--";
	} else {
  	elm.innerHTML = String(fiO2) + '%';
	}

  elm = document.getElementById("o2PurityValue");
	if ((o2Purity === null) || isUndefined(o2Purity)) {
  	elm.innerHTML = "--";
	} else {
  	elm.innerHTML = String(o2Purity) + '%';
	}

  elm = document.getElementById("o2FlowRate");
	if ((o2Flow === null) || isUndefined(o2Flow)) {
  	elm.innerHTML = "--";
	} else {
  	elm.innerHTML = parseFloat(o2Flow / 10).toFixed(1);
	}
}

// ////////////////////////////////////////////////////////////////
// Measured Parameters
// ////////////////////////////////////////////////////////////////
function refreshMeasuredParameters() {
	let snap = session.snapshot.content;

  animateDivToValue(vtdelValELM, snap.vtdel);
  peakGauge.setValue(snap.peak);
  platGauge.setValue(snap.plat);
  peepGauge.setValue(snap.mpeep);

  updateDivValue(sbpmValELM, snap.sbpm);
  updateDivValue(mbpmValELM, snap.mbpm);
  updateDivValue(mvdelValELM, snap.mvdel);
  updateDivValue(mmvdelValELM, snap.mmvdel);
  updateDivValue(smvdelValELM, snap.smvdel);
  updateDivValue(scompValELM, snap.scomp);
  updateDivValue(dcompValELM, snap.dcomp);
}

// ////////////////////////////////////////////////////////////////
// Blinking timers
// ////////////////////////////////////////////////////////////////
var snapshotsTimerPaused = false;
var snapshotsTimer = setInterval(function () {
	executeSnapshotsTimer();
}, FASTEST_BLINK_INTERVAL_IN_MS)

function pauseSnapshotsTimer() {
	if (snapshotsTimerPaused) return;
	clearInterval(snapshotsTimer);
	snapshotsTimerPaused = true;
}

function resumeSnapshotsTimer() {
	if (!snapshotsTimerPaused) return;

	snapshotsTimer = setInterval(function () {
		executeSnapshotsTimer();
	}, FASTEST_BLINK_INTERVAL_IN_MS)

	snapshotsTimerPaused = false;
}

function executeSnapshotsTimer() {
	let snap = session.snapshot.content;
	if (!session) return;

	blinkStateImage();
  if ((snap.state == ERROR_STATE) || (snap.errorTag == true)) {
		blinkEntireFrontPanel();
	} else if (fpErrorBlank) {
		updateEntireFrontPanel();
	}

	if (snap.somePending) {
		blinkFrontPanelPendingSettings();
	} else if (!((snap.state == ERROR_STATE) || (snap.errorTag == true))) {
		updateEntireFrontPanel();
		blinkFrontPanelLEDs();
	}
}

