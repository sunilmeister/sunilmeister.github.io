// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var SessionDataTemplate = {
  appId: null,
  
  // currently open session
  sessionVersion: "UNKNOWN",
  sessionDbName: "",
  sessionDbReady: false,
  sessionDurationInMs: 0,
  sessionDataValid: true,
  startDate: null,
  dashboardBreathNum: 0,
  systemBreathNum: null,
  prevSystemBreathNum: null,
  startSystemBreathNum: null,
  numMissingBreaths: 0,
  lastValidBreathTime: null,
  statTablesConstructed: false,

  reportRange: {
    rolling: true,
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
  // data collected from dweets
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
    pmax : null,
    ipeep : null,
    ps : null,
    mode : null,
    tps : null,
    ei : null,
    rr : null,
  },

  fiO2Data: {
    fiO2 : null,
    o2Purity : null,
    o2FlowX10 : null,
  },

  minuteData: {
    mbpm : null,
    sbpm : null,
    mvdel : null,
  },

  breathData: {
    peak : null,
    plat : null,
    mpeep : null,
    vtdel : null,
    type : null,
  },

  complianceData: {
    scomp : null,
    dcomp : null,
  },

  miscData: {
    tempC : null,
    altitude : null,
  },

  patientData: {
    fname : null,
    lname : null,
    age : null,
    pid : null,
  },

  // value transitions arrays
  breathTimes:          [null],
  stateValues:          [{"time":0, "value":null}],
  vtdelValues:          [{"time":0, "value":null}],
  mvdelValues:          [{"time":0, "value":null}],
  sbpmValues:           [{"time":0, "value":null}],
  mbpmValues:           [{"time":0, "value":null}],
  breathTypeValues:     [{"time":0, "value":null}],
  scompValues:          [{"time":0, "value":null}],
  dcompValues:          [{"time":0, "value":null}],
  peakValues:           [{"time":0, "value":null}],
  platValues:           [{"time":0, "value":null}],
  mpeepValues:          [{"time":0, "value":null}],
  tempValues:           [{"time":0, "value":null}],
  fiO2Values:           [{"time":0, "value":null}],
  o2PurityValues:       [{"time":0, "value":null}],
  o2FlowX10Values:      [{"time":0, "value":null}],
  infoValues:           [{"time":0, "value":null}],
  warningValues:        [{"time":0, "value":null}],
  errorValues:          [{"time":0, "value":null}],

  // unique values encountered
  modes:                [],
  vts:                  [],
  rrs:                  [],
  ies:                  [],
  ipeeps:               [],
  pmaxs:                [],
  pss:                  [],
  tpss:                 [],
  fiO2s:                [],
  o2Puritys:            [],
  o2FlowX10s:           [],
  missingBreaths:       [],
  missingBreathWindows: [],
  missingTimeWindows:   [],
  infoMsgs:             [],
  warningMsgs :         [],
  errorMsgs:            [],

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
  // Below are used both by Analyzer and Dashboard
  // /////////////////////////////////////////////

  // error and warning messages
  alerts: {
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
    rangeLimit: MAX_CHART_DATAPOINTS,
    fontSize: 25,
    creationInProgress: false,
    allChartsContainerInfo: {},
    boxTree: null,
  },

  // Below is stuff for detailed breath pressure shapes
  shapes: {
    data: [],
    breathNum: null,
    breathInfo: null,
    newShapeCallback: null,
    sendPeriod: null,
    onDemand: false,
    labelFontSize: 20,
    legendFontSize: 20,
    titleFontSize: 40,
    expectedSamplesPerSlice: null,
    allShapesContainerInfo: {},
    boxTree: null,
    stripLineFontSize: 50,
  },

  // /////////////////////////////////////////////
  // Below is used by Analyzer
  // /////////////////////////////////////////////
  analyzer: {
    logStartTime: null,
    logEndTime: null,
    analysisStartTime: null,
    analysisEndTime: null,
    analysisStartBreath: 0,
    analysisEndBreath: 0,
    logStartBreath: 0,
    logEndBreath: 0,
  },

  // /////////////////////////////////////////////
  // Below is used by Analyzer
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
    prevDweetRecorded:  false,
  },


};

var session = null;

function createReportRange(rolling, minBnum, maxBnum) {
  range = {};
  range.rolling = rolling;
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

