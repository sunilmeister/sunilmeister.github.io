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
  cboxTree:                 null,
  chartFontSize:            25,
  chartCreationInProgress:  false,
  allChartsContainerInfo:   {},

  // Breath Shapes parameters
  shapeLabelFontSize:       20,
  shapeLegendFontSize:      20,
  shapeTitleFontSize:       40,
  stripLineFontSize:        50,

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

var app = null;


