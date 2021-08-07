const ARROW = "\\u27AD";
const maxDummyValue = -999999 ;
const minDummyValue = 999999 ;
var prevBreathMandatory = true;
var currBreathMandatory = true;

var numInitialEntry, numStandbyEntry, numRunningEntry, numErrorEntry;
var numWarnings;

var patientName, patientInfo;
var numMandatory, numSpontaneous;
var altitude = "";

var modes = [];
var vts = [];
var rrs = [];
var ies = [];
var peeps = [];
var pmaxs = [];
var pss = [];
var tpss = [];

var minPeak, maxPeak;
var minPlat, maxPlat;
var minPeep, maxPeep;
var minVt, maxVt;
var minMv, maxMv;
var minMbpm, maxMbpm;
var minSbpm, maxSbpm;
var minScomp, maxScomp;
var minDcomp, maxDcomp;
var minTemp, maxTemp;

var initialState = false;
var standbyState = false;
var runningState = false;
var errorState = false;
var attentionState = false;

/////////////////////////////////////////////////////////////////
// Changing parameters have an arrow embedded in the string
/////////////////////////////////////////////////////////////////
function validParamValue(str) {
  if (str=="--") return false;
  ix = str.search(ARROW);
  return (ix == -1);
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
  minMaxTableRow(table,"PEEP Pressure","cmH20","peepMin","peepMax");

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

  paramTableRow(table,"Ventilation Mode","","mode");
  paramTableRow(table,"Tidal Volume","ml","vt");
  paramTableRow(table,"Respiration Rate","bpm","rr");
  paramTableRow(table,"I:E Ratio","","ie");
  paramTableRow(table,"PEEP Pressure","cm H20","peep");
  paramTableRow(table,"Maximum Pressure","cm H20","pmax");
  paramTableRow(table,"Support Pressure","cm H20","ps");
  paramTableRow(table,"Support Pressure Termination","","tps");
}

function constructStatMiscTable() {
  var table = document.getElementById("statsMiscTable");

  miscTableRow(table,"Number of Mandatory Breaths","numMandatory");
  miscTableRow(table,"Number of Spontaneous Breaths","numSpontaneous");
  miscTableRow(table,"Number of entries into INITIAL state","numInitialEntry");
  miscTableRow(table,"Number of entries into STANDBY state","numStandbyEntry");
  miscTableRow(table,"Number of entries into RUNNING state","numRunningEntry");
  miscTableRow(table,"Number of entries into ERROR state","numErrorEntry");
  miscTableRow(table,"Number of WARNINGs","numWarnings");
}

function replaceDummyValue(value) {
  if (value == minDummyValue) str = "--";
  else if (value == maxDummyValue) str = "--";
  else str = String(value);
  return str;
}

function displayStats() {
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
  el = document.getElementById("peepMin");
  el.innerHTML = replaceDummyValue(minPeep);
  el = document.getElementById("peepMax");
  el.innerHTML = replaceDummyValue(maxPeep);
  el = document.getElementById("vtMin");
  el.innerHTML = replaceDummyValue(minVt);
  el = document.getElementById("vtMax");
  el.innerHTML = replaceDummyValue(maxVt);
  el = document.getElementById("mvMin");
  el.innerHTML = replaceDummyValue(minMv);
  el = document.getElementById("mvMax");
  el.innerHTML = replaceDummyValue(maxMv);
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
  el = document.getElementById("peep");
  el.innerHTML=replaceDummyValue(peeps);
  el = document.getElementById("pmax");
  el.innerHTML=replaceDummyValue(pmaxs);
  el = document.getElementById("ps");
  el.innerHTML=replaceDummyValue(pss);
  el = document.getElementById("tps");
  el.innerHTML=replaceDummyValue(tpss);

  if (patientName) {
    el = document.getElementById("pName");
    el.innerHTML = "Patient Name: " + replaceDummyValue(patientName);
  }
  if (patientInfo) {
    el = document.getElementById("pInfo");
    el.innerHTML = "Patient Info: " + replaceDummyValue(patientInfo) +"yrs";
  }
  el = document.getElementById("altitude");
  el.innerHTML = "System Deployment Altitude: " + replaceDummyValue(altitude);

  el = document.getElementById("numMandatory");
  el.innerHTML = replaceDummyValue(numMandatory);
  el = document.getElementById("numSpontaneous");
  el.innerHTML = replaceDummyValue(numSpontaneous);

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
}

