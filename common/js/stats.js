// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function checkForUndefined(val) {
  if (typeof val == 'undefined') return "?";
  return val;
}

function displayUsedCombos() {
  var table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  
  var arr = statComputer.filterTransitions(app.usedParamCombos);
  for (i = 0; i < arr.length; i++) {
    combo = arr[i];
    if (combo.value.numBreaths == 0) continue;
    var row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.mode);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.vt);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.rr);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.ie);
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
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.value.numBreaths);
    cell = row.insertCell();
    afterBreath = app.reportsXrange.minBnum + combo.value.startingBreath;
    cell.innerHTML = checkForUndefined(afterBreath);
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
  cell.innerHTML = '<div style="font-size:0.7em;">' + units + '</div>';
  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function minMaxTableRow(table, field, units, minDiv, maxDiv, avgDiv) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = field;
  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size:0.7em;">' + units + '</div>';
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
  minMaxTableRow(table, "Minute Volume Delivered", "litres/min", "mvMin", "mvMax", "mvAvg");
  minMaxTableRow(table, "Mandatory BPM", "bpm", "mbpmMin", "mbpmMax", "mbpmAvg");
  minMaxTableRow(table, "Spontaneous BPM", "bpm", "sbpmMin", "sbpmMax", "sbpmAvg");
  minMaxTableRow(table, "FIO2", "%", "fiO2Min", "fiO2Max", "fiO2Avg");
  minMaxTableRow(table, "Instantaneous Static Compliance", "ml/cmH20", "scMin", "scMax", "scAvg");
  minMaxTableRow(table, "Instantaneous Dynamic Compliance", "ml/cmH20", "dcMin", "dcMax", "dcAvg");
  minMaxTableRow(table, "System Temperature", "degC", "tempMin", "tempMax", "tempAvg");
}

function constructStatParamTable() {
  var table = document.getElementById("statsParamTable");
  paramTableRow(table, "Ventilation Mode", "mode", "mode");
  paramTableRow(table, "Tidal Volume", "ml", "vt");
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
  miscTableRow(table, "Number of Missing Breaths (Wi-Fi Disconnect)", "numMissingBreaths");
  miscTableRow(table, "Number of NOTIFICATIONs", "numNotifications");
  miscTableRow(table, "Number of WARNINGs", "numWarnings");
  miscTableRow(table, "Number of ERRORs", "numErrors");
}

