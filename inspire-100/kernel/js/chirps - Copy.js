// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function parseMsgLines(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return;
  }
  let obj = {};
  obj.line1 = arr[0];
  obj.line2 = arr[1];
  obj.line3 = arr[2];
  obj.line4 = arr[3];
  return obj;
}

function parseWaveData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 7)) {
    return;
  }
  let obj = {};
  obj.sysBreathNum = arr[0];
  obj.vtdel = arr[1];
  obj.iqdel = arr[2];
  obj.breathInfo = arr[3];
  obj.samplingIntervalMs = arr[4];
  obj.partial = arr[5];
  obj.waveData = arr[6];
  return obj;
}

function parsePstats(jsonStr) {
  jsonStr = jsonStr.replace(/\'/g, '"');
  //console.log("PStats = " + jsonStr);
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }

  let val = {
    gender: (arr[0] == 'M') ? "Male" : "Female",
    age: arr[1] ? arr[1] : null,
    weight: arr[2] ? arr[2] : null,
    height: arr[3] ? arr[3] : null,
  }

  return val;
}

function parseWifiData(jsonStr) {
  //console.log("Wifi " + jsonStr);
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  let val = {
    dropAt : arr[0] - session.startSystemBreathNum + 1,
    reconnectAt : arr[1] - session.startSystemBreathNum + 1,
  }

  return val;
}

function parseStateData(jsonStr) {
  let val = {
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

function parseFwVersion(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 3)) {
    return null;
  }
  let val = {
    major : arr[0],
    minor : arr[1],
    board : arr[2],
  }
  return val;
}

// from a pattern like "[number,0xHEX_NUMBER]"
// returns null if badly formed
function parseBnumData(jsonStr) {
  let str = String(jsonStr);
  let numStr = "";

  if (str[0] != '[') return null;
  let i = 1;
  for (; i<str.length; i++) {
    if (str[i] == ',') break;
    numStr += str[i];
  }
  let bnum = Number(numStr);
  //console.log("numStr", numStr, "num", num);

  let tsStr = "";
  for (i++; i<str.length; i++) {
    if (str[i] == ']') break;
    tsStr += str[i];
  }
  let btime = Number(tsStr);

  let val = {
    "bnum" : bnum,
    "btime" : btime
  }
  return val;
}

function parseParamData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 10)) {
    return null;
  }
  let val = {
    pending :   arr[0] ? true : false,
    vt :        (arr[1] == -1) ? null : arr[1],
    pmax :      (arr[2] == -1) ? null : arr[2],
    ipeep :     (arr[3] == -1) ? null : arr[3],
    ps :        (arr[4] == -1) ? null : arr[4],
    mode :      (arr[5] == -1) ? null : arr[5],
    tps :       (arr[6] == -1) ? null : arr[6],
    ie :        (arr[7] == -1) ? null : arr[7],
    rr :        (arr[8] == -1) ? null : arr[8],
    mv :        (arr[9] == -1) ? null : arr[9]/10,
  }
  return val;
}

function parseFiO2Data(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  let val = {
    extMixer :   arr[0] ? true : false,
    fiO2 :      (arr[1] == -1) ? null : arr[1],
    o2Purity :  (arr[2] == -1) ? null : arr[2],
    o2FlowX10 : (arr[3] == -1) ? null : arr[3],
  }
  return val;
}

function parseMinuteData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  let val = {
    mbpm :  (arr[0] == -1) ? null : arr[0],
    sbpm :  (arr[1] == -1) ? null : arr[1],
    mmvdel : (arr[2] == -1) ? null : arr[2],
    smvdel : (arr[3] == -1) ? null : arr[3],
    mvdel: null,
  }
  return val;
}

function parseBreathData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 6)) {
    return null;
  }
  let val = {
    peak :  (arr[0] == -1) ? null : arr[0],
    plat :  (arr[1] == -1) ? null : arr[1],
    mpeep : (arr[2] == -1) ? null : arr[2],
    vtdel : (arr[3] == -1) ? null : arr[3],
    iqdel : (arr[4] == -1) ? null : arr[4],
    btype : (arr[5] == -1) ? null : arr[5],
  }
  return val;
}

function parseComplianceData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  let val = {
    scomp :   (arr[0] == -1) ? null : arr[0],
    dcomp :  (arr[1] == -1) ? null : arr[1],
  }
  return val;
}

function parseMiscData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  let val = {
    tempC : arr[0],
    altInFt : arr[1],
    atmInCmH20 : arr[2],
    atmO2Pct : arr[3],
  }
  return val;
}

