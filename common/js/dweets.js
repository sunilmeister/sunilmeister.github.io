// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var waveBreathPartial = false;
var waveSampleInterval = null;
var waveActualSamples = null;
var waveBreathClosed = true;
var waveSlices = [];
var pwShapeSliceNum = -1;
var pwPrevShapeSliceNum = -1;
var dpwShapeSliceNum = -1;
var dpwPrevShapeSliceNum = -1;
var expectingPWEND = false;
var expectingDPWEND = false;

function parseWifiData(jsonStr) {
  console.log("Wifi " + jsonStr);
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  val = {
    dropAt : arr[0] - session.startSystemBreathNum + 1,
    reconnectAt : arr[1] - session.startSystemBreathNum + 1,
  }

  return val;
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

function parseSwData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 3)) {
    return null;
  }
  val = {
    major : arr[0],
    minor : arr[1],
    board : arr[2],
  }
  return val;
}

function parseBnumData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  val = {
    bnum : arr[0],
    btime : arr[1],
  }
  return val;
}

function parseParamData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 10)) {
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
    mv :        (arr[9] == -1) ? null : arr[9]/10,
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
    o2FlowX10 : (arr[2] == -1) ? null : arr[2],
  }
  return val;
}

function parseMinuteData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  val = {
    mbpm :  (arr[0] == -1) ? null : arr[0],
    sbpm :  (arr[1] == -1) ? null : arr[1],
    mmvdel : (arr[2] == -1) ? null : arr[2],
    smvdel : (arr[3] == -1) ? null : arr[3],
    mvdel: null,
  }
  return val;
}

function parseBreathData(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 6)) {
    return null;
  }
  val = {
    peak :  (arr[0] == -1) ? null : arr[0],
    plat :  (arr[1] == -1) ? null : arr[1],
    mpeep : (arr[2] == -1) ? null : arr[2],
    vtdel : (arr[3] == -1) ? null : arr[3],
    iqdel : (arr[4] == -1) ? null : arr[4],
    type :  (arr[5] == -1) ? null : arr[5],
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
  if (!arr || (arr.length != 4)) {
    return null;
  }
  val = {
    tempC : arr[0],
    altInFt : arr[1],
    altInM : arr[2],
    o2Pct : arr[3],
  }
  return val;
}

function equalParamCombos(curr, prev) {
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
  if (session.analyzer.recVersion) return;
  for (var key in jsonData) {
    if (key == 'content') {
      for (var ckey in jsonData.content) {
        if (ckey == "RECORDING_VERSION") {
          session.analyzer.recVersion = jsonData.content[ckey];
          console.log("Found Recording Version=" + session.analyzer.recVersion);
        }
      }
    }
  }
}

