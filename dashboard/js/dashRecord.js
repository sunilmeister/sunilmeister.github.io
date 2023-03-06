// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function blinkRecordButton() {
  btn = document.getElementById("recordButton");
  var style = getComputedStyle(document.body)
  if (session.recorder.paused) {
    if (recordButtonForeground == "WHITE") {
      btn.style.color = style.getPropertyValue('--rsp_orange');
      recordButtonForeground = "ORANGE";
    } else {
      btn.style.color = 'white';
      recordButtonForeground = "WHITE";
    }
  } else {
    btn.style.color = 'white';
    recordButtonForeground = "WHITE";
  }
}

function toggleRecording() {
  var style = getComputedStyle(document.body)
  btn = document.getElementById("recordButton");
  if (session.recorder.off) {
    // check for browser capability
    if (!window.indexedDB) {
      modalAlert("IndexedDB not available in your browser", "Use different browser");
      return;
    }
    document.getElementById('recordNameDiv').style.display = "block";
    document.getElementById('recordName').value = "New Session"
  } else if (session.recorder.paused) {
    btn.innerHTML = "Pause Recording";
    session.recorder.off = false;
    session.recorder.paused = false;
  } else if (!session.recorder.paused) {
    btn.innerHTML = "Resume Recording";
    session.recorder.off = false;
    session.recorder.paused = true;
  }
  updateDashboardAndRecordingStatus();
}
// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function getNewDbName(dbNameSuffix) {
  var name = "";
  today = new Date();
  session.recorder.creationTimeStamp = today;
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var hrs = String(today.getHours()).padStart(2, '0');
  var min = String(today.getMinutes()).padStart(2, '0');
  var sec = String(today.getSeconds()).padStart(2, '0');
  dmy = dd + "-" + mm + "-" + yyyy;
  nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;
  if (!dbNameSuffix) return "";
  name = dbNamePrefix + '|' + dbNameSuffix + "|" + nameTagTime;
  if (!isValidDatabaseName(dbNameSuffix)) {
    modalAlert("Invalid Session name", dbNameSuffix + "\nTry again");
    return "";
  } else if (checkDbExists(name)) {
    modalAlert("Session name already exists", dbNameSuffix + "\nTry again");
    return "";
  }

  return name;
}

function cancelRecordingName() {
  document.getElementById('recordNameDiv').style.display = "none";
}

function acceptRecordingName() {
  suffix = document.getElementById('recordName').value;
  dbName = getNewDbName(suffix);
  if (!dbName) return;
  createOrOpenDb(dbName, session.recorder.creationTimeStamp);
  InitRecorder();
  elm = document.getElementById('recordSessionName');
  arr = parseDbName(dbName);
  elm.innerHTML = arr[1] + " [" + arr[2] + "]";

  btn = document.getElementById('recordButton');
  btn.innerHTML = "Pause Recording";
  session.recorder.off = false;
  session.recorder.paused = false;
  document.getElementById('recordNameDiv').style.display = "none";
  updateDashboardAndRecordingStatus();
}

function insertJsonData(db, jsonData) {
  // Start a database transaction and get the notes object store
  var tx = db.transaction([dbObjStoreName], 'readwrite');
  var store = tx.objectStore(dbObjStoreName);
  store.add(jsonData); // Wait for the database transaction to complete
  tx.oncomplete = function () {}
  tx.onerror = function (event) {
    console.log('Error storing data! ' + event.target.errorCode);
  }
}

function createAccumulatedDweet(d) {
  // Note that the signalling messages have already been removed
  // in session.recorder.accumulatedState
  for (const k in session.recorder.accumulatedState) {
    if (typeof d.content[k] == 'undefined') {
      d.content[k] = session.recorder.accumulatedState[k];
    }
  }
  return d;
}

function initRecordingPrevContent() {
  // periodically keep clearing session.recorder.accumulatedState state if not recording
  doRecord = (!session.recorder.off && !session.recorder.paused);
  if (!doRecord) session.recorder.accumulatedState = {};
}

function processRecordDweet(d) {
  var skipRecording = false;
  if (session.stateData.initial) skipRecording = true;

  if (typeof d.content['WMSG'] != 'undefined') {
    session.recorder.expectWarningMsg = true;
    session.recorder.accumulatedState['L1'] = "";
    session.recorder.accumulatedState['L2'] = "";
    session.recorder.accumulatedState['L3'] = "";
    session.recorder.accumulatedState['L4'] = "";
    session.recorder.l1Valid = session.recorder.l2Valid = 
             session.recorder.l3Valid = session.recorder.l4Valid = false;
  }
  if (typeof d.content['EMSG'] != 'undefined') {
    session.recorder.expectErrorMsg = true;
    session.recorder.accumulatedState['L1'] = "";
    session.recorder.accumulatedState['L2'] = "";
    session.recorder.accumulatedState['L3'] = "";
    session.recorder.accumulatedState['L4'] = "";
    session.recorder.l1Valid = session.recorder.l2Valid = 
             session.recorder.l3Valid = session.recorder.l4Valid = false;
  }
  if (session.recorder.expectWarningMsg || session.recorder.expectErrorMsg) {
    if (session.recorder.l1Valid && session.recorder.l2Valid && 
               session.recorder.l3Valid && session.recorder.l4Valid) {
      session.recorder.expectWarningMsg = false;
      session.recorder.expectErrorMsg = false;
      session.recorder.l1Valid = session.recorder.l2Valid = 
               session.recorder.l3Valid = session.recorder.l4Valid = false;
    }
  }
  if (session.recorder.expectWarningMsg || session.recorder.expectErrorMsg) {
    if (typeof d.content['L1'] != 'undefined') session.recorder.l1Valid = true;
    if (typeof d.content['L2'] != 'undefined') session.recorder.l2Valid = true;
    if (typeof d.content['L3'] != 'undefined') session.recorder.l3Valid = true;
    if (typeof d.content['L4'] != 'undefined') session.recorder.l4Valid = true;
  }
  if (!session.recorder.expectWarningMsg && !session.recorder.expectErrorMsg && !skipRecording) {
    // Get rid of messages except in INITIAL state or when the attention is ON
    delete d.content['L1'];
    delete d.content['L2'];
    delete d.content['L3'];
    delete d.content['L4'];
  }
  // prune the content if same as previous
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    if (typeof session.recorder.accumulatedState[key] == 'undefined') {
      session.recorder.accumulatedState[key] = value;
    } else {
      prevValue = session.recorder.accumulatedState[key];
      if (prevValue != value) {
        session.recorder.accumulatedState[key] = value;
      } else {
        if (!shapeWaveformKey(key)) delete d.content[key];
      }
    }
  }
  var emptyContent = true;
  for (let key in d.content) {
    emptyContent = false;
    break;
  }

  doRecord = (!session.recorder.off && !session.recorder.paused);
  recordBox = document.getElementById("recordBox");
  if (!emptyContent) {
    if (doRecord) {
      if (db && session.sessionVersion == 'UNKNOWN') {
        session.sessionVersion = SESSION_VERSION;
        d.content.SESSION_VERSION = session.sessionVersion;
      }
      if (!session.recorder.prevDweetRecorded) {
        // Add on the session.recorder.accumulatedState state first
        d = createAccumulatedDweet(d);
        // console.log(d);
      }
      recordBox.innerText = JSON.stringify(d, null, ". ");
      if (db) insertJsonData(db, d);
      session.recorder.prevDweetRecorded = doRecord;
    }
  }
}

function InitRecorder() {
}
