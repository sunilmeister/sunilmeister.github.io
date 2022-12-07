// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var AppDataTemplate = {
  // currently open session
  sessionDbName:  "",
  sessionDbReady: false,
  sessionVersion: "UNKNOWN",
  sessionDurationInMs: 0,
  startDate: null,
  tablesConstructed: false,
  logStartTime: null,
  logEndTime: null,
  analysisStartTime: null,
  analysisEndTime: null,
  analysisStartBreath: 0,
  analysisEndBreath: 0,
  logStartBreath: 0,
  logEndBreath: 0,

  // Breath numbers being recorded
  dashboardBreathNum:   0,
  systemBreathNum:      0,
  startSystemBreathNum: -1,
  prevSystemBreathNum:  -1,

  // before Analysis starts
  initialJsonRecord:    {},

  // valid or not
  globalDataValid: false,
  firstRecord:     true,

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
  minChartBreathNum:       0,
  maxChartBreathNum:       0,
  chartPrevSystemBreathNum:-1,
  chartRangeLimit:         MAX_CHART_DATAPOINTS,
  chartRangeSlider:        null,
  cboxTree:                null,
  chartCreationInProgress: false,
  allChartsContainerInfo:   {},

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

  // charts analysis ranges
  chartsXrange: {
    doFull: true,
    initBnum:null, 
    minBnum:null, 
    maxBnum:null,
    missingBnum:[],
    initTime:null,
    minTime:null,
    maxTime:null,
    missingTime:[]
  },

  // reports analysis ranges
  reportsXrange: {
    doFull: true,
    minBnum:null, 
    maxBnum:null,
    missingBnum:[]
  },
};

var app = null;

