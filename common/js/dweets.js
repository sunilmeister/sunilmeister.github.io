// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var shapeBreathPartial = false;
var shapeSampleInterval = null;
var shapeActualSamples = null;
var shapeBreathClosed = true;
var shapeSlices = [];
var shapeSliceNum = -1;
var prevShapeSliceNum = -1;
var expectingPWEND = false;

function shapeWaveformKey(key) {
  var prefix = String(key).substr(0,2);
  if (prefix == "PW") return true;
  return false;
}

function parseStateData(jsonStr) {
  val = {
    prevState : null,
    state : null,
    initial : false,
    standby : false,
    active : false,
    error : false,
  };

  switch (jsonStr) {
    case 0 : 
    case 1 : 
      val.state = INITIAL_STATE;
      val.initial = true; 
      break;
    case 2 : 
      val.state = STANDBY_STATE;
      val.standby = true; 
      break;
    case 3 : 
      val.state = ACTIVE_STATE;
      val.active = true; 
      break;
    case 4 : 
      val.state = ERROR_STATE;
      val.error = true; 
      break;
    default : return null;
  }

  return val;
}

function parseParamData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 9)) {
    return null;
  }
  val = {
    pending :   arr[0] ? true : false,
    vt :        (arr[1] == -1) ? null : arr[1],
    pmax :      (arr[2] == -1) ? null : arr[2],
    ipeep :     (arr[3] == -1) ? null : arr[3],
    ps :        (arr[4] == -1) ? null : arr[4],
    mode :      (arr[5] == -1) ? null : MODE_DECODER[arr[5]],
    tps :       (arr[6] == -1) ? null : TPS_DECODER[arr[6]].text,
    tpsUnits :  (arr[6] == -1) ? null : TPS_DECODER[arr[6]].units,
    ie :        (arr[7] == -1) ? null : EI_DECODER[arr[7]],
    rr :        (arr[8] == -1) ? null : arr[8],
  }
  return val;
}

function parseFiO2Data(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 3)) {
    return null;
  }
  val = {
    fiO2 :      (arr[0] == -1) ? null : arr[0],
    o2Purity :  (arr[1] == -1) ? null : arr[1],
    o2FlowX10 : (arr[2] == -1) ? null : arr[2]/10,
  }
  return val;
}

function parseMinuteData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 3)) {
    return null;
  }
  val = {
    mbpm :  (arr[0] == -1) ? null : arr[0],
    sbpm :  (arr[1] == -1) ? null : arr[1],
    mvdel : (arr[2] == -1) ? null : arr[2],
  }
  return val;
}

function parseBreathData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 5)) {
    return null;
  }
  val = {
    peak :  (arr[0] == -1) ? null : arr[0],
    plat :  (arr[1] == -1) ? null : arr[1],
    mpeep : (arr[2] == -1) ? null : arr[2],
    vtdel : (arr[3] == -1) ? null : arr[3],
    type :  (arr[4] == -1) ? null : arr[4],
  }
  return val;
}

function parseComplianceData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  val = {
    scomp :   (arr[0] == -1) ? null : arr[0],
    dcomp :  (arr[1] == -1) ? null : arr[1],
  }
  return val;
}

function parseMiscData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  val = {
    tempC : arr[0],
    altitude : arr[1],
  }
  return val;
}

function equalParamCombos(curr, prev) {
  //console.log("curr"); console.log(curr);
  //console.log("prev"); console.log(prev);
  if (
    (curr.value.mode == prev.value.mode) &&
    (curr.value.vt == prev.value.vt) &&
    (curr.value.rr == prev.value.rr) &&
    (curr.value.ie == prev.value.ie) &&
    (curr.value.ipeep == prev.value.ipeep) &&
    (curr.value.pmax == prev.value.pmax) &&
    (curr.value.ps == prev.value.ps) &&
    (curr.value.fiO2 == prev.value.fiO2) &&
    (curr.value.tps == prev.value.tps)
  ) {
    return true;
  } else return false;
}

function readSessionVersion(jsonData) {
  if (session.sessionVersion != 'UNKNOWN') return;
  for (var key in jsonData) {
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        if (ckey == "SESSION_VERSION") {
          session.sessionVersion = jsonData.content[ckey];
          console.log("Found sessionVersion=" + session.sessionVersion);
        }
      }
    }
  }
}

