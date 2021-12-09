// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// currently open session
var sessionDbName = "";
var sessionDbReady = false;

// before Analysis starts
var initialJsonRecord = null;

// useful for params that have an undefined value sometimes
const maxDummyValue = -999999 ;
const minDummyValue = 999999 ;

// valid or not
var globalDataValid = false;
var firstRecord = true;

// Misc data
var patientName;
var patientInfo;
var altitude;

// All input settings used
var modes = [];
var vts = [];
var rrs = [];
var ies = [];
var ipeeps = [];
var pmaxs = [];
var pss = [];
var tpss = [];
var fiO2s = [];

// Combinations of settings
var prevParamCombo = {};
var currParamCombo = {};
var usedParamCombos = [];

// min max
var minPeak, maxPeak;
var minPlat, maxPlat;
var minPeep, maxPeep;
var minVtdel, maxVtdel;
var minMvdel, maxMvdel;
var minMbpm, maxMbpm;
var minSbpm, maxSbpm;
var minFiO2, maxFiO2;
var minScomp, maxScomp;
var minDcomp, maxDcomp;
var minTemp, maxTemp;

// error and warning messages
var errorMsgs = [];
var warningMsgs = [];
var expectWarningMsg;
var expectErrorMsg;
var l1;
var l2;
var l3;
var l4;

// state transitions
var initialState;
var standbyState;
var activeState;
var errorState;
var numInitialEntry;
var numStandbyEntry;
var numActiveEntry;
var numErrorEntry;

// Breath types
var prevBreathMandatory;
var prevBreathSpontaneous;
var numMandatory;
var numSpontaneous;
var numMaintenance;

function initGlobalData() {
  console.log("initGlobalData");
  globalDataValid = false;
  firstRecord = true;
  initChartData();

  numInitialEntry = 0;
  numStandbyEntry = 0;
  numActiveEntry = 0;
  numErrorEntry = 0;
  initialState = false;
  standbyState = false;
  activeState = false;
  errorState = false;

  prevBreathMandatory = false;
  prevBreathSpontaneous = false;
  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;

  patientName = ""
  patientInfo = ""
  altitude = "";
  
  // All settings combos used
  modes = [];
  vts = [];
  rrs = [];
  ies = [];
  ipeeps = [];
  pmaxs = [];
  pss = [];
  tpss = [];
  fiO2s = [];

  // Settings combinations
  prevParamCombo = {};
  currParamCombo = {
    "mode" : "--",
    "vt" : "--",
    "rr" : "--",
    "ie" : "--",
    "ipeep" : "--",
    "pmax" : "--",
    "ps" : "--",
    "tps" : "--",
    "fiO2" : "--",
    "numBreaths" : 0,
    "start" : 0
  };
  usedParamCombos = [];
  
  minPeak = minDummyValue;
  maxPeak = maxDummyValue;
  minPlat = minDummyValue;
  maxPlat = maxDummyValue;
  minPeep = minDummyValue;
  maxPeep = maxDummyValue;
  minVtdel = minDummyValue;
  maxVtdel = maxDummyValue;
  minMvdel = minDummyValue;
  maxMvdel = maxDummyValue;
  minMbpm = minDummyValue;
  maxMbpm = maxDummyValue;
  minSbpm = minDummyValue;
  maxSbpm = maxDummyValue;
  minFiO2 = minDummyValue;
  maxFiO2 = maxDummyValue;
  minScomp = minDummyValue;
  maxScomp = maxDummyValue;
  minDcomp = minDummyValue;
  maxDcomp = maxDummyValue;
  minTemp = minDummyValue;
  maxTemp = maxDummyValue;

// state transitions
  numInitialEntry = 0; 
  numStandbyEntry = 0; 
  numActiveEntry = 0; 
  numErrorEntry = 0;

// Breath types
  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;
}

function equalParamCombos(curr, prev) {
  if (
    (curr.mode==prev.mode) &&
    (curr.vt==prev.vt) &&
    (curr.rr==prev.rr) &&
    (curr.ie==prev.ie) &&
    (curr.ipeep==prev.ipeep) &&
    (curr.pmax==prev.pmax) &&
    (curr.ps==prev.ps) &&
    (curr.fiO2==prev.fiO2) &&
    (curr.tps==prev.tps)
  ) {
    return true;
  } else return false;
}

function globalTrackJsonRecord(jsonData) {
  for (var key in jsonData) {
    initialJsonRecord.created = jsonData.created;
    if (key=='content') {
      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        initialJsonRecord.content[ckey] = value;
        if (ckey=="BTOG") {
	  breathTimes = [initialJsonRecord.created]
	}
      }
    }
  }

  // delete signalling messages
  delete initialJsonRecord.content["BTOG"];
  delete initialJsonRecord.content["WMSG"];
  delete initialJsonRecord.content["EMSG"];
}

