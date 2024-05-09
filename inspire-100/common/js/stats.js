// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var statComputer = null;

function checkForUndefined(val) {
  if (val === null) return "--";
  if (isUndefined(val)) return "?";
  return val;
}

function displayUsedCombos() {
  let table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  let arr = statComputer.filterTransitions(session.usedParamCombos);
  for (i = 0; i < arr.length; i++) {
    combo = arr[i];
    if (combo.value.numBreaths == 0) continue;
    let row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(MODE_DECODER[(combo.value.mode)]);
    if (combo.value.mode == "PSV") {
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(combo.value.mv);
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(null);
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(null);
    } else {
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(combo.value.vt);
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(combo.value.rr);
      cell = row.insertCell();
      cell.innerHTML = checkForUndefined(EI_DECODER[(combo.value.ie)]);
    }
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.ipeep);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.pmax);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.ps);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.tps);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.fiO2);

    let comboBreathsInRange = null;
    let minBnum = session.reportRange.minBnum;
    let maxBnum = session.reportRange.maxBnum - 1;
    let minComboBnum = combo.value.startingBreath;
    let maxComboBnum = minComboBnum + combo.value.numBreaths - 1;

    //console.log("minBnum=" + minBnum);
    //console.log("maxBnum=" + maxBnum);
    //console.log("minComboBnum=" + minComboBnum);
    //console.log("maxComboBnum=" + maxComboBnum);

    let minB, maxB;
    if (minBnum < minComboBnum) minB = minComboBnum;
    else minB = minBnum;
    if (maxBnum > maxComboBnum) maxB = maxComboBnum;
    else maxB = maxBnum;

    if ((minBnum > maxComboBnum) || (maxBnum < minComboBnum)) {
      // No intersection
      comboBreathsInRange = 0;
    } else {
      comboBreathsInRange = maxB - minB + 1;
    }

    //console.log("comboBreathsInRange=" + comboBreathsInRange);

    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(comboBreathsInRange);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(minComboBnum);
  }
}
/////////////////////////////////////////////////////////////////
// Construct the tables required for reporting statistics
/////////////////////////////////////////////////////////////////
function miscTableRow(table, field, value) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = field;
  cell = row.insertCell();
  cell.innerHTML = '<div style="text-align:right;" id=' + value + '>----</div>';
}

function paramTableRow(table, field, units, value) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = field;
  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size:0.8em;">' + units + '</div>';
  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function minMaxTableRow(table, field, units, minDiv, maxDiv, avgDiv) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = field;
  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size:0.8em;">' + units + '</div>';
  cell = row.insertCell();
  cell.innerHTML = '<div style="text-align:right;" id=' + minDiv + '>----</div>';
  cell = row.insertCell();
  cell.innerHTML = '<div style="text-align:right;" id=' + maxDiv + '>----</div>';
  cell = row.insertCell();
  cell.innerHTML = '<div style="text-align:right;" id=' + avgDiv + '>----</div>';
}

function constructStatMinMaxTable() {
  let table = document.getElementById("statsMinMaxTable");
  minMaxTableRow(table, "Peak Pressure", "cmH20", "peakMin", "peakMax", "peakAvg");
  minMaxTableRow(table, "Plateau Pressure", "cmH20", "platMin", "platMax", "platAvg");
  minMaxTableRow(table, "PEEP Pressure", "cmH20", "mpeepMin", "mpeepMax", "mpeepAvg");
  minMaxTableRow(table, "Tidal Volume Delivered", "ml", "vtMin", "vtMax", "vtAvg");
  minMaxTableRow(table, "Total Minute Volume", "litres/min", "mvMin", "mvMax", "mvAvg");
  minMaxTableRow(table, "Mandatory Minute Volume", "litres/min", "mmvMin", "mmvMax", "mmvAvg");
  minMaxTableRow(table, "Spontaneous Minute Volume", "litres/min", "smvMin", "smvMax", "smvAvg");
  minMaxTableRow(table, "Mandatory BPM", "bpm", "mbpmMin", "mbpmMax", "mbpmAvg");
  minMaxTableRow(table, "Spontaneous BPM", "bpm", "sbpmMin", "sbpmMax", "sbpmAvg");
  minMaxTableRow(table, "FIO2", "%", "fiO2Min", "fiO2Max", "fiO2Avg");
  minMaxTableRow(table, "Static &#x394V/&#x394P", "ml/cmH20", "scMin", "scMax", "scAvg");
  minMaxTableRow(table, "Dynamic &#x394V/&#x394P", "ml/cmH20", "dcMin", "dcMax", "dcAvg");
  minMaxTableRow(table, "System Temperature", "degC", "tempMin", "tempMax", "tempAvg");
}

