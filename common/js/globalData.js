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
var prevParamCombo = {time:0,value:{}};
var currParamCombo = {time:0,value:{}};
var usedParamCombos = [];
// error and warning messages
var notificationNum = 0;
var warningNum = 0;
var errorNum = 0;
var notificationMsgs = [];
var warningMsgs = [];
var errorMsgs = [];
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
var numMissingBreaths;
// value transitions
var breathTimes = [];
var missingBreaths = [];
var missingBreathWindows = [];
var missingTimeWindows = [];
var vtdelValues = [];
var mvdelValues = [];
var sbpmValues = [];
var mbpmValues = [];
var breathTypeValues = [];
var scompValues = [];
var dcompValues = [];
var peakValues = [];
var platValues = [];
var mpeepValues = [];
var tempValues = [];
var notificationValues = [];
var warningValues = [];
var errorValues = [];
var fiO2Values = [];
var o2PurityValues = [];
var o2FlowValues = [];

var chartsXrange = {
    doFull: null,
    initBnum:null, 
    minBnum:null, 
    maxBnum:null,
    missingBnum:[],
    initTime:null,
    minTime:null,
    maxTime:null,
    missingtIme:[]
};

var reportsXrange = {
    doFull: true,
    minBnum:null, 
    maxBnum:null,
    missingBnum:[]
};

function initGlobalData() {
  // breath types
  numMissingBreaths = 0;
  // error messages etc.
  notificationMsgs = [];
  warningMsgs = [];
  errorMsgs = [];
  notificationNum = 0;
  warningNum = 0;
  errorNum = 0;
  // chart transitions etc.
  minChartBreathNum = 0;
  maxChartBreathNum = 0;
  chartRangeLimit = MAX_CHART_DATAPOINTS;
  chartPrevSystemBreathNum = -1;
  breathTimes = [];
  missingBreaths = [];
  missingBreathWindows = [];
  missingTimeWindows = [];
  vtdelValues = [];
  mvdelValues = [];
  sbpmValues = [];
  mbpmValues = [];
  breathTypeValues = [];
  scompValues = [];
  dcompValues = [];
  peakValues = [];
  platValues = [];
  mpeepValues = [];
  tempValues = [];
  notificationValues = [];
  warningValues = [];
  errorValues = [];
  fiO2Values = [];
  o2PurityValues = [];
  o2FlowValues = [];

  chartsXrange = {
    doFull: null,
    initbnum:null, 
    minbnum:null , 
    maxbnum:null ,
    missingbnum:[],
    inittime:null,
    mintime:null,
    maxtime:null,
    missingtime:[]
  };

  reportsXrange = {
    doFull: true,
    minbnum:null , 
    maxbnum:null ,
    missingbnum:[]
  };

}

function initTransitionStartValues() {
  if (breathTimes.length == 0) breathTimes.push({
    "time": 0,
    "valid": false
  });
  if (peakValues.length == 0) peakValues.push({
    "time": 0,
    "value": null
  });
  if (platValues.length == 0) platValues.push({
    "time": 0,
    "value": null
  });
  if (mpeepValues.length == 0) mpeepValues.push({
    "time": 0,
    "value": null
  });
  if (vtdelValues.length == 0) vtdelValues.push({
    "time": 0,
    "value": null
  });
  if (mvdelValues.length == 0) mvdelValues.push({
    "time": 0,
    "value": null
  });
  if (scompValues.length == 0) scompValues.push({
    "time": 0,
    "value": null
  });
  if (dcompValues.length == 0) dcompValues.push({
    "time": 0,
    "value": null
  });
  if (mbpmValues.length == 0) mbpmValues.push({
    "time": 0,
    "value": null
  });
  if (breathTypeValues.length == 0) breathTypeValues.push({
    "time": 0,
    "value": null
  });
  if (sbpmValues.length == 0) sbpmValues.push({
    "time": 0,
    "value": null
  });
  if (tempValues.length == 0) tempValues.push({
    "time": 0,
    "value": null
  });
  if (warningValues.length == 0) warningValues.push({
    "time": 0,
    "value": null
  });
  if (notificationValues.length == 0) notificationValues.push({
    "time": 0,
    "value": null
  });
  if (errorValues.length == 0) errorValues.push({
    "time": 0,
    "value": null
  });
  if (fiO2Values.length == 0) fiO2Values.push({
    "time": 0,
    "value": null
  });
  if (o2PurityValues.length == 0) o2PurityValues.push({
    "time": 0,
    "value": null
  });
  if (o2FlowValues.length == 0) o2FlowValues.push({
    "time": 0,
    "value": null
  });
}

