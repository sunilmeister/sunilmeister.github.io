// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formMessageLine(str) {
  value = str.trim();
  if (value == "") return "&nbsp";
  mvalue = value.replace(/ /g, "&nbsp");
  return mvalue;
}

function blinkSettingValue(pending, containerDiv, valueDiv) {
  if (pending) {
    updatePending(false);
    elm = document.getElementById(containerDiv);
    elm.style.backgroundColor = orangeColor;
  } else {
    elm = document.getElementById(containerDiv);
    elm.style.backgroundColor = mediumblueColor;
  }
}

function updatePendingIndividualSetting(blink, div, pendingSetting) {
  elm = document.getElementById(div);
  if (session.paramDataOnDisplay.pending) {
    if (pendingSetting && blink) {
      if (pendingBackground != "ORANGE") {
        elm.style.backgroundColor = orangeColor;
      } else {
        elm.style.backgroundColor = mediumblueColor;
      }
    }
  } else if (pendingBackground != "MEDIUMBLUE") {
    elm.style.backgroundColor = mediumblueColor;
  }
}

function updatePendingSettings(blink) {
  pend = session.pendingParamsData;
  updatePendingIndividualSetting(blink, "MODEDiv", pend.mode);
  updatePendingIndividualSetting(blink, "VTDiv", pend.vt);
  updatePendingIndividualSetting(blink, "RRDiv", pend.rr);
  updatePendingIndividualSetting(blink, "IEDiv", pend.ie);
  updatePendingIndividualSetting(blink, "IPEEPDiv", pend.ipeep);
  updatePendingIndividualSetting(blink, "PMAXDiv", pend.pmax);
  updatePendingIndividualSetting(blink, "PSDiv", pend.ps);
  updatePendingIndividualSetting(blink, "TPSDiv", pend.ps);
}

function updatePending(blink) {
  updatePendingSettings(blink);
  if (session.paramDataOnDisplay.pending) {
    elm = document.getElementById("Pending");
    elm.innerHTML = "Pending Changes";
    if (pendingBackground != "ORANGE") {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = orangeColor;
      pendingBackground = "ORANGE";
    } else if (blink) {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = mediumblueColor;
      pendingBackground = "MEDIUMBLUE";
    }
  } else {
    elm = document.getElementById("PendingDiv");
    elm.style.backgroundColor = mediumblueColor;
    elm = document.getElementById("Pending");
    elm.innerHTML = "No Pending Changes";
    pendingBackground = "MEDIUMBLUE";
  }
}

function updateAlert(blink) {
  elm = document.getElementById("AlertDiv");
  if (session.stateData.error) {
    if (alertBackground != "DARKRED") {
      elm.style.backgroundColor = darkredColor;
      alertBackground = "DARKRED";
    } else if (blink) {
      elm.style.backgroundColor = mediumblueColor;
      alertBackground = "MEDIUMBLUE";
    }
    if (alertImage != "ERROR") {
      document.getElementById("AlertImg").src = "img/Error.svg";
      alertImage = "ERROR";
    }
  } else if (session.alerts.attention || wifiDropped) {
    if (alertBackground != "ORANGE") {
      elm.style.backgroundColor = orangeColor;
      alertBackground = "ORANGE";
    } else if (blink) {
      elm.style.backgroundColor = mediumblueColor;
      alertBackground = "MEDIUMBLUE";
    }
    if (alertImage != "WARNING") {
      document.getElementById("AlertImg").src = "img/Warning.svg";
      alertImage = "WARNING";
    }
  } else {
    if (alertBackground != "GREEN") {
      elm.style.backgroundColor = greenColor;
      alertBackground = "GREEN";
    }
    if (alertImage != "OK") {
      document.getElementById("AlertImg").src = "img/OK.png";
      alertImage = "OK";
    }
  }
}

function displayMessageLine(lineTag, value) {
  if (messagesBackground != "MEDIUMBLUE") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = mediumblueColor;
    messagesBackground = "MEDIUMBLUE";
  }
  elm = document.getElementById(lineTag);
  mvalue = formMessageLine(value);
  elm.innerHTML = mvalue;
}

function updateDivValue(div, value) {
  var txt;
  if (value === null) txt = "--";
  else txt = value;
  div.innerHTML = txt;
}

