// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
// currently open session
var sessionDbName = "";
var sessionDbReady = false;
var sessionDurationInMs = 0;
const RESPIMATIC_UID_PREFIX = "UID_";
// Analyzer guides
var fullSessionBreathTimes = [];
var initSessionGather = false;
// Chart Range Selector (Slider)
var chartRangeSlider = null;
// Breath numbers being recorded
var dashboardBreathNum = 0;
var systemBreathNum = 0;
var startSystemBreathNum = -1;
var prevSystemBreathNum = -1;
// before Analysis starts
var initialJsonRecord = null;
// useful for params that have an undefined value sometimes
const maxDummyValue = -999999;
const minDummyValue = 999999;
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
// min max, avg
var minPeak, maxPeak, avgPeak;
var minPlat, maxPlat, avgPlat;
var minPeep, maxPeep, avgPeep;
var minVtdel, maxVtdel, avgVtdel;
var minMvdel, maxMvdel, avgMvdel;
var minMbpm, maxMbpm, avgMbpm;
var minSbpm, maxSbpm, avgSbpm;
var minFiO2, maxFiO2, avgFiO2;
var minScomp, maxScomp, avgScomp;
var minDcomp, maxDcomp, avgDcomp;
var minTemp, maxTemp, avgTemp;
// sum and numSamples for computing average
var sumPeak = 0;
var nPeak = 0;
var sumPlat = 0;
var nPlat = 0;
var sumPeep = 0;
var nPeep = 0;
var sumVtdel = 0;
var nVtdel = 0;
var sumMvdel = 0;
var nMvdel = 0;
var sumMbpm = 0;
var nMbpm = 0;
var sumSbpm = 0;
var nSbpm = 0;
var sumFiO2 = 0;
var nFiO2 = 0;
var sumScomp = 0;
var nScomp = 0;
var sumDcomp = 0;
var nDcomp = 0;
var sumTemp = 0;
var nTemp = 0;
// error and warning messages
var warningNum = 0;
var errorNum = 0;
var errorMsgs = [];
var warningMsgs = [];
var infoMsgs = [];
var chartExpectWarningMsg;
var chartExpectErrorMsg;
var chartL1;
var chartL2;
var chartL3;
var chartL4;
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
var numMissingBreaths;

function initGlobalData() {
  //console.log("initGlobalData");
  sessionDurationInMs = 0;
  globalDataValid = false;
  firstRecord = true;
  dashboardBreathNum = 0;
  systemBreathNum = 0;
  startSystemBreathNum = -1;
  prevSystemBreathNum = -1;
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
  prevParamCombo = {
    "mode": "--",
    "vt": "--",
    "rr": "--",
    "ie": "--",
    "ipeep": "--",
    "pmax": "--",
    "ps": "--",
    "tps": "--",
    "fiO2": "--",
    "dashboardBreathNum": 0,
    "start": 0
  };
  currParamCombo = {
    "mode": "--",
    "vt": "--",
    "rr": "--",
    "ie": "--",
    "ipeep": "--",
    "pmax": "--",
    "ps": "--",
    "tps": "--",
    "fiO2": "--",
    "dashboardBreathNum": 0,
    "start": 0
  };
  usedParamCombos = [];
  minPeak = minDummyValue;
  maxPeak = maxDummyValue;
  avgPeak = "--";
  minPlat = minDummyValue;
  maxPlat = maxDummyValue;
  avgPlat = "--";
  minPeep = minDummyValue;
  maxPeep = maxDummyValue;
  avgPeep = "--";
  minVtdel = minDummyValue;
  maxVtdel = maxDummyValue;
  avgVtdel = "--";
  minMvdel = minDummyValue;
  maxMvdel = maxDummyValue;
  avgMvdel = "--";
  minMbpm = minDummyValue;
  maxMbpm = maxDummyValue;
  avgMbpm = "--";
  minSbpm = minDummyValue;
  maxSbpm = maxDummyValue;
  avgSbpm = "--";
  minFiO2 = minDummyValue;
  maxFiO2 = maxDummyValue;
  avgFiO2 = "--";
  minScomp = minDummyValue;
  maxScomp = maxDummyValue;
  avgScomp = "--";
  minDcomp = minDummyValue;
  maxDcomp = maxDummyValue;
  avgDcomp = "--";
  minTemp = minDummyValue;
  maxTemp = maxDummyValue;
  avgTemp = "--";
  // for computing averages
  sumPeak = 0;
  nPeak = 0;
  sumPlat = 0;
  nPlat = 0;
  sumPeep = 0;
  nPeep = 0;
  sumVtdel = 0;
  nVtdel = 0;
  sumMvdel = 0;
  nMvdel = 0;
  sumMbpm = 0;
  nMbpm = 0;
  sumSbpm = 0;
  nSbpm = 0;
  sumFiO2 = 0;
  nFiO2 = 0;
  sumScomp = 0;
  nScomp = 0;
  sumDcomp = 0;
  nDcomp = 0;
  sumTemp = 0;
  nTemp = 0;
  // state transitions
  numInitialEntry = 0;
  numStandbyEntry = 0;
  numActiveEntry = 0;
  numErrorEntry = 0;
  // Breath types
  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;
  numMissingBreaths = 0;
}

