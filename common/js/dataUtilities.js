// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
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
  prevParamCombo = cloneObject(currParamCombo);
  prevParamCombo.start = initialJsonRecord.created;
  globalProcessJsonRecord(initialJsonRecord);
  initTransitionStartValues();
}

function readSessionVersion(jsonData) {
  if (sessionVersion != 'UNKNOWN') return;
  for (var key in jsonData) {
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        if (ckey == "SESSION_VERSION") {
          sessionVersion = jsonData.content[ckey];
	  console.log("Found sessionVersion=" + sessionVersion);
	}
      }
    }
  }
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
	    fullSessionBreathTimes.push(new Date(jsonData.created));
	    if (startSystemBreathNum<0) startSystemBreathNum = value;
	  }

          if (prevBreathMandatory) numMandatory++;
          else if (prevBreathSpontaneous) numSpontaneous++;

          if (errorState) numMaintenance++;
          if ((usedParamCombos.length == 0) ||
            !equalParamCombos(currParamCombo, prevParamCombo)) {
            // first breath in current combo
            prevParamCombo = cloneObject(currParamCombo);
            currParamCombo.start = jsonData.created;
            currParamCombo.dashboardBreathNum = 1;
            usedParamCombos.push(cloneObject(currParamCombo));
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
          if (tpsValid(value)) {
            currParamCombo.tps = value;
            if ((tpss.length == 0) || (tpss.indexOf(value) == -1)) {
              tpss.push(value);
            }
          }
        }
        else if (ckey == "FIO2") {
          if (validDecimalInteger(value) && (value <= 100)) {
            currParamCombo.fiO2 = value;
            if ((fiO2s.length == 0) || (fiO2s.indexOf(value) == -1)) {
              fiO2s.push(value);
            }
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
      readSessionVersion(jsonData);
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
  //usedParamCombos.push(cloneObject(prevParamCombo));
  globalDataValid = true;
  var analysisWindowExists = (typeof analysisWindowExists != undefined); 
  if (analysisWindowExists && initSessionGather) {
    showAnalysisRangeSlider();
  }
}

function gatherGlobalData() {
  if (globalDataValid) return;
  sessionVersion = "UNKNOWN";
  //console.log("gatherGlobalData");
  initSessionGather = (fullSessionBreathTimes.length==0);
  initialJsonRecord = cloneObject(jsonRecordSchema);
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

