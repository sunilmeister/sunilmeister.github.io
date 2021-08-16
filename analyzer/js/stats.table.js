// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var tablesConstructed = false;

function displayUsedCombos() {
  var table = document.getElementById("statsComboTable");

  for (i=0; i<usedParamCombos.length; i++) {

    combo = usedParamCombos[i];
    if (combo.numBreaths==0) continue;
    row = table.insertRow();

    cell = row.insertCell();
    cell.innerHTML = combo.mode;

    cell = row.insertCell();
    cell.innerHTML = combo.vt;

    cell = row.insertCell();
    cell.innerHTML = combo.rr;

    cell = row.insertCell();
    cell.innerHTML = combo.ie;

    cell = row.insertCell();
    cell.innerHTML = combo.ipeep;

    cell = row.insertCell();
    cell.innerHTML = combo.pmax;

    cell = row.insertCell();
    cell.innerHTML = combo.ps;

    cell = row.insertCell();
    cell.innerHTML = combo.tps;

    cell = row.insertCell();
    cell.innerHTML = combo.numBreaths;

    cell = row.insertCell();
    cell.innerHTML = dateToStr(combo.start);
  }
}

/////////////////////////////////////////////////////////////////
// Construct the tables required for reporting statistics
/////////////////////////////////////////////////////////////////
function miscTableRow(table,field,value) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function paramTableRow(table,field,units,value) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function minMaxTableRow(table,field,units,minDiv,maxDiv) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + minDiv + '>----</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + maxDiv + '>----</div>';
}

function constructStatMinMaxTable() {
  var table = document.getElementById("statsMinMaxTable");

  minMaxTableRow(table,"Peak Pressure","cmH20","peakMin","peakMax");
  minMaxTableRow(table,"Plateau Pressure","cmH20","platMin","platMax");
  minMaxTableRow(table,"PEEP Pressure","cmH20","mpeepMin","mpeepMax");

  minMaxTableRow(table,"Tidal Volume Delivered","ml","vtMin","vtMax");
  minMaxTableRow(table,"Minute Volume Delivered","litres / min","mvMin","mvMax");

  minMaxTableRow(table,"Mandatory BPM","bpm","mbpmMin","mbpmMax");
  minMaxTableRow(table,"Spontaneous BPM","bpm","sbpmMin","sbpmMax");

  minMaxTableRow(table,"Instantaneous Static Compliance","ml / cmH20","scMin","scMax");
  minMaxTableRow(table,"Instantaneous Dynamic Compliance","ml / cmH20","dcMin","dcMax");

  minMaxTableRow(table,"System Temperature","deg C","tempMin","tempMax");
}

function constructStatParamTable() {
  var table = document.getElementById("statsParamTable");

  paramTableRow(table,"Ventilation Mode","mode","mode");
  paramTableRow(table,"Tidal Volume","ml","vt");
  paramTableRow(table,"Respiration Rate","bpm","rr");
  paramTableRow(table,"I:E Ratio","ratio","ie");
  paramTableRow(table,"PEEP Pressure","cmH20","ipeeps");
  paramTableRow(table,"Maximum Pressure","cmH20","pmax");
  paramTableRow(table,"Support Pressure","cmH20","ps");
  paramTableRow(table,"Support Pressure Termination","%flow,secs","tps");
}

function constructStatMiscTable() {
  var table = document.getElementById("statsMiscTable");

  miscTableRow(table,"Number of Mandatory Breaths","numMandatory");
  miscTableRow(table,"Number of Spontaneous Breaths","numSpontaneous");
  miscTableRow(table,"Number of Maintenance Breaths","numMaintenance");
  miscTableRow(table,"Number of entries into INITIAL state","numInitialEntry");
  miscTableRow(table,"Number of entries into STANDBY state","numStandbyEntry");
  miscTableRow(table,"Number of entries into RUNNING state","numRunningEntry");
  miscTableRow(table,"Number of entries into ERROR state","numErrorEntry");
  miscTableRow(table,"Number of WARNINGs","numWarnings");
  miscTableRow(table,"Number of ERRORs","numErrors");
}

function replaceDummyValue(value) {
  if (value == minDummyValue) str = "--";
  else if (value == maxDummyValue) str = "--";
  else str = String(value);
  return str;
}