function processAllJsonRecords(key, lastRecord, lastRecordCallback) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    sessionDbReady = true;
    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function (event) {
      var jsonData = keyReq.result;
      readSessionVersion(jsonData);
      processJsonRecord(jsonData);
      if (lastRecord) {
        if (typeof lastRecordCallback != 'undefined') lastRecordCallback();
      }
    }
  }
}

function gatherSessionData(lastRecordCallback) {
  session.analyzer.sessionDataValid = false;
  session.sessionVersion = "UNKNOWN";
  if (allDbKeys.length == 0) {
    modalAlert("Selected Session has no data", "");
    return;
  }
  var lastRecord = false;
  for (i = 0; i < allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (i == (allDbKeys.length - 1)) {
      lastRecord = true;
    }
    processAllJsonRecords(key, lastRecord, lastRecordCallback);
  }
}


function processJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  for (var key in jsonData) {
    processAlertDweet(curTime, jsonData);
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        value = jsonData.content[ckey];

        // close off PW samples if missing a closing dweet
        if (expectingPWEND) {
          // if anything else, close of with PWEND
          if (ckey != "PWEND") {
            partsArray = ckey.split('_');
            if ((partsArray.length == 0) || (partsArray[0] != "PW")) {
              //console.log("Expecting PWEND or PW slice but found=" + ckey);
              //console.log("Graphing anyway with PWEND()");
              processPwendDweet();
              shapeBreathClosed = true;
              expectingPWEND = false;
            }
          }
        }

        // process each keyword
        if (ckey == "BNUM") {
          //console.log("Found BNUM " + value);
          processBnumDweet(curTime, value, jsonData);
        } else if (ckey == "STATE") {
          processStateDweet(curTime, value);
        } else if (ckey == "PARAM") {
          processParamDweet(curTime, value);
        } else if (ckey == "FIO2") {
          processFiO2Dweet(curTime, value);
        } else if (ckey == "MINUTE") {
          processMinuteDweet(curTime, value);
        } else if (ckey == "BREATH") {
          processBreathDweet(curTime, value);
        } else if (ckey == "COMP") {
          processComplianceDweet(curTime, value);
        } else if (ckey == "MISC") {
          processMiscDweet(curTime, value);
        } else if (ckey == "FNAME") {
          session.patientData.fname = value;
        } else if (ckey == "LNAME") {
          session.patientData.lname = value;
        } else if (ckey == "AGE") {
          session.patientData.age = value;
        } else if (ckey == "PID") {
          session.patientData.pid = value;
        } else if (ckey == "PWSTART") {
          processPwstartDweet(value);
        } else if (ckey == "PWPERIOD") {
          session.shapes.sendPeriod = value;
        } else if (ckey == "PWEND") {
          processPwendDweet(value);
        } else {
          partsArray = ckey.split('_');
          if (partsArray.length == 0) continue;
          if (partsArray[0] != "PW") continue;
          sNum = partsArray[1];
          processPwsliceDweet(sNum, value);
        }
      }
    }
  }
}

// ////////////////////////////////////////////////
// All individual Pressure Waveform data handling below
// ////////////////////////////////////////////////
function shapeCollectedSamples(slices) {
  num = 0;
  for (i = 0; i < slices.length; i++) {
    num += slices[i].sliceData.length;
  }
  return num;
}

function processPwstartDweet(str) {
  if (!shapeBreathClosed) {
    processPwendDweet();
    shapeBreathClosed = true;
  }

  arr = parseJSONSafely(str);
  if (!arr || (arr.length != 5)) {
    //console.log("Bad PWSTART=" + str);
    session.shapes.breathNum = null;
    shapeSampleInterval = null;
    return;;
  }
  expectingPWEND = true;
  // PWSTART key has the following value format
  // arr = [breathNum, breathInfo, expectedSamples, sampleInterval]
  session.shapes.breathNum = arr[0];
  session.shapes.breathInfo = arr[1];
  shapeExpectedSamplesPerSlice = arr[2];
  shapeSampleInterval = arr[3];
  session.shapes.onDemand = arr[4] ? true : false;
  shapeBreathClosed = false;
  shapeBreathPartial = false;
  prevShapeSliceNum = -1;
  shapeSliceNum = -1;
  shapeSlices = [];
}

