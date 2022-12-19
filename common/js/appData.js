// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var AppDataTemplate = {
  appId: null,
  // /////////////////////////////////////////////
  // Below are used by Analyzer
  // /////////////////////////////////////////////

  // currently open session
  sessionDbName:  "",
  sessionDbReady: false,
  sessionVersion: "UNKNOWN",
  sessionDurationInMs: 0,
  tablesConstructed: false,
  logStartTime: null,
  logEndTime: null,
  analysisStartTime: null,
  analysisEndTime: null,
  analysisStartBreath: 0,
  analysisEndBreath: 0,
  logStartBreath: 0,
  logEndBreath: 0,

  // before Analysis starts
  initialJsonRecord:    {},

  // valid or not
  sessionDataValid: true,
  firstRecord:     true,

  // /////////////////////////////////////////////
  // Below are used both by Analyzer and Dashboard
  // /////////////////////////////////////////////

  // Breath numbers being recorded
  startDate: null,
  dashboardBreathNum:   0,
  systemBreathNum:      null,
  startSystemBreathNum: null,

  // Combinations of settings
  prevParamCombo:  {"time":0,"value":{}},
  currParamCombo:  {"time":0,"value":{}},
  usedParamCombos: [],

  // error and warning messages
  chartExpectWarningMsg: false,
  chartExpectErrorMsg:   false,
  chartL1: "",
  chartL2: "",
  chartL3: "",
  chartL4: "",
  errorNum:        0,
  warningNum:      0,
  notificationNum: 0,

  // chart transitions etc.
  chartPrevSystemBreathNum: null,
  chartRangeLimit:          MAX_CHART_DATAPOINTS,
  chartRangeSlider:         null,
  chartFontSize:            25,
  chartCreationInProgress:  false,
  allChartsContainerInfo:   {},
  chartboxTree:             null,

  // Breath Shapes parameters
  shapeSendPeriod:           null,
  shapeLabelFontSize:        20,
  shapeLegendFontSize:       20,
  shapeTitleFontSize:        40,
  stripLineFontSize:         50,
  pwExpectedSamplesPerSlice: null,
  pwBreathNum:               null,
  allShapesContainerInfo:    {},
  shapeboxTree:              null,

  // current state 
  initialState:     false,
  standbyState:     false,
  activeState:      false,
  errorState:       false,
  attentionState:   false,
  pendingState:     false,
  pendingMODE:      false,
  pendingVT:        false,
  pendingRR:        false,
  pendingIE:        false,
  pendingIPEEP:     false,
  pendingPMAX:      false,
  pendingPS:        false,
  pendingTPS:       false,

  // Breath types
  prevBreathMandatory:   true,
  prevBreathSpontaneous: false,
  numMissingBreaths:     0,
  prevBreathRecorded:    false,
  lastValidBreathTime:   null,
  lastWarningTime:       null,
  lastErrorTime:         null,

  // /////////////////////////////////////////////
  // Below is stuff for detailed breath pressure chart
  // /////////////////////////////////////////////
  pwData:            [],
  pwBreathNum:       null,
  pwBreathInfo:      null,
  newPwDataCallback: null,

  // analysis  and display ranges
  reportRange: {
    rolling:       true,
    initBnum:      null, 
    minBnum:       null, 
    maxBnum:       null,
    missingBnum:   [],
    initTime:      null,
    minTime:       null,
    maxTime:       null,
    missingTime:   []
  },

};

function createReportRange(rolling, minBnum, maxBnum) {
  range = {};
  range.rolling =       rolling;
  range.initBnum =      1; 
  range.minBnum =       minBnum; 
  range.maxBnum =       maxBnum;
  if (! session.breathTimes[minBnum]) { // missing breath
    minBnum = closestNonNullEntryIndex(session.breathTimes, minBnum);
  }
  if (! session.breathTimes[maxBnum]) { // missing breath
    maxBnum = closestNonNullEntryIndex(session.breathTimes, maxBnum);
  }

  range.initTime =      app.startDate;
  if (minBnum<1) {
    range.minTime =     app.startDate;
  } else {
    range.minTime =     session.breathTimes[minBnum];
  }
  if (maxBnum<1) {
    range.maxTime =     app.startDate;
  } else {
    range.maxTime =     session.breathTimes[maxBnum];
  }

  range.missingBnum =   cloneObject(session.missingBreathWindows);
  range.missingTime =   cloneObject(session.missingTimeWindows);
  return range;
}

var app = null;


