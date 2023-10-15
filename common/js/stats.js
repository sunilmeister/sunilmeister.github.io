// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function checkForUndefined(val) {
  if (val === null) return "--";
  if (isUndefined(val)) return "?";
  return val;
}

function displayUsedCombos() {
  var table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  var arr = statComputer.filterTransitions(session.usedParamCombos);
  for (i = 0; i < arr.length; i++) {
    combo = arr[i];
    if (combo.value.numBreaths == 0) continue;
    var row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.mode);
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
      cell.innerHTML = checkForUndefined(combo.value.ie);
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

    var comboBreathsInRange = null;
    var minBnum = session.reportRange.minBnum;
    var maxBnum = session.reportRange.maxBnum - 1;
    var minComboBnum = combo.value.startingBreath;
    var maxComboBnum = minComboBnum + combo.value.numBreaths - 1;

    //console.log("minBnum=" + minBnum);
    //console.log("maxBnum=" + maxBnum);
    //console.log("minComboBnum=" + minComboBnum);
    //console.log("maxComboBnum=" + maxComboBnum);

    var minB, maxB;
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
  var table = document.getElementById("statsMinMaxTable");
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
  minMaxTableRow(table, "Static DeltaV/DeltaP", "ml/cmH20", "scMin", "scMax", "scAvg");
  minMaxTableRow(table, "Dynamic DeltaV/DeltaP", "ml/cmH20", "dcMin", "dcMax", "dcAvg");
  minMaxTableRow(table, "System Temperature", "degC", "tempMin", "tempMax", "tempAvg");
}

function constructStatParamTable() {
  var table = document.getElementById("statsParamTable");
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
  var table = document.getElementById("statsMiscTable");
  miscTableRow(table, "Number of Breaths", "numBreaths");
  miscTableRow(table, "Number of Mandatory Breaths", "numMandatory");
  miscTableRow(table, "Number of Spontaneous Breaths", "numSpontaneous");
  miscTableRow(table, "Number of Maintenance Breaths", "numMaintenance");
  miscTableRow(table, "Number of CMV-mode Spontaneous Breaths", "numCmvSpont");
  miscTableRow(table, "Number of Missing Intervals (Packet loss)", "numMissingBreaths");
  miscTableRow(table, "Number of WiFi or Server Disconnects", "numWifiDrops");
  miscTableRow(table, "Number of Notifications", "numNotifications");
  miscTableRow(table, "Number of Warnings", "numWarnings");
  miscTableRow(table, "Number of Errors", "numErrors");
}

function replaceDummyValue(value) {
  if ((value == null) || isUndefined(value)) str = "----";
  else if (value == 'undefined') str = "----";
  else str = String(value);
  return str;
}

var statComputer = null;

function fillMinMaxAvgRow(minDivId, maxDivId, avgDivId, transitions) {
  statComputer.computeMinMaxAvg(transitions);
  document.getElementById(minDivId).innerHTML = replaceDummyValue(statComputer.computedMin);
  document.getElementById(maxDivId).innerHTML = replaceDummyValue(statComputer.computedMax);
  document.getElementById(avgDivId).innerHTML = replaceDummyValue(statComputer.computedAvg);
}

function extractUsedParamsFromCombos() {
  var pNames = ["mode", "vt", "mv", "rr", "ie", "ipeep", "pmax", "ps", "tps", "fiO2"];
  var obj = {};

  if (session.usedParamCombos.length == 0) {
    console.warn("session.usedParamCombos is empty");
    return;
  }

  var arr = statComputer.filterTransitions(session.usedParamCombos);
  for (i = 0; i < arr.length; i++) {
    combo = arr[i];
    params = combo.value;
    for (j = 0; j < pNames.length; j++) {
      pName = pNames[j];
      p = params[pName];
      if (isUndefined(p)) continue;
      if (isUndefined(obj[pName])) {
        obj[pName] = [p];
      } else {
        if (obj[pName].indexOf(p) == -1) {
          obj[pName].push(p);
        }
      }
    }
  }
  return obj;
}

function formUsedParamString(extractedObj, paramName) {
  if (isUndefined(extractedObj)) {
    return "?";
  }
  var extractedArray = extractedObj[paramName];
  if (isUndefined(extractedArray)) {
    return "?";
  }

  var str = "";
  for (i = 0; i < extractedArray.length; i++) {
    var p = extractedArray[i];
    if (i == 0) str = p;
    else str = str + "," + p;
  }
  return str;
}