function gatherStats(jsonData) {
  for (var key in jsonData) {
    if (key=='content') {
      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (ckey=="L1") {
        } else if (ckey=="L2") {
        } else if (ckey=="L3") {
        } else if (ckey=="L4") {
        } else if (ckey=="INITIAL") {
	  if ((value==1) && !initialState) numInitialEntry++ ;
	  initialState = (value==1);
        } else if (ckey=="STANDBY") {
	  if ((value==1) && !standbyState) numStandbyEntry++ ;
	  standbyState = (value==1);
        } else if (ckey=="RUNNING") {
	  if ((value==1) && !runningState) numRunningEntry++ ;
	  runningState = (value==1);
        } else if (ckey=="ERROR") {
	  if ((value==1) && !errorState) numErrorEntry++ ;
	  errorState = (value==1);
        } else if (ckey=="MANDATORY") {
	  prevBreathMandatory = (value==1);
        } else if (ckey=="SPONTANEOUS") {
	  prevBreathMandatory = (value==1);
        } else if (ckey=="BTOG") {
	  if (prevBreathMandatory) {
	    numSpontaneous++ ;
	  } else {
	    numMandatory++ ;
	  }
        } else if (ckey=="ATTENTION") {
	  if (!attentionState && (value==1)) numWarnings++;
	  attentionState = (value == 1);
        } else if (ckey=="MODE") {
	  if (validParamValue(value)) {
	    if ((modes.length==0) || (modes.indexOf(value) == -1)) {
	      modes.push(value);
	    }
	  }
        } else if (ckey=="VT") {
	  if (validParamValue(value)) {
	    if ((vts.length==0) || (vts.indexOf(value) == -1)) {
	      vts.push(value);
	    }
	  }
        } else if (ckey=="RR") {
	  if (validParamValue(value)) {
	    if ((rrs.length==0) || (rrs.indexOf(value) == -1)) {
	      rrs.push(value);
	    }
	  }
        } else if (ckey=="EI") {
	  if (validParamValue(value)) {
	    if ((ies.length==0) || (ies.indexOf(value) == -1)) {
	      ies.push(value);
	    }
	  }
        } else if (ckey=="IPEEP") {
	  if (validParamValue(value)) {
	    if ((peeps.length==0) || (peeps.indexOf(value) == -1)) {
	      peeps.push(value);
	    }
	  }
        } else if (ckey=="PMAX") {
	  if (validParamValue(value)) {
	    if ((pmaxs.length==0) || (pmaxs.indexOf(value) == -1)) {
	      pmaxs.push(value);
	    }
	  }
        } else if (ckey=="PS") {
	  if (validParamValue(value)) {
	    if ((pss.length==0) || (pss.indexOf(value) == -1)) {
	      pss.push(value);
	    }
	  }
        } else if (ckey=="TPS") {
	  if (validParamValue(value)) {
	    if ((tpss.length==0) || (tpss.indexOf(value) == -1)) {
	      tpss.push(value);
	    }
	  }
        } else if (ckey=="MBPM") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxMbpm < value) {
	      maxMbpm = value;
	    }
	    if (minMbpm > value) {
	      minMbpm = value;
	    }
	  }
        } else if (ckey=="SBPM") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxSbpm < value) {
	      maxSbpm = value;
	    }
	    if (minSbpm > value) {
	      minSbpm = value;
	    }
	  }
        } else if (ckey=="STATIC") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxScomp < value) {
	      maxScomp = value;
	    }
	    if (minScomp > value) {
	      minScomp = value;
	    }
	  }
        } else if (ckey=="DYNAMIC") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxDcomp < value) {
	      maxDcomp = value;
	    }
	    if (minDcomp > value) {
	      minDcomp = value;
	    }
	  }
        } else if (ckey=="VTDEL") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxVt < value) {
	      maxVt = value;
	    }
	    if (minVt > value) {
	      minVt = value;
	    }
	  }
        } else if (ckey=="MVDEL") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxMv < value) {
	      maxMv = value;
	    }
	    if (minMv > value) {
	      minMv = value;
	    }
	  }
        } else if (ckey=="PIP") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxPeak < value) {
	      maxPeak = value;
	    }
	    if (minPeak > value) {
	      minPeak = value;
	    }
	  }
        } else if (ckey=="PLAT") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxPlat < value) {
	      maxPlat = value;
	    }
	    if (minPlat > value) {
	      minPlat = value;
	    }
	  }
        } else if (ckey=="MPEEP") {
	  if ((runningState || errorState) && (value != "--")) {
	    if (maxPeep < value) {
	      maxPeep = value;
	    }
	    if (minPeep > value) {
	      minPeep = value;
	    }
	  }
        } else if (ckey=="TEMP") {
	  if (maxTemp < value) {
	    maxTemp = value;
	  }
	  if (minTemp > value) {
	    minTemp = value;
	  }
        } else if (ckey=="ALT") {
	    altitude = value + " ft(m)";
        } else if (ckey=="PNAME") {
	    patientName = value;
        } else if (ckey=="PMISC") {
	    patientInfo = value;
        }
      }
    }
  }
}

