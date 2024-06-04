// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formMessageLine(str) {
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

function blinkSettingValue(pending, containerDiv, valueDiv) {
	if (!session) return;
  let elm = document.getElementById(containerDiv);
  if (pending) {
    updatePending(false);
    elm.style.backgroundColor = palette.orange;
  } else {
    elm.style.backgroundColor = palette.mediumblue;
  }
}

function updatePendingIndividualSetting(blink, div, pendingSetting) {
  let elm = document.getElementById(div);
  if (session.paramDataOnDisplay.pending) {
    if (pendingSetting && blink) {
      if (pendingBackground != "ORANGE") {
        elm.style.backgroundColor = palette.orange;
      } else {
        elm.style.backgroundColor = palette.mediumblue;
      }
    }
  } else if (pendingBackground != "MEDIUMBLUE") {
    elm.style.backgroundColor = palette.mediumblue;
  }
}

function updatePendingSettings(blink) {
  let pend = session.pendingParamsData;
  updatePendingIndividualSetting(blink, "MODEDiv", pend.mode);
  updatePendingIndividualSetting(blink, "VTDiv", pend.vt);
  updatePendingIndividualSetting(blink, "VTDiv", pend.mv);
  updatePendingIndividualSetting(blink, "RRDiv", pend.rr);
  updatePendingIndividualSetting(blink, "IEDiv", pend.ie);
  updatePendingIndividualSetting(blink, "IPEEPDiv", pend.ipeep);
  updatePendingIndividualSetting(blink, "PMAXDiv", pend.pmax);
  updatePendingIndividualSetting(blink, "PSDiv", pend.ps);
  updatePendingIndividualSetting(blink, "TPSDiv", pend.tps);
}

