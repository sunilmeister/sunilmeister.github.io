// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var creationTimeStamp = "";
var db;
var dbName;
var doLog = false;
var firstDweet = true;
var startDate = new Date();
var prevContent = {};
var initialState = true;
var expectErrorMsg = false;
var expectWarningMsg = false;
var l1 = false;
var l2 = false;
var l3 = false;
var l4 = false;
var recorderBackground="MEDIUMBLUE";

// check for continuing dweets
const dweetIntervalMax = 6;
var periodicTickCount = 0;
var lastDweetTick = 0;
var wifiDropped = false;

// Refresh data controls
const REFRESH_DWEET_INTERVAL = 10;
var dweetIntervalCounter = 0;
// check for browser capability
if (!window.indexedDB) {
  alert("IndexedDB not available in your browser.\nSwitch browsers");
}

function undisplayWifiDropped() {
  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body);

  if (doLog) {
    elm.style.backgroundColor = style.getPropertyValue('--rsp_green');
    recorderBackground="GREEN";
  } else {
    elm.style.backgroundColor = style.getPropertyValue('--rsp_orange');
    recorderBackground="ORANGE";
    if (!dbName) {
      dweetBox = document.getElementById('dweetBox');
      dweetBox.innerHTML = "<center><br><br><br><b>No Active Session</b></center>" ;
    } else {
      dweetBox = document.getElementById('dweetBox');
      dweetBox.innerHTML = "<center><br><br><br><b>Recording Paused</b></center>" ;
    }
  }
}

function displayWifiDropped() {
  if (initialState) return;
  if (recorderBackground=="ORANGE") return;

  dweetBox = document.getElementById('dweetBox');
  dweetBox.innerHTML = "<center><br><br><br><b>Wi-Fi Disconnected</b><br><br>System will attempt<br>to re-connect</center>" ;

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body);
  elm.style.backgroundColor = style.getPropertyValue('--rsp_orange');
  recorderBackground="ORANGE";
}

function displayWifiUnconnected() {
  if (recorderBackground=="ORANGE") return;

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body);
  elm.style.backgroundColor = style.getPropertyValue('--rsp_orange');
  recorderBackground="ORANGE";

  dweetBox = document.getElementById('dweetBox');
  dweetBox.innerHTML = "<center><br><br><br><b>Wi-Fi not connected</b><br><br>Use Control Panel<br>to connect to Wi-Fi</center>" ;
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

function listDbTableRow(item, index) {
  // do not list current db
  if (item == dbName) return;
  nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return;
  var table = document.getElementById("dbTable");
  var row = table.insertRow();
  var cell;
  cell = row.insertCell();
  cell.style.paddingRight = "25px" ;
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
}

function exportDbRow() {
  var row = getSelectedTableRow();
  if (!row) {
    alert("No selected item\nSelect by clicking on a table row\nTry again!");
    return;
  }

  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dbName = respimaticUid + '|' + row.cells[0].innerHTML + "|" + row.cells[1].innerHTML;
  exportDb(dbName);
}

function deleteDbRow() {
  var row = getSelectedTableRow();
  if (!row) {
    alert("No selected item\nSelect by clicking on a table row\nTry again!");
    return;
  }

  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dName = respimaticUid + '|' + row.cells[0].innerHTML + "|" + row.cells[1].innerHTML;
  if (!confirm("Deleting Session named\n" + row.cells[0].innerHTML)) {
    return;
  }
  // Delete the actual database
  deleteDb(dName);
  // remove from HTML table
  row.parentNode.removeChild(row);
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

function listAllDbs() {
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  initSelectRowTable("dbTable", null);
  var rowCount = table.rows.length;
  for (var i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }

  var retrieved_dbs = getAllDbs();
  if (!retrieved_dbs) return;
  for (i = retrieved_dbs.length - 1; i >= 0; i--) {
    listDbTableRow(retrieved_dbs[i], i);
  }
}

function deleteAllDbs() {
  if (!confirm("Deleting All Saved Sessions")) return;
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
}

function initState() {
  firstDweet = true;
  startDate = new Date();
  prevContent = {};
  initialState = true;
  expectErrorMsg = false;
  expectWarningMsg = false;
  l1 = l2 = l3 = l4 = false;
}

function createNewDb() {
  dbName = getNewDbName();
  if (!dbName) return;
  createOrOpenDb(dbName, creationTimeStamp);
  initState();
  startLog();
  var sessionName = document.getElementById('sessionName');
  arr = parseDbName(dbName);
  //sessionName.innerHTML = arr[1] + " [" + arr[2] + "]";
  sessionName.innerHTML = arr[1] ;
}
// ///////////////////////////////////////////////////////
// Dweet Functions 
// ///////////////////////////////////////////////////////
function displayTweet(d) {
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d, null, ". ");
}