function readSessionVersion(jsonData) {
  if (session.playback.recVersion) return;
  for (let key in jsonData) {
    if (key == 'content') {
      for (let ckey in jsonData.content) {
        if (ckey == "RECORDING_VERSION") {
          session.playback.recVersion = jsonData.content[ckey];
          console.log("Found Recording Version=" + session.playback.recVersion);
        }
      }
    }
  }
}

function processAllJsonRecords(key, lastRecord, lastRecordCallback) {
  let req = indexedDB.open(session.database.dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    let db = event.target.result;
    session.database.dbReady = true;
    let tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    let store = tx.objectStore(session.database.dbObjStoreName);
    let keyReq = store.get(key);
    keyReq.onsuccess = function (event) {
      let jsonData = keyReq.result;
      readSessionVersion(jsonData);
      if (!session.firstChirpDate) {
        session.firstChirpDate = new Date(jsonData.created);
      }
      processJsonRecord(jsonData);
      if (lastRecord) {
        if (!isUndefined(lastRecordCallback)) lastRecordCallback();
      }
    }
  }
}

function gatherSessionData(lastRecordCallback) {
  session.playback.sessionDataValid = false;
  session.playback.recVersion= null;
  if (session.playback.allDbKeys.length == 0) {
    modalAlert("Selected Session has no data", "");
    return;
  }
  let lastRecord = false;
  for (let i = 0; i < session.playback.allDbKeys.length; i++) {
    let key = session.playback.allDbKeys[i];
    if (i == (session.playback.allDbKeys.length - 1)) {
      lastRecord = true;
    }
    processAllJsonRecords(key, lastRecord, lastRecordCallback);
  }
}


function resetSignalTags(curTime, jsonData) {
  session.params.errorTag.AddTimeValueIfAbsent(curTime, false);
  session.params.warningTag.AddTimeValueIfAbsent(curTime, false);
  session.params.comboChanged.AddTimeValueIfAbsent(curTime, false);
}

