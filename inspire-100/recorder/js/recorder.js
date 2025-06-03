// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var lastChirpInMs = 0;
var awaitingFirstChirp = true;
const INIT_RECORDING_INTERVAL_IN_MS = 5000;
const MAX_DIFF_CHIRP_SIMULAION_TIMES = 10000;

var blankIndicator = false;
function blinkRecordingIndicator() {
  if (session.recorder.off) return;
	if (blankIndicator) {
  	if (session.recorder.paused) {
    	document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
		} else {
    	document.getElementById("RecordIndicator").src = "../common/img/RedDot.png";
		}
		blankIndicator = false;
	} else {
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
		blankIndicator = true;
	}
}

function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("RecordIndicator").src = "../common/img/RedDot.png";
  }
}

setInterval(function () {
	blinkRecordingIndicator();
}, FAST_BLINK_INTERVAL_IN_MS)

var recorderLaunchTime = null;
var recorderChirpCount = 0;
function waitForChirps() {
  waitForHwPosts(inspireUid, function (d) {
		// ignore old chirps
		recorderChirpCount++;
		if ((recorderChirpCount == 1) && (d.created < recorderLaunchTime)) return;

    let now = new Date();
    let nowMs = now.getTime();
    if (nowMs - lastChirpInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstChirp) {
      millisStr = d.content["0"].MILLIS
      millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed chirp

      elm = document.getElementById("logStartDate");
      elm.innerHTML = dateToDateStr(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstChirp = false;
    lastChirpInMs = nowMs;
    disassembleAndQueueChirp(d);
  })
}

function updateRecorderSummary(d) {
  curDate = new Date(d.created);
	let date = session.firstChirpDate;
	if (date === null) date = new Date(d.created);
  session.sessionDurationInMs = Math.abs(curDate.getTime() - date.getTime());
  elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToHHMMSS(session.sessionDurationInMs);

  elm = document.getElementById("breathNum");
  animateNumberValueTo(elm, session.maxBreathNum);

  return d;
}

window.onload = function () {
	recorderLaunchTime = new Date();
  finishedLoading = false;

  createNewSession();
  session.appId = RECORDER_APP_ID;
  session.launchDate = new Date();
  updateDocumentTitle();

  initDbNames();
  let heading = document.getElementById("SysUid");
  if (inspireTag) {
    heading.innerHTML = inspireUid + "<br>(" + inspireTag + ")";
  } else {
    heading.innerHTML = "NOT SPECIFIED"
  }

  if (inspireTag) {
    document.title = inspireTag + " (RECORDER)"
  } else {
    document.title = "NOT SPECIFIED"
  }
  showAllDbs();

  // Treat <ENTER> as accept button
  new KeypressEnterSubmit('recordName', 'acceptRecordNameBtn');
  new KeypressEnterSubmit('exportFileName', 'exportFileBtn');

  // now wait for chirps and act accordingly
  initChirpQ();
  waitForChirps();

	sidebarAlign();
	setRootFontSize("fullRecorder", "nonMenuArea");

	appResize();
	appResizeFunction = appResize;
  finishedLoading = true;
}

function sidebarAlign() {
  let menuBar = document.getElementById("sideMenuBar");
  let menuBarHeight = menuBar.offsetHeight;
  let menuBarWidth = menuBar.offsetWidth;
  let nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = "-" + String(convertPixelsToRem(menuBarHeight)) + "rem";
  nonMenuArea.style.marginLeft = String(convertPixelsToRem(menuBarWidth + 25)) + "rem";
}

function appResize() {
	sidebarAlign();
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  let msg = 'Charts waveform history will be lost';
  if (session.maxBreathNum != 0) {
    if (!session.recorder.off) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}


const TIMEOUT_INTERVAL_IN_MS = 200;

setTimeout(function periodicCheck() {
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (chirpQ && chirpQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return;
  let millis;
  while (1) {
    if (chirpQ.size() == 0) break;

    let d = chirpQ.pop();
		if (recorderSessionClosed) {
			return; // do not process any more chirps
		}

		if (isUndefined(d["content"])) break; // empty chirp

		// check if a new session has started without current one being closed
    if (!isUndefined(d.content["HWORLD"])) {
			if (session.firstChirpDate) {
				// A session was in progress but a new session started
				// must close current session and inform user
				closeCurrentSession();
				return;
			}
		}

    if (!isUndefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
      let bnumObj = parseBnumData(bnumContent);
			if (bnumObj) {
      	if (session.startSystemBreathNum == null) {
        	session.startSystemBreathNum = bnumObj.bnum;
        	let elm = document.getElementById("priorBreathNum");
        	elm.innerHTML = String(bnumObj.bnum - 1);
      	}
        let chirpBnum = bnumObj.bnum - session.startSystemBreathNum + 1;
        if (chirpBnum >	session.maxBreathNum) {
      	  session.systemBreathNum = bnumObj.bnum;
         	session.maxBreathNum = chirpBnum;
        }
			}
    }
    let dCopy = cloneObject(d);
    processRecordChirp(dCopy);
  }
}

var recorderSessionClosed = false;
function closeCurrentSession() {
	// allow navigation and manipulation of current session views
	recorderSessionClosed = true;

	// close any recording in progress
	closeRecording();

	// display and sound a warning
	modalWarning("SESSION CLOSED", SESSION_CLOSED_MSG);
	enableWarningBeep();
	startWarningBeep();
}

function exportCurrentRecording() {
  if (session.recorder.off) {
    modalAlert("EXPORT Failed", "No Active Recording");
    return;
  }
  document.getElementById("exportCurrentRecordingDiv").style.display = "block";
  document.getElementById("exportCurrentRecordingFileName").value = "Exported Recording";
}

function doExportCurrentRecording() {
  let fileName = document.getElementById("exportRecordingFileName").value;
  if (fileName) {
    exportDb(session.database.dbName, fileName);
    document.getElementById("exportCurrentRecordingDiv").style.display = "none";
  }
}

function doCancelCurrentExport() {
  document.getElementById("exportCurrentRecordingDiv").style.display = "none";
}