function processDweet(d) {
  if (firstDweet) {
    firstDweet = false;
    startDate = d.created;
    elm = document.getElementById("startTime");
    elm.innerHTML = "Starting Time " + dateToTimeStr(d.created);
  } else {
    curDate = d.created;
    var diff = curDate - startDate;
    elm = document.getElementById("logTimeDuration");
    elm.innerHTML = "Session Duration " + msToTimeStr(diff);
  }
  if (!doLog) return;

  if (typeof d.content['LOST'] != 'undefined') {
    console.log("LOST=" + d.content['LOST']);
  }

  // We already have the UID
  delete d.thing;
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
  var dweetBox = document.getElementById('dweetBox');
  if (emptyContent) {
    dweetBox.innerHTML = "<center><br><br><br><b>Record pruned</b></center>" ;
  } else {
    if (db) insertJsonData(db, d);
    dweetBox.innerText = dweetBox.textContent = JSON.stringify(d, null, ". ");
  }
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    lastDweetTick = periodicTickCount;
    dweetIntervalCounter++;
    if (dweetIntervalCounter > REFRESH_DWEET_INTERVAL) {
      dweetIntervalCounter = 0;
      prevContent = {};
    }
    processDweet(d);
  });
}
// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////
function startLog() {
  if (doLog) return;
  if (!dbName) {
    alert("No Session created");
    return;
  }
  heading = document.getElementById("SysUidMsg");
  heading.innerText = "Recording ...";
  heading = document.getElementById("SysUid");
  heading.innerText = "\n" + respimaticUid;
  doLog = true;
  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body)
  elm.style.backgroundColor = style.getPropertyValue('--rsp_green');
  recorderBackground="GREEN";
}

function pauseLog() {
  if (!doLog) return;
  heading = document.getElementById("SysUidMsg");
  heading.innerText = "Recording Paused";
  heading = document.getElementById("SysUid");
  heading.innerText = "\n" + respimaticUid;
  doLog = false;

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body)
  elm.style.backgroundColor = style.getPropertyValue('--rsp_orange');
  recorderBackground="ORANGE";

  if (!dbName) {
    dweetBox = document.getElementById('dweetBox');
    dweetBox.innerHTML = "<center><br><br><br><b>No Active Session</b></center>" ;
  } else {
    dweetBox = document.getElementById('dweetBox');
    dweetBox.innerHTML = "<center><br><br><br><b>Recording Paused</b></center>" ;
  }
}

function selectExit() {
  if (doLog) {
    if (!confirm("Recording will STOP")) {
      return;
    }
  }
  //window.location.assign("../index.html");
  window.open('','_self').close();
}

window.onload = function() {
  initDbNames();
  document.title = respimaticTag + " (RECORDER)";

  periodicTickCount = 0;
  lastDweetTick = 0;
  dweetIntervalCounter = 0;

  heading = document.getElementById("SysUidMsg");
  heading.innerText = "Ready to Record";
  heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";

  listAllDbs();

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body)
  elm.style.backgroundColor = style.getPropertyValue('--rsp_orange');
  recorderBackground="ORANGE";

  dweetBox = document.getElementById('dweetBox');
  dweetBox.innerHTML = "<center><br><br><br><b>No Active Session</b></center>" ;

  waitForDweets();
  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );
}

window.onbeforeunload = function(e) {
  if (doLog) {
    const msg = 'Recording will stop';
    return msg;
  }
}

var periodicIntervalId = setInterval(function() {
  periodicTickCount++;
  if (firstDweet) {
    displayWifiUnconnected();
  } else if ((periodicTickCount-lastDweetTick) >= dweetIntervalMax) {
    displayWifiDropped();
  } else {
    undisplayWifiDropped();
  }
}, 1500);
