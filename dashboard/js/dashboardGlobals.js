// Dashboard variables
var datasource_name = "RESPIMATIC100";
var startDate;
var simulatedTimeInMs = 0;
var startimulatedTimeInMs = 0;
var startSystemDate = new Date();
var updateInProgress = false;
var blueColor;
var darkblueColor;
var darkredColor;
var greenColor;
var orangeColor;
var alertImage;
var alertBackground;
var pendingBackground;
var messagesBackground;
var pauseButtonBackground;
var flowDivBackground;
var pendingMODE = false;
var pendingVT = false;
var pendingRR = false;
var pendingIE = false;
var pendingIPEEP = false;
var pendingPMAX = false;
var pendingPS = false;
var pendingTPS = false;
var initialState = true;
var standbyState = false;
var activeState = false;
var errorState = false;
var attentionState = false;
var pendingState = false;
var currentViewIsSnapshot = true;
var awaitingFirstDweet = true;
var updatePaused = false;
var desiredFiO2 = 21;
var o2Purity = 21;
var reqO2Flow = 0;
var fiO2Gauge = null;
var purityGauge = null;
var peakGauge = null;
var platGauge = null;
var peepGauge = null;
var tempGauge = null;
// Up to date dweet format state
// useful for resuming after pause
var updatedDweetContent = {
  "content": {}
};;
// Recorder
var recCreationTimeStamp = "";
var db;
var dbName;
var recordStartDate = new Date();
var accumulatedRecordState = {};
var prevDweetRecorded = false;
var recExpectErrorMsg = false;
var recExpectWarningMsg = false;
var recL1Valid = false;
var recL2Valid = false;
var recL3Valid = false;
var recL4Valid = false;
var recorderBackground = "MEDIUMBLUE";
var recordingOff = true;
var recordingPaused = false;
// sliders
var sliderCommitPending = false;
var stopSliderCallback = false;
var chartRangeSlider = null;
var stattRangeSlider = null;
var alertRangeSlider = null;
// check for continuing dweets
var dweetQ = null;
var wifiDropped = false;
var blinkInterval = 0;
var prevBlinkTimeInMs = (new Date()).getTime();

const TIMEOUT_INTERVAL_IN_MS = 200;
const BLINK_INTERVAL_IN_MS = 1000;
const MAX_DWEET_INTERVAL_IN_MS = 30000;
const INIT_RECORDING_INTERVAL_IN_MS = 5000;
const MAX_DIFF_DWEET_SIMULAION_TIMES = 10000;

