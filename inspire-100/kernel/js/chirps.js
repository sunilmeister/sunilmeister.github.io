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

function parsePstats(jsonStr) {
  jsonStr = jsonStr.replace(/\'/g, '"');
  //console.log("PStats = " + jsonStr);
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }

  val = {
    gender: (arr[0] == 'M') ? "Male" : "Female",
    age: arr[1] ? arr[1] : null,
    weight: arr[2] ? arr[2] : null,
    height: arr[3] ? arr[3] : null,
  }

  return val;
}

function parseWifiData(jsonStr) {
  //console.log("Wifi " + jsonStr);
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

var settingsInUse = {
  pending : null,
  vt : null,
  mv : null,
  pmax : null,
  ipeep : null,
  ps : null,
  mode : null,
  tps : null,
  ei : null,
  rr : null,
};

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
    mode :      (arr[5] == -1) ? null : arr[5],
    tps :       (arr[6] == -1) ? null : arr[6],
    ie :        (arr[7] == -1) ? null : arr[7],
    rr :        (arr[8] == -1) ? null : arr[8],
    mv :        (arr[9] == -1) ? null : arr[9]/10,
  }
  return val;
}

function parseFiO2Data(jsonStr) {
  arr = parseJSONSafely(jsonStr);
  if (!arr || (arr.length != 4)) {
    return null;
  }
  val = {
    extMixer :   arr[0] ? true : false,
    fiO2 :      (arr[1] == -1) ? null : arr[1],
    o2Purity :  (arr[2] == -1) ? null : arr[2],
    o2FlowX10 : (arr[3] == -1) ? null : arr[3],
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
    btype : (arr[5] == -1) ? null : arr[5],
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
	if (session.firstChirpDate === null) session.firstChirpDate = new Date(jsonData.created);
	session.lastChirpDate = new Date(jsonData.created);

  let curTime = new Date(jsonData.created);
	resetSignalTags(curTime, jsonData);
  processAlertChirp(curTime, jsonData);
  for (let key in jsonData) {
    if (key == 'content') {
      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];

        // close off PW samples if missing a closing chirp
        if (expectingPWEND) {
          // if anything else, close of with PWEND
          if (ckey != "PWEND") {
            partsArray = ckey.split('_');
            if ((partsArray.length == 0) || (partsArray[0] != "PW")) {
              //console.log("Expecting PWEND or PW slice but found=" + ckey);
              //console.log("Graphing anyway with PWEND()");
              processPwendChirp("");
              waveBreathClosed = true;
              expectingPWEND = false;
            }
          }
        }

        // close off DPW samples if missing a closing chirp
        if (expectingDPWEND) {
          // if anything else, close of with DPWEND
          if (ckey != "DPWEND") {
            partsArray = ckey.split('_');
            if ((partsArray.length == 0) || (partsArray[0] != "DPW")) {
              //console.log("Expecting DPWEND or DPW slice but found=" + ckey);
              //console.log("Graphing anyway with DPWEND()");
              processPwendChirp("");
              waveBreathClosed = true;
              expectingDPWEND = false;
            }
          }
        }

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
          processSwChirp(curTime, value);
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
        } else if (ckey == "CMV_SPONT") {
          processCmvSpontChirp(curTime, value);
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
        } else if (ckey == "PWPERIOD") {
          session.waves.sendPeriod = value;
        } else if (ckey == "PWSTART") {
          processPwstartChirp(value);
          expectingPWEND = true;
        } else if (ckey == "PWEND") {
          processPwendChirp(value);
          expectingPWEND = false;
        } else if (ckey == "DPWSTART") {
          processPwstartChirp(value);
          expectingDPWEND = true;
        } else if (ckey == "DPWEND") {
          processPwendChirp(value);
          expectingDPWEND = false;
        } else {
          partsArray = ckey.split('_');
          if (partsArray.length == 0) continue;
          if ((partsArray[0] != "PW") && (partsArray[0] != "DPW")) continue;
          sNum = partsArray[1];
          processPwsliceChirp(sNum, value);
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

function processPwstartChirp(str) {
  if (!waveBreathClosed) {
    processPwendChirp("");
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
    console.log("Bad PWSTART=" + str);
    session.waves.breathNum = null;
    waveSampleInterval = null;
    return;;
  }
  // PWSTART key has the following value format
  // arr = [breathNum, breathInfo, expectedSamples, sampleInterval, inspTime]
  session.waves.breathNum = arr[0];
  session.waves.breathInfo = arr[1];
  waveExpectedSamplesPerSlice = arr[2];
  waveSampleInterval = arr[3];
  session.waves.onDemand = arr[4] ? false : true;
  waveBreathClosed = false;
  waveBreathPartial = false;
  pwPrevShapeSliceNum = -1;
  pwShapeSliceNum = -1;
  dpwPrevShapeSliceNum = -1;
  dpwShapeSliceNum = -1;
  waveSlices = [];
}

function movingAverageFilter(samples) {
	const order = 3;
	let filteredSamples = [];
  let win = order;

  for (let i = 0; i < samples.length; i++) {
    if ((i+1) < order) {
        win = i+1;
    } else {
        win = order;
    }
    let sum = 0;
    for (let j = 0; j < win; j++) {
        sum += samples[i-j];
    }
    filteredSamples.push(sum / win);
  }

  return filteredSamples;
}

function findFlowChangePoints(samples) {
	//console.log("samples",samples);
	let inspStart, expStart, expEnd;
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
		if (sample > SAMPLE_FLOWQ_THRESHOLD) continue;
		expStart = ix;
		break;
	}

	// Go backwards - find end of -ve flow
	for (let i=samples.length-1; i>ix; i--) {
		let sample = samples[i];
		if (sample > -SAMPLE_FLOWQ_THRESHOLD) continue;
		expEnd = i;
		break;
	}

	return {"inspStart":inspStart, "expStart": expStart, "expEnd":expEnd};
}

function findQmults(samples, changes) {
	let inspTime = (changes.expStart - changes.inspStart + 1) * waveSampleInterval;
	let expTime = (changes.expEnd - changes.expStart + 1) * waveSampleInterval;

	let inspQmult = session.breathData.qmult * 1000 / inspTime;
	let expQmult = session.breathData.qmult * 1000 / expTime;

	return {"inspQmult": inspQmult, "expQmult": expQmult};
}

function convertQtoFlow(waveSlices) {
	let samples = [];
  for (let i = 0; i < waveSlices.length; i++) {
    slice = waveSlices[i];
    for (let j = 0; j < slice.sliceData.length; j++) {
      let Q = slice.sliceData[j];
      samples.push(Q);
    }
  }

	let filteredSamples = movingAverageFilter(samples);

	let changes = findFlowChangePoints(filteredSamples);
	//console.log("changes", changes);
	let qmults = findQmults(filteredSamples, changes);
	//console.log("qmults", qmults);

	let flowSamples = [];
  for (let i = 0; i < filteredSamples.length; i++) {
    let Q = filteredSamples[i];
		if (Q !== null) {
      Q = (Q * qmults.inspQmult);
		  if (Math.abs(Q) < FLOW_IGNORE_THRESHOLD) Q = 0;
		}
    flowSamples.push(Q);
	}

	return flowSamples;
}


function processPwendChirp(str) {
  // PWEND key has the following value format
  // arr = [breathNum, breathInfo, actualSamples, sampleInterval, inspTime]
  if (str != "") {
    arr = parseJSONSafely(str);
    if (arr && (arr.length == 5)) {
      waveActualSamples = arr[2];
      if (!session.waves.breathNum) {
        //console.log("Recovering from missing PWSTART using PWEND");
        session.waves.breathNum = arr[0];
        session.waves.breathInfo = arr[1];
        waveSampleInterval = arr[3];
        session.waves.onDemand = arr[4] ? false : true;
      }
    } else {
      console.log("Bad PWEND=" + str);
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
	if (expectingDPWEND) {
		samples = convertQtoFlow(waveSlices);
	} else {
    for (let i = 0; i < waveSlices.length; i++) {
      slice = waveSlices[i];
      for (let j = 0; j < slice.sliceData.length; j++) {
        let Q = slice.sliceData[j];
        samples.push(Q);
      }
		}
  }
  waveSlices = [];
  if (waveActualSamples != samples.length) {
    waveBreathPartial = true;
    //console.log("Missing Samples at PWEND=" + (waveActualSamples-samples.length));
  }

  // Make it consistently WAVE_MAX_SAMPLES_PER_BREATH
  for (let j = 0; j < WAVE_MAX_SAMPLES_PER_BREATH - samples.length; j++) {
    samples.push(null);
  }

  // check how many null samples we have in the first 60% where the details are
  let checkLimit = Math.floor(WAVE_MAX_SAMPLES_PER_BREATH * 6 / 10);
  let nullCount = 0;
  for (let j = 0; j < checkLimit; j++) {
    if (samples[j] === null) nullCount++;
  }
  if (nullCount > (checkLimit/2)) {
    //console.log("Too few datapoints for waveform=" + 
      //(nullCount/checkLimit) + "for breath " + session.waves.breathNum);
    if (!session.waves.tooFewDatapoints.includes(session.waves.breathNum)) {
      session.waves.tooFewDatapoints.push(session.waves.breathNum);
    }
  }

  let holdingArray = null;
  if (expectingPWEND) {
    holdingArray = session.waves.pwData;
    session.waves.pwRecordedBreaths.push(session.waves.breathNum);
  } else {
    holdingArray = session.waves.flowData;
		//samples = movingAvgFilter(samples, FLOW_FILTER_WINDOW);
    session.waves.flowRecordedBreaths.push(session.waves.breathNum);
  }

	if (checkIfLoggedValidBreath(session.waves.breathNum)) {
  	// store it for later use
  	holdingArray.push({
    	"partial": waveBreathPartial,
    	"systemBreathNum": session.waves.breathNum,
    	"breathInfo": session.waves.breathInfo,
    	"onDemand": session.waves.onDemand,
    	"sampleInterval": waveSampleInterval,
    	"samples": cloneObject(samples),
  	});
  	if (session.waves.newShapeCallback) {
			session.waves.newShapeCallback(session.waves.breathNum);
		}
	} else {
		//console.log("Wave Data discarded for breath#", session.waves.breathNum);
	}

  waveBreathPartial = false;
  waveBreathClosed = true;
}

function processPwsliceChirp(receivedSliceNum, str) {
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

  if ((sliceNum != prevSliceNum + 1) || (sliceNum != receivedSliceNum)) {
    // stuff empty slices
    waveBreathPartial = true;
    for (let i = prevSliceNum + 1; i < sliceNum; i++) {
      samples = [];
      if (!session.waves.expectedSamplesPerSlice) session.waves.expectedSamplesPerSlice = WAVE_MAX_SAMPLES_PER_SLICE;
      for (let j = 0; j < session.waves.expectedSamplesPerSlice; j++) {
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

var prevChirpResetStatus = RESET_NONE;
function processResetChirp(curTime, jsonStr) {
	let resetStatus = Number(jsonStr);
	//console.log("prevChirpResetStatus",prevChirpResetStatus,"resetStatus",resetStatus);
	if (resetStatus == prevChirpResetStatus) {
		// System will keep sending Timout/Decline messages till reset is pressed again
		if ((resetStatus == RESET_TIMEOUT) || (resetStatus == RESET_DECLINED)) {
			resetStatus = RESET_NONE;
		}
	} else {
		prevChirpResetStatus = resetStatus;
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

function processSwChirp(curTime, jsonStr) {
  let obj = parseSwData(jsonStr);
  if (!obj) return;

  if (session.firmwareVersion.major === null) {
    session.firmwareVersion.major = obj.major;
    session.firmwareVersion.minor = obj.minor;
    session.firmwareVersion.board = obj.board;
    appendSwVersionToUid();
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

var prevParamChangeBreathNum = null;
function processParamChirp(curTime, jsonStr) {
  let obj = parseParamData(jsonStr);
  if (!obj) return;

  let onDisplay = cloneObject(obj);
  if (!obj.pending) {
		if (!equalObjects(settingsInUse, onDisplay)) {
			session.params.comboChanged.AddTimeValue(curTime, true);
			prevParamChangeBreathNum = session.loggedBreaths.length - 1;
		}
    settingsInUse = cloneObject(obj);
		settingsInUse.pending = false;
  } else {
			session.params.comboChanged.AddTimeValueIfAbsent(curTime, false);
	}
  updatePendingParamState(curTime, onDisplay, settingsInUse);
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
  session.breathData.qmult = (obj.vtdel / obj.iqdel);

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

function processCmvSpontChirp(curTime, value) {
  saveOutputChange("cmvSpont", curTime, value);
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

var firstBnumChirp = true;
function processBnumChirp(curTime, value, jsonData) {
	// Parse for breath info
  let obj = parseBnumData(value);
  if (!obj) return;
  let bnumValue = obj.bnum;
  if (bnumValue == null) {
    console.error("Bad BNUM value = ", value, " systemBreathNum = ", session.systemBreathNum);
    return; // will count as missing
  }
  bnumValue = Number(bnumValue);
  let breathTime = new Date(curTime);
	let len = session.loggedBreaths.length;
  let numLoggedBreaths = len - 1;
 	let prevBreathTime = session.loggedBreaths[numLoggedBreaths].time;

	// Housekeeping tasks
	let breathsMissing = 0;
	let outOfOrder = false;
  if (firstBnumChirp) {
		firstBnumChirp = false;
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
		session.firstBreathBnumTime = new Date(breathTime);
	}

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
		console.log("Missed breath#", session.loggedBreaths.length);
  	session.loggedBreaths.push({time:missingBreathTime, missed:true});
  }

	/* No need to let the users know - it will just be confusing
	 * Also because breath numbers may be received out of order
	let info1 = "";
	let info2 = "";

	if (numMissing == 1) {
		info1 += "Missed Breath #" + String(lastBreathNum+1);
	} else {
		info1 += "Missed " + numMissing + " Breaths";
		info2 += "# [" + String(lastBreathNum+1) + " to " + String(lastBreathNum+numMissing) + "]";
	}
	console.log(info1, info2);

  let msg = {
    'created': newBreathTime,
    'breathNum': lastBreathNum + numMissing + 1,
    'L1': info1,
    'L2': info2,
    'L3': "Due to Internet",
    'L4': "Packet loss"
  };
  session.infoMsgs.push(msg);
  session.params.infos.AddTimeValue(newBreathTime, ++session.alerts.infoNum);
	*/
}

function updateLoggedBreaths(bnumValue, breathTime) {
	let len = session.loggedBreaths.length;
  let numLoggedBreaths = len - 1;
 	let prevBreathTime = session.loggedBreaths[numLoggedBreaths].time;

	// Error Checking
	let outOfOrder = false;
	if (bnumValue < len) {
		outOfOrder = true;
		if (breathTime.getTime() > prevBreathTime.getTime()) {
			console.error("--- BREATH Number", bnumValue, "out of order but breathTime wrong");
			console.log("breathTime", breathTime, "prevBreathTime", prevBreathTime);
			return; // will count as missing
		}
		console.log("--- BREATH number", bnumValue, "received out of order");
	} else if (breathTime.getTime() < prevBreathTime.getTime()) {
		console.error("--- BREATH Number", bnumValue, "in order but breathTime wrong");
		console.log("breathTime", breathTime, "prevBreathTime", prevBreathTime);
		return; // will count as missing
	}

	if (!outOfOrder) {
  	session.loggedBreaths.push({time:breathTime, missed:false});
	} else {
  	if (!session.loggedBreaths[bnumValue].missed) {
			console.log("Duplicate BREATH Number", bnumValue, "received out of order");
		} else {
			console.log("Previously missed BREATH Number", bnumValue, "received out of order");
		}
  	session.loggedBreaths[bnumValue].time = breathTime;
  	session.loggedBreaths[bnumValue].missed = false;
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
