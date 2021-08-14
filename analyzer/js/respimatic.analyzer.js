var importJsonArray = [];
var analysisRangeSliderDiv = null;
var rangeSlider = null;

document.title = respimaticUid + " (ANALYZER)" ;
if (!window.indexedDB) {
    alert("IndexedDB not available in your browser.\nSwitch browsers");
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function listDbTableRow(item, index) {
  nameTm = parseDbName(item);

  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return;

  var table = document.getElementById("dbTable");

  var row = table.insertRow();

  var cell;
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="selectDbRow(this)">SELECT</button>' ;
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="exportDbRow(this)">EXPORT</button>' ;
  cell = row.insertCell();
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="deleteDbRow(this)">DELETE</button>' ;

}

function exportDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  var dbName = respimaticUid + '|' + p.cells[2].innerHTML + '|' + p.cells[3].innerHTML;
  exportDb(dbName);
}

function selectDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + p.cells[2].innerHTML + '|' + p.cells[3].innerHTML;
  sessionDbName = dbName;
  
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + 
    ' [' + p.cells[2].innerHTML + ' ' + p.cells[3].innerHTML + ' ]';

  initSession(dbName);
  return dbName;
}

function deleteDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  name = respimaticUid + '|' + p.cells[2].innerHTML + '|' + p.cells[3].innerHTML;

  // Delete the actual database
  deleteDb(name);

  // remove from HTML table
  p.parentNode.removeChild(p);

  // return the name just in case
  return dbName;
}

// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////

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
    name = respimaticUid + '|' + row.cells[2].innerHTML + '|' + row.cells[3].innerHTML;
    deleteDb(name);
    table.deleteRow(0);
  }
}

function checkDbReady() {
//return true;
  if (sessionDbReady && sessionDbName) return true;

  if (!dbName) {
    alert('No Session Selected\nPlease Select Session for Analysis');
    return false;
  }

  nameTm = parseDbName(dbName);
  sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]' ;
  alert('Session ' + sessionName + '\nNot yet ready\nPlease try again');
  return false;
}

function selectSession() {
  document.getElementById("selectorDiv").style.display = "block";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  listAllDbs();
}

function doImport(file, fileName, dbName) {

  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    importJsonArray = JSON.parse(evt.target.result);

    var dbReq = window.indexedDB.open(dbName, dbVersion);

    dbReq.onupgradeneeded = function(event) {
      // Save the IDBDatabase interface
      var db = event.target.result;
      var dbObjStore;
      if (!db.objectStoreNames.contains(dbObjStoreName)) {
        dbObjStore = db.createObjectStore(dbObjStoreName, {keyPath: dbPrimaryKey});
      } else {
        dbObjStore = dbReq.transaction.objectStore(dbObjStoreName);
      }
    };

    dbReq.onsuccess = function(event) {
      var db = event.target.result;
      for (i=0; i<importJsonArray.length; i++) {
        jsonData = importJsonArray[i];
        var tx = db.transaction([dbObjStoreName], 'readwrite');
        var store = tx.objectStore(dbObjStoreName);  
        store.add(jsonData);  
      }
      // free up memory ASAP
      importJsonArray = [];
      registerDbName(dbName);
      listAllDbs();
    }
  }
}

function importFile() {
  elm = document.getElementById("fileSelector");
  var fileName = elm.value;
  var file = elm.files[0];
  elm = document.getElementById("importSessionName");
  sessionName = elm.value;

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
    dbName= respimaticUid + '|' + sessionName + "|" + nameTagTime;
    if (checkDbExists(dbName)) {
      alert("Session name already exists\n" + sessionName + "\nTry again");
    } else break;
  } while (true) ;

  doImport(file, fileName, dbName);
}

function selectImport() {
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "block";
}

function selectExport() {
  selectSession();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  displayStats();
}

