// check for browser capability
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

  var cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="selectDbRow(this)">SELECT</button>' ;
  cell = row.insertCell();
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" onclick="deleteDbRow(this)">DELETE</button>' ;

}

function getSessionDuration(dbName) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    dbReady = true;

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
      logEndTime = new Date(keys[keys.length-1]);
      analysisStartTime = logStartTime;
      analysisEndTime = logEndTime;

      updateSelectedDuration();
      updateLogDuration();

      elm = document.getElementById("startTime");
      elm.value = dateToStr(logStartTime);

      elm = document.getElementById("endTime");
      elm.value = dateToStr(logEndTime);

    }
  }
}

async function selectDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + p.cells[1].innerHTML + '|' + p.cells[2].innerHTML;
  
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + 
    ' [' + p.cells[1].innerHTML + ' ' + p.cells[2].innerHTML + ' ]';

  createOrOpenDb(dbName);

  getSessionDuration(dbName);
  return dbName;
}

function deleteDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  name = respimaticUid + '|' + p.cells[1].innerHTML + '|' + p.cells[2].innerHTML;

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
    name = respimaticUid + '|' + row.cells[1].innerHTML + '|' + row.cells[2].innerHTML;
    deleteDb(name);
    table.deleteRow(0);
  }
}

function checkDbReady() {
  if (dbReady && db && dbName) return true;

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

  listAllDbs();
}

function selectImport() {
  alert("Not yet implemented\nWork In Progress...");
}

function selectExport() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  alert("Not yet implemented\nWork In Progress...");
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";

  collectStats();
}

function selectErrorWarnings() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;
  alert("Not yet implemented\nWork In Progress...");

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "block";
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;
  alert("Not yet implemented\nWork In Progress...");

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "block";
  document.getElementById("errorWarningDiv").style.display = "none";

  dumpRawData();
}

function resetAnalysisData() {
  initStats();
}

function checkValidAnalysisDuration() {
  var diff = analysisEndTime - analysisStartTime;
  if (diff<=0) {
    alert("Analysis EndTime must be greater than StartTime");
    return false;
  }
  else return true;
}

function updateLogDuration() {
  var diff = logEndTime - logStartTime;

  elm = document.getElementById("logTimeDuration");
  if (diff>=0) {
    elm.innerHTML = "Session Duration " + msToTime(diff);
  } else {
    elm.innerHTML = "Session Duration " + "NaN" ;
  }
}

function updateSelectedDuration() {
  var diff = analysisEndTime - analysisStartTime;

  elm = document.getElementById("selectedTimeDuration");
  if (diff>=0) {
    elm.innerHTML = "Selected Duration " + msToTime(diff);
  } else {
    elm.innerHTML = "Selected Duration " + "NaN" ;
  }
}

function selectTimeInterval() {
  var elm = document.getElementById("startTime");
  st = strToDate(elm.value);
  elm = document.getElementById("endTime");
  et = strToDate(elm.value);

  if (st<logStartTime) {
    alert("Start Time is before the Session Start Time\nUsing Session Start Time");
    st = logStartTime;
  }

  if (et>logEndTime) {
    alert("End Time is after the Session End Time\nUsing Session End Time");
    et = logEndTime;
  }

  analysisStartTime = st;
  analysisEndTime = et;

  updateSelectedDuration();
  resetAnalysisData();
}

function selectLogTimes() {
  if ((logStartTime!=analysisStartTime) || (logEndTime!=analysisEndTime)) {
    analysisStartTime = logStartTime;
    analysisEndTime = logEndTime;
    updateSelectedDuration();

    elm = document.getElementById("startTime");
    elm.value = dateToStr(analysisStartTime);

    elm = document.getElementById("endTime");
    elm.value = dateToStr(analysisEndTime);

    resetAnalysisData();
  }
}

window.onload = function() {
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + " No Session Selected";

  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";

  //Date time pickers
  instance = new dtsel.DTS('input[name="startTime"]',  {
    direction: 'BOTTOM',
    dateFormat: "dd-mm-yyyy",
    showTime: true,
    timeFormat: "HH:MM:SS"
  });

  instance = new dtsel.DTS('input[name="endTime"]',  {
    direction: 'BOTTOM',
    dateFormat: "dd-mm-yyyy",
    showTime: true,
    timeFormat: "HH:MM:SS"
  });

  initStats();
}


