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
  },

  miscData: {
    altInFt : null,
    atmInCmH20 : null,
    atmO2Pct : null,
    locationName: null,
  },

  patientData: {
    fname : null,
    lname : null,
    gender : null,
    age : null,
    weight : null,
    height : null,
  },

	breathData: {
    iqdel : null,
    qmult : null,
  },

	breathTimes:          [new Date(0)],
  missingBreaths:       [],
  missingBreathWindows: [],
  missingTimeWindows:   [],
  infoMsgs:             [],
  warningMsgs :         [],
  errorMsgs:            [],

	// /////////////////////////////////////////////
	// For the Search view
	// /////////////////////////////////////////////
  search: {
		criteria: null,
		range: null,
		paramSet: [],
		results: [],
	},

	// /////////////////////////////////////////////
  // All input and output parameters (settings and measured)
	// Initialized during createNewSession
  // /////////////////////////////////////////////
	params : {
		state:	null,
		vtdel:	null,
		mvdel:	null,
		mmvdel:	null,
		smvdel:	null,
		sbpm:	null,
		mbpm:	null,
		btype:	null,
		bcontrol:	null,
		scomp:	null,
		dcomp:	null,
		peak:	null,
		mpeep:	null,
		plat:	null,
		tempC:	null,
		cmvSpont:	null,
		o2FlowX10:	null,
		errors:	null,
		warnings:	null,
		infos:	null,
		wifiDrops:	null,
		wifiReconns:	null,

		mode:	null,
		vt:	null,
		mv:	null,
		rr:	null,
		ie:	null,
		ipeep:	null,
		pmax:	null,
		ps:	null,
		tps:	null,
		fiO2:	null,
		o2Purity:	null,
	},

	allParamsTable: [],

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
	console.log("Creating new session");
	let saveRangeSlider = null;

	// There is a problem with nouiRange slider
	// multiple initializations cause an error
	if (session) saveRangeSlider = session.rangeSlider;
	session = cloneObject(SessionDataTemplate);
	session.rangeSlider = saveRangeSlider;

	initSessionParams();
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

