// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var SessionDataTemplate = {
  internetOnline: true,
  appId: null,
  
  // currently open session
  sessionDataValid: true,
  sessionDurationInMs: 0,
	rangeSlider:  null,
  startDate: null,
  launchDate: null,
  dashboardBreathNum: 0,
  systemBreathNum: null,
  prevSystemBreathNum: null,
  startSystemBreathNum: null,
  numMissingBreaths: 0,
  lastValidBreathTime: null,
  firstBreathChirpTime: null,
  firstBreathBnumTime: null,
  statTablesConstructed: false,
  cmvSpontDetections: 0,

  firmwareVersion: {
    major: null,
    minor: null,
    board: null,
  },

  wifi: {
    drops: [], // {time: , value: {dropAt: , reconnectAt: }
  },

  database: {
    db:  null,
    dbVersion:  1,
    dbName:  "",
    dbNamePrefix:  "",
    dbReady:  false,
    dbPrimaryKey:  'created',
    dbObjStoreName:  "",
    allDbKeys:  {},
  },
  
  reportRange: {
    moving: true,
    initBnum: null,
    minBnum: null,
    maxBnum: null,
    missingBnum: [],
    initTime: null,
    minTime: null,
    maxTime: null,
    missingTime: []
  },

  // ////////////////////////////////////////////////////
  // data collected from chirps
  // ////////////////////////////////////////////////////

  stateData: {
    prevState : null,
    state : null,
    initial : null,
    standby : null,
    active : null,
    error : null,
  },

  pendingParamsData: {
    vt : null,
    mv : null,
    pmax : null,
    ipeep : null,
    ps : null,
    mode : null,
    tps : null,
    tpsUnits: null,
    ei : null,
    rr : null,
  },

  paramDataOnDisplay: {
    pending : null,
    vt : null,
    mv : null,
    pmax : null,
    ipeep : null,
    ps : null,
    mode : null,
    tps : null,
    tpsUnits: null,
    ie : null,
    rr : null,
  },

  paramDataInUse: {
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
  },

  fiO2Data: {
		externalMixer: false,
    fiO2 : null,
    o2Purity : null,
    o2FlowX10 : null,
  },

  minuteData: {
    mbpm : null,
    sbpm : null,
    smvdel : null,
    mmvdel : null,
    mvdel : null,
  },

  breathData: {
    peak : null,
    plat : null,
    mpeep : null,
    vtdel : null,
    iqdel : null,
    qmult : null,
    type : null,
  },

  complianceData: {
    scomp : null,
    dcomp : null,
  },

  miscData: {
    tempC : null,
    altInFt : null,
    atmInCmH20 : null,
    o2Pct : null,
    locationName: null,
    cmvSpontDetections: 0,
  },

  patientData: {
    fname : null,
    lname : null,
    gender : null,
    age : null,
    weight : null,
    height : null,
  },

  // value transitions arrays
  breathTimes:          [null],
  stateChanges:          [{"time":0, "value":null}],
  vtdelChanges:          [{"time":0, "value":null}],
  mmvdelChanges:         [{"time":0, "value":null}],
  smvdelChanges:         [{"time":0, "value":null}],
  mvdelChanges:          [{"time":0, "value":null}],
  sbpmChanges:           [{"time":0, "value":null}],
  mbpmChanges:           [{"time":0, "value":null}],
  breathTypeChanges:     [{"time":0, "value":null}],
  scompChanges:          [{"time":0, "value":null}],
  dcompChanges:          [{"time":0, "value":null}],
  peakChanges:           [{"time":0, "value":null}],
  platChanges:           [{"time":0, "value":null}],
  mpeepChanges:          [{"time":0, "value":null}],
  tempChanges:           [{"time":0, "value":null}],
  fiO2Changes:           [{"time":0, "value":null}],
  o2PurityChanges:       [{"time":0, "value":null}],
  o2FlowX10Changes:      [{"time":0, "value":null}],
  cmvSpontChanges:       [{"time":0, "value":null}],
  infoChanges:           [{"time":0, "value":null}],
  warningChanges:        [{"time":0, "value":null}],
  errorChanges:          [{"time":0, "value":null}],

  // sets of unique values encountered
  modeUsed:                [],
  vtUsed:                  [],
  mvUsed:                  [],
  rrUsed:                  [],
  ieUsed:                  [],
  ipeepUsed:               [],
  pmaxUsed:                [],
  psUsed:                  [],
  tpsUsed:                 [],
  fiO2Used:                [],
  o2PurityUsed:            [],
  o2FlowX10Used:           [],

  missingBreaths:       [],
  missingBreathWindows: [],
  missingTimeWindows:   [],
  infoMsgs:             [],
  warningMsgs :         [],
  errorMsgs:            [],

  // /////////////////////////////////////////////
  // All input and output parameters (settings and measured)
	// Initialized during createNewSession
  // /////////////////////////////////////////////
	params : {},

  // /////////////////////////////////////////////
  // Combinations of settings
  // /////////////////////////////////////////////
  prevParamCombo: {
    "time": 0,
    "value": {}
  },
  currParamCombo: {
    "time": 0,
    "value": {}
  },
  usedParamCombos: [],

  // /////////////////////////////////////////////
  // Below are used both by Playback and Dashboard
  // /////////////////////////////////////////////

  // error and warning messages
  alerts: {
    rangeLimit: ALERT_NUM_ROLLING_BREATHS,
    attention: false,
    expectWarningMsg: false,
    expectErrorMsg: false,
    L1: "",
    L2: "",
    L3: "",
    L4: "",
    errorNum: 0,
    warningNum: 0,
    infoNum: 0,
    lastWarningTime: null,
    lastErrorTime: null,
  },

  // chart transitions etc.
  charts : {
    rangeLimit: CHART_NUM_ROLLING_BREATHS,
    allChartsContainerInfo: {},
    boxTree: null,
    numChartDatapoints: 0,
    sparseInterval: 1,
    labelFontSize: 10,
    legendFontSize: 12,
    titleFontSize: 30,
    stripLineFontSize: 20,
  },

  // Below is stuff for stats
  stats: {
    rangeLimit: STAT_NUM_ROLLING_BREATHS,
  },

  // Below is stuff for detailed breath waveforms
  waves: {
    rangeLimit: WAVE_NUM_ROLLING_BREATHS,
    sparseInterval: 1,
    pwData: [],
    flowData: [],
    pwRecordedBreaths: [],
    flowRecordedBreaths: [],
    tooFewDatapoints: [],
    breathNum: null,
    breathInfo: null,
    newWaveCallback: null,
    sendPeriod: null,
    onDemand: false,
    expectedSamplesPerSlice: null,
    allWavesContainerInfo: {},
    boxTree: null,
    labelFontSize: 10,
    legendFontSize: 12,
    titleFontSize: 30,
    stripLineFontSize: 20,
  },

  // /////////////////////////////////////////////
  // Below is used by Playback
  // /////////////////////////////////////////////
  playback: {
    recVersion:             null,
    logStartTime:           null,
    logEndTime:             null,
    playbackStartTime:     	null,
    playbackEndTime:        null,
    playbackStartBreath:    0,
    playbackEndBreath:      0,
    logStartBreath:         0,
    logEndBreath:           0,
  },

  // /////////////////////////////////////////////
  // Below is used by Recorder
  // /////////////////////////////////////////////
  recorder: {
    expectErrorMsg:     false,
    expectWarningMsg:   false,
    l1Valid:            false,
    l2Valid:            false,
    l3Valid:            false,
    l4Valid:            false,
    off:                true,
    paused:             false,
    creationTimeStamp:  null,
    accumulatedState:   {},
    prevChirpRecorded:  false,
    versionRecorded:    false,
  },

};