function processJsonRecord(jsonData) {

  // Keep track of the time duration
  session.lastChirpDate = new Date(jsonData.created);

  let curTime = new Date(jsonData.created);
  resetSignalTags(curTime, jsonData);
  processAlertChirp(curTime, jsonData);
  for (let key in jsonData) {
    if (key == 'content') {
      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];

        // process each keyword
        if (ckey == "BNUM") {
          //console.log("Found BNUM ",value);
          processBnumChirp(curTime, value, jsonData);
        } else if (ckey == "RST") {
          processResetChirp(curTime, value);
        } else if (ckey == "ATT") {
          session.params.attention.AddTimeValue(curTime, value);
        } else if (ckey == "L1") {
          session.params.lcdLine1.AddTimeValue(curTime, value);
        } else if (ckey == "L2") {
          session.params.lcdLine2.AddTimeValue(curTime, value);
        } else if (ckey == "L3") {
          session.params.lcdLine3.AddTimeValue(curTime, value);
          processUptimeChirp(curTime, value);
        } else if (ckey == "L4") {
          session.params.lcdLine4.AddTimeValue(curTime, value);
        } else if (ckey == "WL1") {
          session.params.lcdLine1.AddTimeValue(curTime, value);
          session.params.lcdWLine1.AddTimeValue(curTime, value);
        } else if (ckey == "WL2") {
          session.params.lcdLine2.AddTimeValue(curTime, value);
          session.params.lcdWLine2.AddTimeValue(curTime, value);
        } else if (ckey == "WL3") {
          session.params.lcdLine3.AddTimeValue(curTime, value);
          session.params.lcdWLine3.AddTimeValue(curTime, value);
        } else if (ckey == "WL4") {
          session.params.lcdLine4.AddTimeValue(curTime, value);
          session.params.lcdWLine4.AddTimeValue(curTime, value);
        } else if (ckey == "EL1") {
          session.params.lcdLine1.AddTimeValue(curTime, value);
          session.params.lcdELine1.AddTimeValue(curTime, value);
        } else if (ckey == "EL2") {
          session.params.lcdLine2.AddTimeValue(curTime, value);
          session.params.lcdELine2.AddTimeValue(curTime, value);
        } else if (ckey == "EL3") {
          session.params.lcdLine3.AddTimeValue(curTime, value);
          session.params.lcdELine3.AddTimeValue(curTime, value);
        } else if (ckey == "EL4") {
          session.params.lcdLine4.AddTimeValue(curTime, value);
          session.params.lcdELine4.AddTimeValue(curTime, value);
        } else if (ckey == "FWVER") {
          //console.log("Found FWVER " + value);
          processFwChirp(curTime, value);
        } else if (ckey == "STATE") {
          processStateChirp(curTime, value);
        } else if (ckey == "PARAM") {
          processParamChirp(curTime, value);
        } else if (ckey == "FIO2") {
          processFiO2Chirp(curTime, value);
        } else if (ckey == "MINUTE") {
          processMinuteChirp(curTime, value);
        } else if (ckey == "BREATH") {
          //console.log("Found BREATH ",value);
          processBreathChirp(curTime, value);
        } else if (ckey == "COMP") {
          processComplianceChirp(curTime, value);
        } else if (ckey == "MISC") {
          processMiscChirp(curTime, value);
        } else if (ckey == "WIFI_STATS") {
          processWifiChirp(curTime, value);
          //console.log("WIFI_STATS " + value);
        } else if (ckey == "LOC") {
          session.miscData.locationName = value;
        } else if (ckey == "FNAME") {
          session.patientData.fname = value;
        } else if (ckey == "LNAME") {
          session.patientData.lname = value;
        } else if (ckey == "PSTATS") {
          processPstatsChirp(curTime, value);
        } else if (ckey == "WPERIOD") {
          session.waves.sendPeriod = value;
        } else if (ckey == "FWAVE") {
          //console.log(ckey, value);
          processFwaveChirp(curTime, value);
        } else if (ckey == "PWAVE") {
          processPwaveChirp(curTime, value);
          //console.log(ckey, value);
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
  for (let i = 0; i < slices.length; i++) {
    num += slices[i].sliceData.length;
  }
  return num;
}

function checkIfLoggedValidBreath(sysBnum) {
  if (session.startSystemBreathNum === null) return false;
  let n = session.loggedBreaths.length;
  if (n==1) return false;

  let bnum = sysBnum - session.startSystemBreathNum + 1;
  if (isUndefined(session.loggedBreaths[bnum])) return false;
  return !session.loggedBreaths[bnum].missed;
}

function findFlowChangePoints(samples) {
  //console.log("samples",samples);
  let inspStart, inspEnd, expStart, expEnd;
  let inspIQ = 0;
  let expIQ = 0;
  let ix = 0;

  // find start of +ve flow
  for (; ix < samples.length; ix++) {
    let sample = samples[ix];
    if (sample <= SAMPLE_FLOWQ_THRESHOLD) continue;
    inspStart = ix;
    break;
  }

  // find end of +ve flow
  for (; ix < samples.length; ix++) {
    let sample = samples[ix];
    if (sample > SAMPLE_FLOWQ_THRESHOLD) {
      inspIQ += (samples[ix] + samples[ix-1])/2;
      continue;
    } else if (sample <= -SAMPLE_FLOWQ_THRESHOLD) {
      inspEnd = ix;
      break;
    }
  }

  // find start of -ve flow
  expStart = inspEnd+1;

  // Go backwards - find end of -ve flow
  expEnd = samples.length - 1;
  for (let i=samples.length-1; i>ix; i--) {
    let sample = samples[i];
    if (sample > -SAMPLE_FLOWQ_THRESHOLD) continue;
    expEnd = i;
    break;
  }

  for (let i=expStart; i<=expEnd; i++) {
    expIQ += (Math.abs(samples[i]) + Math.abs(samples[i+1]))/2;
  }

  return {"inspStart":inspStart, "inspEnd":inspEnd, "expStart": expStart, "expEnd":expEnd,
          "inspIQ":inspIQ, "expIQ":expIQ};
}

function findVtIqRatios(samples, changes, sampleInterval) {
  let inspTime = (changes.inspEnd - changes.inspStart + 1) * sampleInterval;
  let expTime = (changes.expEnd - changes.expStart + 1) * sampleInterval;

  let inspVtIqRatio = session.breathData.vtIqRatio * 1000 / inspTime;
  let expVtIqRatio = session.breathData.vtIqRatio * 1000 / expTime * (changes.inspIQ / changes.expIQ);

  return {"inspVtIqRatio": inspVtIqRatio, "expVtIqRatio": expVtIqRatio};
}

function computeIntegral(samples, sampleInterval, fromIx, toIx) {
  let prevSample = 0;
  let integral = 0;
  for (let i=fromIx; i<=toIx; i++) {
    let sample = samples[i];
    let area = (sample + prevSample) * sampleInterval / 2;
    integral += area;
    prevSample = sample;
  }
  return integral;
}

function convertQtoFlowLPM(samples, partial, sampleInterval) {
  //console.log("samples", samples);
  let filteredSamples = movingAverageFilter(samples, WAVE_FLOW_FILTER_WINDOW);
  //console.log("filteredSamples", filteredSamples);

  let changes = findFlowChangePoints(filteredSamples);
  //console.log("changes", changes);
  let vtIqRatios = findVtIqRatios(filteredSamples, changes, sampleInterval);
  //console.log("vtIqRatios", vtIqRatios);

  let flowSamples = [];
  for (let i = 0; i < filteredSamples.length; i++) {
    let Q = filteredSamples[i];
    if (Q !== null) {
      if (i<changes.inspStart) {
        Q = 0;
      } else if (i<=changes.inspEnd) {
        if (Q > 0) Q = (Q * vtIqRatios.inspVtIqRatio);
        else Q = 0;
      } else if (i <= changes.expStart) {
        Q = 0;
      } else if (i <= changes.expEnd) {
        if (Q < 0) Q = (Q * vtIqRatios.expVtIqRatio);
        else Q = 0;
      } else {
        Q = 0;
      }
    }
    Q = Q*60;
    //if (partial && (Q<-100)) Q = -100; // missing data points can cause strange Qs
    flowSamples.push(Q);
  }

  // Final adjustment to inspiration flow samples
  let inspArea = computeIntegral(flowSamples, sampleInterval, 
    changes.inspStart, changes.inspEnd);
  let inspVol = (inspArea * 1000) / (60 * 1000);
  let inspRatio = session.breathData.vtdel/inspVol;
  if (inspArea != 0) {
    for (let i = changes.inspStart; i <= changes.inspEnd; i++) {
      flowSamples[i] *= inspRatio;
    }
  }

  // Final adjustment to expiration flow samples
  inspArea = computeIntegral(flowSamples, sampleInterval, 
    changes.inspStart, changes.inspEnd);
  let expArea = computeIntegral(flowSamples, sampleInterval, 
    changes.expStart, changes.expEnd);
  let expRatio = Math.abs(inspArea/expArea);
  if (expArea != 0) {
    for (let i = changes.expStart; i <= changes.expEnd; i++) {
      flowSamples[i] *= expRatio;
    }
  }

  //console.log("inspArea",inspArea,"expArea",expArea,"vtdel",session.breathData.vtdel);
  //console.log("inspArea",inspArea,"inspVol",inspVol,"vtdel",session.breathData.vtdel);

  return flowSamples;
}

function createVolumeWaveData(flowData, samplingIntervalMs) {
  let volData = [];
  let mlpmsPrev = 0;
  let vol = 0;
  for (let i=0; i<flowData.length; i++) {
    let lpm = flowData[i];
    let mlpms = (lpm * 1000) / (60 * 1000);
    let v = (mlpms + mlpmsPrev) * samplingIntervalMs / 2;
    vol += v;
    if (vol < 0) vol = 0;
    mlpmsPrev = mlpms;
    volData.push(vol);
  }
  return volData;
}

function processPwaveChirp(curTime, jsonStr) {
  //console.log("PWAVE", jsonStr);
  let obj = parseWaveData(jsonStr);
  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);
  saveOutputChange("vtdel", curTime, obj);

  let lastSample = obj.waveData[obj.waveData.length-1];
  let filteredSamples = movingAverageFilter(obj.waveData, WAVE_PRESSURE_FILTER_WINDOW);
  obj.waveData = filteredSamples;
  obj.waveData[obj.waveData.length-1] = lastSample; // show spontaneous trigger if any

  processWaveChirp(obj.sysBreathNum, obj.partial, obj.breathInfo, obj.samplingIntervalMs, 
    obj.waveData, session.waves.pwPartial, session.waves.pwData);
}

function processFwaveChirp(curTime, jsonStr) {
  //console.log("FWAVE", jsonStr);
  let obj = parseWaveData(jsonStr);
  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);
  saveOutputChange("vtdel", curTime, obj);

  let fwData = convertQtoFlowLPM(obj.waveData, obj.partial, obj.samplingIntervalMs);
  processWaveChirp(obj.sysBreathNum, obj.partial, obj.breathInfo, obj.samplingIntervalMs, 
    fwData, session.waves.fwPartial, session.waves.fwData);

  let vwData = createVolumeWaveData(fwData, obj.samplingIntervalMs);
  processWaveChirp(obj.sysBreathNum, obj.partial, obj.breathInfo, obj.samplingIntervalMs, 
    vwData, session.waves.vwPartial, session.waves.vwData);
}

