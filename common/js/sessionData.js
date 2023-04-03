// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var SessionDataTemplate = {
  appId: null,
  
  // currently open session
  sessionDataValid: true,
  sessionDurationInMs: 0,
  startDate: null,
  dashboardBreathNum: 0,
  systemBreathNum: null,
  prevSystemBreathNum: null,
  startSystemBreathNum: null,
  numMissingBreaths: 0,
  lastValidBreathTime: null,
  statTablesConstructed: false,

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

  inProgress: {
    charts:     false,
    shapes:     false,
    alerts:     false,
    stats:      false,
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
  stateChanges:          [{"time":0, "value":null}],
  vtdelChanges:          [{"time":0, "value":null}],
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
  infoChanges:           [{"time":0, "value":null}],
  warningChanges:        [{"time":0, "value":null}],
  errorChanges:          [{"time":0, "value":null}],

  // sets of unique values encountered
  modeUsed:                [],
  vtUsed:                  [],
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
    sessionVersion:         null,
    logStartTime:           null,
    logEndTime:             null,
    analysisStartTime:      null,
    analysisEndTime:        null,
    analysisStartBreath:    0,
    analysisEndBreath:      0,
    logStartBreath:         0,
    logEndBreath:           0,
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
    versionRecorded:    false,
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

