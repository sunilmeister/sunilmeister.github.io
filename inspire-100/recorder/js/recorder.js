// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var lastChirpInMs = 0;
var awaitingFirstChirp = true;
const INIT_RECORDING_INTERVAL_IN_MS = 5000;
const MAX_DIFF_CHIRP_SIMULAION_TIMES = 10000;

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
      let millisStr = d.content["0"].MILLIS
      let obj = parseMillis(millisStr);
      if (obj == null) return; // ignore this malformed chirp
      let millis = Number(obj.millis);
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
  new KeypressEnterSubmit('exportRecordingFileName', 'exportRecordingFileBtn');
  new KeypressEnterSubmit('importSessionName', 'importRecordingBtn');

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
    if (isDefined(d.content["HWORLD"])) {
      if (session.firstChirpDate) {
        // A session was in progress but a new session started
        // must close current session and inform user
        closeCurrentSession();
        return;
      }
    }

    if (isDefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
      let bnumObj = parseBnumData(bnumContent);
      if (bnumObj) {
        if (session.startSystemBreathNum == null) {
          session.startSystemBreathNum = bnumObj.bnum;
          let elm = document.getElementById("priorBreathNum");
          elm.innerHTML = String(bnumObj.bnum - 1);
        }
        let chirpBnum = bnumObj.bnum - session.startSystemBreathNum + 1;
        if (chirpBnum > session.maxBreathNum) {
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
