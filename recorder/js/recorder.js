// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var simulatedTimeInMs = 0;
var startimulatedTimeInMs = 0;
var startMillis = 0;
var simulatedMillis = 0;
var lastDweetInMs = 0;
var startSystemDate = new Date();
var awaitingFirstDweet = true;
var dweetQ = null;
const INIT_RECORDING_INTERVAL_IN_MS = 5000;
const MAX_DIFF_DWEET_SIMULAION_TIMES = 10000;


function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordIndicator").src = "img/WhiteDot.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordIndicator").src = "img/YellowDot.png";
  } else {
    document.getElementById("RecordIndicator").src = "img/RedDot.png";
  }
}

function disassembleAndQueueDweet(d) {
  fragmentIndex = 0;
  while (1) {
    key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    fragment = d.content[key];
    millisStr = fragment.MILLIS;
    millis = parseChecksumString(millisStr);
    if (millis == null) continue // ignore this malformed dweet

    if (!startMillis) startMillis = Number(millis);
    if (!isUndefined(fragment.content['CLEAR_ALL'])) {
      // replace CLEAR_ALL with a preconstructed dweet
      // fragment = cloneObject(clearAllDweet);
    }
    fragment.MILLIS = Number(millis);
    fragment.created = new Date(addMsToDate(session.startDate, (fragment.MILLIS - startMillis)));
    dweetQ.push(cloneObject(fragment));
  }
}

function getCurrentSimulatedMillis() {
  curDate = new Date();
  deltaTimeInMs = curDate - startSystemDate;
  return startSimulatedMillis + deltaTimeInMs;
}

function waitForDweets() {
  waitForInspireMessages(inspireUid, function (d) {
    if (simulatedMillis - lastDweetInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstDweet) {
      millisStr = d.content["0"].MILLIS
      millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed dweet

      simulatedMillis = Number(millis);
      startSimulatedMillis = simulatedMillis;
      startSystemDate = new Date();
      session.startDate = new Date(d.created);
      elm = document.getElementById("logStartDate");
      elm.innerHTML = dateToDateStr(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstDweet = false;
    lastDweetInMs = simulatedMillis;
    disassembleAndQueueDweet(d);
  })
}

function updateRecorderSummary(d) {
  curDate = new Date(d.created);
  sessionDurationInMs = curDate - session.startDate;
  elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToTimeStr(sessionDurationInMs);

  elm = document.getElementById("breathNum");
  animateNumberValueTo(elm, session.dashboardBreathNum);

  return d;
}

window.onload = function () {
  setModalWidth(600);

  finishedLoading = false;

  session = cloneObject(SessionDataTemplate);
  session.appId = RECORDER_APP_ID;
  session.launchDate = new Date();
  updateDocumentTitle();

  initDbNames();
  if (inspireTag) {
    document.title = inspireTag + " (RECORDER)"
  } else {
    document.title = "NOT SPECIFIED"
  }

  // Treat <ENTER> as accept button
  new KeypressEnterSubmit('recordName', 'acceptRecordNameBtn');
  new KeypressEnterSubmit('exportFileName', 'exportFileBtn');

  // now wait for dweets and act accordingly
  dweetQ = new Queue();
  waitForDweets();
  finishedLoading = true;
  let menuBar = document.getElementById("sideMenuBar");
  let menuBarHeight = menuBar.offsetHeight;
  let menuBarWidth = menuBar.offsetWidth;
  let nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth + 30) + "px";
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  let msg = 'Charts waveform history will be lost';
  if (session.dashboardBreathNum != 0) {
    if (!session.recorder.off) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}


const TIMEOUT_INTERVAL_IN_MS = 200;

setTimeout(function periodicCheck() {
  if (!awaitingFirstDweet) {
    simulatedMillis = getCurrentSimulatedMillis();
  }
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (dweetQ && dweetQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return;
  let millis;
  while (1) {
    if (dweetQ.size() == 0) break;
    let d = dweetQ.peek();
    millis = Number(d.MILLIS);
    if (simulatedMillis < millis) break;

    d = dweetQ.pop();
    if (!isUndefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
      let bnumObj = parseJSONSafely(bnumContent);
      session.systemBreathNum = bnumObj[0];
      if (session.startSystemBreathNum == null) {
        session.startSystemBreathNum = session.systemBreathNum;
        let elm = document.getElementById("priorBreathNum");
        elm.innerHTML = String(session.systemBreathNum - 1);
      }
      session.dashboardBreathNum = 
        session.systemBreathNum - session.startSystemBreathNum + 1;
    }
    updateRecorderSummary(d);
    let dCopy = cloneObject(d);
    processRecordDweet(dCopy);
  }

  if (millis - simulatedMillis > MAX_DIFF_DWEET_SIMULAION_TIMES) {
    modalAlert("Recorder out of Sync", "Something went wrong\nPlease relaunch the Recorder");
    console.error("Dweets way ahead of simulated time " + millis +
      " v/s " + simulatedMillis);
  }
  return;
}

function exportRecording() {
  if (session.recorder.off) {
    modalAlert("EXPORT Failed", "No Active Recording");
    return;
  }
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value = "Exported Recording";
}

function exportFile() {
  let fileName = document.getElementById("exportFileName").value;
  if (fileName) {
    exportDb(session.database.dbName, fileName);
    document.getElementById("exportDiv").style.display = "none";
  }
}

function cancelExport() {
  document.getElementById("exportDiv").style.display = "none";
}

