// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formMessageLine(str) {
  let value = str.trim();
  if (value == "") return "&nbsp";
  let mvalue = value.replace(/ /g, "&nbsp");
  return mvalue;
}

function blinkSettingValue(pending, containerDiv, valueDiv) {
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
      document.getElementById("AlertImg").src = "img/Error.png";
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
      document.getElementById("AlertImg").src = "img/Warning.png";
      alertImage = "WARNING";
    }
  } else {
    stopAllBeeps();
    if (alertBackground != "GREEN") {
      elm.style.backgroundColor = palette.green;
      alertBackground = "GREEN";
    }
    if (alertImage != "OK") {
      document.getElementById("AlertImg").src = "img/OK.png";
      alertImage = "OK";
    }
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

function updateStateDivsFromSessionData() {
  // Change of state
  if (session.stateData.state !== session.stateData.prevState) {
    session.alerts.attention = false; // entering initial state
    updateAlert(false);
    session.stateData.prevState = session.stateData.state;
  }

  if (session.stateData.initial) {
    stateDIV.innerHTML = "<b>INITIALIZE</b>";
    imgStateDIV.src = "img/WhiteDot.png";
  } else if (session.stateData.standby) {
    stateDIV.innerHTML = "<b>STANDBY</b>";
    imgStateDIV.src = "img/YellowDot.png";
  } else if (session.stateData.active) {
    stateDIV.innerHTML = "<b>ACTIVE</b>";
    imgStateDIV.src = "img/GreenDot.png";
  } else {
    stateDIV.innerHTML = "<b>ERROR</b>";
    imgStateDIV.src = "img/RedDot.png";
  }
}

function updateParamDivsFromSessionData() {
  // Switch between PSV and other modes
  if (session.paramDataInUse.mode == "PSV") {
    vtMvTitleELM.innerHTML = "Minute Volume";
    vtMvUnitsELM.innerHTML = "(litres/min)";
    updateDivValue(ieValELM, null);
    updateDivValue(rrValELM, null);
    updateDivValue(vtValELM, session.paramDataInUse.mv);
  } else {
    vtMvTitleELM.innerHTML = "Tidal Volume";
    vtMvUnitsELM.innerHTML = "(ml)";
    updateDivValue(ieValELM, session.paramDataInUse.ie);
    animateDivValue(rrValELM, session.paramDataInUse.rr);
    animateDivValue(vtValELM, session.paramDataInUse.vt);
  }
  animateDivValue(pmaxValELM, session.paramDataInUse.pmax);
  animateDivValue(ipeepValELM, session.paramDataInUse.ipeep);
  animateDivValue(psValELM, session.paramDataInUse.ps);
  updateDivValue(modeValELM, session.paramDataInUse.mode);
  updateDivValue(tpsValELM, session.paramDataInUse.tps);
  updateDivValue(tpsUnitsValELM, session.paramDataInUse.tpsUnits);
}

function updateFiO2DivsFromSessionData() {
  updateFiO2Display(
    session.fiO2Data.fiO2,
    session.fiO2Data.o2Purity,
    session.fiO2Data.o2FlowX10
  );
}

function updateBreathTypeFromSessionData() {
  /*
  switch (session.breathData.type) {
    case MANDATORY_BREATH:
      imgBreathDIV.src = "img/YellowDot.png";
      breathTypeValELM.innerHTML = "Mandatory";
      break;
    case SPONTANEOUS_BREATH:
      imgBreathDIV.src = "img/GreenDot.png";
      breathTypeValELM.innerHTML = "Spontaneous";
      break;
    case MAINTENANCE_BREATH:
      imgBreathDIV.src = "img/RedDot.png";
      breathTypeValELM.innerHTML = "Maintenance";
      break;
    default:
      imgBreathDIV.src = "img/WhiteDot.png";
      breathTypeValELM.innerHTML = "None";
      break;
  }
  */
}

function updateBreathDivsFromSessionData() {
  updateBreathTypeFromSessionData();
  animateDivToValue(vtdelValELM, session.breathData.vtdel);

  peakGauge.setValue(session.breathData.peak);
  platGauge.setValue(session.breathData.plat);
  peepGauge.setValue(session.breathData.mpeep);
}

function updateMinuteDivsFromSessionData() {
  updateDivValue(sbpmValELM, session.minuteData.sbpm);
  updateDivValue(mbpmValELM, session.minuteData.mbpm);
  updateDivValue(mvdelValELM, session.minuteData.mvdel);
  updateDivValue(mmvdelValELM, session.minuteData.mmvdel);
  updateDivValue(smvdelValELM, session.minuteData.smvdel);
}

function updateCompDivsFromSessionData() {
  animateDivToValue(scompValELM, session.complianceData.scomp);
  animateDivToValue(dcompValELM, session.complianceData.dcomp);
}

function updateMiscDivsFromSessionData() {
  let altF = " <small><small>ft</small></small>";
  updateDivValue(altfDIV, session.miscData.altInFt + altF);
  let altM = " <small><small>m</small></small>";
  updateDivValue(altmDIV, session.miscData.altInM + altM);

  tempGauge.setValue(session.miscData.tempC);
}

function updateSnapshot() {
  let d = updatedDweetContent;
  for (let key in d.content) {
    // get key value pairs
    let value = d.content[key];
    if (key == 'ATT') {
      if (value==1) {
        updateAlert(true);
        session.alerts.attention = true;
        //console.log("attention=true");
      } else {
        updateAlert(false);
        session.alerts.attention = false;
        //console.log("attention=false");
      }
    }
    // Message lines
    else if (key == 'L1') {
      displayMessageLine("Mline1", value);
    } else if (key == 'L2') {
      displayMessageLine("Mline2", value);
    } else if (key == 'L3') {
      displayMessageLine("Mline3", value);
    } else if (key == 'L4') {
      displayMessageLine("Mline4", value);
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
  if (awaitingFirstDweet) {
    document.getElementById("DashboardActiveImg").src = "img/WhiteDot.png";
  } else if (updatePaused) {
    document.getElementById("DashboardActiveImg").src = "img/YellowDot.png";
  } else if (wifiDropped) {
    document.getElementById("DashboardActiveImg").src = "img/YellowDot.png";
  } else {
    document.getElementById("DashboardActiveImg").src = "img/GreenDot.png";
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
    elm.innerHTML = "Respimatic100 UID";
    elm = document.getElementById("Mline3");
    savedL3 = elm.innerHTML;
    elm.innerHTML = respimaticUid;
    elm = document.getElementById("Mline4");
    savedL4 = elm.innerHTML;
    elm.innerHTML = "for " + dormantTimeInSec + " secs";
  }
}