function displayStats() {
  console.log("displayStats");
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

  numWarnings = warningMsgs.length;
  numErrors = errorMsgs.length;

  el = document.getElementById("peakMin");
  el.innerHTML = replaceDummyValue(minPeak);
  el = document.getElementById("peakMax");
  el.innerHTML = replaceDummyValue(maxPeak);
  el = document.getElementById("platMin");
  if (minPeak==0) {
    el.innerHTML = "--" ;
  } else {
    el.innerHTML = replaceDummyValue(minPlat);
  }
  el = document.getElementById("platMax");
  if (minPeak==0) {
    el.innerHTML = "--" ;
  } else {
    el.innerHTML = replaceDummyValue(maxPlat);
  }
  el = document.getElementById("mpeepMin");
  el.innerHTML = replaceDummyValue(minPeep);
  el = document.getElementById("mpeepMax");
  el.innerHTML = replaceDummyValue(maxPeep);
  el = document.getElementById("vtMin");
  el.innerHTML = replaceDummyValue(minVtdel);
  el = document.getElementById("vtMax");
  el.innerHTML = replaceDummyValue(maxVtdel);
  el = document.getElementById("mvMin");
  el.innerHTML = replaceDummyValue(minMvdel);
  el = document.getElementById("mvMax");
  el.innerHTML = replaceDummyValue(maxMvdel);
  el = document.getElementById("mbpmMin");
  el.innerHTML = replaceDummyValue(minMbpm);
  el = document.getElementById("mbpmMax");
  el.innerHTML = replaceDummyValue(maxMbpm);
  el = document.getElementById("sbpmMin");
  el.innerHTML = replaceDummyValue(minSbpm);
  el = document.getElementById("sbpmMax");
  el.innerHTML = replaceDummyValue(maxSbpm);
  el = document.getElementById("scMin");
  el.innerHTML = replaceDummyValue(minScomp);
  el = document.getElementById("scMax");
  el.innerHTML = replaceDummyValue(maxScomp);
  el = document.getElementById("dcMin");
  el.innerHTML = replaceDummyValue(minDcomp);
  el = document.getElementById("dcMax");
  el.innerHTML = replaceDummyValue(maxDcomp);
  el = document.getElementById("tempMin");
  el.innerHTML = replaceDummyValue(minTemp);
  el = document.getElementById("tempMax");
  el.innerHTML = replaceDummyValue(maxTemp);
  
  el = document.getElementById("mode");
  el.innerHTML=replaceDummyValue(modes);
  el = document.getElementById("vt");
  el.innerHTML=replaceDummyValue(vts);
  el = document.getElementById("rr");
  el.innerHTML=replaceDummyValue(rrs);
  el = document.getElementById("ie");
  el.innerHTML=replaceDummyValue(ies);
  el = document.getElementById("ipeeps");
  el.innerHTML=replaceDummyValue(ipeeps);
  el = document.getElementById("pmax");
  el.innerHTML=replaceDummyValue(pmaxs);
  el = document.getElementById("ps");
  el.innerHTML=replaceDummyValue(pss);
  el = document.getElementById("tps");
  el.innerHTML=replaceDummyValue(tpss);

  el = document.getElementById("pName");
  if (patientName) {
    el.innerHTML = "Patient Name: " + replaceDummyValue(patientName);
  } else {
    el.innerHTML = "Patient Name: UNKNOWN";
  }
  el = document.getElementById("pInfo");
  if (patientInfo) {
    el.innerHTML = "Patient Info: " + replaceDummyValue(patientInfo);
  } else {
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

  el = document.getElementById("numInitialEntry");
  el.innerHTML = replaceDummyValue(numInitialEntry);
  el = document.getElementById("numStandbyEntry");
  el.innerHTML = replaceDummyValue(numStandbyEntry);
  el = document.getElementById("numRunningEntry");
  el.innerHTML = replaceDummyValue(numRunningEntry);
  el = document.getElementById("numErrorEntry");
  el.innerHTML = replaceDummyValue(numErrorEntry);
  el = document.getElementById("numWarnings");
  el.innerHTML = replaceDummyValue(numWarnings);
  el = document.getElementById("numErrors");
  el.innerHTML = replaceDummyValue(numErrors);

  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
  displayUsedCombos();
}

function initStats() {
  console.log("initStats");
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

