// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function cancelRecordingName() {
  document.getElementById('recordNameDiv').style.display = "none";
}

function acceptRecordingName() {
  let suffix = document.getElementById('recordName').value;
  session.database.dbName = getNewDbName(suffix);
  if (!session.database.dbName) return;
  createOrOpenDb(session.database.dbName, session.recorder.creationTimeStamp, showNewRecording);
  let elm = document.getElementById('recordSessionName');
  elm.style.backgroundColor = palette.green;
  elm.style.color = palette.brightgreen;
  let arr = parseDbName(session.database.dbName);
  elm.innerHTML = arr[1] + " [" + arr[2] + "]";

  let btn = document.getElementById('recordButton');
  btn.innerHTML = "Stop Recording";
  document.getElementById('recordNameDiv').style.display = "none";

  session.recorder.off = false;
  session.recorder.paused = false;
  btn = document.getElementById("recordButton");
  btn.innerHTML = "Stop Recording";
  updateRecordingIndicator();
}

function showNewRecording() {
  showAllDbs();
  highlightDbRow(session.database.dbName);
}

function startNewRecording() {
  // check for browser capability
  if (!window.indexedDB) {
    modalAlert("IndexedDB not available in your browser", "Use different browser");
    return;
  }
  document.getElementById('recordNameDiv').style.display = "block";
  document.getElementById('recordName').value = "New Recording"
  updateRecordingIndicator();
}

function resumeRecording() {
  session.recorder.off = false;
  session.recorder.paused = false;
  let btn = document.getElementById("recordButton");
  btn.innerHTML = "Stop Recording";
  updateRecordingIndicator();
}

function closeRecording() {
	if (!session.database.db) return;
  showAllDbs();
  highlightDbRow(null);

  session.database.db.close();
  session.database.db = null;
  session.database.dbName = null;
  session.database.dbReady = false;

  // Initialize all recorder variables
  session.recorder = cloneObject(SessionDataTemplate.recorder);

  let btn = document.getElementById("recordButton");
  btn.innerHTML = "Start Recording";
  blankRecordingBox();
  updateRecordingIndicator();
}

function pauseRecording() {
  showAllDbs();
  highlightDbRow(session.database.dbName);
  // Initialize all recorder variables
  let versionRecorded = session.recorder.versionRecord;
  let creationTimeStamp = session.recorder.creationTimeStamp;
  session.recorder = cloneObject(SessionDataTemplate.recorder);
  session.recorder.versionRecorded = versionRecorded;
  session.recorder.creationTimeStamp = creationTimeStamp;

  session.recorder.off = false;
  session.recorder.paused = true;
  let btn = document.getElementById("recordButton");
  btn.innerHTML = "Resume Recording";
  updateRecordingIndicator();
}

function stopRecording() {
  modalConfirm(RECORDING_STOP_TITLE, RECORDING_STOP_MSG, 
    closeRecording, pauseRecording, null, 
    "CLOSE Recording", "PAUSE Recording");
}

function blankRecordingBox() {
  let elm = document.getElementById('recordSessionName');
  elm.style.backgroundColor = palette.darkred;
  elm.style.color = "white";
  elm.innerHTML = "No Active Recording"
  recordBox = document.getElementById("recordBox");
  recordBox.innerHTML = "";
}

function changeRecordingStatus() {
  if (session.recorder.off) {
    startNewRecording();
  } else if (session.recorder.paused) {
    resumeRecording();
  } else {
    stopRecording();
  }
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function getNewDbName(dbNameSuffix) {
  let name = "";
  let today = new Date();
  session.recorder.creationTimeStamp = today;
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  let hrs = String(today.getHours()).padStart(2, '0');
  let min = String(today.getMinutes()).padStart(2, '0');
  let sec = String(today.getSeconds()).padStart(2, '0');
  let dmy = dd + "-" + mm + "-" + yyyy;
  let nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;
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

function insertJsonData(jsonData) {
  // Start a database transaction and get the notes object store
  let tx = session.database.db.transaction([session.database.dbObjStoreName], 'readwrite');
  let store = tx.objectStore(session.database.dbObjStoreName);
  store.add(jsonData); // Wait for the database transaction to complete
  tx.oncomplete = function () {}
  tx.onerror = function (event) {
    console.error('Error storing data! ',event);
  }
}

function createAccumulatedChirp(d) {
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
  let doRecord = (!session.recorder.off && !session.recorder.paused);
  if (!doRecord) session.recorder.accumulatedState = {};
}

function processRecordChirp(d) {
  let skipRecording = false;
  if (session.stateData.initial) skipRecording = true;

  // prune the content if same as previous
  for (let key in d.content) {
    // get key value pairs
    let value = d.content[key];
    if (isUndefined(session.recorder.accumulatedState[key])) {
      session.recorder.accumulatedState[key] = value;
    } else {
      let prevValue = session.recorder.accumulatedState[key];
      if (prevValue != value) {
        session.recorder.accumulatedState[key] = value;
      }
    }
  }
  let emptyContent = true;
  for (let key in d.content) {
    emptyContent = false;
    break;
  }

  let doRecord = (!session.recorder.off && !session.recorder.paused);
  let recordBox = document.getElementById("recordBox");
  if (!emptyContent) {
    if (doRecord) {
      if (session.database.db && !session.recorder.versionRecorded) {
        session.recorder.versionRecorded = true;
        d.content.RECORDING_VERSION = CURRENT_RECORDING_VERSION;
      }
      if (!session.recorder.prevChirpRecorded) {
        // Add on the session.recorder.accumulatedState state first
        d = createAccumulatedChirp(d);
      }
      recordBox.innerText = JSON.stringify(d, null, ". ");
      if (session.database.db) insertJsonData(d);
      session.recorder.prevChirpRecorded = doRecord;
    }
  }
}

var blankRecordingIndicator = false;
function blinkRecordingIndicator() {
  if (session.recorder.off) return;
	if (blankRecordingIndicator) {
  	if (session.recorder.paused) {
    	document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
		} else {
    	document.getElementById("RecordIndicator").src = "../common/img/GreenDot.png";
		}
		blankRecordingIndicator = false;
	} else {
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
		blankRecordingIndicator = true;
	}
}

function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("RecordIndicator").src = "../common/img/GreenDot.png";
  }
}

setInterval(function () {
	blinkRecordingIndicator();
}, FAST_BLINK_INTERVAL_IN_MS)