function statsProcessJsonRecord(key, lastRecord) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    dbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function(event) {
      var jsonData = keyReq.result;
      gatherStats(jsonData);
      if (lastRecord) displayStats();
    }
  }
}

function gatherAndDisplayStats() {
  if (allDbKeys.length==0) {
    alert("Selected Session has no data");
    return;
  }

  for (i=0; i<allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (!keyWithinAnalysisRange(key)) continue;
    lastRecord = (i==(allDbKeys.length-1));
    statsProcessJsonRecord(key, lastRecord);
  }
}

function initStats() {
  numInitialEntry = 0;
  numStandbyEntry = 0;
  numRunningEntry = 0;
  numErrorEntry = 0;
  numWarnings = 0;

  patientName = ""
  patientInfo = ""
  numMandatory = 0;
  numSpontaneous = 0;
  altitude = "";
  
  modes = [];
  vts = [];
  rrs = [];
  ies = [];
  peeps = [];
  pmaxs = [];
  pss = [];
  tpss = [];
  
  minPeak = minDummyValue;
  maxPeak = maxDummyValue;
  minPlat = minDummyValue;
  maxPlat = maxDummyValue;
  minPeep = minDummyValue;
  maxPeep = maxDummyValue;
  minVt = minDummyValue;
  maxVt = maxDummyValue;
  minMv = minDummyValue;
  maxMv = maxDummyValue;
  minMbpm = minDummyValue;
  maxMbpm = maxDummyValue;
  minSbpm = minDummyValue;
  maxSbpm = maxDummyValue;
  minScomp = minDummyValue;
  maxScomp = maxDummyValue;
  minDcomp = minDummyValue;
  maxDcomp = maxDummyValue;
  minTemp = minDummyValue;
  maxTemp = maxDummyValue;
}

var tablesContructed = false;;
function collectStats() {
  if (!tablesContructed) {
    constructStatMinMaxTable();
    constructStatParamTable();
    constructStatMiscTable();
    tablesContructed = true;
  }

  gatherAndDisplayStats();
  displayStats();
}
