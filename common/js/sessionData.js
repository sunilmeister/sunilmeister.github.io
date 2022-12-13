// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var SessionDataTemplate = {
  // Misc data
  patientName: "",
  patientInfo: "",
  altitude:    "",

  // value transitions arrays
  breathTimes:          [{"time":0, "valid":false}],
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
  o2FlowValues:         [{"time":0, "value":null}],
  notificationValues:   [{"time":0, "value":null}],
  warningValues:        [{"time":0, "value":null}],
  errorValues:          [{"time":0, "value":null}],

  modes:                [],
  vts:                  [],
  rrs:                  [],
  ies:                  [],
  ipeeps:               [],
  pmaxs:                [],
  pss:                  [],
  tpss:                 [],
  fiO2s:                [],
  missingBreaths:       [],
  missingBreathWindows: [],
  missingTimeWindows:   [],
  notificationMsgs:     [],
  warningMsgs :         [],
  errorMsgs:            [],
};

function createReportRange(rolling, minBnum, maxBnum) {
  range = {};
  range.rolling =       rolling;
  range.initBnum =      1; 
  range.minBnum =       minBnum; 
  range.maxBnum =       maxBnum;
  range.missingBnum =   cloneObject(session.missingBreathWindows);
  range.initTime =      app.startDate;
  if (minBnum<1) {
    range.minTime =     app.startDate;
  } else {
    range.minTime =     session.breathTimes[minBnum].time;
  }
  if (maxBnum<1) {
    range.maxTime =     app.startDate;
  } else {
    range.maxTime =     session.breathTimes[maxBnum].time;
  }
  range.missingTime =   cloneObject(session.missingTimeWindows);
  return range;
}

var session = null;