function processPwendDweet(str) {
  // PWEND key has the following value format
  // arr = [breathNum, breathInfo, actualSamples, sampleInterval]
  if (typeof str != 'undefined') {
    arr = parseJSONSafely(str);
    if (arr && (arr.length == 5)) {
      shapeActualSamples = arr[2];
      if (!session.shapes.breathNum) {
        //console.log("Recovering from missing PWSTART using PWEND");
        session.shapes.breathNum = arr[0];
        session.shapes.breathInfo = arr[1];
        shapeSampleInterval = arr[3];
        session.shapes.onDemand = arr[4] ? true : false;
      }
    } else {
      //console.log("Bad PWEND=" + str);
    }
  } else {
    if (shapeExpectedSamplesPerSlice) {
      shapeActualSamples = shapeExpectedSamplesPerSlice * SHAPE_MAX_SLICES;
    } else {
      shapeActualSamples = SHAPE_MAX_SAMPLES_PER_BREATH;
    }
  }

  if (!session.shapes.breathNum || shapeBreathClosed) {
    //console.log("Missing PWSTART for PWEND=" + str);
    prevShapeSliceNum = -1;
    shapeSliceNum = -1;
    shapeSlices = [];
    shapeBreathPartial = false;
    shapeBreathClosed = true;
    return;
  }

  // consolidate all samples
  let samples = [];
  for (i = 0; i < shapeSlices.length; i++) {
    slice = shapeSlices[i];
    for (j = 0; j < slice.sliceData.length; j++) {
      samples.push(slice.sliceData[j]);
    }
  }
  shapeSlices = [];
  if (shapeActualSamples != samples.length) {
    shapeBreathPartial = true;
    //console.log("Missing Samples at PWEND=" + (shapeActualSamples-samples.length));
  }

  // Make it consistently SHAPE_MAX_SAMPLES_PER_BREATH
  for (j = 0; j < SHAPE_MAX_SAMPLES_PER_BREATH - samples.length; j++) {
    samples.push(null);
  }

  // store it for later use
  session.shapes.data.push({
    "partial": shapeBreathPartial,
    "systemBreathNum": session.shapes.breathNum,
    "breathInfo": session.shapes.breathInfo,
    "onDemand": session.shapes.onDemand,
    "sampleInterval": shapeSampleInterval,
    "samples": cloneObject(samples),
  });

  expectingPWEND = false;
  shapeBreathPartial = false;
  shapeBreathClosed = true;
  if (session.shapes.newShapeCallback) session.shapes.newShapeCallback(session.shapes.breathNum);
}

function processPwsliceDweet(receivedSliceNum, str) {
  if (!session.shapes.breathNum || shapeBreathClosed) {
    shapeBreathPartial = false;
    shapeBreathClosed = true;
    return;
  }

  arr = parseJSONSafely(str);
  if (!arr || (arr.length != 2)) {
    return;
  }
  shapeSliceNum = Number(arr[0]);

  if ((shapeSliceNum != prevShapeSliceNum + 1) || (shapeSliceNum != receivedSliceNum)) {
    // stuff empty slices
    shapeBreathPartial = true;
    for (i = prevShapeSliceNum + 1; i < shapeSliceNum; i++) {
      samples = [];
      if (!session.shapes.expectedSamplesPerSlice) session.shapes.expectedSamplesPerSlice = SHAPE_MAX_SAMPLES_PER_SLICE;
      for (j = 0; j < session.shapes.expectedSamplesPerSlice; j++) {
        samples.push(null);
      }
      shapeSlices.push({
        "sliceNum": i,
        sliceData: cloneObject(samples)
      });
    }
  }

  shapeSlices.push({
    "sliceNum": shapeSliceNum,
    sliceData: cloneObject(arr[1])
  });
  prevShapeSliceNum = shapeSliceNum;
}

// /////////////////////////////////////////////////////
// All other dweets below
// /////////////////////////////////////////////////////
function processStateDweet(curTime, jsonStr) {
  obj = parseStateData(jsonStr);
  if (!obj) return;
  if (obj.state == session.stateData.state) return;

  obj.prevState = session.stateData.state;
  session.stateData = obj;
  session.stateValues.push({
    "time": curTime,
    "value": obj.state
  });
}

