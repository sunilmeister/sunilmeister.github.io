// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function parseMillis(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  let obj = {};
  obj.millis = (Number(arr[0]) << 32) | Number(arr[1]);
  return obj;
}

function parseMsgLines(jsonStr) {
  let msg = jsonStr.replaceAll("'", '"');
  //console.log(msg);
  let arr = parseJSONSafely(msg);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  let obj = {};
  obj.line1 = arr[0];
  obj.line2 = arr[1];
  obj.line3 = arr[2];
  obj.line4 = arr[3];
  obj.empty = (arr[0]=="") && (arr[1]=="") && (arr[2]=="") && (arr[3]=="");
  return obj;
}

// The return value is an object with following boolean fields
// {isMaintenance,isAbnormal,isError,isVC,isMandatory}
function parseBreathInfo(num) {
  num = Number(num);
  let obj = {};

  for (i = 0; i < 5; i++) {
    bit = num & 0x1;
    num = num >> 1;

    switch (i) {
      case 0:
        obj.isMandatory = bit ? true : false;
        break;
      case 1:
        obj.isVC = bit ? true : false;
        break;
      case 2:
        obj.isAbnormal = bit ? true : false;
        break;
      case 3:
        obj.isError = bit ? true : false;
        break;
      case 4:
        obj.isMaintenance = bit ? true : false;
        break;
      default:
        break;
    }
  }

  return obj;
}

function parseWaveData(jsonStr) {
  //console.log("parseWaveData", jsonStr);
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 8)) {
    return null;
  }
  let obj = {};
  obj.sysBreathNum = arr[0];
  obj.vtdel = arr[1];
  obj.iqdel = arr[2];
  obj.breathInfo = arr[3];
  obj.samplingIntervalMs = arr[4];
  obj.numSamples = arr[5];
  obj.partial = arr[6];
  obj.waveData = arr[7];

  if (obj.waveData.length < obj.numSamples) {
    obj.partial = 1;
    let len = obj.waveData.length;
    let lastSample = obj.waveData[len-1];
    for (let i=len; i<obj.numSamples; i++) {
      obj.waveData.push(lastSample);
    }
  } else if (obj.waveData.length > obj.numSamples) {
    return {}; // something very wrong
  }

  // cleanup
  for (let i=0; i < obj.waveData.length; i++) {
    if (obj.waveData[i] == WAVE_UNKNOWN_DATAPOINT) {
      obj.waveData[i] = 0;
    }
  }

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

// [hi,lo]
function parse64bitMs(hiLo) {
  if (!hiLo || (hiLo.length != 2)) {
    return null;
  }

  let ms = (Number(hiLo[0]) << 32) | Number(hiLo[1]);
  return ms;
}

// returns null if badly formed
function parseBnumData(jsonStr) {
  // console.log("BNUM",jsonStr);
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 2)) {
    return null;
  }
  let hiLo = arr[1];
  let btimeMs = parse64bitMs(hiLo);
  if (!btimeMs) {
    return null;
  }

  let val = {
    "bnum" : arr[0],
    "btime" : btimeMs
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

function parsePressureData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 3)) {
    return null;
  }

  let val = {
    peak :  (arr[0] == -1) ? null : arr[0],
    plat :  (arr[1] == -1) ? null : arr[1],
    mpeep : (arr[2] == -1) ? null : arr[2],
  }
  return val;
}