var session = null;
function createNewSession() {
	session = cloneObject(SessionDataTemplate);
	//initSessionParams();
}

window.addEventListener("load", function() {
  if (session) delete session;
	createNewSession();
})

function createReportRange(moving, minBnum, maxBnum) {
  let range = cloneObject(session.reportRange);
  range.moving = moving;
  range.initBnum = 1;
  range.minBnum = minBnum;
  range.maxBnum = maxBnum;
  if (!session.breathTimes[minBnum]) { // missing breath
    minBnum = closestNonNullEntryIndex(session.breathTimes, minBnum);
  }
  if (!session.breathTimes[maxBnum]) { // missing breath
    maxBnum = closestNonNullEntryIndex(session.breathTimes, maxBnum);
  }

  range.initTime = session.startDate;
  if (minBnum < 1) {
    range.minTime = session.startDate;
  } else {
    range.minTime = session.breathTimes[minBnum];
  }
  if (maxBnum < 1) {
    range.maxTime = session.startDate;
  } else {
    range.maxTime = session.breathTimes[maxBnum];
  }

  range.missingBnum = cloneObject(session.missingBreathWindows);
  range.missingTime = cloneObject(session.missingTimeWindows);
  return range;
}

/////////////////////////////////////////////////////
// Periodically check the internet online status
/////////////////////////////////////////////////////
/*
setInterval(async () => {
  testUrl('https://google.com');
}, 5000); // check every 5 secs
*/

function testUrl(url) {
  if (!session) return; // nowhere to store result
  var wasOnline = session.internetOnline;
  ping(url).then(function(delta) {
    session.internetOnline = true;
    //if (!wasOnline) alert("System is online");
  }).catch(function(error) {
    session.internetOnline = false;
    //if (wasOnline) alert("System is offline");
  });
};

// Pings a url.
// @param  {String} url
// @return {Promise} promise that resolves to a ping (ms, float).
function ping(url) {
    return new Promise(function(resolve, reject) {
      var start = (new Date()).getTime();
      var response = function() { 
        var delta = ((new Date()).getTime() - start);
        resolve(delta); 
      };
      request_image(url).then(response).catch(response);
        
      // Set a timeout for max-pings, 5s.
      setTimeout(function() { reject(Error('Timeout')); }, 5000);
  });
}

 // Creates and loads an image element by url.
 // @param  {String} url
 // @return {Promise} promise that resolves to an image element or
 //                   fails to an Error.
function request_image(url) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() { resolve(img); };
        img.onerror = function() { reject(url); };
        img.src = url + '?random-no-cache=' + Math.floor((1 + Math.random()) * 0x10000).toString(16);
    });
}