function processFirstRecordData() {
  // delete signalling messages
  delete initialJsonRecord.content["BTOG"];
  delete initialJsonRecord.content["WMSG"];
  delete initialJsonRecord.content["EMSG"];

  prevParamCombo = createNewInstance(currParamCombo);
  prevParamCombo.start = initialJsonRecord.created;

  globalProcessJsonRecord(initialJsonRecord);
  initGraphStartValues();
}

function globalProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  if (firstRecord) {
    firstRecord = false;
    processFirstRecordData();
  }

  // Below is common to all pages
  chartProcessJsonRecord(jsonData);

  // unique to amalyzer
  for (var key in jsonData) {
    if (key=='content') {

      for (var ckey in jsonData.content) {
        value = jsonData.content[ckey];
        if (ckey=="INITIAL") {
	  if ((value==1) && !initialState) numInitialEntry++ ;
	  initialState = (value==1);
        } else if (ckey=="STANDBY") {
	  if ((value==1) && !standbyState) numStandbyEntry++ ;
	  standbyState = (value==1);
        } else if (ckey=="RUNNING") {
	  if ((value==1) && !activeState) numActiveEntry++ ;
	  activeState = (value==1);
        } else if (ckey=="ERROR") {
	  if ((value==1) && !errorState) numErrorEntry++ ;
	  errorState = (value==1);
        } else if (ckey=="BREATH") {
	  prevBreathMandatory = (value=="MANDATORY");
	  prevBreathSpontaneous = (value=="SPONTANEOUS");
        } else if (ckey=="BTOG") {
	  if (prevBreathMandatory) {
	    numMandatory++ ;
	  } else if (prevBreathSpontaneous) {
	    numSpontaneous++ ;
	  }
	  if (errorState) numMaintenance++;

          if (!equalParamCombos(currParamCombo, prevParamCombo)) {
            usedParamCombos.push(createNewInstance(prevParamCombo));
	    prevParamCombo = createNewInstance(currParamCombo);
            prevParamCombo.numBreaths=1;
            prevParamCombo.start = jsonData.created;
	  } else {
            prevParamCombo.numBreaths++;
	  }

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
	    currParamCombo.ipeep = value;
	    if ((ipeeps.length==0) || (ipeeps.indexOf(value) == -1)) {
	      ipeeps.push(value);
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
        } else if (ckey=="FIO2") {
	  if (validDecimalInteger(value)) {
	    currParamCombo.fiO2 = value;
	    if ((fiO2s.length==0) || (fiO2s.indexOf(value) == -1)) {
	      fiO2s.push(value);
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
	    if (maxVtdel < value) {
	      maxVtdel = value;
	    }
	    if (minVtdel > value) {
	      minVtdel = value;
	    }
	  }
        } else if (ckey=="MVDEL") {
	  if (validFloatNumber(value)) {
	    if (maxMvdel < value) {
	      maxMvdel = value;
	    }
	    if (minMvdel > value) {
	      minMvdel = value;
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
        } else if (ckey=="FIO2") {
	  console.log("FIO2 value=" + value);
	  if (validDecimalInteger(value) && (value <=100)) {
	    if (maxFiO2 < value) {
	      maxFiO2 = value;
	    }
	    if (minFiO2 > value) {
	      minFiO2 = value;
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
	}
      }
    }
  }
}

function globalProcessAllJsonRecords(key, lastRecord) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    sessionDbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function(event) {
      var jsonData = keyReq.result;
      // It will never get here is keyMoreThanAnalysisRangeMax
      if (keyLessThanAnalysisRangeMin(jsonData.created)) {
        globalTrackJsonRecord(jsonData);
      } else {
        globalProcessJsonRecord(jsonData);
      }
      if (lastRecord) {
	globalLastRecord();
      }
    }
  }
}

function globalLastRecord() {
  usedParamCombos.push(createNewInstance(prevParamCombo));
  globalDataValid = true;
}

function gatherGlobalData() {
  if (globalDataValid) return;
  console.log("gatherGlobalData");
  initialJsonRecord = createNewInstance(jsonRecordSchema);

  if (allDbKeys.length==0) {
    alert("Selected Session has no data");
    return;
  }

  var lastRecord = false;
  for (i=0; i<allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (keyMoreThanAnalysisRangeMax(allDbKeys[i])) {
      break;
    } else if (i==(allDbKeys.length-1)) {
      lastRecord = true;
    } else if (keyMoreThanAnalysisRangeMax(allDbKeys[i+1])) {
      lastRecord = true;
    }
    globalProcessAllJsonRecords(key, lastRecord);
  }
}

function formInitialJsonRecord() {
  return initialJsonRecord;
}