function parseBreathData(jsonStr) {
  let arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 7)) {
    return null;
  }
  let btimeMs = parse64bitMs(arr[6]);
  if (!btimeMs) return null;

  let val = {
    peak :  (arr[0] == -1) ? null : arr[0],
    plat :  (arr[1] == -1) ? null : arr[1],
    mpeep : (arr[2] == -1) ? null : arr[2],
    vtdel : (arr[3] == -1) ? null : arr[3],
    iqdel : (arr[4] == -1) ? null : arr[4],
    binfo : (arr[5] == -1) ? null : arr[5],
    btimeMs : btimeMs,
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
  if (!arr) return null;
  if (!((arr.length == 5) || (arr.length == 6))) {
    return null;
  }

  let val = {
    tempC : arr[0],
    altInFt : arr[1],
    atmInCmH20 : arr[2],
    atmO2Pct : arr[3],
    productionMode : arr[4],
  }
  if (arr.length == 6) {
    val.buzzerMuted = arr[5] ? true : false;
  } else {
    val.buzzerMuted = false;
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
  for (let key in jsonData) {
    if (key == 'content') {
      // Install the system's firmware version right up front
      // so the rest of the system can adjust if required
      if (session.firmwareVersion.major === null) {
        if (!isUndefined(jsonData.content["FWVER"])) {
          let value = jsonData.content["FWVER"];
          console.log("Found System Firmware Version",value);
          processFwChirp(curTime, value);
        }
      }

      // Now go through the rest of the chirps one by one
      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];

        // process each keyword
        if (ckey == "BNUM") {
          //console.log("Found BNUM ",value);
          processBnumChirp(curTime, value, jsonData);
        } else if (ckey == "BMUTE") {
          processBmuteChirp(curTime, value);
        } else if (ckey == "RST") {
          processResetChirp(curTime, value);
        } else if (ckey == "ATT") {
          session.params.attention.AddTimeValue(curTime, value);
        } else if (ckey == "IMSG") {
          processMsgInfo(curTime, value);
        } else if (ckey == "WMSG") {
          processMsgWarning(curTime, value);
        } else if (ckey == "EMSG") {
          processMsgError(curTime, value);
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
        } else if (ckey == "PPP") {
          //console.log("Found PRESSURES ",value);
          processPressureChirp(curTime, value);
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
// All individual Waveform data handling below
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
  let ix = 1;

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
    if (sample >= SAMPLE_FLOWQ_THRESHOLD) {
      inspIQ += (samples[ix] + samples[ix-1])/2;
      continue;
    } else if (sample <= -(SAMPLE_FLOWQ_THRESHOLD)) {
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
    if (sample >= -(SAMPLE_FLOWQ_THRESHOLD)) continue;
    expEnd = i;
    break;
  }

  for (let i=expStart; i<=expEnd; i++) {
    expIQ += (Math.abs(samples[i]) + Math.abs(samples[i-1]))/2;
  }

  return {"inspStart":inspStart, "inspEnd":inspEnd, "expStart": expStart, "expEnd":expEnd,
          "inspIQ":inspIQ, "expIQ":expIQ};
}

function findVtIqRatios(samples, changes, sampleInterval) {
  let inspTime = (changes.inspEnd - changes.inspStart + 1) * sampleInterval;
  let expTime = (changes.expEnd - changes.expStart + 1) * sampleInterval;
  // console.log("changes", changes);
  // console.log("sampleInterval",sampleInterval);
  // console.log("inspTime",inspTime);
  // console.log("expTime",expTime);

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

function convertQtoFlowLPM(samples, partial, sampleInterval, fFilterWindow) {
  //console.log("samples", samples);
  let filteredSamples = movingAverageFilter(samples, fFilterWindow);
  //console.log("filteredSamples", filteredSamples);

  let changes = findFlowChangePoints(filteredSamples);
  // console.log("changes", changes);
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
  if (!obj) return;
  let binfo = parseBreathInfo(obj.breathInfo);
  if (!binfo) return;

  // wave filters
  let pFilterWindow = VC_WAVE_PRESSURE_FILTER_WINDOW;
  if (!binfo.isVC) pFilterWindow = PS_WAVE_PRESSURE_FILTER_WINDOW;

  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);
  saveOutputChange("vtdel", curTime, obj);

  let lastSample = obj.waveData[obj.waveData.length-1];
  let filteredSamples = movingAverageFilter(obj.waveData, pFilterWindow);
  obj.waveData = filteredSamples;
  obj.waveData[obj.waveData.length-1] = lastSample; // show spontaneous trigger if any

  processWaveChirp(obj.sysBreathNum, obj.partial, obj.breathInfo, obj.samplingIntervalMs, 
    obj.waveData, session.waves.pwPartial, session.waves.pwData);
}

function processFwaveChirp(curTime, jsonStr) {
  //console.log("FWAVE", jsonStr);
  let obj = parseWaveData(jsonStr);
  if (!obj) return;
  let binfo = parseBreathInfo(obj.breathInfo);
  if (!binfo) return;

  // wave filters
  let fFilterWindow = VC_WAVE_FLOW_FILTER_WINDOW;
  if (!binfo.isVC) fFilterWindow = PS_WAVE_FLOW_FILTER_WINDOW;

  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);
  //console.log("obj.iqdel",obj.iqdel,"obj.vtdel",obj.vtdel);
  saveOutputChange("vtdel", curTime, obj);

  //console.log("obj.waveData",obj.waveData);
  //console.log("obj.samplingIntervalMs",obj.samplingIntervalMs);
  let fwData = convertQtoFlowLPM(obj.waveData, obj.partial, obj.samplingIntervalMs, fFilterWindow);
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
    'time': curTime,
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

function processPressureChirp(curTime, jsonStr) {
  let obj = parsePressureData(jsonStr);
  if (!obj) return;

  saveOutputChange("peak", curTime, obj);
  saveOutputChange("plat", curTime, obj);
  saveOutputChange("mpeep", curTime, obj);
}

function processBreathChirp(curTime, jsonStr) {
  let obj = parseBreathData(jsonStr);
  if (!obj) return;

  // Ignore any breath data received before BNUM received
  if (!session.firstBreathBnumTime) {
    return;
  }

  let btime = convertBreathMsToBreathTime(curTime, obj.btimeMs);

  saveOutputChange("peak", btime, obj);
  saveOutputChange("plat", btime, obj);
  saveOutputChange("mpeep", btime, obj);
  saveOutputChange("vtdel", btime, obj);

  session.breathData.iqdel = obj.iqdel;
  session.breathData.vtdel = obj.vtdel;
  session.breathData.vtIqRatio = (obj.vtdel / obj.iqdel);

  //console.log("binfo",obj.binfo);
  if (obj.binfo !== null) {
    let btype;
    if (session.stateData.error) {
      btype = MAINTENANCE_BREATH;
    } else {
      btype = obj.binfo & 0x1; // bit#0
      if (btype != 0) btype = MANDATORY_BREATH;
      else  btype = SPONTANEOUS_BREATH;
    }
    //console.log("btype",btype);
    session.params.btype.AddTimeValue(btime, btype);

    let bcontrol = obj.binfo & 0x2; // bit#1
    if (bcontrol != 0) bcontrol = VOLUME_CONTROL;
    else  bcontrol = PRESSURE_SUPPORT;
    //console.log("bcontrol",bcontrol);
    session.params.bcontrol.AddTimeValue(btime, bcontrol);

    let bcmvSpont = (obj.binfo & 0x20) ? true : false; // bit#5
    //console.log("bcmvSpont",bcmvSpont);
    session.params.cmvSpont.AddTimeValue(btime, bcmvSpont);
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

function processBmuteChirp(curTime, jsonStr) {
  let bmute = (jsonStr == 1);
  if (!session.buzzerMuted && bmute) {
    let msg = {
        'time': curTime,
        'L1': "Alarm Buzzer",
        'L2': "Disabled",
        'L3': "",
        'L4': ""
    };
    session.infoMsgs.push(msg);
    session.params.infos.AddTimeValue(curTime, ++session.alerts.infoNum);
  } else if (session.buzzerMuted && !bmute) {
    let msg = {
        'time': curTime,
        'L1': "Alarm Buzzer",
        'L2': "Re-enabled",
        'L3': "",
        'L4': ""
    };
    session.infoMsgs.push(msg);
    session.params.infos.AddTimeValue(curTime, ++session.alerts.infoNum);
  }
  session.buzzerMuted = bmute;
}

function processMiscChirp(curTime, jsonStr) {
  let obj = parseMiscData(jsonStr);
  if (!obj) return;
  session.productionMode = obj.productionMode;

  if ((session.productionMode !== null) && !session.productionMode) {
    // give a notification if app is dashboard
    if ((session.appId == DASHBOARD_APP_ID) || (session.appId == MINI_DASHBOARD_APP_ID)) {
	    modalInfo("SYSTEM IN DEBUG MODE", "Not Production mode");
    }
  }

  processBmuteChirp(curTime, obj.buzzerMuted);

  saveOutputChange("tempC", curTime, obj);
  saveOutputChange("buzzerMuted", curTime, obj);

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

function convertBreathMsToBreathTime(chirpTime, bnumMs) {
  if (!session.firstBreathBnumTime) {
    session.firstBreathBnumTime = new Date(chirpTime);
    session.firstBreathBnumMs = bnumMs;
  }
  let breathTime = addMsToDate(session.firstBreathBnumTime, bnumMs - session.firstBreathBnumMs);
  return breathTime;
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

  let breathTime = convertBreathMsToBreathTime(chirpTime, bnumMs);
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

  if (numMissing) {
    console.log("Missed", numMissing, "breath(s) starting BNUM", session.loggedBreaths.length);
  }
  for (let i = 0; i < numMissing; i++) {
    missingBreathTime = addMsToDate(missingBreathTime, msPerMissingBreath);
    session.params.comboChanged.AddTimeValue(missingBreathTime, false);
    session.params.errorTag.AddTimeValue(missingBreathTime,false);
    session.params.warningTag.AddTimeValue(missingBreathTime,false);
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
  if (!obj || obj.empty) return;
  session.params.lcdLine1.AddTimeValue(curTime, obj.line1);
  session.params.lcdLine2.AddTimeValue(curTime, obj.line2);
  session.params.lcdLine3.AddTimeValue(curTime, obj.line3);
  session.params.lcdLine4.AddTimeValue(curTime, obj.line4);
  processUptimeChirp(curTime, obj.line3);
}

function processMsgWarning(curTime, jsonData) {
  let obj = parseMsgLines(jsonData);
  if (!obj || obj.empty) return;
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
  if (!obj || obj.empty) return;
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
