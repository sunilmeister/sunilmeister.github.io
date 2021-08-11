// useful for params that have an undefined value sometimes
const maxDummyValue = -999999 ;
const minDummyValue = 999999 ;

// valid or not
var globalDataValid = false;

// value transitions
var breathTimes = [];
var vtdelValues = [];
var mvdelValues = [];
var sbpmValues = [];
var mbpmValues = [];
var scompValues = [];
var dcompValues = [];
var peakValues = [];
var platValues = [];
var peepValues = [];
var tempValues = [];

// Misc data
var patientName;
var patientInfo;
var altitude;

// All input settings used
var modes = [];
var vts = [];
var rrs = [];
var ies = [];
var peeps = [];
var pmaxs = [];
var pss = [];
var tpss = [];
var usedParamCombos = [];

var minPeak, maxPeak;
var minPlat, maxPlat;
var minPeep, maxPeep;
var minVt, maxVt;
var minMv, maxMv;
var minMbpm, maxMbpm;
var minSbpm, maxSbpm;
var minScomp, maxScomp;
var minDcomp, maxDcomp;
var minTemp, maxTemp;

// error and warning messages
var errorMsgs = [];
var warningMsgs = [];

// state transitions
var numInitialEntry;
var numStandbyEntry;
var numRunningEntry;
var numErrorEntry;

// Breath types
var numMandatory;
var numSpontaneous;
var numMaintenance;

function initGlobalData() {
  globalDataValid = false;

  breathTimes = [];
  vtdelValues = [];
  mvdelValues = [];
  sbpmValues = [];
  mbpmValues = [];
  scompValues = [];
  dcompValues = [];
  peakValues = [];
  platValues = [];
  peepValues = [];
  tempValues = [];
  numInitialEntry = 0;
  numStandbyEntry = 0;
  numRunningEntry = 0;
  numErrorEntry = 0;
  numWarnings = 0;

  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;

  patientName = ""
  patientInfo = ""
  altitude = "";
  
  // All settings combos used
  modes = [];
  vts = [];
  rrs = [];
  ies = [];
  peeps = [];
  pmaxs = [];
  pss = [];
  tpss = [];
  usedParamCombos = [];
  
  minPeak = minDummyValue;
  maxPeak = maxDummyValue;
  minPlat = minDummyValue;
  maxPlat = maxDummyValue;
  minPeep = minDummyValue;
  maxPeep = maxDummyValue;
  minVt = minDummyValue;
  maxVt = maxDummyValue;
  minMv = minDummyValue;
  maxMv = maxDummyValue;
  minMbpm = minDummyValue;
  maxMbpm = maxDummyValue;
  minSbpm = minDummyValue;
  maxSbpm = maxDummyValue;
  minScomp = minDummyValue;
  maxScomp = maxDummyValue;
  minDcomp = minDummyValue;
  maxDcomp = maxDummyValue;
  minTemp = minDummyValue;
  maxTemp = maxDummyValue;

  errorMsgs = [];
  warningMsgs = [];

// state transitions
  numInitialEntry = 0; 
  numStandbyEntry = 0; 
  numRunningEntry = 0; 
  numErrorEntry = 0;

// Breath types
  numMandatory = 0;
  numSpontaneous = 0;
  numMaintenance = 0;
}

function gatherGlobalData() {
}
