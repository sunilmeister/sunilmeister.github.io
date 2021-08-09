const ARROW = "\\u27AD";
const maxDummyValue = -999999 ;
const minDummyValue = 999999 ;
var prevBreathMandatory = true;
var currBreathMandatory = true;

var numInitialEntry, numStandbyEntry, numRunningEntry, numErrorEntry;
var numWarnings, numErrors;

var patientName, patientInfo;
var numMandatory, numSpontaneous, numMaintenance;
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

// collect error and warning messages
var expectWarningMsg = false;
var expectErrorMsg = false;
var l1 = "";
var l2 = "";
var l3 = "";
var l4 = "";
var errorMsgs = [];
var warningMsgs = [];

/////////////////////////////////////////////////////////////////
// Miscellaneous
/////////////////////////////////////////////////////////////////
// Changing parameters have an arrow embedded in the string
function validParamValue(str) {
  if (str=="--") return false;
  ix = String(str).search(ARROW);
  return (ix == -1);
}

/////////////////////////////////////////////////////////////////
// Keep track of all parameter combinations used
/////////////////////////////////////////////////////////////////
var prevParamCombo = {
  "mode" : "--",
  "vt" : "--",
  "rr" : "--",
  "ie" : "--",
  "peep" : "--",
  "pmax" : "--",
  "ps" : "--",
  "tps" : "--",
  "numBreaths" : 0
};


var currParamCombo = {
  "mode" : "--",
  "vt" : "--",
  "rr" : "--",
  "ie" : "--",
  "peep" : "--",
  "pmax" : "--",
  "ps" : "--",
  "tps" : "--",
  "numBreaths" : 0
};

var usedParamCombos = [];

function equalParamCombos(curr, prev) {
  if (
    (curr.mode==prev.mode) &&
    (curr.vt==prev.vt) &&
    (curr.rr==prev.rr) &&
    (curr.ie==prev.ie) &&
    (curr.peep==prev.peep) &&
    (curr.pmax==prev.pmax) &&
    (curr.ps==prev.ps) &&
    (curr.tps==prev.tps)
  ) {
    return true;
  }

  return false;
}

function insertUsedParamCombos(combo) {
  /* insert the sequence as it was found
  for (i=0; i<usedParamCombos.length; i++) {
    c = usedParamCombos[i];
    if (equalParamCombos(combo,c)) return;
  }
  */
  usedParamCombos.push(createNewInstance(combo));
}

