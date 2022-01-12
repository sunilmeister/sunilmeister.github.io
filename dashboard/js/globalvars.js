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

// check for continuing dweets
const dweetIntervalMax = 6;
var periodicTickCount = 0;
var lastDweetTick = 0;
var wifiDropped = false;