function constructStatParamTable() {
  let table = document.getElementById("statsParamTable");
  paramTableRow(table, "Ventilation Mode", "mode", "mode");
  paramTableRow(table, "Tidal Volume", "ml", "vt");
  paramTableRow(table, "Minute Volume", "l/min", "mv");
  paramTableRow(table, "Respiration Rate", "bpm", "rr");
  paramTableRow(table, "I:E Ratio", "ratio", "ie");
  paramTableRow(table, "PEEP Pressure", "cmH20", "ipeep");
  paramTableRow(table, "Maximum Pressure", "cmH20", "pmax");
  paramTableRow(table, "Support Pressure", "cmH20", "ps");
  paramTableRow(table, "Support Pressure Termination", "%flow,secs", "tps");
  paramTableRow(table, "FIO2", "%", "fiO2");
}

function constructStatMiscTable() {
  let table = document.getElementById("statsMiscTable");
  miscTableRow(table, "Number of Breaths", "numBreaths");
  miscTableRow(table, "Number of Mandatory Breaths", "numMandatory");
  miscTableRow(table, "Number of Spontaneous Breaths", "numSpontaneous");
  miscTableRow(table, "Number of Maintenance Breaths", "numMaintenance");
  miscTableRow(table, "Number of CMV Spontaneous Breaths", "numCmvSpont");
  miscTableRow(table, "Number of Missing Intervals (Packet loss)", "numMissingBreaths");
  miscTableRow(table, "Number of WiFi Disconnects", "numWifiDrops");
  miscTableRow(table, "Number of Notifications", "numNotifications");
  miscTableRow(table, "Number of Warnings", "numWarnings");
  miscTableRow(table, "Number of Errors", "numErrors");
}

function replaceDummyValue(value) {
  if ((value === null) || isUndefined(value)) str = "----";
  else str = String(value);
  return str;
}

function fillMinMaxAvgRow(minDivId, maxDivId, avgDivId, param) {
	let minBnum = session.reportRange.minBnum;
	let maxBnum = session.reportRange.maxBnum;

	let stats = param.MinMaxAvg(minBnum, maxBnum);
  document.getElementById(minDivId).innerHTML = replaceDummyValue(stats.min);
  document.getElementById(maxDivId).innerHTML = replaceDummyValue(stats.max);
	if (!isUndefined(stats.avg) && (stats.avg !== null)) {
  	document.getElementById(avgDivId).innerHTML = replaceDummyValue(stats.avg.toFixed(1));
	} else {
  	document.getElementById(avgDivId).innerHTML = replaceDummyValue(null);
	}
}

function formUsedParamString(paramObj, enums) {
	let minBnum = session.reportRange.minBnum;
	let maxBnum = session.reportRange.maxBnum;

	let stats = paramObj.DistinctValues(minBnum, maxBnum);
  if (!stats.length) {
    return "?";
  }

  let str = "";
  for (i = 0; i < stats.length; i++) {
    let p = stats[i];
		if (!isUndefined(enums)) {
			p = enums[p];
		}
    if (i == 0) str = p;
    else str = str + "," + p;
  }
  return str;
}

function displayBreathTypeInfo() {
	let minBnum = session.reportRange.minBnum;
	let maxBnum = session.reportRange.maxBnum;
	let paramObj = session.params.btype;

	let ns = paramObj.CountValueEqual(SPONTANEOUS_BREATH, minBnum, maxBnum);
	let nm = paramObj.CountValueEqual(MANDATORY_BREATH, minBnum, maxBnum);
	let ne = paramObj.CountValueEqual(MAINTENANCE_BREATH, minBnum, maxBnum);

  el = document.getElementById("numBreaths");
  el.innerHTML = replaceDummyValue(nm + ns + ne);
  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(nm);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(ns);
  el = document.getElementById("numMaintenance");
  el.innerHTML = replaceDummyValue(ne);

	let nSpont = session.params.cmvSpont.NumChanges(minBnum, maxBnum);
  el = document.getElementById("numCmvSpont");
  el.innerHTML = replaceDummyValue(nSpont);

	let nDrops = session.params.wifiDrops.NumChanges(minBnum, maxBnum);
  el = document.getElementById("numWifiDrops");
  el.innerHTML = replaceDummyValue(nDrops);

  let arr = statComputer.filterChanges(session.missingBreaths);
  let n = 0;
  for (let i = 0; i < arr.length; i++) {
    obj = arr[i];
    n += obj.value;
  }
  el = document.getElementById("numMissingBreaths");
  el.innerHTML = replaceDummyValue(n);
}

function displayMinMaxAvg() {
  fillMinMaxAvgRow("peakMin", "peakMax", "peakAvg", session.params.peak);
  fillMinMaxAvgRow("platMin", "platMax", "platAvg", session.params.plat);
  fillMinMaxAvgRow("mpeepMin", "mpeepMax", "mpeepAvg", session.params.mpeep);
  fillMinMaxAvgRow("vtMin", "vtMax", "vtAvg", session.params.vtdel);
  fillMinMaxAvgRow("mvMin", "mvMax", "mvAvg", session.params.mvdel);
  fillMinMaxAvgRow("mmvMin", "mmvMax", "mmvAvg", session.params.mmvdel);
  fillMinMaxAvgRow("smvMin", "smvMax", "smvAvg", session.params.smvdel);
  fillMinMaxAvgRow("mbpmMin", "mbpmMax", "mbpmAvg", session.params.mbpm);
  fillMinMaxAvgRow("sbpmMin", "sbpmMax", "sbpmAvg", session.params.sbpm);
  fillMinMaxAvgRow("fiO2Min", "fiO2Max", "fiO2Avg", session.params.fiO2);
  fillMinMaxAvgRow("scMin", "scMax", "scAvg", session.params.scomp);
  fillMinMaxAvgRow("dcMin", "dcMax", "dcAvg", session.params.dcomp);
  fillMinMaxAvgRow("tempMin", "tempMax", "tempAvg", session.params.tempC);
}

