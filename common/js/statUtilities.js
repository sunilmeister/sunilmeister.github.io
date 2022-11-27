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
  for (i = 0; i < usedParamCombos.length; i++) {
    combo = usedParamCombos[i];
    if (combo.dashboardBreathNum == 0) continue;
    row = table.insertRow();
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.mode);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.vt);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.rr);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.ie);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.ipeep);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.pmax);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.ps);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.tps);
    cell = row.insertCell();
    cell.innerHTML = checkForUndefined(combo.fiO2);
    cell = row.insertCell();
    cell.innerHTML = combo.dashboardBreathNum;
    cell = row.insertCell();
    dstr = dateToStr(combo.start);
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
  miscTableRow(table, "Number of Mandatory Breaths", "numMandatory");
  miscTableRow(table, "Number of Spontaneous Breaths", "numSpontaneous");
  miscTableRow(table, "Number of Maintenance Breaths", "numMaintenance");
  miscTableRow(table, "Number of Missing Breaths (Wi-Fi Disconnect)", "numMissingBreaths");
  miscTableRow(table, "Number of entries into INITIAL state", "numInitialEntry");
  miscTableRow(table, "Number of entries into STANDBY state", "numStandbyEntry");
  miscTableRow(table, "Number of entries into ACTIVE state", "numActiveEntry");
  miscTableRow(table, "Number of entries into ERROR state", "numErrorEntry");
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
  statComputer.compute(transitions);
  document.getElementById(minDivId).innerHTML = replaceDummyValue(statComputer.computedMin);
  document.getElementById(maxDivId).innerHTML = replaceDummyValue(statComputer.computedMax);
  document.getElementById(avgDivId).innerHTML = replaceDummyValue(statComputer.computedAvg);
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
  reportsXrange.doFull = true;
  statComputer = new StatComputer(breathTimes,reportsXrange);

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

  el = document.getElementById("mode");
  el.innerHTML = replaceDummyValue(modes);
  el = document.getElementById("vt");
  el.innerHTML = replaceDummyValue(vts);
  el = document.getElementById("rr");
  el.innerHTML = replaceDummyValue(rrs);
  el = document.getElementById("ie");
  el.innerHTML = replaceDummyValue(ies);
  el = document.getElementById("ipeeps");
  el.innerHTML = replaceDummyValue(ipeeps);
  el = document.getElementById("pmax");
  el.innerHTML = replaceDummyValue(pmaxs);
  el = document.getElementById("ps");
  el.innerHTML = replaceDummyValue(pss);
  el = document.getElementById("tps");
  el.innerHTML = replaceDummyValue(tpss);
  el = document.getElementById("fiO2");
  el.innerHTML = replaceDummyValue(fiO2s);
  el = document.getElementById("pName");
  if (patientName) {
    el.innerHTML = "Patient Name: " + replaceDummyValue(patientName);
  }
  else {
    el.innerHTML = "Patient Name: UNKNOWN";
  }
  el = document.getElementById("pInfo");
  if (patientInfo) {
    el.innerHTML = "Patient Info: " + replaceDummyValue(patientInfo);
  }
  else {
    el.innerHTML = "Patient Info: UNKNOWN";
  }
  el = document.getElementById("altitude");
  el.innerHTML = "System Deployment Altitude: " + replaceDummyValue(altitude);
  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(numMandatory);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(numSpontaneous);
  el = document.getElementById("numMaintenance");
  el.innerHTML = replaceDummyValue(numMaintenance);
  el = document.getElementById("numMissingBreaths");
  el.innerHTML = replaceDummyValue(numMissingBreaths);
  el = document.getElementById("numInitialEntry");
  el.innerHTML = replaceDummyValue(numInitialEntry);
  el = document.getElementById("numStandbyEntry");
  el.innerHTML = replaceDummyValue(numStandbyEntry);
  el = document.getElementById("numActiveEntry");
  el.innerHTML = replaceDummyValue(numActiveEntry);
  el = document.getElementById("numErrorEntry");
  el.innerHTML = replaceDummyValue(numErrorEntry);
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(warningNum);
  el = document.getElementById("numErrors");
  el.innerHTML = replaceDummyValue(errorNum);
  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  displayUsedCombos();
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