function displayUsedCombos() {
  var table = document.getElementById("statsComboTable");

  for (i=0; i<usedParamCombos.length; i++) {
    combo = usedParamCombos[i];
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
    cell.innerHTML = combo.peep;

    cell = row.insertCell();
    cell.innerHTML = combo.pmax;

    cell = row.insertCell();
    cell.innerHTML = combo.ps;

    cell = row.insertCell();
    cell.innerHTML = combo.tps;

    cell = row.insertCell();
    cell.innerHTML = combo.numBreaths;
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

  paramTableRow(table,"Ventilation Mode","mode","mode");
  paramTableRow(table,"Tidal Volume","ml","vt");
  paramTableRow(table,"Respiration Rate","bpm","rr");
  paramTableRow(table,"I:E Ratio","ratio","ie");
  paramTableRow(table,"PEEP Pressure","cmH20","peep");
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

  el = document.getElementById("pName");
  if (patientName) {
    el.innerHTML = "Patient Name: " + replaceDummyValue(patientName);
  } else {
    el.innerHTML = "Patient Name: UNKNOWN";
  }
  el = document.getElementById("pInfo");
  if (patientInfo) {
    el.innerHTML = "Patient Info: " + replaceDummyValue(patientInfo) +"yrs";
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

  displayUsedCombos();
}

function gatherStats(jsonData) {
  for (var key in jsonData) {
    if (key=='content') {
      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (l1 && l2 && l3 && l4) {
	  if (expectErrorMsg || expectWarningMsg) {
	    var msg = {
	      'created' : jsonData.created,
	      'L1' : l1,
	      'L2' : l2,
	      'L3' : l3,
	      'L4' : l4
	    };
	    console.log("Storing");
	    console.log(msg);

	    if (expectWarningMsg) {
	      warningMsgs.push(createNewInstance(msg));
	    } else {
	      errorngMsgs.push(createNewInstance(msg));
	    }
	    expectWarningMsg = false;
	    expectErrorMsg = false;
	  }
	}

        if (ckey=="L1") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l1) l1 = jsonData.content['L1'];
	  }
        } else if (ckey=="L2") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l2) l2 = jsonData.content['L2'];
	  }
        } else if (ckey=="L3") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l3) l3 = jsonData.content['L3'];
	  }
        } else if (ckey=="L4") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l4) l4 = jsonData.content['L4'];
	  }
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

	  var firstBreath = false;
	  if ((numMandatory==0) && (numSpontaneous==0)) firstBreath = true;
	  else firstBreath = false;

	  if (prevBreathMandatory) {
	    numSpontaneous++ ;
	  } else {
	    numMandatory++ ;
	  }
	  if (errorState) numMaintenance++;

	  if (!firstBreath && !equalParamCombos(currParamCombo, prevParamCombo)) {
	    insertUsedParamCombos(currParamCombo);
	    prevParamCombo = createNewInstance(currParamCombo);
            currParamCombo.numBreaths=0;
	  }
          currParamCombo.numBreaths++;

        } else if (ckey=="ATTENTION") {
	  attentionState = (value == 1);
        } else if (ckey=="MODE") {
	  if (modeValid(value)) {
	    currParamCombo.mode = value;
	    if ((modes.length==0) || (modes.indexOf(value) == -1)) {
	      modes.push(value);
	    }
	  }
        } else if (ckey=="VT") {
	  if (vtValid(value)) {
	    currParamCombo.vt = value;
	    if ((vts.length==0) || (vts.indexOf(value) == -1)) {
	      vts.push(value);
	    }
	  }
        } else if (ckey=="RR") {
	  if (rrValid(value)) {
	    currParamCombo.rr = value;
	    if ((rrs.length==0) || (rrs.indexOf(value) == -1)) {
	      rrs.push(value);
	    }
	  }
        } else if (ckey=="EI") {
	  if (ieValid(value)) {
	    currParamCombo.ie = value;
	    if ((ies.length==0) || (ies.indexOf(value) == -1)) {
	      ies.push(value);
	    }
	  }
        } else if (ckey=="IPEEP") {
	  if (peepValid(value)) {
	    currParamCombo.peep = value;
	    if ((peeps.length==0) || (peeps.indexOf(value) == -1)) {
	      peeps.push(value);
	    }
	  }
        } else if (ckey=="PMAX") {
	  if (pmaxValid(value)) {
	    currParamCombo.pmax = value;
	    if ((pmaxs.length==0) || (pmaxs.indexOf(value) == -1)) {
	      pmaxs.push(value);
	    }
	  }
        } else if (ckey=="PS") {
	  if (psValid(value)) {
	    currParamCombo.ps = value;
	    if ((pss.length==0) || (pss.indexOf(value) == -1)) {
	      pss.push(value);
	    }
	  }
        } else if (ckey=="TPS") {
	  if (tpsValid(value)) {
	    currParamCombo.tps = value;
	    if ((tpss.length==0) || (tpss.indexOf(value) == -1)) {
	      tpss.push(value);
	    }
	  }
        } else if (ckey=="MBPM") {
	  if (validDecimalInteger(value)) {
	    if (maxMbpm < value) {
	      maxMbpm = value;
	    }
	    if (minMbpm > value) {
	      minMbpm = value;
	    }
	  }
        } else if (ckey=="SBPM") {
	  if (validDecimalInteger(value)) {
	    if (maxSbpm < value) {
	      maxSbpm = value;
	    }
	    if (minSbpm > value) {
	      minSbpm = value;
	    }
	  }
        } else if (ckey=="STATIC") {
	  if (validDecimalInteger(value)) {
	    if (maxScomp < value) {
	      maxScomp = value;
	    }
	    if (minScomp > value) {
	      minScomp = value;
	    }
	  }
        } else if (ckey=="DYNAMIC") {
	  if (validDecimalInteger(value)) {
	    if (maxDcomp < value) {
	      maxDcomp = value;
	    }
	    if (minDcomp > value) {
	      minDcomp = value;
	    }
	  }
        } else if (ckey=="VTDEL") {
	  if (validDecimalInteger(value)) {
	    if (maxVt < value) {
	      maxVt = value;
	    }
	    if (minVt > value) {
	      minVt = value;
	    }
	  }
        } else if (ckey=="MVDEL") {
	  if (validFloatNumber(value)) {
	    if (maxMv < value) {
	      maxMv = value;
	    }
	    if (minMv > value) {
	      minMv = value;
	    }
	  }
        } else if (ckey=="PIP") {
	  if (validDecimalInteger(value)) {
	    if (maxPeak < value) {
	      maxPeak = value;
	    }
	    if (minPeak > value) {
	      minPeak = value;
	    }
	  }
        } else if (ckey=="PLAT") {
	  if (validDecimalInteger(value)) {
	    if (maxPlat < value) {
	      maxPlat = value;
	    }
	    if (minPlat > value) {
	      minPlat = value;
	    }
	  }
        } else if (ckey=="MPEEP") {
	  if (validDecimalInteger(value)) {
	    if (maxPeep < value) {
	      maxPeep = value;
	    }
	    if (minPeep > value) {
	      minPeep = value;
	    }
	  }
        } else if (ckey=="TEMP") {
	  if (validDecimalInteger(value)) {
	    if (maxTemp < value) {
	      maxTemp = value;
	    }
	    if (minTemp > value) {
	      minTemp = value;
	    }
	  }
        } else if (ckey=="ALT") {
	    altitude = value + " ft(m)";
        } else if (ckey=="PNAME") {
	    patientName = value;
        } else if (ckey=="PMISC") {
	    patientInfo = value;
        } else if (ckey=="WMSG") {
	  expectWarningMsg = true;
        } else if (ckey=="EMSG") {
	  expectErrorMsg = true;
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
      if (lastRecord) {
        insertUsedParamCombos(currParamCombo);
	displayStats();
      }
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

var tablesContructed = false;
function initStats() {
  table = document.getElementById("statsComboTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  table = document.getElementById("statsMinMaxTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  table = document.getElementById("statsParamTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  table = document.getElementById("statsMiscTable");
  table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;

  tablesConstructed = false;

  numInitialEntry = 0;
  numStandbyEntry = 0;
  numRunningEntry = 0;
  numErrorEntry = 0;
  numWarnings = 0;

  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;

  patientName = ""
  patientInfo = ""
  altitude = "";
  
  usedParamCombos = [];
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

  expectWarningMsg = false;
  expectErrorMsg = false;
  l1 = "";
  l2 = "";
  l3 = "";
  l4 = "";
  errorMsgs = [];
  warningMsgs = [];

}

function collectStats() {
  if (tablesConstructed) return;

  constructStatMinMaxTable();
  constructStatParamTable();
  constructStatMiscTable();
  tablesContructed = true;

  gatherAndDisplayStats();

  tablesConstructed = true;
}
