// ///////////////////////////////////////////////////////////////
// Author: Sunil Nanda
// ///////////////////////////////////////////////////////////////

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
	/* Sexy but is slowing things down
  if (div.innerText === null) {
    div.innerHTML = "--";
    return;
  }
  if (Number(div.innerText) == value) return;
  animateNumberValue(div, 0, value, ANIMATE_NUMBER_DURATION);
	*/

	if (!isValidValue(value)) {
    div.innerHTML = "--";
    return;
	}
  div.innerText = value;
}

function animateDivToValue(div, value) {
	/* Sexy but is slowing things down
  if (div.innerText === null) {
    div.innerHTML = "--";
    return;
  }
  if (Number(div.innerText) == value) return;
  animateNumberValueTo(div, value);
	*/

	if (!isValidValue(value)) {
    div.innerHTML = "--";
    return;
	}
  div.innerText = value;
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

function updateDscompDivValue(div, dcomp, scomp) {
  let sc, dc;
  if (!isValidValue(dcomp)) dc = "--";
  else dc = dcomp;
  if (!isValidValue(scomp)) sc = "--";
  else sc = scomp;
  div.innerHTML = String(dc) + "/" + String(sc);
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
        elm.style.backgroundColor = palette.darkorange;
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
      elm.style.backgroundColor = palette.darkorange;
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
      elm.style.backgroundColor = palette.darkorange;
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
	if (session.patientData.fname) {
    let elem = document.getElementById("PatientFirstName");
    elem.innerHTML = session.patientData.fname;
  }
	if (session.patientData.lname) {
    let elem = document.getElementById("PatientLastName");
    elem.innerHTML = session.patientData.lname;
  }
	if (session.patientData.age) {
    let elem = document.getElementById("PatientAge");
    elem.innerHTML = session.patientData.age;
  }
	if (session.patientData.gender) {
    let elem = document.getElementById("PatientGender");
    elem.innerHTML = session.patientData.gender;
  }
	if (session.patientData.height) {
    let elem = document.getElementById("PatientHeight");
    elem.innerHTML = session.patientData.height;
  }
	if (session.patientData.weight) {
    let elem = document.getElementById("PatientWeight");
    elem.innerHTML = session.patientData.weight;
  }
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
  animateDivValue(psTriggerValELM, snap.psTrigger);

  let psRampText = "--";
	if (isValidValue(snap.psRamp)) {
    psRampText = PSRAMP_DECODER[snap.psRamp]
  }
	updateDivText(psRampValELM, psRampText);

	if (isValidValue(snap.mode)) {
		let modeText =  MODE_DECODER[snap.mode];
		if (snap.mode == 3) { // PSV
			modeValELM.className = "psvModeValueCls";
			modeText = modeText + " (BiPAP)";
		} else {
			modeValELM.className = "modeValueCls";
		}
 		updateDivText(modeValELM, modeText);
	}
	if (isValidValue(snap.tps)) {
  	updateDivText(tpsValELM, snap.tps);
	}

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
  peakGauge.setValue(snap.peak*10);
  platGauge.setValue(snap.plat*10);
  peepGauge.setValue(snap.mpeep*10);

  updateDivValue(sbpmValELM, snap.sbpm);
  updateDivValue(mbpmValELM, snap.mbpm);
  updateDivValue(mvdelValELM, snap.mvdel);
  updateDivValue(mmvdelValELM, snap.mmvdel);
  updateDivValue(smvdelValELM, snap.smvdel);
  updateDscompDivValue(dscompValELM, snap.dcomp, snap.scomp);
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
	if (!session) return;
	let snap = session.snapshot.content;

	if (imgStateDIV) blinkStateImage();
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