function processWaveChirp(sysBreathNum, partial, breathInfo, samplingIntervalMs, waveData, 
                          partialArray, dataArray) {
  if (sysBreathNum < session.startSystemBreathNum) return;

  if (checkIfLoggedValidBreath(sysBreathNum)) {
    if (partial) {
      if (!partialArray.includes(sysBreathNum)) {
        partialArray.push(sysBreathNum);
      }
    }
    let dashBnum = sysBreathNum - session.startSystemBreathNum + 1;
    for (let i=dataArray.length-1; i<dashBnum; i++) {
      // create a new entry in data array
      dataArray.push(null);
    }

    if (dataArray.length > dashBnum+1) {
      console.log("#### Out-of-order Waveform SysBreathNum",sysBreathNum,
                  "DashBreathNum",dashBnum);
    }

    // Note that this will also take care of waveforms received out of order
    dataArray[dashBnum] = {
      "partial": partial,
      "systemBreathNum": sysBreathNum,
      "breathInfo": breathInfo,
      "sampleInterval": samplingIntervalMs,
      "samples": cloneObject(waveData),
    };

  }
}

// /////////////////////////////////////////////////////
// All other chirps below
// /////////////////////////////////////////////////////
function processPstatsChirp(curTime, jsonStr) {
  let obj = parsePstats(jsonStr);
  if (!obj) return;

  session.patientData.gender = obj.gender;
  session.patientData.age = obj.age;
  session.patientData.weight = obj.weight;
  session.patientData.height = obj.height;
}