function selectErrorWarnings() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "block";
  document.getElementById("importDiv").style.display = "none";

  displayErrorWarnings();
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  displayCharts();
}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "block";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  displayRawData();
}

function initSession() {
  if (!sessionDbName) {
    alert("Please Select Session");
    return;
  }
  resetAnalysisData();
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    sessionDbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.getAllKeys();

    keyReq.onsuccess = function(event) {
      var keys = event.target.result;
      allDbKeys = keys;
      if (keys.length==0) {
        alert("Selected Session has no data");
      }

      logStartTime = new Date(keys[0]);
      logStartTime.setMilliseconds(0);
      logEndTime = new Date(keys[keys.length-1]);
      logEndTime.setMilliseconds(0);
      analysisStartTime = new Date(logStartTime);
      analysisEndTime = new Date(logEndTime);

      updateSelectedDuration();
      updateLogDuration();

      gatherGlobalData();
      slider = document.getElementById("analysisWindowDiv");
      slider.style.display = "block";
    }
  }
}

function resetAnalysisData() {
  initGlobalData();
  initStats();
  initCharts();
  initRawDump();
  initErrorWarnings();

  importJsonArray = [];
}

function checkValidAnalysisDuration() {
//return true;
  var diff = analysisEndTime - analysisStartTime;
  if (diff<=0) {
    alert("Analysis EndTime must be greater than StartTime");
    return false;
  }
  else return true;
}

function updateLogDuration() {
  rangeSlider.updateOptions({
    range: {
      'min': logStartTime.getTime(),
      'max': logEndTime.getTime()
    },
    start: [
      analysisStartTime.getTime(), 
      analysisEndTime.getTime()
    ],
  });

  var diff = logEndTime - logStartTime;

  elm = document.getElementById("logTimeDuration");
  if (diff>=0) {
    elm.innerHTML = "Session Duration " + msToTimeStr(diff);
  } else {
    elm.innerHTML = "Session Duration " + "NaN" ;
  }
}

function updateSelectedDuration() {
  elm = document.getElementById("selectedTimeDuration");

  var diff = analysisEndTime - analysisStartTime;
  if (diff>=0) {
    elm.innerHTML = msToTimeStr(diff);
  } else {
    elm.innerHTML = "NaN" ;
  }
}

function setTimeInterval() {
  values = rangeSlider.get();
  analysisStartTime = new Date(Number(values[0]));
  analysisEndTime = new Date(Number(values[1]));

  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
}

function resetTimeInterval() {
  analysisStartTime = logStartTime;
  analysisEndTime = logEndTime;

  st = logStartTime.getTime();
  et = logEndTime.getTime();
  rangeSlider.set([st,et]);

  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
}

window.onload = function() {
  sessionDbName = "" ;
  sessionDbReady = false ;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + " No Session Selected";

  // Create analysis range slider
  analysisRangeSliderDiv = document.getElementById('analysisRangeSliderDiv');
  createAnalysisRangeSlider();

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  resetAnalysisData();
  selectSession();
}

function selectExit() {
  window.location.assign("../index.html");
}

function createAnalysisRangeSlider() {
  rangeSlider = noUiSlider.create(analysisRangeSliderDiv, {
    // Create two timestamps to define a range.
    range: {
        min: logStartTime.getTime(),
        max: logEndTime.getTime()+10000
    },
    // Steps of one second
    step: 1000,
    // Two more timestamps indicate the handle starting positions.
    start: [
      analysisStartTime.getTime(), 
      analysisEndTime.getTime()+10000
    ],
    //some formatting
    padding: [1000, 1000],
    connect: [false, true, false],
    // handle labels
    tooltips: [
      {
        to: function(ms) { return msToDateStr(ms); },
        from: function(dt) { return dateStrToMs(dt); }
      },
      {
        to: function(ms) { return msToDateStr(ms); },
        from: function(dt) { return dateStrToMs(dt); }
      }
    ]  
  });
}