function updateStateDivsFromSessionData() {
  // Change of state
  if (session.stateData.state !== session.stateData.prevState) {
    session.alerts.attention = false; // entering initial state
    updateAlert(false);
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
  updateDivValue(vtValELM, session.paramDataInUse.vt);
  updateDivValue(pmaxValELM, session.paramDataInUse.pmax);
  updateDivValue(ipeepValELM, session.paramDataInUse.ipeep);
  updateDivValue(psValELM, session.paramDataInUse.ps);
  updateDivValue(modeValELM, session.paramDataInUse.mode);
  updateDivValue(tpsValELM, session.paramDataInUse.tps);
  updateDivValue(tpsUnitsValELM, session.paramDataInUse.tpsUnits);
  updateDivValue(ieValELM, session.paramDataInUse.ie);
  updateDivValue(rrValELM, session.paramDataInUse.rr);
}

function updateFiO2DivsFromSessionData() {
  updateFiO2Display(
    session.fiO2Data.fiO2,
    session.fiO2Data.o2Purity,
    session.fiO2Data.o2FlowX10
  );
}

function updateBreathTypeFromSessionData() {
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
}

function updateBreathDivsFromSessionData() {
  updateBreathTypeFromSessionData();
  updateDivValue(vtdelValELM, session.breathData.vtdel);

  peakGauge.setValue(session.breathData.peak);
  platGauge.setValue(session.breathData.plat);
  peepGauge.setValue(session.breathData.mpeep);
}

function updateMinuteDivsFromSessionData() {
  updateDivValue(sbpmValELM, session.minuteData.sbpm);
  updateDivValue(mbpmValELM, session.minuteData.mbpm);
  updateDivValue(mvdelValELM, session.minuteData.mvdel);
}

function updateCompDivsFromSessionData() {
  updateDivValue(scompValELM, session.complianceData.scomp);
  updateDivValue(dcompValELM, session.complianceData.dcomp);
}

function updateMiscDivsFromSessionData() {
  altF = " <small><small>ft</small></small>";
  updateDivValue(altfDIV, session.miscData.altitude + altF);
  altM = " <small><small>m</small></small>";
  updateDivValue(altmDIV, Math.floor(session.miscData.altitude*0.305) + altM);

  tempGauge.setValue(session.miscData.tempC);
}

function updateSnapshot() {
  let d = updatedDweetContent;
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    if (key == 'ATT') {
      if (value==1) {
        updateAlert(true);
        session.alerts.attention = true;
      } else {
        updateAlert(false);
        session.alerts.attention = false;
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
      var pname = "--" ;
      if (session.patientData.fname) pname = session.patientData.fname;
      if (session.patientData.lname) pname = pname + " " + session.patientData.lname;
      updateDivValue(pline1DIV, pname);
    } else if (key == 'AGE') {
      updateDivValue(pline2DIV, String(session.patientData.age));
    } else if (key == 'PID') {
      updateDivValue(pline3DIV, String(session.patientData.pid));
      //console.log("session.patientData.pid:" + session.patientData.pid);
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

function updateDashboardAndRecordingStatus() {
  if (awaitingFirstDweet) {
    document.getElementById("DashboardActiveImg").src = "img/RedDot.png";
  } else if (updatePaused) {
    document.getElementById("DashboardActiveImg").src = "img/YellowDot.png";
  } else if (wifiDropped) {
    document.getElementById("DashboardActiveImg").src = "img/WhiteDot.png";
  } else {
    document.getElementById("DashboardActiveImg").src = "img/GreenDot.png";
  }

  if (session.recorder.off) {
    document.getElementById("RecordingActiveImg").src = "img/WhiteDot.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordingActiveImg").src = "img/YellowDot.png";
  } else if (wifiDropped) {
    document.getElementById("RecordingActiveImg").src = "img/YellowDot.png";
  } else {
    document.getElementById("RecordingActiveImg").src = "img/RedDot.png";
  }
}

function displayNormalMessages() {
  wifiDropped = false;
  if (messagesBackground == "MEDIUMBLUE") return;
  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = mediumblueColor;
  messagesBackground = "MEDIUMBLUE";
  updateDashboardAndRecordingStatus();
}

function displayWifiDropped() {
  //if (app.initialState) return;
  wifiDropped = true;
  wifiDroppedBlink++;
  if (wifiDroppedBlink != 3) return;
  wifiDroppedBlink = 0;
  if (messagesBackground == "ORANGE") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = mediumblueColor;
    messagesBackground = "MEDIUMBLUE";
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
    elm.style.backgroundColor = orangeColor;
    messagesBackground = "ORANGE";
    updateDashboardAndRecordingStatus();
    elm = document.getElementById("Mline1");
    savedL1 = elm.innerHTML;
    elm.innerHTML = "&nbsp";
    elm = document.getElementById("Mline2");
    savedL2 = elm.innerHTML;
    elm.innerHTML = "No Message from device";
    elm = document.getElementById("Mline3");
    savedL3 = elm.innerHTML;
    elm.innerHTML = "for a while";
    elm = document.getElementById("Mline4");
    savedL4 = elm.innerHTML;
    elm.innerHTML = "&nbsp";
  }
}

function displayWifiUnconnected() {
  wifiDropped = true;
  if (messagesBackground == "ORANGE") return;
  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;
  messagesBackground = "ORANGE";
  updateDashboardAndRecordingStatus();
  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;
  elm = document.getElementById("Mline1");
  elm.innerHTML = "Awaiting Internet";
  elm = document.getElementById("Mline2");
  elm.innerHTML = "Connection";
  elm = document.getElementById("Mline3");
  elm.innerHTML = "Connect RESPIMATIC100";
  elm = document.getElementById("Mline4");
  elm.innerHTML = "to Wi-Fi";
}