function processWifiChirp(curTime, jsonStr) {
  let obj = parseWifiData(jsonStr);
  if (!obj) return;

  session.params.wifiDrops.AddTimeValue(curTime, obj.dropAt);
  session.params.wifiReconns.AddTimeValue(curTime, obj.reconnectAt);

  let msg = {
    'created': curTime,
    'breathNum': obj.reconnectAt,
    'L1': "Auto Recovered from",
    'L2': "Dropped WIFI or",
    'L3': "Server Disconnection",
    'L4': ""
  };
  session.infoMsgs.push(msg);
  session.params.infos.AddTimeValue(curTime, ++session.alerts.infoNum);
}

function processResetChirp(curTime, jsonStr) {
  let resetStatus = Number(jsonStr);
  //console.log("prevChirpResetStatus",session.prevChirpResetStatus,"resetStatus",resetStatus);
  if (resetStatus == session.prevChirpResetStatus) {
    // System will keep sending Timout/Decline messages till reset is pressed again
    if ((resetStatus == RESET_TIMEOUT) || (resetStatus == RESET_DECLINED)) {
      resetStatus = RESET_NONE;
    }
  } else {
    session.prevChirpResetStatus = resetStatus;
  }
  session.params.resetStatus.AddTimeValue(curTime, resetStatus);
}

function processStateChirp(curTime, jsonStr) {
  let obj = parseStateData(jsonStr);
  if (!obj) return;
  if (obj.state == session.stateData.state) return;

  obj.prevState = session.stateData.state;
  session.stateData = cloneObject(obj);
  session.params.state.AddTimeValue(curTime, obj.state);
}

function updatePendingParamState(curTime, onDisplay, settingsInUse) {
  let params = session.params;
  let p1 = onDisplay;
  let p2 = settingsInUse;

  if (p1.vt == p2.vt) params.pendingVt.AddTimeValue(curTime, null);
  else params.pendingVt.AddTimeValue(curTime, p1.vt);

  if (p1.mv == p2.mv) params.pendingMv.AddTimeValue(curTime, null);
  else params.pendingMv.AddTimeValue(curTime, p1.mv);

  if (p1.pmax == p2.pmax) params.pendingPmax.AddTimeValue(curTime, null);
  else params.pendingPmax.AddTimeValue(curTime, p1.pmax);

  if (p1.ipeep == p2.ipeep) params.pendingIpeep.AddTimeValue(curTime, null);
  else params.pendingIpeep.AddTimeValue(curTime, p1.ipeep);

  if (p1.ps == p2.ps) params.pendingPs.AddTimeValue(curTime, null);
  else params.pendingPs.AddTimeValue(curTime, p1.ps);

  if (p1.mode == p2.mode) params.pendingMode.AddTimeValue(curTime, null);
  else params.pendingMode.AddTimeValue(curTime, p1.mode);

  if (p1.tps == p2.tps) params.pendingTps.AddTimeValue(curTime, null);
  else params.pendingTps.AddTimeValue(curTime, p1.tps);

  if (p1.ie == p2.ie) params.pendingIe.AddTimeValue(curTime, null);
  else params.pendingIe.AddTimeValue(curTime, p1.ie);

  if (p1.rr == p2.rr) params.pendingRr.AddTimeValue(curTime, null);
  else params.pendingRr.AddTimeValue(curTime, p1.rr);
}

