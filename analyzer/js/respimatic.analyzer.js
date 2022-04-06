// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var analysisRangeSliderDiv = null;
var rangeSlider = null;
var sliderCommitPending = false;
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
  cell.innerHTML = '<button class="dbTableButton" style="background-color:var(--rsp_darkblue);" onclick="selectDbRow(this)">SELECT</button>';
  cell = row.insertCell();
  cell.style.paddingRight = "25px" ;
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
  cell = row.insertCell();
  cell.innerHTML = '<button class="dbTableButton" style="background-color:var(--rsp_darkblue);" onclick="deleteDbRow(this)">DELETE</button>';
}

function selectDbRow(row) {
  var p = row.parentNode.parentNode;
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + p.cells[1].innerHTML + '|' + p.cells[2].innerHTML;
  sessionDbName = dbName;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = '<b>SYSUID</b><br>' + respimaticUid ;
  var sessionInfo = document.getElementById("SessionInfo");
  sessionInfo.innerHTML = '<b>Session Name</b><br>' + p.cells[1].innerHTML + '<br><br><b>Creation Date</b><br>' + p.cells[2].innerHTML;
  initSession(dbName);
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("selectorDiv").style.display = "none";
  return dbName;
}

function deleteDbRow(row) {
  var p = row.parentNode.parentNode;
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
  for (i = 0; i < numRows; i++) {
    row = table.rows[0];
    name = respimaticUid + '|' + row.cells[1].innerHTML + '|' + row.cells[2].innerHTML;
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
  sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]';
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
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
  listAllDbs();
}

function selectImport() {
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
}

function selectExport() {
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "block";
  listAllExportDbs();
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
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
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
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
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
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
  displayCharts();
}

function selectExportWindow() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "block";
  document.getElementById("exportSessionDiv").style.display = "none";
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
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
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
      if (keys.length == 0) {
        alert("Selected Session has no data");
      }
      logStartTime = new Date(keys[0]);
      logStartTime.setMilliseconds(0);
      logEndTime = new Date(keys[keys.length - 1]);
      logEndTime.setMilliseconds(0);
      analysisStartTime = new Date(logStartTime);
      analysisEndTime = new Date(logEndTime);
      updateSelectedDuration();
      updateLogDuration();
      gatherGlobalData();
    }
  }
}

function resetAnalysisData() {
  initGlobalData();
  initStats();
  initCharts();
  initRawDump();
  initErrorWarnings();
  initImportExport();
}

function checkValidAnalysisDuration() {
  //return true;
  var diff = analysisEndTime - analysisStartTime;
  if (diff <= 0) {
    alert("Analysis EndTime must be greater than StartTime");
    return false;
  } else return true;
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
  if (diff >= 0) {
    elm.innerHTML = "Session Duration " + msToTimeStr(diff);
  } else {
    elm.innerHTML = "Session Duration " + "NaN";
  }
}

function updateSliderDuration() {
  values = rangeSlider.get();
  st = new Date(Number(values[0]));
  st.setMilliseconds(0);
  et = new Date(Number(values[1]));
  et.setMilliseconds(0);
  var diff = et - st;
  elm = document.getElementById("intervalStart");
  elm.value = dateToStr(st);
  elm = document.getElementById("intervalEnd");
  elm.value = dateToStr(et);
  elm = document.getElementById("intervalDuration");
  elm.value = msToTimeStr(diff);
}

function updateSelectedDuration() {
  elm = document.getElementById("selectedTimeDuration");
  var diff = analysisEndTime - analysisStartTime;
  if (diff >= 0) {
    elm.innerHTML = "Window Duration " + msToTimeStr(diff);
  } else {
    elm.innerHTML = "NaN";
  }
  elm = document.getElementById("intervalStart");
  elm.value = dateToStr(analysisStartTime);
  elm = document.getElementById("intervalEnd");
  elm.value = dateToStr(analysisEndTime);
  elm = document.getElementById("intervalDuration");
  elm.value = msToTimeStr(diff);
}

function setTimeInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  values = rangeSlider.get();
  st = new Date(Number(values[0]));
  st.setMilliseconds(0);
  et = new Date(Number(values[1]));
  et.setMilliseconds(0);
  if ((st.getTime() == analysisStartTime.getTime()) &&
    (et.getTime() == analysisEndTime.getTime())) return;
  analysisStartTime = new Date(st);
  analysisEndTime = new Date(et);
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  //resetDivs();
}

function cancelTimeInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  st = analysisStartTime.getTime();
  et = analysisEndTime.getTime();
  rangeSlider.set([st, et]);
  updateSelectedDuration();
}

function resetTimeInterval() {
  cancelTimeInterval();
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  if ((logStartTime.getTime() == analysisStartTime.getTime()) &&
    (logEndTime.getTime() == analysisEndTime.getTime())) return;
  analysisStartTime = logStartTime;
  analysisEndTime = logEndTime;
  st = logStartTime.getTime();
  et = logEndTime.getTime();
  rangeSlider.set([st, et]);
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  resetDivs();
}

window.onload = function() {
  initDbNames();
  document.title = respimaticUid + " (ANALYZER)";

  sessionDbName = "";
  sessionDbReady = false;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = '<b>SYSUID</b><br>' + respimaticUid ;
  var sessionInfo = document.getElementById("SessionInfo");
  sessionInfo.innerHTML = '<br>No Session' ;
  // Create analysis range slider
  analysisRangeSliderDiv = document.getElementById('analysisRangeSliderDiv');
  createAnalysisRangeSlider();
  rangeSlider.on('end', function() {
    flashAnalysisWindowButtons();
    updateSliderDuration();
    sliderCommitPending = true;
  });
  unflashAnalysisWindowButtons();
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  resetAnalysisData();
  selectSession();
  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('','_self').close();
}

function createAnalysisRangeSlider() {
  rangeSlider = noUiSlider.create(analysisRangeSliderDiv, {
    // Create two timestamps to define a range.
    range: {
      min: logStartTime.getTime(),
      max: logEndTime.getTime() + 10000
    },
    // Steps of one second
    step: 1000,
    // Two more timestamps indicate the handle starting positions.
    start: [
      analysisStartTime.getTime(),
      analysisEndTime.getTime() + 10000
    ],
    //some formatting
    padding: [1000, 1000],
    connect: [false, true, false],
    // handle labels
    tooltips: [{
        to: function(ms) {
          return msToDateStr(ms);
        },
        from: function(dt) {
          return dateStrToMs(dt);
        }
      },
      {
        to: function(ms) {
          return msToDateStr(ms);
        },
        from: function(dt) {
          return dateStrToMs(dt);
        }
      }
    ],
    //pips: {mode: 'count', values: 5},
  });
}
var intervalId = setInterval(function() {
  blinkAnalysisWindowButtons();
}, 1000);
var analysisButtonsFlashed = false;

function blinkAnalysisWindowButtons() {
  if (!sliderCommitPending) return;
  if (analysisButtonsFlashed) {
    unflashAnalysisWindowButtons();
  } else {
    flashAnalysisWindowButtons();
  }
}

function flashAnalysisWindowButtons() {
  analysisButtonsFlashed = true;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_orange');
  el = document.getElementById("btnSetInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnCancelInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnResetInterval");
  el.style.backgroundColor = bgd;
}

function unflashAnalysisWindowButtons() {
  analysisButtonsFlashed = false;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_blue');
  el = document.getElementById("btnSetInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnCancelInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnResetInterval");
  el.style.backgroundColor = bgd;
}

function resetDivs() {
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
}
