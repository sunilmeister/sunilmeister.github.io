//  returns [gender, age, pid]
function parsePatientInfo(str) {
  tokens = str.split('[');
  tokens = tokens[1].split(']');
  pid = tokens[0].trim();
  tokens = tokens[1].split(' ');
  age = tokens[2];
  tokens = tokens[1].split('(');
  tokens = tokens[1].split(')');
  gender = tokens[0];
  return [gender, age, pid];
}

function parseAltitude(str) {
  // return [ft,meters]
  return str.split(' ');
}

function formMessageLine(str) {
  value = str.trim();
  mvalue = value.replace(/ /g, "&nbsp");
  return mvalue;
}
// returns [old,new]
function parseInputParam(val) {
  const arrowUnicode = '\u27AD';
  var oldP, newP;
  var str;
  if (typeof val === 'string' || val instanceof String) {
    str = val;
  } else {
    str = String(val);
  }
  tokens = str.split(arrowUnicode);
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
  if (pendingState) {
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
  updatePendingIndividualSetting(blink, "MODEDiv", pendingMODE);
  updatePendingIndividualSetting(blink, "VTDiv", pendingVT);
  updatePendingIndividualSetting(blink, "RRDiv", pendingRR);
  updatePendingIndividualSetting(blink, "IEDiv", pendingIE);
  updatePendingIndividualSetting(blink, "IPEEPDiv", pendingIPEEP);
  updatePendingIndividualSetting(blink, "PMAXDiv", pendingPMAX);
  updatePendingIndividualSetting(blink, "PSDiv", pendingPS);
  updatePendingIndividualSetting(blink, "TPSDiv", pendingTPS);
}

function updatePending(blink) {
  // double verify if something is pending
  pendingState = pendingMODE || pendingVT || pendingRR || pendingIE ||
    pendingIPEEP || pendingPMAX || pendingPS || pendingTPS;
  updatePendingSettings(blink);
  if (pendingState) {
    elm = document.getElementById("Pending");
    elm.innerHTML = "Pending Uncommitted Changes";
    if (pendingBackground != "ORANGE") {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = orangeColor;
      pendingBackground = "ORANGE";
    } else if (blink) {
      elm = document.getElementById("PendingDiv");
      elm.style.backgroundColor = mediumblueColor;
      pendingBackground = "MEDIUMBLUE";
    }
  } else if (pendingBackground != "MEDIUMBLUE") {
    elm = document.getElementById("PendingDiv");
    elm.style.backgroundColor = mediumblueColor;
    elm = document.getElementById("Pending");
    elm.innerHTML = "No Uncommitted Changes";
    pendingBackground = "MEDIUMBLUE";
  }
}

function updateAlert(blink) {
  elm = document.getElementById("AlertDiv");
  if (errorState) {
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
  } else if (attentionState || wifiDropped) {
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
  const flowUnicode = '\u21A1';
  const timeUnicode = '\u23F1';
  const pctUnicode = '\uFE6A';
  var val, units;
  tokens = str.split(flowUnicode);
  if (tokens[0] != str) {
    val = tokens[1];
    units = "(% Peak Flow)";
    return [val, units];
  }
  tokens = str.split(timeUnicode);
  if (tokens[0] != str) {
    val = tokens[1];
    units = "(secs)";
    return [val, units];
  }
  return [str, ""];
}

function updateSettingValue(str, containerDiv, valueDiv) {
  var pending = false;
  [prev, curr] = parseInputParam(str);
  if (prev != curr) {
    pendingState = true;
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

function updateSnapshot(d) {
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    // System State
    if (key == 'INITIAL') {
      initialState = false;
      if (value == "1") {
        initialState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>INITIALIZE</b>";
        document.getElementById("StateImg").src = "img/WhiteDot.png";
        updateAlert(false);
      }
    } else if (key == 'STANDBY') {
      standbyState = false;
      if (value == "1") {
        standbyState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>STANDBY</b>";
        document.getElementById("StateImg").src = "img/YellowDot.png";
        updateAlert(false);
      }
    } else if (key == 'RUNNING') {
      activeState = false;
      if (value == "1") {
        activeState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ACTIVE</b>";
        document.getElementById("StateImg").src = "img/GreenDot.png";
        updateAlert(false);
      }
    } else if (key == 'ERROR') {
      if (value == "1") {
        errorState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ERROR</b>";
        document.getElementById("StateImg").src = "img/RedDot.png";
        updateAlert(false);
      } else {
	if (errorState) attentionState = false; // exiting error state
        errorState = false;
      }
    } else if (key == 'ATTENTION') {
      if (value == "1") {
        attentionState = true;
        updateAlert(false);
      } else {
        attentionState = false;
        updateAlert(false);
      }
    }
    // Message lines
    else if (key == 'L1') {
      elm = document.getElementById("Mline1");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    } else if (key == 'L2') {
      elm = document.getElementById("Mline2");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    } else if (key == 'L3') {
      elm = document.getElementById("Mline3");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    } else if (key == 'L4') {
      elm = document.getElementById("Mline4");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
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
      if (ft=='--') m = '--' ;
      elm.innerHTML = m + " <small><small>m</small></small>";
    }
    // Breath Type
    else if (key == 'BREATH') {
      elm = document.getElementById("BreathType");
      if (value == "MANDATORY") {
        document.getElementById("ImgBreath").src = "img/MandatoryDot.png";
        elm.innerHTML = "Mandatory";
      } else if (value == "SPONTANEOUS") {
        document.getElementById("ImgBreath").src = "img/SpontaneousDot.png";
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
        pendingState = true;
        updatePending(false);
      } else {
        pendingState = false;
        pendingMODE = false;
        pendingVT = false;
        pendingRR = false;
        pendingIE = false;
        pendingIPEEP = false;
        pendingPMAX = false;
        pendingPS = false;
        pendingTPS = false;
        updatePending(false);
      }
    }
    // Patient info
    else if (key == 'PNAME') {
      elm = document.getElementById("Pline1");
      elm.innerHTML = value;
    } else if (key == 'PMISC') {
      [gender, age, pid] = parsePatientInfo(value);
      elm = document.getElementById("Pline2");
      if (gender == "M") {
        elm.innerHTML = "Male " + "(" + age + " years)";
      } else {
        elm.innerHTML = "Female " + "(" + age + " years)";
      }
      elm = document.getElementById("Pline3");
      elm.innerHTML = "ID: " + pid;
    }
    // Input Settings
    else if (key == 'MODE') {
      pendingMODE = updateSettingValue(value, "MODEDiv", "MODE");
      if (pendingMODE) somethingPending = true;
    } else if (key == 'VT') {
      pendingVT = updateSettingValue(value, "VTDiv", "VT");
      if (pendingVT) somethingPending = true;
    } else if (key == 'RR') {
      pendingRR = updateSettingValue(value, "RRDiv", "RR");
      if (pendingRR) somethingPending = true;
    } else if (key == 'EI') {
      pendingIE = updateSettingValue(value, "IEDiv", "IE");
      if (pendingIE) somethingPending = true;
    } else if (key == 'IPEEP') {
      pendingIPEEP = updateSettingValue(value, "IPEEPDiv", "IPEEP");
      if (pendingIPEEP) somethingPending = true;
    } else if (key == 'PMAX') {
      pendingPMAX = updateSettingValue(value, "PMAXDiv", "PMAX");
      if (pendingPMAX) somethingPending = true;
    } else if (key == 'PS') {
      pendingPS = updateSettingValue(value, "PSDiv", "PS");
      if (pendingPS) somethingPending = true;
    } else if (key == 'TPS') {
      pendingTPS = updateSettingValue(value, "TPSDiv", "TPS");
      if (pendingTPS) somethingPending = true;
      [tps, units] = parseInputTPS(document.getElementById("TPS").innerText);
      elm = document.getElementById("TPS");
      elm.innerHTML = tps;
      elm = document.getElementById("TPS_UNITS");
      elm.innerHTML = units;
    }
  }
}

function undisplayWifiDropped() {
  if (initialState) return;
  wifiDropped = false;
  if (messagesBackground=="MEDIUMBLUE") return;

  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = mediumblueColor;
  messagesBackground="MEDIUMBLUE";

  elm = document.getElementById("Mline1");
  elm.innerHTML = "--";
  elm = document.getElementById("Mline2");
  elm.innerHTML = "--";
  elm = document.getElementById("Mline3");
  elm.innerHTML = "--";
  elm = document.getElementById("Mline4");
  elm.innerHTML = "--";
}

function displayWifiDropped() {
  wifiDropped = true;
  if (messagesBackground=="ORANGE") return;

  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;
  messagesBackground="ORANGE";

  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;

  elm = document.getElementById("Mline1");
  elm.innerHTML = "Wi-Fi Disconnected";
  elm = document.getElementById("Mline2");
  elm.innerHTML = "&nbsp";
  elm = document.getElementById("Mline3");
  elm.innerHTML = "System will attempt";
  elm = document.getElementById("Mline4");
  elm.innerHTML = "to re-connect";
}

function displayWifiUnconnected() {
  wifiDropped = true;
  if (messagesBackground=="ORANGE") return;

  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;
  messagesBackground="ORANGE";

  elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = orangeColor;

  elm = document.getElementById("Mline1");
  elm.innerHTML = "Wi-Fi not connected";
  elm = document.getElementById("Mline2");
  elm.innerHTML = "Use RESPIMATIC";
  elm = document.getElementById("Mline3");
  elm.innerHTML = "Control Panel";
  elm = document.getElementById("Mline4");
  elm.innerHTML = "to connect";
}

var periodicIntervalId = setInterval(function() {
  updateAlert(true);
  updatePending(true);
  periodicTickCount++;
  if (firstDweet) {
    displayWifiUnconnected();
  } else if ((periodicTickCount-lastDweetTick) >= dweetIntervalMax) {
    displayWifiDropped();
  } else {
    undisplayWifiDropped();
  }
}, 1500);