function processFwChirp(curTime, jsonStr) {
  let obj = parseFwVersion(jsonStr);
  if (!obj) return;

  if (session.firmwareVersion.major === null) {
    session.firmwareVersion.major = obj.major;
    session.firmwareVersion.minor = obj.minor;
    session.firmwareVersion.board = obj.board;
    appendFwVersionToUid();
  }
}

function saveInputChange(paramName, time, parsedObj) {
  session.params[paramName].AddTimeValue(time, parsedObj[paramName]);
}

function saveOutputChange(paramName, time, parsedObj) {
  session.params[paramName].AddTimeValue(time, parsedObj[paramName]);
}

function saveMiscValue(paramName, parsedObj) {
  session.miscData[paramName] = parsedObj[paramName];
}

function processParamChirp(curTime, jsonStr) {
  let obj = parseParamData(jsonStr);
  if (!obj) return;

  let onDisplay = cloneObject(obj);
  if (!obj.pending) {
    if (!equalObjects(session.settingsInUse, onDisplay)) {
      session.params.comboChanged.AddTimeValue(curTime, true);
    }
    session.settingsInUse = cloneObject(obj);
    session.settingsInUse.pending = false;
  } else {
      session.params.comboChanged.AddTimeValueIfAbsent(curTime, false);
  }
  updatePendingParamState(curTime, onDisplay, session.settingsInUse);
  session.params.somePending.AddTimeValue(curTime, obj.pending);

  if (!obj.pending) {
    saveInputChange("vt", curTime, obj);
    saveInputChange("mv", curTime, obj);
    saveInputChange("pmax", curTime, obj);
    saveInputChange("ipeep", curTime, obj);
    saveInputChange("ps", curTime, obj);
    saveInputChange("mode", curTime, obj);
    saveInputChange("tps", curTime, obj);
    saveInputChange("ie", curTime, obj);
    saveInputChange("rr", curTime, obj);
  }
}

function processFiO2Chirp(curTime, jsonStr) {
  let obj = parseFiO2Data(jsonStr);
  if (!obj) return;

  session.fiO2Data.externalMixer =  obj.extMixer;
  saveInputChange("fiO2", curTime, obj);
  saveInputChange("o2Purity", curTime, obj);
  saveInputChange("o2FlowX10", curTime, obj);
}

function processMinuteChirp(curTime, jsonStr) {
  let obj = parseMinuteData(jsonStr);
  if (!obj) return;
  if (obj.mmvdel !== null) { // valid minute volume
    obj.mmvdel = parseFloat(obj.mmvdel/1000).toFixed(1);
    obj.smvdel = parseFloat(obj.smvdel/1000).toFixed(1);
    mv = Number(obj.mmvdel) + Number(obj.smvdel);
    obj.mvdel = mv.toFixed(1);
  }

  saveOutputChange("mbpm", curTime, obj);
  saveOutputChange("sbpm", curTime, obj);
  saveOutputChange("mmvdel", curTime, obj);
  saveOutputChange("smvdel", curTime, obj);
  saveOutputChange("mvdel", curTime, obj);
}

function processBreathChirp(curTime, jsonStr) {
  let obj = parseBreathData(jsonStr);
  if (!obj) return;

  // Ignore any breath data received before BNUM received
  // except PEEP
  if (!session.firstBreathBnumTime) {
    saveOutputChange("mpeep", curTime, obj);
    return;
  }

  if (session.stateData.error) obj.btype = MAINTENANCE_BREATH;

  saveOutputChange("peak", curTime, obj);
  saveOutputChange("plat", curTime, obj);
  saveOutputChange("mpeep", curTime, obj);
  saveOutputChange("vtdel", curTime, obj);
  saveOutputChange("btype", curTime, obj);

  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);

  // infer the breath control
  let mode = session.params.mode.LastChangeValue();
  if (obj.btype == SPONTANEOUS_BREATH) {
    if ((MODE_DECODER[mode] == "SIMV") || (MODE_DECODER[mode] == "PSV")) {
      session.params.bcontrol.AddTimeValue(curTime, PRESSURE_SUPPORT);
    } else {
      session.params.bcontrol.AddTimeValue(curTime, VOLUME_CONTROL);
    }
  } else {
    session.params.bcontrol.AddTimeValue(curTime, VOLUME_CONTROL);
  }
}