function displayBreathTypeInfo() {
  var arr = statComputer.rangeArray(session.breathTypeChanges);
  var nm = 0;
  var ns = 0;
  var ne = 0;
  for (let i = 0; i < arr.length; i++) {
    value = arr[i].value;
    if (value == SPONTANEOUS_BREATH) ns++;
    else if (value == MANDATORY_BREATH) nm++;
    else if (value == MAINTENANCE_BREATH) ne++;
  }
  el = document.getElementById("numBreaths");
  el.innerHTML = replaceDummyValue(nm + ns + ne);
  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(nm);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(ns);
  el = document.getElementById("numMaintenance");
  el.innerHTML = replaceDummyValue(ne);


  arr = statComputer.filterChanges(session.missingBreaths);
  var n = 0;
  for (let i = 0; i < arr.length; i++) {
    obj = arr[i];
    n += obj.value;
  }
  el = document.getElementById("numMissingBreaths");
  el.innerHTML = replaceDummyValue(n);

  arr = statComputer.filterChanges(session.cmvSpontChanges);
  n = 0;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numCmvSpont");
  el.innerHTML = replaceDummyValue(n);

  //arr = statComputer.filterChanges(session.wifi.drops);
  el = document.getElementById("numWifiDrops");
  el.innerHTML = replaceDummyValue(session.wifi.drops.length);
}

function displayMinMaxAvg() {
  fillMinMaxAvgRow("peakMin", "peakMax", "peakAvg", session.peakChanges);
  fillMinMaxAvgRow("platMin", "platMax", "platAvg", session.platChanges);
  fillMinMaxAvgRow("mpeepMin", "mpeepMax", "mpeepAvg", session.mpeepChanges);
  fillMinMaxAvgRow("vtMin", "vtMax", "vtAvg", session.vtdelChanges);
  fillMinMaxAvgRow("mvMin", "mvMax", "mvAvg", session.mvdelChanges);
  fillMinMaxAvgRow("mmvMin", "mmvMax", "mmvAvg", session.mmvdelChanges);
  fillMinMaxAvgRow("smvMin", "smvMax", "smvAvg", session.smvdelChanges);
  fillMinMaxAvgRow("mbpmMin", "mbpmMax", "mbpmAvg", session.mbpmChanges);
  fillMinMaxAvgRow("sbpmMin", "sbpmMax", "sbpmAvg", session.sbpmChanges);
  fillMinMaxAvgRow("fiO2Min", "fiO2Max", "fiO2Avg", session.fiO2Changes);
  fillMinMaxAvgRow("scMin", "scMax", "scAvg", session.scompChanges);
  fillMinMaxAvgRow("dcMin", "dcMax", "dcAvg", session.dcompChanges);
  fillMinMaxAvgRow("tempMin", "tempMax", "tempAvg", session.tempChanges);
}

function displayParamUsage() {
  var obj = extractUsedParamsFromCombos();

  el = document.getElementById("mode");
  el.innerHTML = formUsedParamString(obj, "mode");
  el = document.getElementById("vt");
  el.innerHTML = formUsedParamString(obj, "vt");
  el = document.getElementById("mv");
  el.innerHTML = formUsedParamString(obj, "mv");
  el = document.getElementById("rr");
  el.innerHTML = formUsedParamString(obj, "rr");
  el = document.getElementById("ie");
  el.innerHTML = formUsedParamString(obj, "ie");
  el = document.getElementById("ipeep");
  el.innerHTML = formUsedParamString(obj, "ipeep");
  el = document.getElementById("pmax");
  el.innerHTML = formUsedParamString(obj, "pmax");
  el = document.getElementById("ps");
  el.innerHTML = formUsedParamString(obj, "ps");
  el = document.getElementById("tps");
  el.innerHTML = formUsedParamString(obj, "tps");
  el = document.getElementById("fiO2");
  el.innerHTML = formUsedParamString(obj, "fiO2");
}

function displayPatientInfo() {
  var patientName = "";
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

  var pInfo1 = "";
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

  var pInfo2 = "";
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

  var arr = statComputer.filterChanges(session.infoChanges);
  var n = 0;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numNotifications");
  el.innerHTML = replaceDummyValue(n);

  arr = statComputer.filterChanges(session.warningChanges);
  n = 0;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(n);

  arr = statComputer.filterChanges(session.errorChanges);
  n = 0;
  for (i = 0; i < arr.length; i++) {
    if (arr[i].value) n++;
  }
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
    el.innerHTML = "Location Altitude: " 
      + session.miscData.altInFt + " ft ("
      + session.miscData.altInM + " mtrs)" ;
  }
  el = document.getElementById("o2Percentage");
  el.innerHTML = "Location Atmospheric Oxygen: " + "?" ;
  if (session.miscData.altInFt) {
    el.innerHTML = "Location Atmospheric Oxygen: " + session.miscData.o2Pct + "%";
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