function displayParamUsage() {
  el = document.getElementById("mode");
  el.innerHTML = formUsedParamString(session.params.mode, MODE_DECODER);
  el = document.getElementById("vt");
  el.innerHTML = formUsedParamString(session.params.vt);
  el = document.getElementById("mv");
  el.innerHTML = formUsedParamString(session.params.mv);
  el = document.getElementById("rr");
  el.innerHTML = formUsedParamString(session.params.rr);
  el = document.getElementById("ie");
  el.innerHTML = formUsedParamString(session.params.ie, EI_DECODER);
  el = document.getElementById("ipeep");
  el.innerHTML = formUsedParamString(session.params.ipeep);
  el = document.getElementById("pmax");
  el.innerHTML = formUsedParamString(session.params.pmax);
  el = document.getElementById("ps");
  el.innerHTML = formUsedParamString(session.params.ps);
  el = document.getElementById("tps");
  el.innerHTML = formUsedParamString(session.params.tps);
  el = document.getElementById("fiO2");
  el.innerHTML = formUsedParamString(session.params.fiO2);
}

function displayPatientInfo() {
  let patientName = "";
  if (session.patientData.fname) {
    patientName += session.patientData.fname;
  }
  if (session.patientData.lname) {
    patientName += " " + session.patientData.lname;
  }
  el = document.getElementById("pName");
  if (patientName) {
    el.innerHTML = "Patient Name: " + patientName;
  } else {
    el.innerHTML = "Patient Name: ?";
  }

  let pInfo1 = "";
  if (session.patientData.gender) {
    pInfo1 = "Gender: " + session.patientData.gender;
  } else {
    pInfo1 = "Gender: ?";
  }

  if (session.patientData.age) {
    pInfo1 += "&nbsp&nbspAge: " + session.patientData.age + "yr";
  } else {
    pInfo1 += "&nbsp&nbspAge: ?";
  }

  el = document.getElementById("pInfo1");
  el.innerHTML = pInfo1;

  let pInfo2 = "";
  if (session.patientData.weight) {
    pInfo2 = "Weight: " + session.patientData.weight + "kg";
  } else {
    pInfo2 = "Weight: ?";
  }

  if (session.patientData.height) {
    pInfo2 += "&nbsp&nbspHeight: " + session.patientData.height + "cm";
  } else {
    pInfo2 += "&nbsp&nbspHeight: ?";
  }

  el = document.getElementById("pInfo2");
  el.innerHTML = pInfo2;
}

function displayAlertsInfo() {
	let minBnum = session.reportRange.minBnum;
	let maxBnum = session.reportRange.maxBnum;

  let n = session.params.infos.NumChanges(minBnum, maxBnum);
  el = document.getElementById("numNotifications");
  el.innerHTML = replaceDummyValue(n);

  n = session.params.warnings.NumChanges(minBnum, maxBnum);
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(n);

  n = session.params.errors.NumChanges(minBnum, maxBnum);
  el = document.getElementById("numErrors");
  el.innerHTML = replaceDummyValue(n);
}

function createAllStats() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  if (!session.statTablesConstructed) {
    constructStatMinMaxTable();
    constructStatParamTable();
    constructStatMiscTable();
  }
  session.statTablesConstructed = true;
  statComputer = new StatComputer(session.breathTimes, session.reportRange);

  displayMinMaxAvg();
  displayParamUsage();
  displayBreathTypeInfo();
  displayUsedCombos();
  displayPatientInfo();
  displayAlertsInfo();

  el = document.getElementById("location");
  el.innerHTML = "System Location: " + "?" ;
  if (session.miscData.locationName) {
    el.innerHTML = "System Location: " + session.miscData.locationName;
  }
  el = document.getElementById("altitude");
  el.innerHTML = "Location Altitude: " + "?" ;
  if (session.miscData.altInFt) {
    el.innerHTML = "Location Altitude: " + session.miscData.altInFt + " ft";
  }
  el = document.getElementById("atmPressure");
  el.innerHTML = "Location Atmospheric Pressure: " + "?" ;
  if (session.miscData.atmInCmH20) {
    el.innerHTML = "Location Atmospheric Pressure: " + session.miscData.atmInCmH20 + " cmH2O";
  }
  el = document.getElementById("o2Percentage");
  el.innerHTML = "Location Atmospheric Oxygen: " + "?" ;
  if (session.miscData.altInFt) {
    el.innerHTML = "Location Atmospheric Oxygen: " + session.miscData.atmO2Pct + "%";
  }

}

function initStats() {
  session.statTablesConstructed = false;
  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMinMaxTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsParamTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMiscTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
}