function processComplianceChirp(curTime, jsonStr) {
  let obj = parseComplianceData(jsonStr);
  if (!obj) return;
  if (obj.scomp) obj.scomp = Math.round(obj.scomp/100);
  if (obj.dcomp) obj.dcomp = Math.round(obj.dcomp/100);

  saveOutputChange("scomp", curTime, obj);
  saveOutputChange("dcomp", curTime, obj);
}

function processMiscChirp(curTime, jsonStr) {
  let obj = parseMiscData(jsonStr);
  if (!obj) return;

  saveOutputChange("tempC", curTime, obj);
  saveMiscValue("altInFt", obj);
  saveMiscValue("atmInCmH20", obj);
  saveMiscValue("atmO2Pct", obj);
}

function processComplianceChirp(curTime, jsonStr) {
  let obj = parseComplianceData(jsonStr);
  if (!obj) return;
  if (obj.scomp) obj.scomp = Math.round(obj.scomp/100);
  if (obj.dcomp) obj.dcomp = Math.round(obj.dcomp/100);

  saveOutputChange("scomp", curTime, obj);
  saveOutputChange("dcomp", curTime, obj);
}

function saveSnapValueNull(paramName, parentName, curTime, newVal) {
  value = newVal[paramName];
  if (value === session[parentName][paramName]) return;

  session[parentName][paramName] = value;
}

function processBnumChirp(curTime, value, jsonData) {
  // Parse for breath info
  let obj = parseBnumData(value);
  if (!obj) return;
  let bnumValue = obj.bnum;
  let bnumMs = obj.btime;
  if (bnumValue == null) {
    console.error("Bad BNUM value = ", value, " systemBreathNum = ", session.systemBreathNum);
    return; // will count as missing
  }
  bnumValue = Number(bnumValue);
  let chirpTime = new Date(curTime);
  let len = session.loggedBreaths.length;
  let numLoggedBreaths = len - 1;
  let prevBreathTime = session.loggedBreaths[numLoggedBreaths].time;

  // Housekeeping tasks
  let breathsMissing = 0;
  let outOfOrder = false;
  if (session.firstBnumChirp) {
    session.firstBnumChirp = false;
    breathsMissing = 0;
    outOfOrder = false;
    session.startSystemBreathNum = bnumValue;
    console.log("startSystemBreathNum", session.startSystemBreathNum);
  } else {
    breathsMissing = bnumValue - numLoggedBreaths - session.startSystemBreathNum;
    //console.log("breathsMissing",breathsMissing,"bnumValue",bnumValue,"numLoggedBreaths",numLoggedBreaths);
    if (breathsMissing < 0) { // out of order breath number
      breathsMissing = 0;
      outOfOrder = true;
    } else {
      outOfOrder = false;
    }
  }
  session.systemBreathNum = bnumValue;
  if (!session.firstBreathBnumTime) {
    session.firstBreathBnumTime = new Date(chirpTime);
    session.firstBreathBnumMs = bnumMs;
  }

  let breathTime = addMsToDate(session.firstBreathBnumTime, bnumMs - session.firstBreathBnumMs);
  //console.log("chirpTime",chirpTime);
  //console.log("breathTime",breathTime);
  if (breathsMissing) {
    fillMissingBreathsDummyInfo(prevBreathTime, breathTime, breathsMissing);
  }
  updateLoggedBreaths(bnumValue, breathTime, false);
  updateRangeOnNewBreath();
}

function fillMissingBreathsDummyInfo(prevBreathTime, newBreathTime, numMissing) {
  // stuff dummy breaths equally spaced in the missing time interval
  let lastBreathNum = session.loggedBreaths.length;
  let numIntervals = numMissing + 1;
  let missingTimeInterval = newBreathTime.getTime() - prevBreathTime.getTime();
  let msPerMissingBreath = missingTimeInterval / numIntervals;
  let missingBreathTime = prevBreathTime;

  for (let i = 0; i < numMissing; i++) {
    missingBreathTime = addMsToDate(missingBreathTime, msPerMissingBreath);
    session.params.comboChanged.AddTimeValue(missingBreathTime, false);
    session.params.errorTag.AddTimeValue(missingBreathTime,false);
    session.params.warningTag.AddTimeValue(missingBreathTime,false);
    console.log("Missed BNUM ", session.loggedBreaths.length);
    session.loggedBreaths.push({time:missingBreathTime, missed:true});
  }
}

