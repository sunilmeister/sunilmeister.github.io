// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var tablesConstructed = false;

function checkForUndefined(val) {
  if (typeof val == 'undefined') return "?";
  return val;
}

function displayUsedCombos() {
  var table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  
  var arr = statComputer.filterTransitions(usedParamCombos);
  for (i = 0; i < usedParamCombos.length; i++) {
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
    dstr = dateToStr(combo.time);
    dstr = dstr.replace("]", "] ");
    cell.innerHTML = dstr;
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
  paramTableRow(table, "PEEP Pressure", "cmH20", "ipeeps");
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
  miscTableRow(table, "Number of NOTIFICATIONSs", "numNotifications");
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

function formUniqueValueString(inputarray) {
  arr = statComputer.filterTransitions(inputarray);
  if (arr.length==0) return "----";
  var obj = {};
  for (let i=0; i<arr.length; i++) {
    obj[arr[i].value] = 1;
  }

  str = "";
  first = true;
  for (k in obj) {
    if (first) {
      str += String(k);
      first = false;
    } else {
      str += "," + String(k);
    }
  }
  return str;
}

function displayBreathTypeInfo() {
  var arr = statComputer.rangeArray(breathTypeValues);
  var nm=0;
  var ns=0;
  var ne=0;
  for (let i=0; i<arr.length; i++) {
    value = arr[i].value;
    if (value==0) ns++;
    else if (value==1) nm++;
    else ne++;
  }
  el = document.getElementById("numBreaths");
  el.innerHTML = replaceDummyValue(arr.length);
  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(nm);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(ns);
  el = document.getElementById("numMaintenance");
  el.innerHTML = replaceDummyValue(ne);


  arr = statComputer.filterTransitions(missingBreathWindows);
  var n = 0;
  for (let i=0; i<arr.length; i++) {
    obj = arr[i];
    n += ((obj.endValue-obj.startValue)+1);
  }
  el = document.getElementById("numMissingBreaths");
  el.innerHTML = replaceDummyValue(n);
}

function displayMinMaxAvg() {
  fillMinMaxAvgRow("peakMin","peakMax","peakAvg",peakValues);
  fillMinMaxAvgRow("platMin","platMax","platAvg",platValues);
  fillMinMaxAvgRow("mpeepMin","mpeepMax","mpeepAvg",mpeepValues);
  fillMinMaxAvgRow("vtMin","vtMax","vtAvg",vtdelValues);
  fillMinMaxAvgRow("mvMin","mvMax","mvAvg",mvdelValues);
  fillMinMaxAvgRow("mbpmMin","mbpmMax","mbpmAvg",mbpmValues);
  fillMinMaxAvgRow("sbpmMin","sbpmMax","sbpmAvg",sbpmValues);
  fillMinMaxAvgRow("fiO2Min","fiO2Max","fiO2Avg",fiO2Values);
  fillMinMaxAvgRow("scMin","scMax","scAvg",scompValues);
  fillMinMaxAvgRow("dcMin","dcMax","dcAvg",dcompValues);
  fillMinMaxAvgRow("tempMin","tempMax","tempAvg",tempValues);
}

function displayParamUsage() {
  el = document.getElementById("mode");
  el.innerHTML = formUniqueValueString(modes);
  el = document.getElementById("vt");
  el.innerHTML = formUniqueValueString(vts);
  el = document.getElementById("rr");
  el.innerHTML = formUniqueValueString(rrs);
  el = document.getElementById("ie");
  el.innerHTML = formUniqueValueString(ies);
  el = document.getElementById("ipeeps");
  el.innerHTML = formUniqueValueString(ipeeps);
  el = document.getElementById("pmax");
  el.innerHTML = formUniqueValueString(pmaxs);
  el = document.getElementById("ps");
  el.innerHTML = formUniqueValueString(pss);
  el = document.getElementById("tps");
  el.innerHTML = formUniqueValueString(tpss);
  el = document.getElementById("fiO2");
  el.innerHTML = formUniqueValueString(fiO2s);
}

function displayPatientInfo() {
  el = document.getElementById("pName");
  if (patientName) {
    el.innerHTML = "Patient Name: " + patientName;
  }
  else {
    el.innerHTML = "Patient Name: UNKNOWN";
  }
  el = document.getElementById("pInfo");
  if (patientInfo) {
    el.innerHTML = "Patient Info: " + patientInfo;
  }
  else {
    el.innerHTML = "Patient Info: UNKNOWN";
  }
}

function displayStats() {
  //console.log("displayStats");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  if (!tablesConstructed) {
    //console.log("Constructing Tables");
    constructStatMinMaxTable();
    constructStatParamTable();
    constructStatMiscTable();
  }
  tablesConstructed = true;
  statComputer = new StatComputer(breathTimes,reportsXrange);

  displayMinMaxAvg();
  displayParamUsage();
  displayBreathTypeInfo();
  displayUsedCombos();
  displayPatientInfo();

  el = document.getElementById("altitude");
  el.innerHTML = "System Deployment Altitude: " + replaceDummyValue(altitude);

  el = document.getElementById("numNotifications");
  el.innerHTML = replaceDummyValue(warningNum);
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(warningNum);
  el = document.getElementById("numErrors");
  el.innerHTML = replaceDummyValue(errorNum);
}

function initStats() {
  //console.log("initStats");
  tablesConstructed = false;
  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMinMaxTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsParamTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  table = document.getElementById("statsMiscTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
}