function updatePendingParamState() {
  var p1 = session.paramDataOnDisplay;
  var p2 = session.paramDataInUse;
  var p = session.pendingParamsData;

  if (p1.vt == p2.vt) p.vt = false;
  else p.vt = true;

  if (p1.pmax == p2.pmax) p.pmax = false;
  else p.pmax = true;

  if (p1.ipeep == p2.ipeep) p.ipeep = false;
  else p.ipeep = true;

  if (p1.ps == p2.ps) p.ps = false;
  else p.ps = true;

  if (p1.mode == p2.mode) p.mode = false;
  else p.mode = true;

  if (p1.tps == p2.tps) p.tps = false;
  else p.tps = true;

  if (p1.ie == p2.ie) p.ie = false;
  else p.ie = true;

  if (p1.rr == p2.rr) p.rr = false;
  else p.rr = true;
}

function processParamDweet(curTime, jsonStr) {
  obj = parseParamData(jsonStr);
  if (!obj) return;

  session.paramDataOnDisplay = obj;
  if (!obj.pending) {
    session.paramDataInUse = obj;
  }
  updatePendingParamState();

  saveSnapComboValue("vt", "paramDataInUse", "vts", curTime, obj);
  saveSnapComboValue("pmax", "paramDataInUse", "pmaxs", curTime, obj);
  saveSnapComboValue("ipeep", "paramDataInUse", "ipeeps", curTime, obj);
  saveSnapComboValue("ps", "paramDataInUse", "pss", curTime, obj);
  saveSnapComboValue("mode", "paramDataInUse", "modes", curTime, obj);
  saveSnapComboValue("tps", "paramDataInUse", "tpss", curTime, obj);
  saveSnapComboValue("ie", "paramDataInUse", "ies", curTime, obj);
  saveSnapComboValue("rr", "paramDataInUse", "rrs", curTime, obj);
}

function processFiO2Dweet(curTime, jsonStr) {
  obj = parseFiO2Data(jsonStr);
  if (!obj) return;

  saveSnapComboTransValue("fiO2", "fiO2Data", "fiO2s", "fiO2Values", curTime, obj);
  saveSnapComboTransValue("o2Purity", "fiO2Data", "o2Puritys", "o2PurityValues", curTime, obj);
  saveSnapComboTransValue("o2FlowX10", "fiO2Data", "o2FlowX10s", "o2FlowX10Values", curTime, obj);
}

function processMinuteDweet(curTime, jsonStr) {
  obj = parseMinuteData(jsonStr);
  if (!obj) return;
  if (obj.mvdel) {
    obj.mvdel = parseFloat(obj.mvdel/1000).toFixed(1);
  }

  saveSnapTransValue("mbpm", "minuteData", "mbpmValues", curTime, obj);
  saveSnapTransValue("sbpm", "minuteData", "sbpmValues", curTime, obj);
  saveSnapTransValue("mvdel", "minuteData", "mvdelValues", curTime, obj);
}

function processBreathDweet(curTime, jsonStr) {
  obj = parseBreathData(jsonStr);
  if (!obj) return;
  if (session.stateData.error) obj.type = MAINTENANCE_BREATH;

  saveSnapTransValue("peak", "breathData", "peakValues", curTime, obj);
  saveSnapTransValue("plat", "breathData", "platValues", curTime, obj);
  saveSnapTransValue("mpeep", "breathData", "mpeepValues", curTime, obj);
  saveSnapTransValue("vtdel", "breathData", "vtdelValues", curTime, obj);
  saveSnapTransValue("type", "breathData", "breathTypeValues", curTime, obj);
}

function processComplianceDweet(curTime, jsonStr) {
  obj = parseComplianceData(jsonStr);
  if (!obj) return;
  if (obj.scomp) obj.scomp = Math.round(obj.scomp/100);
  if (obj.dcomp) obj.dcomp = Math.round(obj.dcomp/100);

  saveSnapTransValue("scomp", "complianceData", "scompValues", curTime, obj);
  saveSnapTransValue("dcomp", "complianceData", "dcompValues", curTime, obj);
}