function processAllJsonRecords(key, lastRecord, lastRecordCallback) {
  var req = indexedDB.open(session.database.dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    session.database.dbReady = true;
    var tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    var store = tx.objectStore(session.database.dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function (event) {
      var jsonData = keyReq.result;
      readSessionVersion(jsonData);
      processJsonRecord(jsonData);
      if (lastRecord) {
        if (!isUndefined(lastRecordCallback)) lastRecordCallback();
      }
    }
  }
}

function gatherSessionData(lastRecordCallback) {
  session.analyzer.sessionDataValid = false;
  session.analyzer.recVersion= null;
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
  processAlertDweet(curTime, jsonData);
  for (var key in jsonData) {
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
              processPwendDweet("");
              waveBreathClosed = true;
              expectingPWEND = false;
            }
          }
        }

        // close off DPW samples if missing a closing dweet
        if (expectingDPWEND) {
          // if anything else, close of with DPWEND
          if (ckey != "DPWEND") {
            partsArray = ckey.split('_');
            if ((partsArray.length == 0) || (partsArray[0] != "DPW")) {
              //console.log("Expecting DPWEND or DPW slice but found=" + ckey);
              //console.log("Graphing anyway with DPWEND()");
              processPwendDweet("");
              waveBreathClosed = true;
              expectingDPWEND = false;
            }
          }
        }

        // process each keyword
        if (ckey == "BNUM") {
          //console.log("Found BNUM " + value);
          processBnumDweet(curTime, value, jsonData);
        } else if (ckey == "FWVER") {
          //console.log("Found FWVER " + value);
          processSwDweet(curTime, value);
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
        } else if (ckey == "CMV_SPONT") {
          session.cmvSpontChanges.push({
            "time": curTime,
            "value": value
          });
          processCmvSpontDweet(curTime, value);
        } else if (ckey == "COMP") {
          processComplianceDweet(curTime, value);
        } else if (ckey == "MISC") {
          processMiscDweet(curTime, value);
        } else if (ckey == "WIFI_STATS") {
          processWifiDweet(curTime, value);
          //console.log("WIFI_STATS " + value);
        } else if (ckey == "LOC") {
          session.miscData.locationName = value;
        } else if (ckey == "FNAME") {
          session.patientData.fname = value;
        } else if (ckey == "LNAME") {
          session.patientData.lname = value;
        } else if (ckey == "AGE") {
          session.patientData.age = value;
        } else if (ckey == "PID") {
          session.patientData.pid = value;
        } else if (ckey == "PWPERIOD") {
          session.waves.sendPeriod = value;
        } else if (ckey == "PWSTART") {
          processPwstartDweet(value);
          expectingPWEND = true;
        } else if (ckey == "PWEND") {
          processPwendDweet(value);
          expectingPWEND = false;
        } else if (ckey == "DPWSTART") {
          processPwstartDweet(value);
          expectingDPWEND = true;
        } else if (ckey == "DPWEND") {
          processPwendDweet(value);
          expectingDPWEND = false;
        } else {
          partsArray = ckey.split('_');
          if (partsArray.length == 0) continue;
          if ((partsArray[0] != "PW") && (partsArray[0] != "DPW")) continue;
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
function waveCollectedSamples(slices) {
  num = 0;
  for (i = 0; i < slices.length; i++) {
    num += slices[i].sliceData.length;
  }
  return num;
}

function processPwstartDweet(str) {
  if (!waveBreathClosed) {
    processPwendDweet("");
    waveBreathClosed = true;
  }

  if (str=="") {
    // No PWSTART arguments
    // Wait for PWEND to provide them
    waveBreathClosed = false;
    waveBreathPartial = false;
    pwPrevShapeSliceNum = -1;
    pwShapeSliceNum = -1;
    dpwPrevShapeSliceNum = -1;
    dpwShapeSliceNum = -1;
    waveSlices = [];
    return;
  }

  arr = parseJSONSafely(str);
  if (!arr || (arr.length != 5)) {
    //console.log("Bad PWSTART=" + str);
    session.waves.breathNum = null;
    waveSampleInterval = null;
    return;;
  }
  // PWSTART key has the following value format
  // arr = [breathNum, breathInfo, expectedSamples, sampleInterval]
  session.waves.breathNum = arr[0];
  session.waves.breathInfo = arr[1];
  waveExpectedSamplesPerSlice = arr[2];
  waveSampleInterval = arr[3];
  session.waves.onDemand = arr[4] ? true : false;
  waveBreathClosed = false;
  waveBreathPartial = false;
  pwPrevShapeSliceNum = -1;
  pwShapeSliceNum = -1;
  dpwPrevShapeSliceNum = -1;
  dpwShapeSliceNum = -1;
  waveSlices = [];
}

function processPwendDweet(str) {
  // PWEND key has the following value format
  // arr = [breathNum, breathInfo, actualSamples, sampleInterval]
  if (str != "") {
    arr = parseJSONSafely(str);
    if (arr && (arr.length == 5)) {
      waveActualSamples = arr[2];
      if (!session.waves.breathNum) {
        //console.log("Recovering from missing PWSTART using PWEND");
        session.waves.breathNum = arr[0];
        session.waves.breathInfo = arr[1];
        waveSampleInterval = arr[3];
        session.waves.onDemand = arr[4] ? true : false;
      }
    } else {
      //console.log("Bad PWEND=" + str);
    }
  } else {
    if (waveExpectedSamplesPerSlice) {
      waveActualSamples = waveExpectedSamplesPerSlice * WAVE_MAX_SLICES;
    } else {
      waveActualSamples = WAVE_MAX_SAMPLES_PER_BREATH;
    }
  }

  if (!session.waves.breathNum || waveBreathClosed) {
    //console.log("Missing PWSTART args for PWEND=" + str);
    pwPrevShapeSliceNum = -1;
    pwShapeSliceNum = -1;
    dpwPrevShapeSliceNum = -1;
    dpwShapeSliceNum = -1;
    waveSlices = [];
    waveBreathPartial = false;
    waveBreathClosed = true;
    return;
  }

  // consolidate all samples
  let samples = [];
  for (i = 0; i < waveSlices.length; i++) {
    slice = waveSlices[i];
    for (j = 0; j < slice.sliceData.length; j++) {
      d = slice.sliceData[j];
      if (expectingDPWEND) {
        if ((d !== null) && (session.breathData.qmult>10)) {
          // Convert delta pressure to flow value
          if (d > FLOW_THRESHOLD_DELTAP) {
            d = Math.round(Math.sqrt(d) * session.breathData.qmult);
          } else {
            d = 0;
          }
        } else {
          d = null;
        }
      }
      samples.push(d);
    }
  }
  waveSlices = [];
  if (waveActualSamples != samples.length) {
    waveBreathPartial = true;
    //console.log("Missing Samples at PWEND=" + (waveActualSamples-samples.length));
  }

  // Make it consistently WAVE_MAX_SAMPLES_PER_BREATH
  for (j = 0; j < WAVE_MAX_SAMPLES_PER_BREATH - samples.length; j++) {
    samples.push(null);
  }

  // check how many null samples we have in the first 60% where the details are
  var checkLimit = Math.floor(WAVE_MAX_SAMPLES_PER_BREATH * 6 / 10);
  var nullCount = 0;
  for (j = 0; j < checkLimit; j++) {
    if (samples[j] === null) nullCount++;
  }
  if (nullCount > (checkLimit/2)) {
    //console.log("Too few datapoints for waveform=" + 
      //(nullCount/checkLimit) + "for breath " + session.waves.breathNum);
    if (!session.waves.tooFewDatapoints.includes(session.waves.breathNum)) {
      session.waves.tooFewDatapoints.push(session.waves.breathNum);
    }
  }

  var holdingArray = null;
  if (expectingPWEND) {
    holdingArray = session.waves.pwData;
    session.waves.pwRecordedBreaths.push(session.waves.breathNum);
  } else {
    holdingArray = session.waves.flowData;
    session.waves.flowRecordedBreaths.push(session.waves.breathNum);
  }

  // store it for later use
  holdingArray.push({
    "partial": waveBreathPartial,
    "systemBreathNum": session.waves.breathNum,
    "breathInfo": session.waves.breathInfo,
    "onDemand": session.waves.onDemand,
    "sampleInterval": waveSampleInterval,
    "samples": cloneObject(samples),
  });

  waveBreathPartial = false;
  waveBreathClosed = true;
  if (session.waves.newShapeCallback) session.waves.newShapeCallback(session.waves.breathNum);
}

function processPwsliceDweet(receivedSliceNum, str) {
  //console.log("expectingPWEND=" + expectingPWEND);
  //console.log("session.waves.breathNum=" + session.waves.breathNum + " waveBreathClosed=" + waveBreathClosed);

  if (!session.waves.breathNum || waveBreathClosed) {
    waveBreathPartial = false;
    waveBreathClosed = true;
    return;
  }

  arr = parseJSONSafely(str);
  if (!arr || (arr.length != 2)) {
    return;
  }

  let sliceNum = null;
  let prevSliceNum = null;
  if (expectingPWEND) {
    pwShapeSliceNum = Number(arr[0]);
    sliceNum = pwShapeSliceNum;
    prevSliceNum = pwPrevShapeSliceNum;
  } else {
    dpwShapeSliceNum = Number(arr[0]);
    sliceNum = dpwShapeSliceNum;
    prevSliceNum = dpwPrevShapeSliceNum;
  }
  //console.log("sliceNum=" + sliceNum + " prevSliceNum=" + prevSliceNum);

  if ((sliceNum != prevSliceNum + 1) || (sliceNum != receivedSliceNum)) {
    // stuff empty slices
    waveBreathPartial = true;
    for (i = prevSliceNum + 1; i < sliceNum; i++) {
      samples = [];
      if (!session.waves.expectedSamplesPerSlice) session.waves.expectedSamplesPerSlice = WAVE_MAX_SAMPLES_PER_SLICE;
      for (j = 0; j < session.waves.expectedSamplesPerSlice; j++) {
        samples.push(null);
      }
      waveSlices.push({
        "sliceNum": i,
        sliceData: cloneObject(samples)
      });
    }
  }

  waveSlices.push({
    "sliceNum": sliceNum,
    sliceData: cloneObject(arr[1])
  });

  if (expectingPWEND) {
    pwPrevShapeSliceNum = sliceNum;
  } else {
    dpwPrevShapeSliceNum = sliceNum;
  }
}

// /////////////////////////////////////////////////////
// All other dweets below
// /////////////////////////////////////////////////////
function processWifiDweet(curTime, jsonStr) {
  obj = parseWifiData(jsonStr);
  if (!obj) return;

  session.wifi.drops.push({
    "time": curTime,
    "value": cloneObject(obj)
  });

  var msg = {
    'created': curTime,
    'breathNum': obj.reconnectAt,
    'L1': "Auto Recovered from",
    'L2': "Dropped WIFI or",
    'L3': "Server Disconnection",
    'L4': ""
  };
  session.infoMsgs.push(msg);
  session.infoChanges.push({
    "time": curTime,
    "value": ++session.alerts.infoNum
  });
}

function processStateDweet(curTime, jsonStr) {
  obj = parseStateData(jsonStr);
  if (!obj) return;
  if (obj.state == session.stateData.state) return;

  obj.prevState = session.stateData.state;
  session.stateData = cloneObject(obj);
  session.stateChanges.push({
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

  if (p1.mv == p2.mv) p.mv = false;
  else p.mv = true;

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

function processSwDweet(curTime, jsonStr) {
  obj = parseSwData(jsonStr);
  if (!obj) return;

  if (session.firmwareVersion.major === null) {
    session.firmwareVersion.major = obj.major;
    session.firmwareVersion.minor = obj.minor;
    session.firmwareVersion.board = obj.board;
    appendSwVersionToUid();
  }
}

function processParamDweet(curTime, jsonStr) {
  obj = parseParamData(jsonStr);
  if (!obj) return;

  session.paramDataOnDisplay = cloneObject(obj);
  if (!obj.pending) {
    session.paramDataInUse = cloneObject(obj);
  }
  updatePendingParamState();
  //console.log("pre OnDisplay"); console.log(session.paramDataOnDisplay);
  //console.log("pre InUse"); console.log(session.paramDataInUse);

  saveSnapComboValue("vt", "paramDataInUse", "vtUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("mv", "paramDataInUse", "mvUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("pmax", "paramDataInUse", "pmaxUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("ipeep", "paramDataInUse", "ipeepUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("ps", "paramDataInUse", "psUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("mode", "paramDataInUse", "modeUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("tps", "paramDataInUse", "tpsUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("ie", "paramDataInUse", "ieUsed", curTime, session.paramDataInUse);
  saveSnapComboValue("rr", "paramDataInUse", "rrUsed", curTime, session.paramDataInUse);
  //console.log("post OnDisplay"); console.log(session.paramDataOnDisplay);
  //console.log("post InUse"); console.log(session.paramDataInUse);
}

function processFiO2Dweet(curTime, jsonStr) {
  obj = parseFiO2Data(jsonStr);
  if (!obj) return;

  saveSnapComboTransValue("fiO2", "fiO2Data", "fiO2Used", "fiO2Changes", curTime, obj);
  saveSnapComboTransValue("o2Purity", "fiO2Data", "o2PurityUsed", "o2PurityChanges", curTime, obj);
  saveSnapComboTransValue("o2FlowX10", "fiO2Data", "o2FlowX10Used", "o2FlowX10Changes", curTime, obj);
}

function processMinuteDweet(curTime, jsonStr) {
  obj = parseMinuteData(jsonStr);
  if (!obj) return;
  if (obj.mmvdel !== null) { // valid minute volume
    obj.mmvdel = parseFloat(obj.mmvdel/1000).toFixed(1);
    obj.smvdel = parseFloat(obj.smvdel/1000).toFixed(1);
    mv = Number(obj.mmvdel) + Number(obj.smvdel);
    obj.mvdel = mv.toFixed(1);
  }

  saveSnapTransValue("mbpm", "minuteData", "mbpmChanges", curTime, obj);
  saveSnapTransValue("sbpm", "minuteData", "sbpmChanges", curTime, obj);
  saveSnapTransValue("mmvdel", "minuteData", "mmvdelChanges", curTime, obj);
  saveSnapTransValue("smvdel", "minuteData", "smvdelChanges", curTime, obj);
  saveSnapTransValue("mvdel", "minuteData", "mvdelChanges", curTime, obj);
}

function processBreathDweet(curTime, jsonStr) {
  obj = parseBreathData(jsonStr);
  if (!obj) return;
  if (session.stateData.error) obj.type = MAINTENANCE_BREATH;

  saveSnapTransValueNull("peak", "breathData", "peakChanges", curTime, obj);
  saveSnapTransValueNull("plat", "breathData", "platChanges", curTime, obj);
  saveSnapTransValueNull("mpeep", "breathData", "mpeepChanges", curTime, obj);
  saveSnapTransValue("vtdel", "breathData", "vtdelChanges", curTime, obj);
  saveSnapTransValueNull("type", "breathData", "breathTypeChanges", curTime, obj);

  session.breathData.iqdel = obj.iqdel;
  session.breathData.qmult = (obj.vtdel / (obj.iqdel*2)) * Q_SCALE_FACTOR * 1000;

}

function processComplianceDweet(curTime, jsonStr) {
  obj = parseComplianceData(jsonStr);
  if (!obj) return;
  if (obj.scomp) obj.scomp = Math.round(obj.scomp/100);
  if (obj.dcomp) obj.dcomp = Math.round(obj.dcomp/100);

  saveSnapTransValue("scomp", "complianceData", "scompChanges", curTime, obj);
  saveSnapTransValue("dcomp", "complianceData", "dcompChanges", curTime, obj);
}

function processMiscDweet(curTime, jsonStr) {
  obj = parseMiscData(jsonStr);
  if (!obj) return;

  saveSnapTransValue("tempC", "miscData", "tempChanges", curTime, obj);
  saveSnapValue("altInFt", "miscData", curTime, obj);
  saveSnapValue("altInM", "miscData", curTime, obj);
  saveSnapValue("o2Pct", "miscData", curTime, obj);
}

function saveSnapValueNull(paramName, parentName, curTime, newVal) {
  value = newVal[paramName];
  if (value === session[parentName][paramName]) return;

  session[parentName][paramName] = value;
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

function processComplianceDweet(curTime, jsonStr) {
  obj = parseComplianceData(jsonStr);
  if (!obj) return;
  if (obj.scomp) obj.scomp = Math.round(obj.scomp/100);
  if (obj.dcomp) obj.dcomp = Math.round(obj.dcomp/100);

  saveSnapTransValue("scomp", "complianceData", "scompChanges", curTime, obj);
  saveSnapTransValue("dcomp", "complianceData", "dcompChanges", curTime, obj);
}

function saveSnapValueNull(paramName, parentName, curTime, newVal) {
  value = newVal[paramName];
  if (value === session[parentName][paramName]) return;

  session[parentName][paramName] = value;
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

function saveSnapComboValueNull(paramName, parentName, uniqArrName, curTime, newVal) {
  // first check for combo
  saveComboValue(paramName, parentName, uniqArrName, curTime, newVal);
  saveSnapValueNull(paramName, parentName, curTime, newVal);
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

function saveSnapTransValueNull(paramName, parentName, valArrName, curTime, newVal) {
  // first check for transition
  saveTransValue(paramName, parentName, valArrName, curTime, newVal);
  saveSnapValueNull(paramName, parentName, curTime, newVal);
}

function saveSnapTransValue(paramName, parentName, valArrName, curTime, newVal) {
  // first check for transition
  saveTransValue(paramName, parentName, valArrName, curTime, newVal);
  saveSnapValue(paramName, parentName, curTime, newVal);
}

function processBnumDweet(curTime, value, jsonData) {
  obj = parseBnumData(value);
  if (!obj) return;

  // BNUM time is more accurate - use that for breathTimes
  if (!session.firstBreathDweetTime) session.firstBreathDweetTime = curTime;
  if (!session.firstBreathBnumTime) session.firstBreathBnumTime = obj.btime;
  var breathTime = addMsToDate(session.firstBreathDweetTime, obj.btime - session.firstBreathBnumTime);

  var bnumValue = obj.bnum;
  if (bnumValue == null) {
    console.warn("Bad BNUM value = " + value + " sys = " + session.systemBreathNum);
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

  if (session.prevSystemBreathNum == null) { // initialize
    session.prevSystemBreathNum = value - 1;
  }
  session.systemBreathNum = value;
  if (session.systemBreathNum == null) { // first BNUM
    // Take care of breaths missing right at the start
    breathsMissing = value - 1;
  } else {
    breathsMissing = session.systemBreathNum - session.prevSystemBreathNum - 1;
    if (breathsMissing < 0) breathsMissing = 0;
  }
  session.numMissingBreaths += breathsMissing;
  if (session.startSystemBreathNum == null) {
    session.startSystemBreathNum = value - session.numMissingBreaths;
    console.log("null startSystemBreathNum=" + session.startSystemBreathNum);
  }

  updateRangeOnNewBreath();
  session.prevSystemBreathNum = value;
  if (breathsMissing) {
    console.warn("Breaths Missing =" + breathsMissing);
    console.warn("Before systemBreathNum=" + session.systemBreathNum);
    session.missingBreaths.push({
      "time": breathTime,
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
      "endValue": ((new Date(breathTime) - session.startDate) / 1000) - 0.5,
      "type": "zigzag",
      "lineColor": "black",
      "autoCalculate": true
    });
    var msg = {
      'created': breathTime,
      'breathNum': session.breathTimes.length,
      'L1': String(breathsMissing) + " Interval(s) missed",
      'L2': "Info not received by",
      'L3': "Dashboard due to",
      'L4': "Packet loss"
    };
    session.infoMsgs.push(msg);
    session.infoChanges.push({
      "time": breathTime,
      "value": ++session.alerts.infoNum
    });
  }
  session.breathTimes.push(breathTime);
  session.lastValidBreathTime = breathTime;
}

function processAlertDweet(curTime, jsonData) { 
  if (!isUndefined(jsonData.content["WMSG"])) {
    if (session.alerts.expectWarningMsg) { // back to back with Previous msg not yet fully received
      var msg = {
        'created': session.alerts.lastWarningTime,
        'breathNum': session.breathTimes.length,
        'L1': session.alerts.L1,
        'L2': session.alerts.L2,
        'L3': session.alerts.L3,
        'L4': session.alerts.L4
      };
      session.warningMsgs.push(msg);
     }
     session.alerts.lastWarningTime = curTime;
     session.alerts.expectWarningMsg = true;
     session.warningChanges.push({
       "time": curTime,
       "value": ++session.alerts.warningNum
     });
  }
  if (!isUndefined(jsonData.content["EMSG"])) {
   if (session.alerts.expectErrorMsg) { // back to back with Previous msg not yet fully received
     var msg = {
       'created': session.alerts.lastErrorTime,
       'breathNum': session.breathTimes.length,
       'L1': session.alerts.L1,
       'L2': session.alerts.L2,
       'L3': session.alerts.L3,
       'L4': session.alerts.L4
     };
     session.errorMsgs.push(msg);
   }
   session.alerts.lastErrorTime = curTime;
   session.alerts.expectErrorMsg = true;
   session.errorChanges.push({
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
          'breathNum': session.breathTimes.length,
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

