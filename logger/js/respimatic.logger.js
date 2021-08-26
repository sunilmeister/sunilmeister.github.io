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

// check for browser capability
document.title = respimaticUid + " (RECORDER)";
if (!window.indexedDB) {
  alert("IndexedDB not available in your browser.\nSwitch browsers");
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
    if (checkDbExists(name)) {
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
  cell.innerHTML = '<button class="dbTableButton" onclick="exportDbRow(this)">EXPORT</button>';
  cell = row.insertCell();
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="deleteDbRow(this)">DELETE</button>';
}

function exportDbRow(row) {
  var p = row.parentNode.parentNode;
  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dbName = respimaticUid + '|' + p.cells[1].innerHTML + "|" + p.cells[2].innerHTML;
  exportDb(dbName);
}

function deleteDbRow(row) {
  var p = row.parentNode.parentNode;
  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dName = respimaticUid + '|' + p.cells[1].innerHTML + "|" + p.cells[2].innerHTML;
  if (!confirm("Deleting Session named\n" + p.cells[1].innerHTML)) {
    return;
  }
  // Delete the actual database
  deleteDb(dName);
  // remove from HTML table
  p.parentNode.removeChild(p);
}

function insertJsonData(db, jsonData) {
  // Start a database transaction and get the notes object store
  var tx = db.transaction([dbObjStoreName], 'readwrite');
  var store = tx.objectStore(dbObjStoreName);
  store.add(jsonData); // Wait for the database transaction to complete
  tx.oncomplete = function () {}
  tx.onerror = function (event) {
    alert('Error storing data! ' + event.target.errorCode);
  }
}

function listAllDbs() {
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  table.innerHTML = "";
  var retrieved_dbs = getAllDbs();
  if (retrieved_dbs) {
    retrieved_dbs.forEach(listDbTableRow);
  }
}

function deleteAllDbs() {
  if (!confirm("Deleting All Saved Sessions")) return;
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  numRows = table.rows.length;
  for (i = 0; i < numRows; i++) {
    row = table.rows[0];
    name = respimaticUid + '|' + row.cells[1].innerHTML + '|' + row.cells[2].innerHTML;
    deleteDb(name);
    table.deleteRow(0);
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
  sessionName.innerHTML = arr[1] + " [" + arr[2] + "]";
}
// ///////////////////////////////////////////////////////
// Dweet Functions 
// ///////////////////////////////////////////////////////
function displayTweet(d) {
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d, null, ". ");
}

function processDweet(d) {
  if (!doLog) return;
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
    dweetBox.innerText = dweetBox.textContent = "\n\n<Record pruned>";
  } else {
    insertJsonData(db, d);
    dweetBox.innerText = dweetBox.textContent = JSON.stringify(d, null, ". ");
  }
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function (d) {
    processDweet(d);
  });
}
// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////
function startLog() {
  if (doLog) return;
  var heading = document.getElementById("SysUid");
  heading.innerText = "Recording In-progress for\n\n" + respimaticUid;
  doLog = true;

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body)
  elm.style.backgroundColor = style.getPropertyValue('--rsp_green');
}

function pauseLog() {
  if (!doLog) return;
  var heading = document.getElementById("SysUid");
  heading.innerText = "Recording Paused for\n\n" + respimaticUid;
  doLog = false;

  elm = document.getElementById("activeSessionDiv");
  style = getComputedStyle(document.body)
  elm.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
}

window.onload = function () {
  var heading = document.getElementById("SysUid");
  heading.innerText = "Ready to Record for\n\n" + respimaticUid;
  listAllDbs();
  waitForDweets();
}

function selectExit() {
  if (doLog) {
    if (!confirm("Recording will STOP")) {
      return;
    }
  }
  window.location.assign("../index.html");
}