function updateLoggedBreaths(bnumValue, breathTime) {
  let len = session.loggedBreaths.length;
  let bnumIx = bnumValue - session.startSystemBreathNum + 1;
  //console.log("***********", bnumIx, len);

  let outOfOrder = false;
  if (bnumIx < len) {
    outOfOrder = true;
    if (!session.loggedBreaths[bnumIx].missed) {
      return; // duplicate
    }
  }

  let numLoggedBreaths = len - 1;
  let prevBreathTime = session.loggedBreaths[numLoggedBreaths].time;

  if (!outOfOrder) {
    session.loggedBreaths.push({time:breathTime, missed:false});
  } else {
    if (session.loggedBreaths[bnumIx].missed) {
      console.log("Previously missed System BREATH Number", bnumValue, "received out of order");
    }
    session.loggedBreaths[bnumIx].time = breathTime;
    session.loggedBreaths[bnumIx].missed = false;
  }
  session.params.breathNum.AddTimeValue(breathTime, bnumValue);
}

function validErrorLine(jsonData) {
  if (!isUndefined(jsonData.content["EL1"]) && (jsonData.content["EL1"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["EL2"]) && (jsonData.content["EL2"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["EL3"]) && (jsonData.content["EL3"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["EL4"]) && (jsonData.content["EL4"] != "")) {
    return true;
  }
  return false;
}

function validWarningLine(jsonData) {
  if (!isUndefined(jsonData.content["WL1"]) && (jsonData.content["WL1"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["WL2"]) && (jsonData.content["WL2"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["WL3"]) && (jsonData.content["WL3"] != "")) {
    return true;
  }
  if (!isUndefined(jsonData.content["WL4"]) && (jsonData.content["WL4"] != "")) {
    return true;
  }
  return false;
}

function processAlertChirp(curTime, jsonData) { 
  if (validWarningLine(jsonData)) {
    session.params.warnings.AddTimeValue(curTime, ++session.alerts.warningNum);
    session.params.warningTag.AddTimeValue(curTime,true);
  }
  if (validErrorLine(jsonData)) {
    session.params.errors.AddTimeValue( curTime, ++session.alerts.errorNum);
    session.params.errorTag.AddTimeValue(curTime,true);
  }
}

function processUptimeChirp(curTime, jsonData) {
  let matchStr = "(H:M:S)";
  let pos = jsonData.search(matchStr);
  if (pos >= 0) {
    let arr = jsonData.split(' ');
    let tstr = "";
    for (let i=0; i<arr.length; i++) {
      tstr = arr[i];
      if ((tstr != matchStr) && (tstr != "")) break;
    }

    if (!tstr) return;
    arr = tstr.split(':');
    let mins = Number(arr[0])*60 + Number(arr[1]);
    if (Number(arr[2] >= 30)) mins++;
    session.params.upTimeMins.AddTimeValue(curTime,mins);
    //console.log("UpTime", mins);
  }
}

function processMsgInfo(curTime, jsonData) {
  let obj = parseMsgLines(jsonData);
  if (!obj) return;
  session.params.lcdLine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdLine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdLine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdLine4.AddTimeValue(curTime, obj.line4);
}

function processMsgWarning(curTime, jsonData) {
  let obj = parseMsgLines(jsonData);
  if (!obj) return;
  session.params.lcdLine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdLine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdLine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdLine4.AddTimeValue(curTime, obj.line4);

  session.params.lcdWLine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdWLine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdWLine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdWLine4.AddTimeValue(curTime, obj.line4);

  session.params.warnings.AddTimeValue(curTime, ++session.alerts.warningNum);
  session.params.warningTag.AddTimeValue(curTime,true);
}

function processMsgError(curTime, jsonData) {
  let obj = parseMsgLines(jsonData);
  if (!obj) return;
  session.params.lcdLine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdLine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdLine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdLine4.AddTimeValue(curTime, obj.line4);

  session.params.lcdELine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdELine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdELine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdELine4.AddTimeValue(curTime, obj.line4);

  session.params.errors.AddTimeValue(curTime, ++session.alerts.errorNum);
  session.params.errorTag.AddTimeValue(curTime,true);
}
