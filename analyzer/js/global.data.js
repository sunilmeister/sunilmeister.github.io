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

// value transitions
var breathTimes = [];
var vtdelValues = [];
var mvdelValues = [];
var sbpmValues = [];
var mbpmValues = [];
var scompValues = [];
var dcompValues = [];
var peakValues = [];
var platValues = [];
var mpeepValues = [];
var tempValues = [];

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
var runningState;
var errorState;
var numInitialEntry;
var numStandbyEntry;
var numRunningEntry;
var numErrorEntry;

// Breath types
var numMandatory;
var numSpontaneous;
var numMaintenance;

function initGlobalData() {
  console.log("initGlobalData");
  globalDataValid = false;
  firstRecord = true;

  breathTimes = [];
  vtdelValues = [];
  mvdelValues = [];
  sbpmValues = [];
  mbpmValues = [];
  scompValues = [];
  dcompValues = [];
  peakValues = [];
  platValues = [];
  mpeepValues = [];
  tempValues = [];

  numInitialEntry = 0;
  numStandbyEntry = 0;
  numRunningEntry = 0;
  numErrorEntry = 0;
  numWarnings = 0;
  initialState = false;
  standbyState = false;
  runningState = false;
  errorState = false;

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
  minScomp = minDummyValue;
  maxScomp = maxDummyValue;
  minDcomp = minDummyValue;
  maxDcomp = maxDummyValue;
  minTemp = minDummyValue;
  maxTemp = maxDummyValue;

  errorMsgs = [];
  warningMsgs = [];
  expectWarningMsg = false;
  expectErrorMsg = false;
  l1 = "";
  l2 = "";
  l3 = "";
  l4 = "";

// state transitions
  numInitialEntry = 0; 
  numStandbyEntry = 0; 
  numRunningEntry = 0; 
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
}

function globalProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  if (firstRecord) {
    firstRecord = false;
    processFirstRecordData();
  }

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

	    if (expectWarningMsg) {
	      warningMsgs.push(createNewInstance(msg));
	    } else {
	      errorMsgs.push(createNewInstance(msg));
	    }
	    expectWarningMsg = false;
	    expectErrorMsg = false;
	    l1 = l2 = l3 = l4 = "";
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
	  prevBreathMandatory = !(value==1);
        } else if (ckey=="BTOG") {
	  breathTimes.push(curTime);
	  if (prevBreathMandatory) {
	    numMandatory++ ;
	  } else {
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
        } else if (ckey=="MBPM") {
	  if (validDecimalInteger(value)) {
	    if (maxMbpm < value) {
	      maxMbpm = value;
	    }
	    if (minMbpm > value) {
	      minMbpm = value;
	    }
	    mbpmValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="SBPM") {
	  if (validDecimalInteger(value)) {
	    if (maxSbpm < value) {
	      maxSbpm = value;
	    }
	    if (minSbpm > value) {
	      minSbpm = value;
	    }
	    sbpmValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="STATIC") {
	  if (validDecimalInteger(value)) {
	    if (maxScomp < value) {
	      maxScomp = value;
	    }
	    if (minScomp > value) {
	      minScomp = value;
	    }
	    scompValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="DYNAMIC") {
	  if (validDecimalInteger(value)) {
	    if (maxDcomp < value) {
	      maxDcomp = value;
	    }
	    if (minDcomp > value) {
	      minDcomp = value;
	    }
	    dcompValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="VTDEL") {
	  if (validDecimalInteger(value)) {
	    if (maxVtdel < value) {
	      maxVtdel = value;
	    }
	    if (minVtdel > value) {
	      minVtdel = value;
	    }
	    vtdelValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="MVDEL") {
	  if (validFloatNumber(value)) {
	    if (maxMvdel < value) {
	      maxMvdel = value;
	    }
	    if (minMvdel > value) {
	      minMvdel = value;
	    }
	    mvdelValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="PIP") {
	  if (validDecimalInteger(value)) {
	    if (maxPeak < value) {
	      maxPeak = value;
	    }
	    if (minPeak > value) {
	      minPeak = value;
	    }
	    peakValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="PLAT") {
	  if (validDecimalInteger(value)) {
	    if (maxPlat < value) {
	      maxPlat = value;
	    }
	    if (minPlat > value) {
	      minPlat = value;
	    }
	    platValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="MPEEP") {
	  if (validDecimalInteger(value)) {
	    if (maxPeep < value) {
	      maxPeep = value;
	    }
	    if (minPeep > value) {
	      minPeep = value;
	    }
	    mpeepValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="TEMP") {
	  if (validDecimalInteger(value)) {
	    if (maxTemp < value) {
	      maxTemp = value;
	    }
	    if (minTemp > value) {
	      minTemp = value;
	    }
	    tempValues.push({"time":curTime,"value":value});
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
  //console.log("LastRecord prevCombo = " + prevParamCombo);
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
  //console.log("analysisStart=" + analysisStartTime);
  //console.log("analysisEnd=" + analysisEndTime);
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
