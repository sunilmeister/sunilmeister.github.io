// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const TIMEOUT_INTERVAL_IN_MS         = 200;
const BLINK_INTERVAL_IN_MS           = 1000;
const MAX_DWEET_INTERVAL_IN_MS       = 30000;
const INIT_RECORDING_INTERVAL_IN_MS  = 5000;
const MAX_DIFF_DWEET_SIMULAION_TIMES = 10000;

var datasource_name = "RESPIMATIC100";
var simulatedTimeInMs = 0;
var startimulatedTimeInMs = 0;
var startMillis = 0;
var simulatedMillis = 0;
var lastDweetInMs = 0;
var startSystemDate = new Date();

var currentView = "snapshots";
var currentViewIsSnapshot = true;

var updatePaused = false;
var updateInProgress = false;

var wifiDropped = false;
var wifiDroppedBlink = 0;

var savedL1 = "";
var savedL2 = "";
var savedL3 = "";
var savedL4 = "";

var breathPausedAt = 0;

var updatedDweetContent = {"content": {}};
var awaitingFirstDweet = true;
var dweetQ = null;
var periodicTickCount = 0;
var lastDweetTick = 0;
var dweetIntervalCounter = 0;
var finishedLoading = false;

var messagesBackground = "MEDIUMBLUE";
var alertBackground = "GREEN";
var pendingBackground = "MEDIUMBLUE";
var pauseButtonBackground = "MEDIUMBLUE";
var flowDivBackground = "DARKBLUE";
var recordButtonBackground = "MEDIUMBLUE";
var alertImage = "OK";

var blinkInterval = 0;
var prevBlinkTimeInMs = (new Date()).getTime();

var somethingPending = false;

var blueColor;
var darkblueColor;
var darkredColor;
var greenColor;
var orangeColor;

var desiredFiO2 = 21;
var o2Purity = 21;
var reqO2Flow = 0;

var fiO2Gauge = null;
var purityGauge = null;
var peakGauge = null;
var platGauge = null;
var peepGauge = null;
var tempGauge = null;

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
var skipRecording = false;
var onDemandAlert = null;

// sliders
var sliderCommitPending = false;
var stopSliderCallback = false;
var chartRangeSlider = null;
var statRangeSlider = null;
var alertRangeSlider = null;
var shapeRangeSlider = null;