function updatePending(blink) {
  let elm;
  updatePendingSettings(blink);
  if (session.paramDataOnDisplay.pending) {
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

function updateAlert(blink) {
  let elm = document.getElementById("AlertDiv");
  if (session.stateData.error) {
    startErrorBeep();
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
  } else if (session.alerts.attention || wifiDropped) {
    startWarningBeep();
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
    stopAllBeeps();
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

function updateMessageLine(value) {
	if (!value) value = "&nbsp";
	return value;
}

function clearAllMessageLines() {
	msgL1 = null;
	msgL2 = null;
	msgL3 = null;
	msgL4 = null;
}

function displayMessageLines() {
	// Wait for all 4 lines
	if (msgL1 && msgL2 && msgL3 && msgL4) { 
		displayMessageLine("Mline1", msgL1);
 		displayMessageLine("Mline2", msgL2);
 		displayMessageLine("Mline3", msgL3);
 		displayMessageLine("Mline4", msgL4);
		displayMessageLine("lcdline1", msgL1);
 		displayMessageLine("lcdline2", msgL2);
 		displayMessageLine("lcdline3", msgL3);
 		displayMessageLine("lcdline4", msgL4);
		clearAllMessageLines();
	}
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
  let mvalue = formMessageLine(value);
  elm.innerHTML = mvalue;
}

function animateDivValue(div, value) {
  if (div.innerText === null) {
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
  if (Number(div.innerText) == value) return;
  animateNumberValueTo(div, value);
}

function updateDivValue(div, value) {
  let txt;
  if (value === null) txt = "--";
  else txt = value;
  div.innerHTML = txt;
}

var blankStateImg = true;
function blinkStateImage() {
	if (!session) return;
	if (blankStateImg) {
		updateStateImage();
		blankStateImg = false;
	} else {
    imgStateDIV.src = "../common/img/BlankLED.png";
		blankStateImg = true;
	}
}

setInterval(function () {
	if (!session) return;
	blinkStateImage();
	blinkRecordingIndicator();
	blinkDashboardIndicator();
}, FAST_BLINK_INTERVAL_IN_MS)

function updateStateImage() {
	if (!session) return;
  if (!session.stateData.state) {
    imgStateDIV.src = "../common/img/BlankLED.png";
    stateDIV.innerHTML = "<b>UNKNOWN</b>";
	} else if (session.stateData.initial) {
    stateDIV.innerHTML = "<b>INITIALIZE</b>";
    imgStateDIV.src = "../common/img/InitialLED.png";
  } else if (session.stateData.standby) {
    stateDIV.innerHTML = "<b>STANDBY</b>";
    imgStateDIV.src = "../common/img/StandbyLED.png";
  } else if (session.stateData.active) {
    stateDIV.innerHTML = "<b>ACTIVE</b>";
    imgStateDIV.src = "../common/img/ActiveLED.png";
  } else {
    stateDIV.innerHTML = "<b>ERROR</b>";
    imgStateDIV.src = "../common/img/ErrorLED.png";
  }
}

function updateStateDivsFromSessionData() {
  // Change of state
  if (session.stateData.state !== session.stateData.prevState) {
    session.alerts.attention = false; // entering initial state
    updateAlert(false);
    session.stateData.prevState = session.stateData.state;
  }
  updateStateImage();
}

function updateParamDivsFromSessionData() {
  // Switch between PSV and other modes
  if (MODE_DECODER[session.paramDataInUse.mode] == "PSV") {
    vtMvTitleELM.innerHTML = "Minute Volume";
    vtMvUnitsELM.innerHTML = "(litres/min)";
    updateDivValue(ieValELM, null);
    updateDivValue(rrValELM, null);
		if (session.paramDataInUse.mv) {
    	updateDivValue(vtValELM, session.paramDataInUse.mv);
		} else {
    	updateDivValue(vtValELM, null);
		}
  } else {
    vtMvTitleELM.innerHTML = "Tidal Volume";
    vtMvUnitsELM.innerHTML = "(ml)";
    updateDivValue(ieValELM, EI_DECODER[session.paramDataInUse.ie]);
    animateDivValue(rrValELM, session.paramDataInUse.rr);
    animateDivValue(vtValELM, session.paramDataInUse.vt);
  }
  animateDivValue(pmaxValELM, session.paramDataInUse.pmax);
  animateDivValue(ipeepValELM, session.paramDataInUse.ipeep);
  animateDivValue(psValELM, session.paramDataInUse.ps);
  updateDivValue(modeValELM, MODE_DECODER[session.paramDataInUse.mode]);
  updateDivValue(tpsValELM, session.paramDataInUse.tps);
  updateDivValue(tpsUnitsValELM, session.paramDataInUse.tpsUnits);
}

function updateFiO2DivsFromSessionData() {
	if (session.fiO2Data.externalMixer) {
		document.getElementById("reservoirFiO2").style.display = "none";
		document.getElementById("externalFiO2").style.display = "block";
	} else {
		document.getElementById("reservoirFiO2").style.display = "block";
		document.getElementById("externalFiO2").style.display = "none";
  	updateFiO2Display(
    	session.params.fiO2.LastValue(),
    	session.params.o2Purity.LastValue(),
    	session.params.o2FlowX10.LastValue()
  	);
	}
}

function updateBreathDivsFromSessionData() {
  animateDivToValue(vtdelValELM, session.params.vtdel.LastValue());

  peakGauge.setValue(session.params.peak.LastValue());
  platGauge.setValue(session.params.plat.LastValue());
  peepGauge.setValue(session.params.mpeep.LastValue());
}

function updateMinuteDivsFromSessionData() {
  updateDivValue(sbpmValELM, session.params.sbpm.LastValue());
  updateDivValue(mbpmValELM, session.params.mbpm.LastValue());
  updateDivValue(mvdelValELM, session.params.mvdel.LastValue());
  updateDivValue(mmvdelValELM, session.params.mmvdel.LastValue());
  updateDivValue(smvdelValELM, session.params.smvdel.LastValue());
}

function updateCompDivsFromSessionData() {
  animateDivToValue(scompValELM, session.params.scomp.LastValue());
  animateDivToValue(dcompValELM, session.params.dcomp.LastValue());
}

function updateMiscDivsFromSessionData() {
  updateDivValue(locationDIV, session.miscData.locationName);
  let altF = "<small><small>ft</small></small>";
  let atmP = "<small><small>cmH2O</small></small>";
	atmP = " (" + session.miscData.atmInCmH20 + atmP + ")";
  updateDivValue(altDIV, session.miscData.altInFt + altF + atmP);
	let atm = "AtmOxygen " + session.miscData.atmO2Pct + "%";
  updateDivValue(atmDIV, atm);

  tempGauge.setValue(session.params.tempC.LastValue());
}

function debugMessageLines(value) {
	console.log("Value", value);
	console.log("msgL1", msgL1);
	console.log("msgL2", msgL2);
	console.log("msgL3", msgL3);
	console.log("msgL4", msgL4);
}

function updateSnapshot() {
	let chirp = latestChirp;
	if (!chirp) return;

  // Message lines
	if (!isUndefined(chirp.content.L1)) {
		msgL1 = updateMessageLine(chirp.content.L1);
		msgL2 = null; msgL3 = null; msgL4 = null;
	}
	if (!isUndefined(chirp.content.L2)) {
		msgL2 = updateMessageLine(chirp.content.L2);
		msgL3 = null; msgL4 = null;
	}
	if (!isUndefined(chirp.content.L3)) {
		msgL3 = updateMessageLine(chirp.content.L3);
		msgL4 = null;
	}
	if (!isUndefined(chirp.content.L4)) {
		msgL4 = updateMessageLine(chirp.content.L4);
 		displayMessageLines();
	}

  for (let key in chirp.content) {
    // get key value pairs
    let value = chirp.content[key];
    if (key == 'ATT') {
      if (value==1) {
        updateAlert(true);
        session.alerts.attention = true;
      } else {
        updateAlert(false);
        session.alerts.attention = false;
      }
    }

    // Patient info
    else if ((key == 'FNAME') || (key == 'LNAME')) {
      let pname = "--" ;
      if (session.patientData.fname) pname = session.patientData.fname;
      if (session.patientData.lname) pname = pname + " " + session.patientData.lname;
      updateDivValue(pline1DIV, pname);
      updateDocumentTitle();
    } else if (key == 'PSTATS') {
      let pline2 = "";
      if (session.patientData.gender) {
        pline2 = "Gender: " + session.patientData.gender;
      } else {
        pline2 = "Gender: ?";
      }
      if (session.patientData.age) {
        pline2 += "&nbsp&nbspAge: " + session.patientData.age + "yr";
      } else {
        pline2 += "&nbsp&nbspAge: ?";
      }
      updateDivValue(pline2DIV, pline2);

      let pline3 = "";
      if (session.patientData.weight) {
        pline3 = "Weight: " + session.patientData.weight + "kg";
      } else {
        pline3 = "Weight: ?";
      }
      if (session.patientData.height) {
        pline3 += "&nbsp&nbspHeight: " + session.patientData.height + "cm";
      } else {
        pline3 += "&nbsp&nbspHeight: ?";
      }
      updateDivValue(pline3DIV, pline3);
    }

    // state
    else if (key == 'STATE') {
      updateStateDivsFromSessionData();
    }

    // Input settings params
    else if (key == 'PARAM') {
      updateParamDivsFromSessionData();
      updatePending(session.paramDataOnDisplay.pending);
    }

    // fio2
    else if (key == 'FIO2') {
      updateFiO2DivsFromSessionData();
    }

    // breath
    else if (key == 'BREATH') {
      updateBreathDivsFromSessionData();
    }

    // minute data
    else if (key == 'MINUTE') {
      updateMinuteDivsFromSessionData();
    }

    // compliance data
    else if (key == 'COMP') {
      updateCompDivsFromSessionData();
    }

    // misc data
    else if (key == 'MISC') {
      updateMiscDivsFromSessionData();
    }
  }
}

function updateDashboardIndicator() {
  if (awaitingFirstChirp) {
    document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
  } else if (updatePaused) {
    document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  } else if (wifiDropped) {
    document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("DashboardActiveImg").src = "../common/img/GreenDot.png";
  }
}

var blankDashImg = false;
function blinkDashboardIndicator() {
	if (!session) return;
	if (blankDashImg) {
		blankDashImg = false;
  	if (awaitingFirstChirp) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
  	} else if (updatePaused) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  	} else if (wifiDropped) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  	} else {
    	document.getElementById("DashboardActiveImg").src = "../common/img/GreenDot.png";
  	}
	} else {
		blankDashImg = true;
   	document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
	}
}

function updateDashboardAndRecordingStatus() {
  updateDashboardIndicator();
  updateRecordingIndicator();
}

function displayNormalMessages() {
  wifiDropped = false;
  if (messagesBackground == "MEDIUMGREEN") return;
  let elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = palette.mediumgreen;
  elm.style.color = palette.darkblue;
  messagesBackground = "MEDIUMGREEN";
  updateDashboardAndRecordingStatus();
}

function displayWifiDropped() {
  //if (app.initialState) return;
  wifiDropped = true;
  wifiDroppedBlink++;
  if (wifiDroppedBlink != 3) return;
  wifiDroppedBlink = 0;
  let elm;
  if (messagesBackground == "ORANGE") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = palette.mediumgreen;
    elm.style.color = palette.darkblue;
    messagesBackground = "MEDIUMGREEN";
    elm = document.getElementById("Mline1");
    elm.innerHTML = savedL1;
    elm = document.getElementById("Mline2");
    elm.innerHTML = savedL2;
    elm = document.getElementById("Mline3");
    elm.innerHTML = savedL3;
    elm = document.getElementById("Mline4");
    elm.innerHTML = savedL4;
  } else {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = palette.orange;
    elm.style.color = "white";
    messagesBackground = "ORANGE";
    updateDashboardAndRecordingStatus();
    elm = document.getElementById("Mline1");
    savedL1 = elm.innerHTML;
    elm.innerHTML = "No Message from";
    elm = document.getElementById("Mline2");
    savedL2 = elm.innerHTML;
    elm.innerHTML = "Inspire-100 UID";
    elm = document.getElementById("Mline3");
    savedL3 = elm.innerHTML;
    elm.innerHTML = inspireUid;
    elm = document.getElementById("Mline4");
    savedL4 = elm.innerHTML;
    elm.innerHTML = "for " + dormantTimeInSec + " secs";
  }
}