function replaceDummyValue(value) {
  if ((value == null) || (typeof value=='undefined'))  str = "----";
  else if (value=='undefined') str = "----" ;
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
  var pNames = ["mode","vt","rr","ie","ipeep","pmax","ps","tps","fiO2"];
  var obj = {};

  var arr = statComputer.filterTransitions(app.usedParamCombos);
  for (i = 0; i < arr.length; i++) {
    combo = arr[i];
    params = combo.value;
    for (j=0; j<pNames.length; j++) {
      pName = pNames[j];
      p = params[pName];
      if (typeof p == 'undefined') continue;
      if (typeof obj[pName] == 'undefined') {
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
  var extractedArray = extractedObj[paramName];
  if (typeof extractedArray == 'undefined') {
    return "?";
  }

  var str = "";
  for (i=0; i<extractedArray.length; i++) {
    var p = extractedArray[i];
    if (i==0) str = p;
    else str = str + "," + p;
  }
  return str;
}

function displayBreathTypeInfo() {
  var arr = statComputer.rangeArray(session.breathTypeValues);
  var nm=0;
  var ns=0;
  var ne=0;
  for (let i=0; i<arr.length; i++) {
    value = arr[i].value;
    if (value==SPONTANEOUS_BREATH) ns++;
    else if (value==MANDATORY_BREATH) nm++;
    else if (value==ERROR_BREATH) ne++;
  }
  el = document.getElementById("numBreaths");
  el.innerHTML = replaceDummyValue(nm+ns+ne);
  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(nm);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(ns);
  el = document.getElementById("numMaintenance");
  el.innerHTML = replaceDummyValue(ne);


  arr = statComputer.filterValues(session.missingBreathWindows);
  var n = 0;
  for (let i=0; i<arr.length; i++) {
    obj = arr[i];
    n += (obj.endValue-obj.startValue);
  }
  el = document.getElementById("numMissingBreaths");
  el.innerHTML = replaceDummyValue(n);
}

function displayMinMaxAvg() {
  fillMinMaxAvgRow("peakMin","peakMax","peakAvg",session.peakValues);
  fillMinMaxAvgRow("platMin","platMax","platAvg",session.platValues);
  fillMinMaxAvgRow("mpeepMin","mpeepMax","mpeepAvg",session.mpeepValues);
  fillMinMaxAvgRow("vtMin","vtMax","vtAvg",session.vtdelValues);
  fillMinMaxAvgRow("mvMin","mvMax","mvAvg",session.mvdelValues);
  fillMinMaxAvgRow("mbpmMin","mbpmMax","mbpmAvg",session.mbpmValues);
  fillMinMaxAvgRow("sbpmMin","sbpmMax","sbpmAvg",session.sbpmValues);
  fillMinMaxAvgRow("fiO2Min","fiO2Max","fiO2Avg",session.fiO2Values);
  fillMinMaxAvgRow("scMin","scMax","scAvg",session.scompValues);
  fillMinMaxAvgRow("dcMin","dcMax","dcAvg",session.dcompValues);
  fillMinMaxAvgRow("tempMin","tempMax","tempAvg",session.tempValues);
}

function displayParamUsage() {
  var obj = extractUsedParamsFromCombos();

  el = document.getElementById("mode");
  el.innerHTML = formUsedParamString(obj,"mode");
  el = document.getElementById("vt");
  el.innerHTML = formUsedParamString(obj,"vt");
  el = document.getElementById("rr");
  el.innerHTML = formUsedParamString(obj,"rr");
  el = document.getElementById("ie");
  el.innerHTML = formUsedParamString(obj,"ie");
  el = document.getElementById("ipeep");
  el.innerHTML = formUsedParamString(obj,"ipeep");
  el = document.getElementById("pmax");
  el.innerHTML = formUsedParamString(obj,"pmax");
  el = document.getElementById("ps");
  el.innerHTML = formUsedParamString(obj,"ps");
  el = document.getElementById("tps");
  el.innerHTML = formUsedParamString(obj,"tps");
  el = document.getElementById("fiO2");
  el.innerHTML = formUsedParamString(obj,"fiO2");
}

function displayPatientInfo() {
  el = document.getElementById("pName");
  if (session.patientName) {
    el.innerHTML = "Patient Name: " + session.patientName;
  }
  else {
    el.innerHTML = "Patient Name: UNKNOWN";
  }
  el = document.getElementById("pInfo");
  if (session.patientInfo) {
    el.innerHTML = "Patient Info: " + session.patientInfo;
  }
  else {
    el.innerHTML = "Patient Info: UNKNOWN";
  }
}

function displayAlertsInfo() {

  var arr = statComputer.filterValues(session.notificationValues);
  var n = 0;
  for (i=0; i<arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numNotifications");
  el.innerHTML = replaceDummyValue(n);

  arr = statComputer.filterValues(session.warningValues);
  n = 0;
  for (i=0; i<arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(n);

  arr = statComputer.filterValues(session.errorValues);
  n = 0;
  for (i=0; i<arr.length; i++) {
    if (arr[i].value) n++;
  }
  el = document.getElementById("numErrors");
  el.innerHTML = replaceDummyValue(n);
}

function displayStats() {
  //console.log("displayStats");
  if (!app.globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  if (!app.tablesConstructed) {
    //console.log("Constructing Tables");
    constructStatMinMaxTable();
    constructStatParamTable();
    constructStatMiscTable();
  }
  app.tablesConstructed = true;
  statComputer = new StatComputer(session.breathTimes,app.reportsXrange);

  displayMinMaxAvg();
  displayParamUsage();
  displayBreathTypeInfo();
  displayUsedCombos();
  displayPatientInfo();
  displayAlertsInfo();

  el = document.getElementById("altitude");
  el.innerHTML = "System Deployment Altitude: " + replaceDummyValue(session.altitude);
}

function initStats() {
  //console.log("initStats");
  app.tablesConstructed = false;
  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMinMaxTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsParamTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMiscTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
}