function processMiscDweet(curTime, jsonStr) {
  obj = parseMiscData(jsonStr);
  if (!obj) return;

  saveSnapTransValue("tempC", "miscData", "tempValues", curTime, obj);
  saveSnapValue("altitude", "miscData", curTime, obj);
}

function saveSnapValue(paramName, parentName, curTime, newVal) {
  value = newVal[paramName];
  if (value === null) return;
  if (value == session[parentName][paramName]) return;

  session[parentName][paramName] = value;
}

function saveComboValue(paramName, parentName, uniqArrName, curTime, newVal) {
  value = newVal[paramName];
  if (value === null) return;

  session.currParamCombo.value[paramName] = value;
  if ((session[uniqArrName].length == 0) 
       || (session[uniqArrName].indexOf(value) == -1)) {
    session[uniqArrName].push({
      "time": curTime,
      "value": value
    });
  }
}

function saveSnapComboValue(paramName, parentName, uniqArrName, curTime, newVal) {
  // first check for combo
  saveComboValue(paramName, parentName, uniqArrName, curTime, newVal);
  saveSnapValue(paramName, parentName, curTime, newVal);
}

function saveTransValue(paramName, parentName, valArrName, curTime, newVal) {
  value = newVal[paramName];
  if (value == session[parentName][paramName]) return; // no transition

  if (value !== null) {
    session[valArrName].push({
        "time": curTime,
        "value": Number(value)
    });
   } else {
    session[valArrName].push({
        "time": curTime,
        "value": null
    });
  }
}

function saveSnapComboTransValue(paramName, parentName, uniqArrName, valArrName, curTime, newVal) {
  // first check for transition
  saveTransValue(paramName, parentName, valArrName, curTime, newVal);
  saveSnapComboValue(paramName, parentName, uniqArrName, curTime, newVal);
}

function saveSnapTransValue(paramName, parentName, valArrName, curTime, newVal) {
  // first check for transition
  saveTransValue(paramName, parentName, valArrName, curTime, newVal);
  saveSnapValue(paramName, parentName, curTime, newVal);
}

function processBnumDweet(curTime, value, jsonData) {
  if (value === null) return;
  var bnumValue = parseChecksumString(value);
  if (bnumValue == null) {
    console.log("Bad BNUM value = " + value + " sys = " + session.systemBreathNum);
    return; // will count as missing
  }
  value = Number(bnumValue);

  if ((session.usedParamCombos.length == 0) ||
    !equalParamCombos(session.currParamCombo, session.prevParamCombo)) {
    // first breath in current combo
    session.prevParamCombo = cloneObject(session.currParamCombo);
    session.currParamCombo.time = jsonData.created;
    session.currParamCombo.value.numBreaths = 1;
    session.currParamCombo.value.startingBreath = session.breathTimes.length - 1;
    session.usedParamCombos.push(cloneObject(session.currParamCombo));
  } else {
    // update number of breaths for the last combo
    session.usedParamCombos[session.usedParamCombos.length - 1].value.numBreaths++;
  }
  session.breathTimes.push(curTime);

  if (session.prevSystemBreathNum == null) { // initialize
    session.prevSystemBreathNum = value - 1;
  }
  session.systemBreathNum = value;
  if (session.systemBreathNum == null) { // first BNUM
    // Take care of breaths missing right at the start
    breathsMissing = value - 1;
  } else {
    breathsMissing = session.systemBreathNum - session.prevSystemBreathNum - 1;
  }
  session.numMissingBreaths += breathsMissing;
  if (session.startSystemBreathNum == null) {
    session.startSystemBreathNum = value - session.numMissingBreaths;
  }

  if (breathsMissing) {
    var msg = {
      'created': curTime,
      'L1': String(breathsMissing) + " Breath(s) missed",
      'L2': "Info not received by",
      'L3': "Dashboard due to",
      'L4': "Communication packet loss"
    };
    session.infoMsgs.push(msg);
    session.infoValues.push({
      "time": curTime,
      "value": ++session.alerts.infoNum
    });
  }

  updateRangeOnNewBreath();
  session.prevSystemBreathNum = value;
  if (breathsMissing) {
    console.log("Breaths Missing =" + breathsMissing);
    console.log("Before systemBreathNum=" + session.systemBreathNum);
    session.missingBreaths.push({
      "time": curTime,
      "value": breathsMissing
    });
    // stuff dummy breaths 1 sec apart because the fastest breath is 2 secs
    lastBreathNum = session.breathTimes.length;
    for (i = 1; i <= breathsMissing; i++) {
      session.breathTimes.push(null);
    }
    // record breaks for graphing
    session.missingBreathWindows.push({
      "startValue": lastBreathNum + 0.5,
      "endValue": lastBreathNum + breathsMissing + 0.5,
      "type": "zigzag",
      "lineColor": "black",
      "autoCalculate": true
    });
    if (!session.lastValidBreathTime) session.lastValidBreathTime = session.startDate;
    session.missingTimeWindows.push({
      "startValue": ((new Date(session.lastValidBreathTime) - session.startDate) / 1000) + 0.5,
      "endValue": ((new Date(curTime) - session.startDate) / 1000) - 0.5,
      "type": "zigzag",
      "lineColor": "black",
      "autoCalculate": true
    });
  }
  session.lastValidBreathTime = curTime;
}

