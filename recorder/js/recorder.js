// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

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

var awaitingFirstDweet = true;
function waitForDweets() {
  dweetio.listen_for(respimaticUid, function (d) {
    dormantTimeInSec = 0;
    wifiDropped = false;
    autoCloseDormantPopup();
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
      //console.log("simulatedMillis=" + simulatedMillis);
      session.startDate = new Date(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstDweet = false;
    lastDweetInMs = simulatedMillis;
    disassembleAndQueueDweet(d);
  })
}

function processRecorderDweet(d) {
  curDate = new Date(d.created);
  sessionDurationInMs = curDate - session.startDate;
  elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToTimeStr(sessionDurationInMs);
  elm = document.getElementById("numMissedBreaths");
  elm.innerHTML = session.numMissingBreaths;

  if (!updatePaused) {
    elm = document.getElementById("breathNum");
    animateNumberValueTo(elm, session.dashboardBreathNum);
  }

  if (prevAlarmErrorNum != (session.errorMsgs.length - 1)) {
    prevAlarmErrorNum = session.errorMsgs.length - 1;
    let title = "Error encountered Breath# " + session.dashboardBreathNum;
    let msg = session.errorMsgs[prevAlarmErrorNum].L1 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L2 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L3 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L4;
    modalAlert(title, msg);
  }

  return d;
}

window.onload = function () {
  setModalWidth(600);

  finishedLoading = false;

  session = cloneObject(SessionDataTemplate);
  session.appId = RECORDER_APP_ID;
  session.launchDate = new Date();

  initDbNames();
  InitRecorder();
  if (respimaticTag) {
    document.title = respimaticTag + " (RECORDER)"
  } else {
    document.title = "NOT SPECIFIED"
  }

  // Treat <ENTER> as accept button
  var recordNameInput = document.getElementById("recordName");
  recordNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("acceptRecordNameBtn").click();
    }
  });

  // now wait for dweets and act accordingly
  dweetQ = new Queue();
  waitForDweets();
  finishedLoading = true;
  var menuBar = document.getElementById("sideMenuBar");
  menuBarHeight = menuBar.offsetHeight;
  menuBarWidth = menuBar.offsetWidth;
  var nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth + 30) + "px";
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  var msg = 'Charts waveform history will be lost';
  if (session.dashboardBreathNum != 0) {
    if (!session.recorder.off) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}

function createRangeSlider(div) {
  if (rangeSlider) return;
  rangeSlider = new IntRangeSlider(
    div,
    0,
    CHART_NUM_ROLLING_BREATHS,
    0,
    0,
    1
  );
  rangeSlider.setChangeCallback(rangeSliderCallback);
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  sliderCommitPending = true;
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  rangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function outIconButton(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
  //console.log("out");
  //console.log(btn);
}

function overIconButton(btn) {
  bgd = palette.brightgreen;
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  //console.log("hover");
  //console.log(btn);
}

function setBackGroundBreathWindowButton(id, bgd) {
  el = document.getElementById(id);
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;

  el = el.firstElementChild;
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;
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
  var millis;
  while (1) {
    if (dweetQ.size() == 0) break;
    d = dweetQ.peek();
    millis = Number(d.MILLIS);
    if (simulatedMillis < millis) break;

    d = dweetQ.pop();
    if (!isUndefined(d.content["BNUM"])) {
      session.systemBreathNum = parseChecksumString(d.content["BNUM"]);
      if (session.startSystemBreathNum == null) {
        session.startSystemBreathNum = session.systemBreathNum;
        elm = document.getElementById("priorBreathNum");
        elm.innerHTML = String(session.systemBreathNum - 1);
      }
      session.dashboardBreathNum = 
        session.systemBreathNum - session.startSystemBreathNum + 1;
    }
    processRecordDweet(d);
  }

  if (millis - simulatedMillis > MAX_DIFF_DWEET_SIMULAION_TIMES) {
    modalAlert("Dashboard out of Sync", "Something went wrong\nPlease relaunch the Dashboard");
    console.log("Dweets way ahead of simulated time " + millis +
      " v/s " + simulatedMillis);
  }
  return;
}

function InitRecorder() {
}
