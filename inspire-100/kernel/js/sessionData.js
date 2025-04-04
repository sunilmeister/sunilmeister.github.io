// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var SessionDataTemplate = {
  internetOnline: true,
  appId: null,

  // App to install these if it needs to be identified
  // of keypress idle time
  keypressIdleAction: null,
  keypressTimeoutDelaySeconds: null,
  
  // currently open session
  sessionDataValid: true,
  sessionDurationInMs: 0,

  launchDate: null,
	firstChirpDate: null,
	lastChirpDate: null,
  maxBreathNum: 0,
  systemBreathNum: null,
  startSystemBreathNum: null,
  firstBreathBnumTime: null,
  firstBreathBnumMs: null,

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
    dbObjStoreName:  "",
    allDbKeys:  [],
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
    vtdel : null,
    qmult : null,
  },

	loggedBreaths:        [{time:new Date(0),missed:true}],
  infoMsgs:             [],

	// /////////////////////////////////////////////
  // All input and output parameters (settings and measured)
	// Initialized during createNewSession
  // /////////////////////////////////////////////
	params : {},
	allParamsTable: [],

  // /////////////////////////////////////////////
  // Below are used both by Playback and Dashboard
  // /////////////////////////////////////////////

	rangeSelector: {
		timeBased: false,
		rangeSlider:  null,
	},

	allSessionViews: [
		"snapshot",
		"charts",
		"stats",
		"waves",
		"alerts",
		"search",
		"record",
		"rawData",
		"select",
	],

  // Below is stuff for snapshot
  snapshot: {
		visible: false,
		range: null,
		prevRange: null,
  },

  // error and warning messages
  alerts: {
		visible: false,
		range: null,
		prevRange: null,
    errorNum: 0,
    warningNum: 0,
    infoNum: 0,
  },

  // chart transitions etc.
  charts : {
		visible: false,
		range: null,
		prevRange: null,
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
		visible: false,
		range: null,
		prevRange: null,
  },

  // Below is stuff for detailed breath waveforms
  waves: {
		visible: false,
		range: null,
		prevRange: null,
    sparseInterval: 1,
    pwData: [],
    fwData: [],
    vwData: [],
    pwPartial: [],
    fwPartial: [],
    vwPartial: [],
    sendPeriod: null,
    allWavesContainerInfo: {},
    boxTree: null,
    labelFontSize: 10,
    legendFontSize: 12,
    titleFontSize: 30,
    stripLineFontSize: 20,
  },

	// /////////////////////////////////////////////
	// For the recording view
	// /////////////////////////////////////////////
  record: {
		visible: false,
		range: null,
		prevRange: null,
	},

	// /////////////////////////////////////////////
	// For the raw data view
	// /////////////////////////////////////////////
  rawData: {
		visible: false,
		range: null,
		prevRange: null,
	},

	// /////////////////////////////////////////////
	// For the select session
	// /////////////////////////////////////////////
  select: {
		visible: false,
		range: null,
		prevRange: null,
	},

	// /////////////////////////////////////////////
	// For the Search view
	// /////////////////////////////////////////////
  search: {
		visible: false,
		criteria: null,
		range: null,
		prevRange: null,
		paramSet: [],
		results: [],
	},

  // /////////////////////////////////////////////
  // Below is used by Playback
  // /////////////////////////////////////////////
  playback: {
    recVersion:             null,
  },

  // /////////////////////////////////////////////
  // Below is used by Recorder
  // /////////////////////////////////////////////
  recorder: {
    off:                true,
    paused:             false,
    creationTimeStamp:  null,
    accumulatedState:   {},
    prevChirpRecorded:  false,
    versionRecorded:    false,
  },

};

var session = null;

var rangeTemplate = {
  moving: true,
  minBnum: null,
  maxBnum: null,
  minTime: null,
  maxTime: null,
};

function createNewSession() {
	//console.log("Creating new session");
	let saveRangeSlider = null;
	let saveLaunchDate = null;

	// There is a problem with nouiRange slider
	// multiple initializations cause an error
	if (session) {
		saveRangeSlider = session.rangeSelector.rangeSlider;
		saveLaunchDate = session.launchDate;
	}
	session = cloneObject(SessionDataTemplate);
	session.launchDate = saveLaunchDate;
	session.rangeSelector.rangeSlider = saveRangeSlider;

	// initialize ranges
	session.snapshot.range = cloneObject(rangeTemplate);
	session.charts.range = cloneObject(rangeTemplate);
	session.waves.range = cloneObject(rangeTemplate);
	session.stats.range = cloneObject(rangeTemplate);
	session.alerts.range = cloneObject(rangeTemplate);
	session.search.range = cloneObject(rangeTemplate);
	session.record.range = cloneObject(rangeTemplate);
	session.rawData.range = cloneObject(rangeTemplate);
	session.select.range = cloneObject(rangeTemplate);

	createAllParams();
}

window.addEventListener("load", function() {
  if (session) delete session;
	createNewSession();
})

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

