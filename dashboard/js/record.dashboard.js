
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
  creationTimeStamp = today;
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
  createOrOpenDb(dbName, creationTimeStamp);
  InitRecorder();

  //sessionName = document.getElementById('recordSessionName');
  //sessionName.innerHTML = dbName;
  //arr = parseDbName(dbName);
  //sessionName.innerHTML = arr[1] + " [" + arr[2] + "]";
  //sessionName.innerHTML = arr[1] ;

}

function insertJsonData(db, jsonData) {
  // Start a database transaction and get the notes object store
  var tx = db.transaction([dbObjStoreName], 'readwrite');
  var store = tx.objectStore(dbObjStoreName);
  store.add(jsonData); // Wait for the database transaction to complete
  tx.oncomplete = function() {}
  tx.onerror = function(event) {
    alert('Error storing data! ' + event.target.errorCode);
  }
}

function initRecordingPrevContent() {
  prevContent = {};
}

function processRecordDweet(d) {
  if (recordingOff || recordingPaused) return;

  if (typeof d.content['LOST'] != 'undefined') {
    console.log("LOST=" + d.content['LOST']);
  }

  // We already have the UID
  // delete d.thing;
  if (d.content['INITIAL'] == "1") initialState = true;
  if (d.content['STANDBY'] == "1") initialState = false;
  if (d.content['RUNNING'] == "1") initialState = false;
  if (d.content['ERROR'] == "1") initialState = false;
  if (typeof d.content['WMSG'] != 'undefined') {
    expectWarningMsg = true;
    prevContent['L1'] = "";
    prevContent['L2'] = "";
    prevContent['L3'] = "";
    prevContent['L4'] = "";
    l1 = l2 = l3 = l4 = false;
  }
  if (typeof d.content['EMSG'] != 'undefined') {
    expectErrorMsg = true;
    prevContent['L1'] = "";
    prevContent['L2'] = "";
    prevContent['L3'] = "";
    prevContent['L4'] = "";
    l1 = l2 = l3 = l4 = false;
  }
  if (expectWarningMsg || expectErrorMsg) {
    if (l1 && l2 && l3 && l4) {
      expectWarningMsg = false;
      expectErrorMsg = false;
      l1 = l2 = l3 = l4 = false;
    }
  }
  if (expectWarningMsg || expectErrorMsg) {
    if (typeof d.content['L1'] != 'undefined') l1 = true;
    if (typeof d.content['L2'] != 'undefined') l2 = true;
    if (typeof d.content['L3'] != 'undefined') l3 = true;
    if (typeof d.content['L4'] != 'undefined') l4 = true;
  }
  if (!expectWarningMsg && !expectErrorMsg && !initialState) {
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
    if (typeof prevContent[key] == 'undefined') {
      prevContent[key] = value;
    } else {
      prevValue = prevContent[key];
      if (prevValue != value) {
        prevContent[key] = value;
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
  if (emptyContent) {
    //recordBox.innerHTML = "<center><br><br><br><b>Record pruned</b></center>" ;
  } else {
    //recordBox.innerText = JSON.stringify(d, null, ". ");
    if (db) insertJsonData(db, d);
  }
}

function InitRecorder() {
  periodicTickCount = 0;
  lastDweetTick = 0;
  dweetIntervalCounter = 0;

  recordStartDate = new Date();
  prevContent = {};
  expectErrorMsg = false;
  expectWarningMsg = false;
  l1 = l2 = l3 = l4 = false;

  recordingOff = true;
  recordingPaused = false;
  recordButtonBackground="MEDIUMBLUE";
}


