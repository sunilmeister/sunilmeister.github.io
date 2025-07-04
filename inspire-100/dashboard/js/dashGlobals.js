// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const TIMEOUT_INTERVAL_IN_MS = 400;
const MAX_CHIRP_INTERVAL_IN_MS = 30000;
const MAX_DORMANT_CLOSE_DURATION_IN_MS = 60000;
const MAX_AWAIT_FIRST_CHIRP_IN_MS = 60000;
const INIT_RECORDING_INTERVAL_IN_MS = 5000;
const MAX_DIFF_CHIRP_SIMULATION_TIMES = 10000;
const PING_INTERVAL_IN_MS = 1000;

var datasource_name = "INSPIRE-100";
var dashboardLaunchTime = new Date();
var tempGauge = null;

var dormantTimeInSec = 0;
var dormantPopupDisplayed = false;
var dormantPopupManualCloseTime = null;

var updatePaused = false;
var wifiDropped = false;
var wifiDroppedBlink = 0;

var msgL1 = null;
var msgL2 = null;
var msgL3 = null;
var msgL4 = null;
var savedL1 = "";
var savedL2 = "";
var savedL3 = "";
var savedL4 = "";

var breathPausedAt = 0;

var awaitingFirstChirp = true;
var periodicTickCount = 0;
var lastChirpInMs = 0;
var chirpIntervalCounter = 0;

var finishedLoading = false;

var pauseButtonForeground = "MEDIUMBLUE";
var recordButtonForeground = "MEDIUMBLUE";
var recorderBackground = "MEDIUMBLUE";

var blinkInterval = 0;
var prevBlinkTimeInMs = (new Date()).getTime();

// sliders
var stopSliderCallback = false;
var sliderDiv = null;
var rangeWindowDiv = null;

const DORMANT_TITLE_STR = "DASHBOARD is idle";
const DORMANT_MESSAGE_STR = "<span style='font-size:var(--swalTextFontSize);'>" +
"No communication from Inspire-100 System for <b></b> (hh:mm:ss)<br>" +
"<br>Alert will close when communication is re-established" +
"<br>Or you can close it manually</span>"

var banner1 = "<small><small>&nbsp";
var banner2 = "<big><b>INSPIRE-100</b>";
var banner3 = "TekMedika Pvt. Ltd." ;
var banner4 = "&nbsp";

