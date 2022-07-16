// Dashboard
var datasource_name = "RESPIMATIC100";
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
var firstDweet = true;
var numBreaths = 0;
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
var updatedDweetContent = {"content":{}};;

// Recorder
var creationTimeStamp = "";
var db;
var dbName;
var recordStartDate = new Date();
var prevContent = {};
var expectErrorMsg = false;
var expectWarningMsg = false;
var l1 = false;
var l2 = false;
var l3 = false;
var l4 = false;
var recorderBackground="MEDIUMBLUE";
var recordingOff = true;
var recordingPaused = false;

// check for continuing dweets
const REFRESH_DWEET_INTERVAL = 10;
const dweetIntervalMax = 15;
var periodicTickCount = 0;
var lastDweetTick = 0;
var wifiDropped = false;
var dweetIntervalCounter = 0;

