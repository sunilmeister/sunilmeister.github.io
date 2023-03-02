// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formMessageLine(str) {
  value = str.trim();
  if (value == "") return " ";
  mvalue = value.replace(/ /g, " ");
  return mvalue;
}
// returns [old,new]
function parseInputParam(val) {
  var oldP, newP;
  var str;
  if (typeof val === 'string' || val instanceof String) {
    str = val;
  } else {
    str = String(val);
  }
  tokens = str.split(',');
  if (tokens.length == 1) {
    oldP = tokens[0];
    newP = tokens[0];
  } else {
    oldP = tokens[0];
    newP = tokens[1];
  }
  return [oldP, newP];
}

function updatePendingIndividualSetting(blink, div, pendingSetting) {
  elm = document.getElementById(div);
  if (app.pendingState) {
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
  updatePendingIndividualSetting(blink, "MODEDiv", app.pendingMODE);
  updatePendingIndividualSetting(blink, "VTDiv", app.pendingVT);
  updatePendingIndividualSetting(blink, "RRDiv", app.pendingRR);
  updatePendingIndividualSetting(blink, "IEDiv", app.pendingIE);
  updatePendingIndividualSetting(blink, "IPEEPDiv", app.pendingIPEEP);
  updatePendingIndividualSetting(blink, "PMAXDiv", app.pendingPMAX);
  updatePendingIndividualSetting(blink, "PSDiv", app.pendingPS);
  updatePendingIndividualSetting(blink, "TPSDiv", app.pendingTPS);
}

function updatePending(blink) {
  // double verify if something is app.pending
  app.pendingState = app.pendingMODE || app.pendingVT || app.pendingRR ||
    app.pendingIE || app.pendingIPEEP || app.pendingPMAX ||
    app.pendingPS || app.pendingTPS;
  updatePendingSettings(blink);
  //console.log("pendingState=" + app.pendingState);
  if (app.pendingState) {
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
  if (app.errorState) {
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
  } else if (app.attentionState || wifiDropped) {
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
// returns [val,units]
function parseInputTPS(str) {
  var val, units;
  tokens = str.split('F');
  if (tokens[0] != str) {
    val = tokens[1];
    units = "(% of Peak Flow)";
  } else {
    val = str;
    units = "(secs)";
  }
  return [val, units];
}

function updateSettingValue(str, containerDiv, valueDiv) {
  var pending = false;
  [prev, curr] = parseInputParam(str);
  if (prev != curr) {
    app.pendingState = true;
    pending = true;
    updatePending(false);
    elm = document.getElementById(containerDiv);
    elm.style.backgroundColor = orangeColor;
  } else {
    pending = false;
    elm = document.getElementById(containerDiv);
    elm.style.backgroundColor = mediumblueColor;
  }
  elm = document.getElementById(valueDiv);
  elm.innerHTML = curr;
  return pending;
}

function displayMessageLine(lineTag) {
  if (messagesBackground != "MEDIUMBLUE") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = mediumblueColor;
    messagesBackground = "MEDIUMBLUE";
  }
  elm = document.getElementById(lineTag);
  mvalue = formMessageLine(value);
  elm.innerHTML = mvalue;
}

function updateSnapshot() {
  let d = updatedDweetContent;
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    if (value === null) continue;
    // System State
    if (key == 'INITIAL') {
      if (value == "1") {
        if (!app.initialState) app.attentionState = false; // entering initial state
        app.initialState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>INITIALIZE</b>";
        document.getElementById("StateImg").src = "img/WhiteDot.png";
        updateAlert(false);
      } else {
        app.initialState = false;
      }
    } else if (key == 'STANDBY') {
      if (value == "1") {
        if (!app.standbyState) app.attentionState = false; // entering standby state
        app.standbyState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>STANDBY</b>";
        document.getElementById("StateImg").src = "img/YellowDot.png";
        updateAlert(false);
      } else {
        app.standbyState = false;
      }
    } else if ((key == "RUNNING") || (key == "ACTIVE")) {
      if (value == "1") {
        if (!app.activeState) app.attentionState = false; // entering active state
        app.activeState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ACTIVE</b>";
        document.getElementById("StateImg").src = "img/GreenDot.png";
        updateAlert(false);
      } else {
        app.activeState = false;
      }
    } else if (key == 'ERROR') {
      if (value == "1") {
        app.errorState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ERROR</b>";
        document.getElementById("StateImg").src = "img/RedDot.png";
        updateAlert(false);
      } else {
        if (app.errorState) app.attentionState = false; // exiting error state
        app.errorState = false;
      }
    } else if (key == 'ATTENTION') {
      if (value == "1") {
        app.attentionState = true;
        updateAlert(false);
      } else {
        app.attentionState = false;
        updateAlert(false);
      }
    }
    // Message lines
    else if (key == 'L1') {
      displayMessageLine("Mline1");
    } else if (key == 'L2') {
      displayMessageLine("Mline2");
    } else if (key == 'L3') {
      displayMessageLine("Mline3");
    } else if (key == 'L4') {
      displayMessageLine("Mline4");
    }
    // bpm
    else if (key == 'SBPM') {
      elm = document.getElementById("SBPM");
      elm.innerHTML = value;
    } else if (key == 'MBPM') {
      elm = document.getElementById("MBPM");
      elm.innerHTML = value;
    }
    // Volumes
    else if (key == 'VTDEL') {
      elm = document.getElementById("VTDEL");
      elm.innerHTML = value;
    } else if (key == 'MVDEL') {
      elm = document.getElementById("MVDEL");
      elm.innerHTML = value;
    }
    // Compliances
    else if (key == 'STATIC') {
      elm = document.getElementById("SCOMP");
      elm.innerHTML = value;
    } else if (key == 'DYNAMIC') {
      elm = document.getElementById("DCOMP");
      elm.innerHTML = value;
    }
    // Altitude
    else if (key == 'ALT') {
      [ft, m] = parseAltitude(value);
      elm = document.getElementById("AltF");
      elm.innerHTML = ft + " <small><small>ft</small></small>";
      elm = document.getElementById("AltM");
      if (ft == '--') m = '--';
      elm.innerHTML = m + " <small><small>m</small></small>";
    }
    // Breath Type
    else if (key == 'BREATH') {
      elm = document.getElementById("BreathType");
      if (value == "MANDATORY") {
        document.getElementById("ImgBreath").src = "img/YellowDot.png";
        elm.innerHTML = "Mandatory";
      } else if (value == "SPONTANEOUS") {
        document.getElementById("ImgBreath").src = "img/GreenDot.png";
        elm.innerHTML = "Spontaneous";
      } else {
        document.getElementById("ImgBreath").src = "img/WhiteDot.png";
        elm.innerHTML = "";
      }
    }
    // Pressures
    else if (key == 'PIP') {
      peakGauge.setValue(value);
    } else if (key == 'PLAT') {
      platGauge.setValue(value);
    } else if (key == 'MPEEP') {
      peepGauge.setValue(value);
    }
    // Temperature
    else if (key == 'TEMP') {
      tempGauge.setValue(value);
    }
    // Pending settings change
    else if (key == 'PENDING') {
      if (value == 1) {
        app.pendingState = true;
        updatePending(false);
      } else {
        app.pendingState = false;
        app.pendingMODE = false;
        app.pendingVT = false;
        app.pendingRR = false;
        app.pendingIE = false;
        app.pendingIPEEP = false;
        app.pendingPMAX = false;
        app.pendingPS = false;
        app.pendingTPS = false;
        updatePending(false);
      }
    }
    // Patient info
    else if (key == 'PNAME') {
      elm = document.getElementById("Pline1");
      elm.innerHTML = value;
    } else if (key == 'PMISC') {
      if (value != "") {
        rvalue = parsePatientInfo(value);
        if (rvalue != null) {
          [gender, age, pid] = rvalue;
          elm = document.getElementById("Pline2");
          if (gender == "M") {
            elm.innerHTML = "Male " + "(" + age + " years)";
          } else {
            elm.innerHTML = "Female " + "(" + age + " years)";
          }
          elm = document.getElementById("Pline3");
          elm.innerHTML = "ID: " + pid;
        }
      }
    }
    // Input Settings
    else if (key == 'MODE') {
      app.pendingMODE = updateSettingValue(value, "MODEDiv", "MODE");
      if (app.pendingMODE) somethingPending = true;
    } else if (key == 'VT') {
      app.pendingVT = updateSettingValue(value, "VTDiv", "VT");
      if (app.pendingVT) somethingPending = true;
    } else if (key == 'RR') {
      app.pendingRR = updateSettingValue(value, "RRDiv", "RR");
      if (app.pendingRR) somethingPending = true;
    } else if (key == 'EI') {
      app.pendingIE = updateSettingValue(value, "IEDiv", "IE");
      if (app.pendingIE) somethingPending = true;
    } else if (key == 'IPEEP') {
      app.pendingIPEEP = updateSettingValue(value, "IPEEPDiv", "IPEEP");
      if (app.pendingIPEEP) somethingPending = true;
    } else if (key == 'PMAX') {
      app.pendingPMAX = updateSettingValue(value, "PMAXDiv", "PMAX");
      if (app.pendingPMAX) somethingPending = true;
    } else if (key == 'PS') {
      app.pendingPS = updateSettingValue(value, "PSDiv", "PS");
      if (app.pendingPS) somethingPending = true;
    } else if (key == 'TPS') {
      app.pendingTPS = updateSettingValue(value, "TPSDiv", "TPS");
      if (app.pendingTPS) somethingPending = true;
      [tps, units] = parseInputTPS(document.getElementById("TPS").innerText);
      elm = document.getElementById("TPS");
      elm.innerHTML = tps;
      elm = document.getElementById("TPS_UNITS");
      elm.innerHTML = units;
    }
  }
}

function updateDashboardAndRecordingStatus() {
  if (awaitingFirstDweet) {
    document.getElementById("DashboardActiveImg").src = "img/YellowDot.png";
  } else if (updatePaused) {
    document.getElementById("DashboardActiveImg").src = "img/RedDot.png";
  } else if (wifiDropped) {
    document.getElementById("DashboardActiveImg").src = "img/YellowDot.png";
  } else {
    document.getElementById("DashboardActiveImg").src = "img/GreenDot.png";
  }

  if (recordingOff) {
    document.getElementById("RecordingActiveImg").src = "img/RedDot.png";
  } else if (recordingPaused) {
    document.getElementById("RecordingActiveImg").src = "img/RedDot.png";
  } else if (wifiDropped) {
    document.getElementById("RecordingActiveImg").src = "img/YellowDot.png";
  } else {
    document.getElementById("RecordingActiveImg").src = "img/GreenDot.png";
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
    elm.innerHTML = " ";
    elm = document.getElementById("Mline2");
    savedL2 = elm.innerHTML;
    elm.innerHTML = "No Message from device";
    elm = document.getElementById("Mline3");
    savedL3 = elm.innerHTML;
    elm.innerHTML = "for a while";
    elm = document.getElementById("Mline4");
    savedL4 = elm.innerHTML;
    elm.innerHTML = " ";
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
