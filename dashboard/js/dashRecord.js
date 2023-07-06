// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function acceptRecordingName() {
  suffix = document.getElementById('recordName').value;
  session.database.dbName = getNewDbName(suffix);
  if (!session.database.dbName) return;
  createOrOpenDb(session.database.dbName, session.recorder.creationTimeStamp);
  InitRecorder();
  elm = document.getElementById('recordSessionName');
  elm.style.backgroundColor = palette.green;
  elm.style.color = palette.brightgreen;
  arr = parseDbName(session.database.dbName);
  elm.innerHTML = arr[1] + " [" + arr[2] + "]";

  btn = document.getElementById('recordButton');
  btn.innerHTML = "Pause Recording";
  document.getElementById('recordNameDiv').style.display = "none";

  session.recorder.off = false;
  session.recorder.paused = false;
  btn = document.getElementById("recordButton");
  btn.innerHTML = "Stop Recording";
  updateDashboardAndRecordingStatus();
}

function startRecording() {
  // check for browser capability
  if (!window.indexedDB) {
    modalAlert("IndexedDB not available in your browser", "Use different browser");
    return;
  }
  document.getElementById('recordNameDiv').style.display = "block";
  document.getElementById('recordName').value = "New Recording"
}

function resumeRecording() {
  session.recorder.off = false;
  session.recorder.paused = false;
  btn = document.getElementById("recordButton");
  btn.innerHTML = "Stop Recording";
  updateDashboardAndRecordingStatus();
}

function closeRecording() {
  session.database.db.close();
  session.database.db = null;
  session.database.dbName = null;
  session.database.dbReady = false;

  // Initialize all recorder variables
  session.recorder = cloneObject(SessionDataTemplate.recorder);

  btn = document.getElementById("recordButton");
  btn.innerHTML = "Start Recording";
  updateDashboardAndRecordingStatus();
  blankRecordingBox();
}

function pauseRecording() {
  // Initialize all recorder variables
  versionRecorded = session.recorder.versionRecord;
  creationTimeStamp = session.recorder.creationTimeStamp;
  session.recorder = cloneObject(SessionDataTemplate.recorder);
  session.recorder.versionRecorded = versionRecorded;
  session.recorder.creationTimeStamp = creationTimeStamp;

  session.recorder.off = false;
  session.recorder.paused = true;
  btn = document.getElementById("recordButton");
  btn.innerHTML = "Resume Recording";
  updateDashboardAndRecordingStatus();
}

function stopRecording() {
  modalConfirm(RECORDING_STOP_TITLE, RECORDING_STOP_MSG, 
    closeRecording, pauseRecording, null, 
    "CLOSE Recording", "PAUSE Recording");
}

function blankRecordingBox() {
  elm = document.getElementById('recordSessionName');
  elm.style.backgroundColor = palette.darkred;
  elm.style.color = "white";
  elm.innerHTML = "No Active Recording"
  recordBox = document.getElementById("recordBox");
  recordBox.innerHTML = "";
}

function toggleRecording() {
  if (session.recorder.off) {
    startRecording();
  } else if (session.recorder.paused) {
    resumeRecording();
  } else {
    stopRecording();
  }
  updateDashboardAndRecordingStatus();
}

function blinkRecordButton() {
  /*
  btn = document.getElementById("recordButton");
  if (!session.recorder.off) {
    if (recordButtonForeground == "WHITE") {
      btn.style.color = palette.orange;
      recordButtonForeground = "ORANGE";
    } else {
      btn.style.color = 'white';
      recordButtonForeground = "WHITE";
    }
  } else {
    btn.style.color = 'white';
    recordButtonForeground = "WHITE";
  }
  */
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
  name = session.database.dbNamePrefix + '|' + dbNameSuffix + "|" + nameTagTime;
  if (!isValidDatabaseName(dbNameSuffix)) {
    modalAlert("Invalid Recording name", dbNameSuffix + "\nTry again");
    return "";
  } else if (checkDbExists(name)) {
    modalAlert("Recording name already exists", dbNameSuffix + "\nTry again");
    return "";
  }

  return name;
}

function cancelRecordingName() {
  document.getElementById('recordNameDiv').style.display = "none";
}

function insertJsonData(jsonData) {
  // Start a database transaction and get the notes object store
  var tx = session.database.db.transaction([session.database.dbObjStoreName], 'readwrite');
  var store = tx.objectStore(session.database.dbObjStoreName);
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
    if (isUndefined(d.content[k])) {
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

  if (!isUndefined(d.content['WMSG'])) {
    session.recorder.expectWarningMsg = true;
    session.recorder.accumulatedState['L1'] = "";
    session.recorder.accumulatedState['L2'] = "";
    session.recorder.accumulatedState['L3'] = "";
    session.recorder.accumulatedState['L4'] = "";
    session.recorder.l1Valid = session.recorder.l2Valid = 
             session.recorder.l3Valid = session.recorder.l4Valid = false;
  }
  if (!isUndefined(d.content['EMSG'])) {
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
    if (!isUndefined(d.content['L1'])) session.recorder.l1Valid = true;
    if (!isUndefined(d.content['L2'])) session.recorder.l2Valid = true;
    if (!isUndefined(d.content['L3'])) session.recorder.l3Valid = true;
    if (!isUndefined(d.content['L4'])) session.recorder.l4Valid = true;
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
    if (isUndefined(session.recorder.accumulatedState[key])) {
      session.recorder.accumulatedState[key] = value;
    } else {
      prevValue = session.recorder.accumulatedState[key];
      if (prevValue != value) {
        session.recorder.accumulatedState[key] = value;
      } else {
        if (!waveWaveformKey(key)) delete d.content[key];
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
      if (session.database.db && !session.recorder.versionRecorded) {
        session.recorder.versionRecorded = true;
        d.content.RECORDING_VERSION = CURRENT_RECORDING_VERSION;
      }
      if (!session.recorder.prevDweetRecorded) {
        // Add on the session.recorder.accumulatedState state first
        d = createAccumulatedDweet(d);
        // console.log(d);
      }
      recordBox.innerText = JSON.stringify(d, null, ". ");
      if (session.database.db) insertJsonData(d);
      session.recorder.prevDweetRecorded = doRecord;
    }
  }
}

function InitRecorder() {
}