function equalParamCombos(curr, prev) {
  if (
    (curr.mode == prev.mode) &&
    (curr.vt == prev.vt) &&
    (curr.rr == prev.rr) &&
    (curr.ie == prev.ie) &&
    (curr.ipeep == prev.ipeep) &&
    (curr.pmax == prev.pmax) &&
    (curr.ps == prev.ps) &&
    (curr.fiO2 == prev.fiO2) &&
    (curr.tps == prev.tps)
  ) {
    return true;
  }
  else return false;
}

function globalTrackJsonRecord(jsonData) {
  for (var key in jsonData) {
    initialJsonRecord.created = jsonData.created;
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        value = jsonData.content[ckey];
        initialJsonRecord.content[ckey] = value;
        if (ckey == "BNUM") {
	  var bnumValue = parseChecksumString(value);
	  if (bnumValue==null) continue; // ignore badly formed BNUM
	  value = Number(bnumValue);
          if (prevSystemBreathNum == -1) { // initialize
            prevSystemBreathNum = value - 1;
          }
          systemBreathNum = value;
	  if (startSystemBreathNum==-1) startSystemBreathNum = value;
          bMissing = systemBreathNum - prevSystemBreathNum - 1;
          numMissingBreaths += bMissing;
          prevSystemBreathNum = value;
          breathTimes = [{
            "time": initialJsonRecord.created,
            "valid": false
          }]
        }
      }
    }
  }
  // delete signalling messages
  delete initialJsonRecord.content["BNUM"];
  delete initialJsonRecord.content["WMSG"];
  delete initialJsonRecord.content["EMSG"];
}

function processFirstRecordData() {
  // delete signalling messages
  delete initialJsonRecord.content["BNUM"];
  delete initialJsonRecord.content["WMSG"];
  delete initialJsonRecord.content["EMSG"];
  prevParamCombo = createNewInstance(currParamCombo);
  prevParamCombo.start = initialJsonRecord.created;
  globalProcessJsonRecord(initialJsonRecord);
  initChartStartValues();
}

function globalProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  if (firstRecord) {
    firstRecord = false;
    processFirstRecordData();
  }
  // Below is common to all pages
  chartProcessJsonRecord(jsonData);
  statProcessJsonRecord(jsonData);
}