function processAlertDweet(curTime, jsonData) { 
  if (typeof jsonData.content["WMSG"] != 'undefined') {
    if (session.alerts.expectWarningMsg) { // back to back with Previous msg not yet fully received
      var msg = {
        'created': session.alerts.lastWarningTime,
        'L1': session.alerts.L1,
        'L2': session.alerts.L2,
        'L3': session.alerts.L3,
        'L4': session.alerts.L4
      };
      session.warningMsgs.push(msg);
     }
     session.alerts.lastWarningTime = curTime;
     session.alerts.expectWarningMsg = true;
     session.warningValues.push({
       "time": curTime,
       "value": ++session.alerts.warningNum
     });
  }
  if (typeof jsonData.content["EMSG"] != 'undefined') {
   if (session.alerts.expectErrorMsg) { // back to back with Previous msg not yet fully received
     var msg = {
       'created': session.alerts.lastErrorTime,
       'L1': session.alerts.L1,
       'L2': session.alerts.L2,
       'L3': session.alerts.L3,
       'L4': session.alerts.L4
     };
     session.errorMsgs.push(msg);
   }
   session.alerts.lastErrorTime = curTime;
   session.alerts.expectErrorMsg = true;
   session.errorValues.push({
     "time": curTime,
     "value": ++session.alerts.errorNum
   });
  }
  for (var ckey in jsonData.content) {
    value = jsonData.content[ckey];
    if (session.alerts.L1 && session.alerts.L2 && session.alerts.L3 && session.alerts.L4) {
      if (session.alerts.expectErrorMsg || session.alerts.expectWarningMsg) {
        var msgTime;
        if (session.alerts.expectWarningMsg) {
          msgTime = session.alerts.lastWarningTime;
        } else {
          msgTime = session.alerts.lastErrorTime;
        }
        var msg = {
          'created': msgTime,
          'L1': session.alerts.L1,
          'L2': session.alerts.L2,
          'L3': session.alerts.L3,
          'L4': session.alerts.L4
        };
        if (session.alerts.expectWarningMsg) {
          session.warningMsgs.push(msg);
        } else {
          session.errorMsgs.push(msg);
        }
        session.alerts.expectWarningMsg = false;
        session.alerts.expectErrorMsg = false;
        session.alerts.L1 = session.alerts.L2 = session.alerts.L3 = session.alerts.L4 = "";
      }
    }
    if (ckey == "L1") {
      if (session.alerts.expectWarningMsg || session.alerts.expectErrorMsg) {
        if (!session.alerts.L1) session.alerts.L1 = jsonData.content['L1'];
      }
    } else if (ckey == "L2") {
      if (session.alerts.expectWarningMsg || session.alerts.expectErrorMsg) {
        if (!session.alerts.L2) session.alerts.L2 = jsonData.content['L2'];
      }
    } else if (ckey == "L3") {
      if (session.alerts.expectWarningMsg || session.alerts.expectErrorMsg) {
        if (!session.alerts.L3) session.alerts.L3 = jsonData.content['L3'];
      }
    } else if (ckey == "L4") {
      if (session.alerts.expectWarningMsg || session.alerts.expectErrorMsg) {
        if (!session.alerts.L4) session.alerts.L4 = jsonData.content['L4'];
      }
    }
  }
}

