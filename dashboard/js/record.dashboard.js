
function blinkRecordButton() {
  btn = document.getElementById("recordButton");
  var style = getComputedStyle(document.body)
  if (recordingPaused) {
    if (recordButtonBackground=="BLUE") {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_orange');
      recordButtonBackground = "ORANGE";
    } else {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_blue');
      recordButtonBackground = "BLUE";
    }
  } else {
    btn.style.backgroundColor = style.getPropertyValue('--rsp_blue');
    recordButtonBackground = "BLUE";
  }
}

function toggleRecording() {
  var style = getComputedStyle(document.body)
  btn = document.getElementById("recordButton");
  if (recordingOff) {
    // check for browser capability
    if (!window.indexedDB) {
      alert("IndexedDB not available in your browser.\nUse different browser");
      return;
    }

    createNewDb();
    if (!dbName) {
      alert("No Recording Session created\nTry again!");
      return;
    } 
    btn.innerHTML = "Pause Recording" ;
    recordingOff = false;
    recordingPaused = false;
  } else if (recordingPaused) {
    btn.innerHTML = "Pause Recording" ;
    recordingOff = false;
    recordingPaused = false;
  } else if (!recordingPaused) {
    btn.innerHTML = "Resume Recording" ;
    recordingOff = false;
    recordingPaused = true;
  }
  updateDashboardAndRecordingStatus();
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function getNewDbName() {
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
  do {
    var dbNameSuffix = prompt("Name the new Session", "New Session");
    if (!dbNameSuffix) return "";
    name = dbNamePrefix + '|' + dbNameSuffix + "|" + nameTagTime;
    if (!isValidDatabaseName(dbNameSuffix)) {
      alert("Invalid Session name\n" + dbNameSuffix + "\nTry again");
    } else if (checkDbExists(name)) {
      alert("Session name already exists\n" + dbNameSuffix + "\nTry again");
    } else break;
  } while (true);
  return name;
}

function createNewDb() {
  dbName = getNewDbName();
  if (!dbName) return;
  createOrOpenDb(dbName, recCreationTimeStamp);
  InitRecorder();
  elm = document.getElementById('recordSessionName');
  arr = parseDbName(dbName);
  elm.innerHTML = arr[1] + " [" + arr[2] + "]";
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

function initRecordingPrevContent() {
  recPrevContent = {};
}

function processRecordDweet(d) {
  if (recordingOff || recordingPaused) return;

  // We already have the UID
  // delete d.thing;
  if (d.content['INITIAL'] == "1") initialState = true;
  if (d.content['STANDBY'] == "1") initialState = false;
  if (d.content['RUNNING'] == "1") initialState = false;
  if (d.content['ERROR'] == "1") initialState = false;
  if (typeof d.content['WMSG'] != 'undefined') {
    recExpectWarningMsg = true;
    recPrevContent['L1'] = "";
    recPrevContent['L2'] = "";
    recPrevContent['L3'] = "";
    recPrevContent['L4'] = "";
    recL1Valid = recL2Valid = recL3Valid = recL4Valid = false;
  }
  if (typeof d.content['EMSG'] != 'undefined') {
    recExpectErrorMsg = true;
    recPrevContent['L1'] = "";
    recPrevContent['L2'] = "";
    recPrevContent['L3'] = "";
    recPrevContent['L4'] = "";
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
  if (!recExpectWarningMsg && !recExpectErrorMsg && !initialState) {
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
    if (typeof recPrevContent[key] == 'undefined') {
      recPrevContent[key] = value;
    } else {
      prevValue = recPrevContent[key];
      if (prevValue != value) {
        recPrevContent[key] = value;
      } else {
        delete d.content[key];
      }
    }
  }
  var emptyContent = true;
  for (let key in d.content) {
    emptyContent = false;
  }

  recordBox = document.getElementById("recordBox");
  if (!emptyContent) {
    recordBox.innerText = JSON.stringify(d, null, ". ");
    if (db) insertJsonData(db, d);
  }
}

function InitRecorder() {
  periodicTickCount = 0;
  lastDweetTick = 0;
  dweetIntervalCounter = 0;

  recordStartDate = new Date();
  recPrevContent = {};
  recExpectErrorMsg = false;
  recExpectWarningMsg = false;
  recL1Valid = recL2Valid = recL3Valid = recL4Valid = false;

  recordingOff = true;
  recordingPaused = false;
  recordButtonBackground="MEDIUMBLUE";
}