function statProcessJsonRecord(jsonData) {
  for (var key in jsonData) {
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        value = jsonData.content[ckey];
        if (ckey == "INITIAL") {
          if ((value == 1) && !initialState) numInitialEntry++;
          initialState = (value == 1);
        }
        else if (ckey == "STANDBY") {
          if ((value == 1) && !standbyState) numStandbyEntry++;
          standbyState = (value == 1);
        }
        else if (ckey == "RUNNING") {
          if ((value == 1) && !activeState) numActiveEntry++;
          activeState = (value == 1);
        }
        else if (ckey == "ERROR") {
          if ((value == 1) && !errorState) numErrorEntry++;
          errorState = (value == 1);
        }
        else if (ckey == "BREATH") {
          prevBreathMandatory = (value == "MANDATORY");
          prevBreathSpontaneous = (value == "SPONTANEOUS");
        }
        else if (ckey == "BNUM") {
	  bnumValue = parseChecksumString(value);
	  if (bnumValue==null) continue // ignore badly formed BNUM  
	  value = Number(bnumValue);
	  if (initSessionGather) {
	    //console.log("Pushing");
	    fullSessionBreathTimes.push(new Date(jsonData.created));
	    if (startSystemBreathNum<0) startSystemBreathNum = value;
	  }
          if (prevBreathMandatory) {
            numMandatory++;
          }
          else if (prevBreathSpontaneous) {
            numSpontaneous++;
          }
          if (errorState) numMaintenance++;
          if ((usedParamCombos.length == 0) ||
            !equalParamCombos(currParamCombo, prevParamCombo)) {
            // first breath in current combo
            prevParamCombo = createNewInstance(currParamCombo);
            currParamCombo.start = jsonData.created;
            currParamCombo.dashboardBreathNum = 1;
            usedParamCombos.push(createNewInstance(currParamCombo));
          }
          else {
            // update number of breaths for the last combo
            usedParamCombos[usedParamCombos.length - 1].dashboardBreathNum++;
          }
        }
        else if (ckey == "ATTENTION") {
          attentionState = (value == 1);
        }
        else if (ckey == "MODE") {
          if (modeValid(value)) {
            currParamCombo.mode = value;
            if ((modes.length == 0) || (modes.indexOf(value) == -1)) {
              modes.push(value);
            }
          }
        }
        else if (ckey == "VT") {
          if (vtValid(value)) {
            currParamCombo.vt = value;
            if ((vts.length == 0) || (vts.indexOf(value) == -1)) {
              vts.push(value);
            }
          }
        }
        else if (ckey == "RR") {
          if (rrValid(value)) {
            currParamCombo.rr = value;
            if ((rrs.length == 0) || (rrs.indexOf(value) == -1)) {
              rrs.push(value);
            }
          }
        }
        else if (ckey == "EI") {
          if (ieValid(value)) {
            currParamCombo.ie = value;
            if ((ies.length == 0) || (ies.indexOf(value) == -1)) {
              ies.push(value);
            }
          }
        }
        else if (ckey == "IPEEP") {
          if (peepValid(value)) {
            currParamCombo.ipeep = value;
            if ((ipeeps.length == 0) || (ipeeps.indexOf(value) == -1)) {
              ipeeps.push(value);
            }
          }
        }
        else if (ckey == "PMAX") {
          if (pmaxValid(value)) {
            currParamCombo.pmax = value;
            if ((pmaxs.length == 0) || (pmaxs.indexOf(value) == -1)) {
              pmaxs.push(value);
            }
          }
        }
        else if (ckey == "PS") {
          if (psValid(value)) {
            currParamCombo.ps = value;
            if ((pss.length == 0) || (pss.indexOf(value) == -1)) {
              pss.push(value);
            }
          }
        }
        else if (ckey == "TPS") {
	  //console.log("TPS=" + value);
          if (tpsValid(value)) {
	    //console.log("TPS Valid");
            currParamCombo.tps = value;
            if ((tpss.length == 0) || (tpss.indexOf(value) == -1)) {
              tpss.push(value);
            }
          }
        }
        else if (ckey == "FIO2") {
          if (validDecimalInteger(value) && (value <= 100)) {
            currParamCombo.fiO2 = value;
            if (maxFiO2 < value) {
              maxFiO2 = value;
            }
            if (minFiO2 > value) {
              minFiO2 = value;
            }
            if ((fiO2s.length == 0) || (fiO2s.indexOf(value) == -1)) {
              fiO2s.push(value);
            }
            sumFiO2 += Number(value);
            avgFiO2 = formAvg(sumFiO2, ++nFiO2);
          }
        }
        else if (ckey == "MBPM") {
          if (validDecimalInteger(value)) {
            if (maxMbpm < value) {
              maxMbpm = value;
            }
            if (minMbpm > value) {
              minMbpm = value;
            }
            sumMbpm += Number(value);
            avgMbpm = formAvg(sumMbpm, ++nMbpm);
          }
        }
        else if (ckey == "SBPM") {
          if (validDecimalInteger(value)) {
            if (maxSbpm < value) {
              maxSbpm = value;
            }
            if (minSbpm > value) {
              minSbpm = value;
            }
            sumSbpm += Number(value);
            avgSbpm = formAvg(sumSbpm, ++nSbpm);
          }
        }
        else if (ckey == "STATIC") {
          if (validDecimalInteger(value)) {
            if (maxScomp < value) {
              maxScomp = value;
            }
            if (minScomp > value) {
              minScomp = value;
            }
            sumScomp += Number(value);
            avgScomp = formAvg(sumScomp, ++nScomp);
          }
        }
        else if (ckey == "DYNAMIC") {
          if (validDecimalInteger(value)) {
            if (maxDcomp < value) {
              maxDcomp = value;
            }
            if (minDcomp > value) {
              minDcomp = value;
            }
            sumDcomp += Number(value);
            avgDcomp = formAvg(sumDcomp, ++nDcomp);
          }
        }
        else if (ckey == "VTDEL") {
          if (validDecimalInteger(value)) {
            if (maxVtdel < value) {
              maxVtdel = value;
            }
            if (minVtdel > value) {
              minVtdel = value;
            }
            sumVtdel += Number(value);
            avgVtdel = formAvg(sumVtdel, ++nVtdel);
          }
        }
        else if (ckey == "MVDEL") {
          if (validFloatNumber(value)) {
            if (maxMvdel < value) {
              maxMvdel = value;
            }
            if (minMvdel > value) {
              minMvdel = value;
            }
            sumMvdel += Number(value);
            avgMvdel = formAvg(sumMvdel, ++nMvdel);
          }
        }
        else if (ckey == "PIP") {
          if (validDecimalInteger(value)) {
            if (maxPeak < value) {
              maxPeak = value;
            }
            if (minPeak > value) {
              minPeak = value;
            }
            sumPeak += Number(value);
            avgPeak = formAvg(sumPeak, ++nPeak);
          }
        }
        else if (ckey == "PLAT") {
          if (validDecimalInteger(value)) {
            if (maxPlat < value) {
              maxPlat = value;
            }
            if (minPlat > value) {
              minPlat = value;
            }
            sumPlat += Number(value);
            avgPlat = formAvg(sumPlat, ++nPlat);
          }
        }
        else if (ckey == "MPEEP") {
          if (validDecimalInteger(value)) {
            if (maxPeep < value) {
              maxPeep = value;
            }
            if (minPeep > value) {
              minPeep = value;
            }
            sumPeep += Number(value);
            avgPeep = formAvg(sumPeep, ++nPeep);
          }
        }
        else if (ckey == "TEMP") {
          if (validDecimalInteger(value)) {
            if (maxTemp < value) {
              maxTemp = value;
            }
            if (minTemp > value) {
              minTemp = value;
            }
            sumTemp += Number(value);
            avgTemp = formAvg(sumTemp, ++nTemp);
          }
        }
        else if (ckey == "ALT") {
          altitude = value + " ft(m)";
        }
        else if (ckey == "PNAME") {
          patientName = value;
        }
        else if (ckey == "PMISC") {
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
      // It will never get here if keyMoreThanAnalysisRangeMax
      if (keyLessThanAnalysisRangeMin(jsonData.created)) {
        globalTrackJsonRecord(jsonData);
      }
      else {
        globalProcessJsonRecord(jsonData);
      }
      if (lastRecord) {
        globalLastRecord();
      }
    }
  }
}

function globalLastRecord() {
  //usedParamCombos.push(createNewInstance(prevParamCombo));
  globalDataValid = true;
  var analysisWindowExists = (typeof analysisWindowExists != undefined); 
  if (analysisWindowExists && initSessionGather) {
    showAnalysisRangeSlider();
  }
}

function gatherGlobalData() {
  if (globalDataValid) return;
  //console.log("gatherGlobalData");
  initSessionGather = (fullSessionBreathTimes.length==0);
  initialJsonRecord = createNewInstance(jsonRecordSchema);
  if (allDbKeys.length == 0) {
    alert("Selected Session has no data");
    return;
  }
  var lastRecord = false;
  for (i = 0; i < allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (keyMoreThanAnalysisRangeMax(allDbKeys[i])) {
      break;
    }
    else if (i == (allDbKeys.length - 1)) {
      lastRecord = true;
    }
    else if (keyMoreThanAnalysisRangeMax(allDbKeys[i + 1])) {
      lastRecord = true;
    }
    globalProcessAllJsonRecords(key, lastRecord);
  }
}

function formInitialJsonRecord() {
  return initialJsonRecord;
}

