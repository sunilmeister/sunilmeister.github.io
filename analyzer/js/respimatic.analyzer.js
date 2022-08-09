// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var analysisRangeSliderDiv = null;
var analysisRangeSlider = null;
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
  row.style.cursor = "pointer";
  var cell;
  cell = row.insertCell();
  cell.style.paddingRight = "25px";
  cell.style.paddingTop = "8px";
  cell.style.paddingBottom = "8px";
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.style.paddingTop = "8px";
  cell.style.paddingBottom = "8px";
  cell.innerHTML = nameTm[2];
}

function selectDbRow() {
  var row = getSelectedTableRow();
  if (!row) {
    alert("No selected item\nSelect by clicking on a table row\nTry again!");
    return;
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  sessionDbName = dbName;
  var sessionInfo = document.getElementById("analyzeSessionName");
  sessionInfo.innerHTML = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  initSession(dbName);
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("selectorDiv").style.display = "none";
  return dbName;
}

function deleteDbRow() {
  var row = getSelectedTableRow();
  if (!row) {
    alert("No selected item\nSelect by clicking on a table row\nTry again!");
    return;
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  // Delete the actual database
  deleteDb(name);
  // remove from HTML table
  row.parentNode.removeChild(row);
  // return the name just in case
  return dbName;
}
// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////
function listAllDbs() {
  initSelectRowTable("dbTable", selectDbRow);
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
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
  table = document.getElementById("dbExportTable");
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
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
        return;
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
  }
  else return true;
}

function updateLogDuration() {
  var diff = logEndTime - logStartTime;
  elm = document.getElementById("logTimeDuration");
  if (diff >= 0) {
    elm.innerHTML = msToTimeStr(diff);
  }
  else {
    elm.innerHTML = "NaN";
  }
}

function updateSelectedDuration() {
  elm = document.getElementById("selectedTimeDuration");
  var diff = analysisEndTime - analysisStartTime;
  if (diff >= 0) {
    elm.innerHTML = msToTimeStr(diff);
  }
  else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("selectedBreathRange");
  elm.innerHTML = String(analysisStartBreath) + ',' + analysisEndBreath;
  elm = document.getElementById("priorNumBreaths");
  elm.innerHTML = String(startSystemBreathNum-1);
}

function setTimeInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  values = analysisRangeSlider.get();
  analysisStartBreath = parseInt(values[0]);
  analysisEndBreath = parseInt(values[1]);
  analysisStartTime = fullSessionBreathTimes[analysisStartBreath-1];
  analysisEndTime = fullSessionBreathTimes[analysisEndBreath-1];
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  //resetDivs();
}

function cancelTimeInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  analysisRangeSlider.set([analysisStartBreath, analysisEndBreath]);
  updateSelectedDuration();
}

function resetTimeInterval() {
  cancelTimeInterval();
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  analysisStartBreath = 1;
  analysisEndBreath = fullSessionBreathTimes.length;
  analysisStartTime = fullSessionBreathTimes[analysisStartBreath-1];
  analysisEndTime = fullSessionBreathTimes[analysisEndBreath-1];
  analysisRangeSlider.set([analysisStartBreath, analysisEndBreath]);
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  resetDivs();
}

window.onload = function() {
  //console.log("onload");
  initSessionGather = true;
  fullSessionBreathTimes = [];
  initDbNames();
  document.title = respimaticTag + " (ANALYZER)";
  sessionDbName = "";
  sessionDbReady = false;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  var sessionInfo = document.getElementById("analyzeSessionName");
  sessionInfo.innerHTML = 'No Selected Session';
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
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('', '_self').close();
}

var intervalId = setInterval(function() {
  blinkAnalysisWindowButtons();
}, 1000);
var analysisButtonsFlashed = false;

function blinkAnalysisWindowButtons() {
  if (!sliderCommitPending) return;
  if (analysisButtonsFlashed) {
    unflashAnalysisWindowButtons();
  }
  else {
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

function showAnalysisRangeSlider() {
  //console.log("Showing slider");
  analysisStartBreath = 1;
  analysisEndBreath = fullSessionBreathTimes.length;
  analysisStartTime = fullSessionBreathTimes[analysisStartBreath-1];
  analysisEndTime = fullSessionBreathTimes[analysisEndBreath-1];
  elm = document.getElementById("analysisWindowDiv");
  elm.style.display = "block";
  elm = document.getElementById("logNumBreaths");
  elm.innerHTML = analysisEndBreath;

  // Create analysis range slider
  analysisRangeSliderDiv = document.getElementById('analysisRangeSliderDiv');
  createAnalysisRangeSlider(analysisRangeSliderDiv);
  unflashAnalysisWindowButtons();

  updateSelectedDuration();
  if (analysisEndBreath==0) {
    alert("No recorded breath for this session");
  }
}

function createAnalysisRangeSlider(div) {
  var analysisSliderFormatStr = {
    to: function(n) {
      return String(parseInt(n));
    },
    from: function(str) {
      return Number(str);
    }
  }
  
  analysisRangeSlider = noUiSlider.create(div, {
    range: {
      min: analysisStartBreath,
      max: analysisEndBreath
    },
    step: 1,
    start: [
      analysisStartBreath,
      analysisEndBreath
    ],
    connect: [false, true, false],
    // handle labels
    tooltips: true,
    format: analysisSliderFormatStr,
    //pips: {mode: 'range', format: analysisSliderFormatStr},
  });

  analysisRangeSlider.on('change', function() {
    flashAnalysisWindowButtons();
    sliderCommitPending = true;
  });
}

alert(
  "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
  "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

