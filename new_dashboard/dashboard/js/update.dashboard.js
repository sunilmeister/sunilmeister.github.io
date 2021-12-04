
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

  if (tokens.length==1) {
    oldP = tokens[0];
    newP = tokens[0];
  } else {
    oldP = tokens[0];
    newP = tokens[1];
  }
  return [oldP,newP];
}

function updatePending(yes) {
  if (yes) {
    elm = document.getElementById("PendingDiv");
    elm.style.backgroundColor = orangeColor;
    elm = document.getElementById("Pending");
    elm.innerHTML = "Pending Uncommitted Changes";
  } else {
    elm = document.getElementById("PendingDiv");
    elm.style.backgroundColor = mediumblueColor;
    elm = document.getElementById("Pending");
    elm.innerHTML = "No Uncommitted Changes";
  }
}

function updateAlertDiv() {
  elm = document.getElementById("AlertDiv");

  if (errorState) {
    if (alertBackground!="DARKRED") {
      elm.style.backgroundColor = darkredColor;
      alertBackground = "DARKRED";
    } else {
      elm.style.backgroundColor = mediumblueColor;
      alertBackground = "MEDIUMBLUE";
    }
    if (alertImage != "ERROR") {
      document.getElementById("AlertImg").src = "img/Error.svg";
      alertImage = "ERROR";
    }
  } else if (attentionState) {
    if (alertBackground!="ORANGE") {
      elm.style.backgroundColor = orangeColor;
      alertBackground = "ORANGE";
    } else {
      elm.style.backgroundColor = mediumblueColor;
      alertBackground = "MEDIUMBLUE";
    }
    if (alertImage != "WARNING") {
      document.getElementById("AlertImg").src = "img/Warning.svg";
      alertImage = "WARNING";
    }
  } else {
    if (alertBackground!="MEDIUMBLUE") {
      elm.style.backgroundColor = mediumblueColor;
      alertBackground = "MEDIUMBLUE";
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

function updateSnapshot(d) {
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];

    // System State
    if (key=='INITIAL') { 
      initialState = false;
      if (value == "1") {
	initialState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>INITIALIZE</b>";
        document.getElementById("StateImg").src = "img/WhiteDot.png";
	updateAlertDiv();
      }
    } 
    else if (key=='STANDBY') { 
      standbyState = false;
      if (value == "1") {
        standbyState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>STANDBY</b>";
        document.getElementById("StateImg").src = "img/YellowDot.png";
	updateAlertDiv();
      }
    } 
    else if (key=='RUNNING') { 
      activeState = false;
      if (value == "1") {
        activeState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ACTIVE</b>";
        document.getElementById("StateImg").src = "img/GreenDot.png";
	updateAlertDiv();
      }
    } 
    else if (key=='ERROR') { 
      errorState = false;
      if (value == "1") {
        errorState = true;
        elm = document.getElementById("State");
        elm.innerHTML = "<b>ERROR</b>";
        document.getElementById("StateImg").src = "img/RedDot.png";
	updateAlertDiv();
      }
    }
    else if (key=='ATTENTION') { 
      if (value == "1") {
        attentionState = true;
	updateAlertDiv();
      } else {
        attentionState = false;
	updateAlertDiv();
      }
    }

    // Message lines
    else if (key=='L1') { 
      elm = document.getElementById("Mline1");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    }
    else if (key=='L2') { 
      elm = document.getElementById("Mline2");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    }
    else if (key=='L3') { 
      elm = document.getElementById("Mline3");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    }
    else if (key=='L4') { 
      elm = document.getElementById("Mline4");
      mvalue = formMessageLine(value);
      elm.innerHTML = mvalue;
    }

    // bpm
    else if (key=='SBPM') { 
      elm = document.getElementById("SBPM");
      elm.innerHTML = value;
    }
    else if (key=='MBPM') { 
      elm = document.getElementById("MBPM");
      elm.innerHTML = value;
    }

    // Volumes
    else if (key=='VTDEL') { 
      elm = document.getElementById("VTDEL");
      elm.innerHTML = value;
    }
    else if (key=='MVDEL') { 
      elm = document.getElementById("MVDEL");
      elm.innerHTML = value;
    }

    // Compliances
    else if (key=='STATIC') { 
      elm = document.getElementById("SCOMP");
      elm.innerHTML = value;
    }
    else if (key=='DYNAMIC') { 
      elm = document.getElementById("DCOMP");
      elm.innerHTML = value;
    }

    // Altitude
    else if (key=='ALT') { 
      [ft,m] = parseAltitude(value);
      elm = document.getElementById("AltF");
      elm.innerHTML = ft + " <small><small>ft</small></small>";
      elm = document.getElementById("AltM");
      elm.innerHTML = m + " <small><small>m</small></small>";
    }

    // Breath Type
    else if (key=='MANDATORY') { 
      if (value==1) {
        document.getElementById("ImgBreath").src = "img/GreenDot.png";
        elm = document.getElementById("BreathType");
        elm.innerHTML = "Mandatory";
      }
    }
    else if (key=='SPONTANEOUS') { 
      if (value==1) {
        document.getElementById("ImgBreath").src = "img/YellowDot.png";
        elm = document.getElementById("BreathType");
        elm.innerHTML = "Spontaneous";
      }
    }

    // Pressures
    else if (key=='PIP') { 
      peakGauge.setValue(value);
    }
    else if (key=='PLAT') { 
      platGauge.setValue(value);
    }
    else if (key=='MPEEP') { 
      peepGauge.setValue(value);
    }

    // Temperature
    else if (key=='TEMP') { 
      tempGauge.setValue(value);
    }

    // Pending settings change
    else if (key=='PENDING') { 
      if (value==1) {
	updatePending(true);
      }
      else {
	updatePending(false);
      }
    }

    // Patient info
    else if (key=='PNAME') { 
      elm = document.getElementById("Pline2");
      elm.innerHTML = value;
    }
    else if (key=='PMISC') { 
      [gender, age, pid] = parsePatientInfo(value);
      elm = document.getElementById("Pline3");
      if (gender=="M") {
        elm.innerHTML = "Male " + "(" + age + " years)" ;
      } else {
        elm.innerHTML = "Female " + "(" + age + " years)" ;
      }
      elm = document.getElementById("Pline4");
      elm.innerHTML = "ID: " + pid;
    }

    // Input Settings
    else if (key=='MODE') { 
      [oldMODE,newMODE] = parseInputParam(value);
      if (newMODE != oldMODE) {
	updatePending(true);
        elm = document.getElementById("MODEDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("MODEDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("MODE");
      elm.innerHTML = newMODE;
    }
    else if (key=='VT') { 
      [oldVT,newVT] = parseInputParam(value);
      if (newVT != oldVT) {
	updatePending(true);
        elm = document.getElementById("VTDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("VTDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("VT");
      elm.innerHTML = newVT;
    }
    else if (key=='RR') { 
      [oldRR,newRR] = parseInputParam(value);
      if (newRR != oldRR) {
	updatePending(true);
        elm = document.getElementById("RRDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("RRDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("RR");
      elm.innerHTML = newRR;
    }
    else if (key=='EI') { 
      [oldIE,newIE] = parseInputParam(value);
      if (newIE != oldIE) {
	updatePending(true);
        elm = document.getElementById("IEDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("IEDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("IE");
      elm.innerHTML = newIE;
    }
    else if (key=='IPEEP') { 
      [oldIPEEP,newIPEEP] = parseInputParam(value);
      if (newIPEEP != oldIPEEP) {
	updatePending(true);
        elm = document.getElementById("IPEEPDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("IPEEPDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("IPEEP");
      elm.innerHTML = newIPEEP;
    }
    else if (key=='PMAX') { 
      [oldPMAX,newPMAX] = parseInputParam(value);
      if (newPMAX != oldPMAX) {
	updatePending(true);
        elm = document.getElementById("PMAXDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("PMAXDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("PMAX");
      elm.innerHTML = newPMAX;
    }
    else if (key=='PS') { 
      [oldPS,newPS] = parseInputParam(value);
      if (newPS != oldPS) {
	updatePending(true);
        elm = document.getElementById("PSDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("PSDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      elm = document.getElementById("PS");
      elm.innerHTML = newPS;
    }
    else if (key=='TPS') { 
      [oldTPS,newTPS] = parseInputParam(value);
      if (newTPS != oldTPS) {
	updatePending(true);
        elm = document.getElementById("TPSDiv");
        elm.style.backgroundColor = orangeColor;
      } else {
        elm = document.getElementById("TPSDiv");
        elm.style.backgroundColor = mediumblueColor;
      }
      [tps, units] = parseInputTPS(newTPS);
      elm = document.getElementById("TPS");
      elm.innerHTML = tps;
      elm = document.getElementById("TPS_UNITS");
      elm.innerHTML = units;
    }
  }
}

var periodicIntervalId = setInterval(function() {
  updateAlertDiv();
}, 1500);

