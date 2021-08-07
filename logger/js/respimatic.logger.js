var creationTimeStamp = "";
var db;
var dbName;
var doLog = false;

// check for browser capability
document.title = respimaticUid + " (LOGGER)" ;
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

  var dd = String(today. getDate()). padStart(2, '0');
  var mm = String(today. getMonth() + 1). padStart(2, '0'); //January is 0!
  var yyyy = today. getFullYear();

  var hrs = String(today. getHours()). padStart(2, '0');
  var min = String(today. getMinutes()). padStart(2, '0');
  var sec = String(today. getSeconds()). padStart(2, '0');

  dmy = dd + "-" + mm + "-" + yyyy;
  nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;

  do {
    var dbNameSuffix = prompt("Name the new Session","New Session");
    name= dbNamePrefix + '|' + dbNameSuffix + "|" + nameTagTime;
    if (checkDbExists(name)) {
      alert("Session name already exists\n" + dbNameSuffix + "\nTry again");
    } else break;
  } while (true) ;

  return name;
}

function listDbTableRow(item, index) {
  // do not list current db
  if (item==dbName) return;

  nameTm = parseDbName(item);

  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return;

  var table = document.getElementById("dbTable");

  var row = table.insertRow();

  var cell = row.insertCell();
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
  cell = row.insertCell();
  cell.innerHTML = '<button class="tableButton" onclick="deleteDbRow(this)">DELETE</button>' ;

}

function deleteDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dName = respimaticUid + '|' + p.cells[0].innerHTML + "|" + p.cells[1].innerHTML;

  if (!confirm("Deleting Session named\n" + p.cells[0].innerHTML)) {
    return;
  }

  // Delete the actual database
  deleteDb(dName);

  // remove from HTML table
  p.parentNode.removeChild(p);
}

function insertJsonData(db,jsonData) {
  // Start a database transaction and get the notes object store
  let tx = db.transaction([dbObjStoreName], 'readwrite');
  let store = tx.objectStore(dbObjStoreName);  
  store.add(jsonData);  // Wait for the database transaction to complete
  tx.oncomplete = function() { }
  tx.onerror = function(event) {
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
  for (i=0; i<numRows; i++) {
    row = table.rows[0];
    name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(0);
  }
}

function createNewDb() {
  dbName = getNewDbName();
  createOrOpenDb(dbName, creationTimeStamp);
  doLog = true;

  var sessionName = document.getElementById('sessionName');
  arr = parseDbName(dbName);
  sessionName.innerHTML = arr[1] + " [" + arr[2] + "]";

  document.getElementById("btnNewSessionDiv").style.display = "none";
  document.getElementById("btnStartLogDiv").style.display = "none";
  document.getElementById("btnPauseLogDiv").style.display = "block";
}

// ///////////////////////////////////////////////////////
// Dweet Functions 
// ///////////////////////////////////////////////////////

function displayTweet(d) {
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d,null,". ") ;
}

var prevContent = {}; 
var attentionState = false;
var initialState = false;

function processDweet(d) {
  if (!doLog) return ;

  // We already have the UID
  delete d.thing;

  if (d.content['INITIAL'] == "1") {
    initialState = true;
  } else if (d.content['INITIAL'] == "0") {
    initialState = false;
  }

  if (d.content['ATTENTION'] == "1") {
    attentionState = true;
  } else if (d.content['ATTENTION'] == "0") {
    attentionState = false;
  }

  if (!attentionState && !initialState) {
    // Get rid of messages except in INITIAL state or when the attention is ON
    delete d.content['L1'];
    delete d.content['L2'];
    delete d.content['L3'];
    delete d.content['L4'];
  }

  /*
  // prune the content if same as previous
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    if (prevContent[key] === null) {
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
  */

  var emptyContent = true;
  for (let key in d.content) {
    emptyContent = false;
  }

  var dweetBox = document.getElementById('dweetBox');
  if (emptyContent) {
    dweetBox.innerText = dweetBox.textContent = "\n\n<Record pruned>" ;
  } else {
    insertJsonData(db,d);
    dweetBox.innerText = dweetBox.textContent = JSON.stringify(d,null,". ") ;
  }
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    processDweet(d);
  });
}

// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////

function startLog() {
  if (doLog) return;
  doLog = true;

  document.getElementById("btnNewSessionDiv").style.display = "none";
  document.getElementById("btnStartLogDiv").style.display = "none";
  document.getElementById("btnPauseLogDiv").style.display = "block";
}

function pauseLog() {
  if (!doLog) return;
  doLog = false;

  document.getElementById("btnNewSessionDiv").style.display = "block";
  document.getElementById("btnStartLogDiv").style.display = "block";
  document.getElementById("btnPauseLogDiv").style.display = "none";
}

window.onload = function() {
  var heading = document.getElementById("SysUid");
  heading.innerHTML = "LOG for " + respimaticUid;
  listAllDbs();

  document.getElementById("btnNewSessionDiv").style.display = "block";
  document.getElementById("btnStartLogDiv").style.display = "none";
  document.getElementById("btnPauseLogDiv").style.display = "none";

  waitForDweets();
}

