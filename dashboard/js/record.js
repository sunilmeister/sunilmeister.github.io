// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function blinkRecordButton() {
  btn = document.getElementById("recordButton");
  var style = getComputedStyle(document.body)
  if (recordingPaused) {
    if (recordButtonForeground == "WHITE") {
      btn.style.color = style.getPropertyValue('--rsp_orange');
      recordButtonForeground = "ORANGE";
    }
    else {
      btn.style.color = 'white';
      recordButtonForeground = "WHITE";
    }
  }
  else {
    btn.style.color = 'white';
    recordButtonForeground = "WHITE";
  }
}

function toggleRecording() {
  var style = getComputedStyle(document.body)
  btn = document.getElementById("recordButton");
  if (recordingOff) {
    // check for browser capability
    if (!window.indexedDB) {
      modalAlert("IndexedDB not available in your browser","Use different browser");
      return;
    }
    document.getElementById('recordNameDiv').style.display = "block";
    document.getElementById('recordName').value = "New Session"
  } else if (recordingPaused) {
    btn.innerHTML = "Pause Recording";
    recordingOff = false;
    recordingPaused = false;
  } else if (!recordingPaused) {
    btn.innerHTML = "Resume Recording";
    recordingOff = false;
    recordingPaused = true;
  }
  updateDashboardAndRecordingStatus();
}
// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function getNewDbName(dbNameSuffix) {
  var name = "";
  today = new Date();
  recCreationTimeStamp = today;
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
  createOrOpenDb(dbName, recCreationTimeStamp);
  InitRecorder();
  elm = document.getElementById('recordSessionName');
  arr = parseDbName(dbName);
  elm.innerHTML = arr[1] + " [" + arr[2] + "]";

  btn = document.getElementById('recordButton');
  btn.innerHTML = "Pause Recording";
  recordingOff = false;
  recordingPaused = false;
  document.getElementById('recordNameDiv').style.display = "none";
  updateDashboardAndRecordingStatus();
}

function insertJsonData(db, jsonData) {
  // Start a database transaction and get the notes object store
  var tx = db.transaction([dbObjStoreName], 'readwrite');
  var store = tx.objectStore(dbObjStoreName);
  store.add(jsonData); // Wait for the database transaction to complete
  tx.oncomplete = function() {}
  tx.onerror = function(event) {
    console.log('Error storing data! ' + event.target.errorCode);
  }
}

function createAccumulatedDweet(d) {
  // Note that the signalling messages have already been removed
  // in accumulatedRecordState
  for (const k in accumulatedRecordState) {
    if (typeof d.content[k]=='undefined') {
      d.content[k] = accumulatedRecordState[k];
    }
  }
  return d;
}

function initRecordingPrevContent() {
  // periodically keep clearing accumulated state if not recording
  doRecord = (!recordingOff && !recordingPaused);
  if (!doRecord) accumulatedRecordState = {};
}

function processRecordDweet(d) {
  // We already have the UID
  // delete d.thing;
  if (d.content['INITIAL'] == "1") skipRecording = true;
  if (d.content['STANDBY'] == "1") skipRecording = false;
  if (d.content['ACTIVE'] == "1") skipRecording = false;
  if (d.content['RUNNING'] == "1") skipRecording = false;
  if (d.content['ERROR'] == "1") skipRecording = false;
  if (typeof d.content['WMSG'] != 'undefined') {
    recExpectWarningMsg = true;
    accumulatedRecordState['L1'] = "";
    accumulatedRecordState['L2'] = "";
    accumulatedRecordState['L3'] = "";
    accumulatedRecordState['L4'] = "";
    recL1Valid = recL2Valid = recL3Valid = recL4Valid = false;
  }
  if (typeof d.content['EMSG'] != 'undefined') {
    recExpectErrorMsg = true;
    accumulatedRecordState['L1'] = "";
    accumulatedRecordState['L2'] = "";
    accumulatedRecordState['L3'] = "";
    accumulatedRecordState['L4'] = "";
    recL1Valid = recL2Valid = recL3Valid = recL4Valid = false;
  }
  if (recExpectWarningMsg || recExpectErrorMsg) {
    if (recL1Valid && recL2Valid && recL3Valid && recL4Valid) {
      recExpectWarningMsg = false;
      recExpectErrorMsg = false;
      recL1Valid = recL2Valid = recL3Valid = recL4Valid = false;
    }
  }
  if (recExpectWarningMsg || recExpectErrorMsg) {
    if (typeof d.content['L1'] != 'undefined') recL1Valid = true;
    if (typeof d.content['L2'] != 'undefined') recL2Valid = true;
    if (typeof d.content['L3'] != 'undefined') recL3Valid = true;
    if (typeof d.content['L4'] != 'undefined') recL4Valid = true;
  }
  if (!recExpectWarningMsg && !recExpectErrorMsg && !skipRecording) {
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
    if (typeof accumulatedRecordState[key] == 'undefined') {
      accumulatedRecordState[key] = value;
    }
    else {
      prevValue = accumulatedRecordState[key];
      if (prevValue != value) {
        accumulatedRecordState[key] = value;
      }
      else {
        delete d.content[key];
      }
    }
  }
  var emptyContent = true;
  for (let key in d.content) {
    emptyContent = false;
    break;
  }

  doRecord = (!recordingOff && !recordingPaused);
  recordBox = document.getElementById("recordBox");
  if (!emptyContent) {
    if (doRecord) {
      if (db && app.sessionVersion=='UNKNOWN') {
        app.sessionVersion = SESSION_VERSION;
        d.content.SESSION_VERSION = app.sessionVersion;
      }
      if (!prevDweetRecorded) {
	// Add on the accumulated state first
	d = createAccumulatedDweet(d);
	// console.log(d);
      }
      recordBox.innerText = JSON.stringify(d, null, ". ");
      if (db) insertJsonData(db, d);
      prevDweetRecorded = doRecord;
    }
  }
}

function InitRecorder() {
  recordStartDate = new Date();
}

