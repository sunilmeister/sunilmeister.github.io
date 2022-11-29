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

  UndisplayAllPanes();
  document.getElementById("analysisWindowDiv").style.display = "block";
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
  if (sessionDbReady && sessionDbName) {
    if (sessionVersion!=SESSION_VERSION) {
      alert("WARNING\n" + 
	"Retrieved Session recorded with Software Version " + sessionVersion + 
        "\nCurrent Software Version is " + SESSION_VERSION);
    }
    return true;
  }

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
  UndisplayAllPanes();
  document.getElementById("selectorDiv").style.display = "block";

  enableAllButtons();

  listAllDbs();
}

function selectImport() {
  UndisplayAllPanes();
  document.getElementById("importDiv").style.display = "block";
  enableAllButtons();
}

function selectExport() {
  UndisplayAllPanes();
  document.getElementById("exportSessionDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnExportWindow").disabled = true;

  listAllExportDbs();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  UndisplayAllPanes();
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnStat").disabled = true;

  displayStats();
}

function selectErrorWarnings() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  UndisplayAllPanes();
  document.getElementById("errorWarningDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnErrorWarning").disabled = true;

  displayErrorWarningInfo();
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  UndisplayAllPanes();
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnChart").disabled = true;

  displayCharts();
}

function selectExportWindow() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  UndisplayAllPanes();
  document.getElementById("analysisWindowDiv").style.display = "block";
  document.getElementById("exportWindowDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnExportWindow").disabled = true;

}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  UndisplayAllPanes();
  document.getElementById("rawDataDiv").style.display = "block";

  enableAllButtons();
  document.getElementById("btnRaw").disabled = true;

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
      startDate = logStartTime;
      
      updateSelectedDuration();
      updateLogDuration();
      gatherGlobalData();
    }
  }
}

function enableAllButtons() {
  document.getElementById("btnSelect").disabled = false;
  document.getElementById("btnRaw").disabled = false;
  document.getElementById("btnStat").disabled = false;
  document.getElementById("btnChart").disabled = false;
  document.getElementById("btnErrorWarning").disabled = false;
  document.getElementById("btnExportWindow").disabled = false;
}

function resetAnalysisData() {
  initGlobalData();
  initStats();
  initCharts();
  initRawDump();
  initErrorWarningInfo();
  initImportExport();
  enableAllButtons();
  UndisplayAllPanes();
  document.getElementById("analysisWindowDiv").style.display = "block";
}

function UndisplayAllPanes() {
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("errorWarningDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("exportWindowDiv").style.display = "none";
  document.getElementById("exportSessionDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
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
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  values = analysisRangeSlider.getSlider();
  analysisStartBreath = parseInt(values[0]);
  analysisEndBreath = parseInt(values[1]);
  analysisStartTime = fullSessionBreathTimes[analysisStartBreath-1];
  analysisEndTime = fullSessionBreathTimes[analysisEndBreath-1];
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  UndisplayAllPanes();
  document.getElementById("analysisWindowDiv").style.display = "block";
}

function cancelTimeInterval() {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  analysisRangeSlider.setSlider([analysisStartBreath, analysisEndBreath]);
  updateSelectedDuration();
}

function resetTimeInterval() {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  analysisStartBreath = 1;
  analysisEndBreath = fullSessionBreathTimes.length;
  analysisStartTime = fullSessionBreathTimes[analysisStartBreath-1];
  analysisEndTime = fullSessionBreathTimes[analysisEndBreath-1];
  analysisRangeSlider.setSlider([analysisStartBreath, analysisEndBreath]);
  updateSelectedDuration();
  resetAnalysisData();
  gatherGlobalData();
  UndisplayAllPanes();
  document.getElementById("analysisWindowDiv").style.display = "block";
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

  UndisplayAllPanes();

  reportsXrange.doFull = true;
  
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

function outIconButton(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
}

function overIconButton(btn) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
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
  bgd = style.getPropertyValue('white');
  el = document.getElementById("btnSetInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnCancelInterval");
  el.style.backgroundColor = bgd;
  el = document.getElementById("btnResetInterval");
  el.style.backgroundColor = bgd;
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

var cumulativeChartBreaths = 0;
function updateRangeOnNewBreath(num) {
  minChartBreathNum = 1;
  maxChartBreathNum += num;
}

function createAnalysisRangeSlider(div) {
  analysisRangeSlider = new IntRangeSlider(
    analysisRangeSliderDiv,
    analysisStartBreath,
    analysisEndBreath,
    analysisStartBreath,
    analysisEndBreath,
    1
  );
  analysisRangeSlider.setChangeCallback(analysisRangeSliderCallback);
}

function analysisRangeSliderCallback() {
  flashAnalysisWindowButtons();
  sliderCommitPending = true;
}

alert(
  "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
  "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

