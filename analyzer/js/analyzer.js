// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var analysisRangeSlider = null;
var sessionBannerHTML = null;
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

  cell = row.insertCell();
  cell.innerHTML = checkButtonHTML("selectRowBtn",25,"Select");
  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn",25,"Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn",25,"Delete");

  // Highlight selected database
  banner = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  if (sessionBannerHTML == banner) {
    var style = getComputedStyle(document.body)
    row.style.backgroundColor = style.getPropertyValue('--rsp_blue');
  }

}

function selectDbRow(row) {
  if ((typeof row == 'undefined') || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      alert("No selected item\nSelect by clicking on a table row\nTry again!");
      return;
    }
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  app.sessionDbName = dbName;
  var sessionInfo = document.getElementById("sessionNameSelector");
  sessionInfo.innerHTML = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  sessionBannerHTML = sessionInfo.innerHTML;
  initSession(dbName);
  selectSession();

  return dbName;
}

function deleteDbRow(row) {
  if (typeof row == 'undefined') {
    row = getSelectedTableRow();
    if (!row) {
      alert("No selected item\nSelect by clicking on a table row\nTry again!");
      return;
    }
  }
  msg = "Delete " + row.cells[0].innerHTML + " " + row.cells[1].innerHTML + "?";
  if (!confirm(msg)) return;

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

function selectRowBtn(btn) {
  selectDbRow(btn.parentNode.parentNode);
}

function exportRowBtn(btn) {
  exportDbRow(btn.parentNode.parentNode);
}

function deleteRowBtn(btn) {
  deleteDbRow(btn.parentNode.parentNode);
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
  if (app.sessionDbReady && app.sessionDbName) {
    if (app.sessionVersion!=SESSION_VERSION) {
      alert("WARNING\n" + 
	"Retrieved Session recorded with Software Version " + app.sessionVersion + 
        "\nCurrent Software Version is " + SESSION_VERSION);
    }
    return true;
  }

  if (!app.sessionDbName) {
    alert('No Session Selected\nPlease Select Session for Analysis');
    return false;
  }
  nameTm = parseDbName(app.sessionDbName);
  sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]';
  alert('Session ' + sessionName + '\nNot yet ready\nPlease try again');
  return false;
}

function selectSession() {
  undisplayAllPanes();
  document.getElementById("selectorDiv").style.display = "block";

  if (app.sessionDataValid) enableAllButtons();

  listAllDbs();
}

function selectImport() {
  undisplayAllPanes();
  document.getElementById("importDiv").style.display = "block";
  if (app.sessionDataValid) enableAllButtons();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  enableAllButtons();
  document.getElementById("btnStat").disabled = true;

  displayStats();
}

function selectAlerts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("alertsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  enableAllButtons();
  document.getElementById("btnAlert").disabled = true;

  displayAlerts();
}

function selectShapes() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("shapesDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  enableAllButtons();
  document.getElementById("btnShape").disabled = true;

  displayShapes();
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  enableAllButtons();
  document.getElementById("btnChart").disabled = true;

  displayCharts();
}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("rawDataDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameData");
  sessionInfo.innerHTML = sessionBannerHTML;

  enableAllButtons();
  document.getElementById("btnRaw").disabled = true;

  displayRawData();
}

function initSession(dbName) {
  if (!dbName) {
    alert("Please Select Session");
    return;
  }
  resetAnalysisData();
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    app.sessionDbReady = true;
    app.sessionDbName = dbName;
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
      app.logStartTime = new Date(keys[0]);
      app.logStartTime.setMilliseconds(0);
      app.logEndTime = new Date(keys[keys.length - 1]);
      app.logEndTime.setMilliseconds(0);
      app.analysisStartTime = new Date(app.logStartTime);
      app.analysisEndTime = new Date(app.logEndTime);
      app.startDate = app.logStartTime;
      
      updateSelectedDuration();
      updateLogDuration();
      disableAllButtons();
      gatherSessionData(analysisGatherDoneCallback);
    }
  }
}

function enableAllButtons() {
  document.getElementById("btnSelect").disabled = false;
  document.getElementById("btnRaw").disabled = false;
  document.getElementById("btnStat").disabled = false;
  document.getElementById("btnChart").disabled = false;
  document.getElementById("btnAlert").disabled = false;
  document.getElementById("btnShape").disabled = false;
}

function disableAllButtons() {
  //document.getElementById("btnSelect").disabled = true;
  document.getElementById("btnRaw").disabled = true;
  document.getElementById("btnStat").disabled = true;
  document.getElementById("btnChart").disabled = true;
  document.getElementById("btnAlert").disabled = true;
  document.getElementById("btnShape").disabled = true;
}

function resetAnalysisData() {
  initStats();
  initCharts();
  initRawDump();
  initAlerts();
  initImportExport();
  if ((document.getElementById("statsDiv").style.display == "block")
    || (document.getElementById("chartsDiv").style.display == "block")
    || (document.getElementById("shapesDiv").style.display == "block")
    || (document.getElementById("alertsDiv").style.display == "block")) {
    document.getElementById("analysisWindowDiv").style.display = "block";
  }
}

function undisplayAllPanes() {
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("alertsDiv").style.display = "none";
  document.getElementById("shapesDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
}

function checkValidAnalysisDuration() {
  //return true;
  var diff = app.analysisEndTime - app.analysisStartTime;
  if (diff <= 0) {
    alert("Analysis EndTime must be greater than StartTime");
    return false;
  }
  else return true;
}

function updateLogDuration() {
  var diff = app.logEndTime - app.logStartTime;
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
  var diff = app.analysisEndTime - app.analysisStartTime;
  if (diff >= 0) {
    elm.innerHTML = msToTimeStr(diff);
  }
  else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("selectedBreathRange");
  elm.innerHTML = String(app.analysisStartBreath) + ',' + app.analysisEndBreath;
  elm = document.getElementById("priorNumBreaths");
  elm.innerHTML = String(app.startSystemBreathNum-1);
}

function setAnalysisRanges(doFull) {
  app.reportsXrange ={
    doFull : doFull,
    minBnum : app.analysisStartBreath,
    maxBnum : app.analysisEndBreath,
    missingBnum : session.missingBreathWindows,
  };

  app.chartsXrange = {
    doFull :  doFull,
    initBnum : 1, 
    minBnum : app.analysisStartBreath, 
    maxBnum : app.analysisEndBreath,
    missingBnum : cloneObject(session.missingBreathWindows),
    initTime : app.logStartTime, 
    minTime : app.analysisStartTime, 
    maxTime : app.analysisEndTime,
    missingTime : cloneObject(session.missingTimeWindows)
  };
}

function refreshActivePane() {
  if (document.getElementById("statsDiv").style.display == "block") {
    displayStats();
  } else if (document.getElementById("chartsDiv").style.display == "block") {
    displayCharts();
  } else if (document.getElementById("alertsDiv").style.display == "block") {
    displayAlerts();
  } else if (document.getElementById("shapesDiv").style.display == "block") {
    displayShapes();
  }
}

function setTimeInterval() {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  values = analysisRangeSlider.getSlider();
  app.analysisStartBreath = parseInt(values[0]);
  app.analysisEndBreath = parseInt(values[1]);
  app.analysisStartTime = session.breathTimes[app.analysisStartBreath].time;
  app.analysisEndTime = session.breathTimes[app.analysisEndBreath].time;
  analysisRangeSlider.setSlider([app.analysisStartBreath, app.analysisEndBreath]);

  setAnalysisRanges(false);
  updateSelectedDuration();
  resetAnalysisData();
  refreshActivePane();
}

function cancelTimeInterval() {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  analysisRangeSlider.setSlider([app.analysisStartBreath, app.analysisEndBreath]);
  updateSelectedDuration();
}

function resetTimeInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  app.analysisStartBreath = app.logStartBreath;
  app.analysisEndBreath = app.logEndBreath;
  app.analysisStartTime = app.logStartTime;
  app.analysisEndTime = app.logEndTime;
  analysisRangeSlider.setSlider([app.analysisStartBreath, app.analysisEndBreath]);

  setAnalysisRanges(true);
  updateSelectedDuration();
  resetAnalysisData();
  document.getElementById("analysisWindowDiv").style.display = "block";

  refreshActivePane();
}

function analysisGatherDoneCallback() {
  app.sessionDataValid = true;
  app.sessionDbReady = true;

  app.logStartBreath = 1;
  app.logEndBreath = session.breathTimes.length-1;

  app.analysisStartBreath = app.logStartBreath;
  app.analysisEndBreath = app.logEndBreath;
  app.analysisStartTime = app.logStartTime;
  app.analysisEndTime = app.logEndTime;

  if (app.logEndBreath==0) {
    alert("No recorded breath for this session\nSelect another session");
    return;
  }

  enableAllButtons();
  setAnalysisRanges();
  updateSelectedDuration();

  createAnalysisRangeSlider();
}

window.onload = function() {
  // Create data objects
  app = cloneObject(AppDataTemplate);
  app.appId = ANALYZER_APP_ID;
  app.chartFontSize = 20;
  app.shapeLabelFontSize = 20;
  app.shapeLegendFontSize = 25;
  app.shapeTitleFontSize = 40;
  app.stripLineFontSize = 50;
  session = cloneObject(SessionDataTemplate);

  initDbNames();
  document.title = respimaticTag + " (ANALYZER)";
  app.sessionDbName = "";
  app.sessionDbReady = false;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  var sessionInfo = document.getElementById("sessionNameSelector");
  sessionInfo.innerHTML = 'No Selected Session';

  undisplayAllPanes();
  disableAllButtons();

  app.reportsXrange.doFull = true;
  app.chartsXrange.doFull = true;
  
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

var cumulativeChartBreaths = 0;
function updateRangeOnNewBreath(num) {
  app.minChartBreathNum = 1;
  app.maxChartBreathNum += num;
}

function createAnalysisRangeSlider() {
  // Create analysis range slider
  if (!analysisRangeSlider) {
    analysisRangeSliderDiv = document.getElementById('analysisRangeSliderDiv');
    analysisRangeSlider = new IntRangeSlider(
      analysisRangeSliderDiv,
      app.analysisStartBreath,
      app.analysisEndBreath,
      app.analysisStartBreath,
      app.analysisEndBreath,
      1
    );
    analysisRangeSlider.setChangeCallback(analysisRangeSliderCallback);
  }

  analysisRangeSlider.setRange([app.logStartBreath, app.logEndBreath]);
  analysisRangeSlider.setSlider([app.analysisStartBreath, app.analysisEndBreath]);

  elm = document.getElementById("analysisWindowDiv");
  elm.style.display = "none";
  elm = document.getElementById("logNumBreaths");
  elm.innerHTML = app.analysisEndBreath;

  setAnalysisRanges(true);
  updateSelectedDuration();

  unflashAnalysisWindowButtons();

  if (app.logEndBreath==0) {
    alert("No recorded breath for this session");
  }
}

function analysisRangeSliderCallback() {
  flashAnalysisWindowButtons();
  sliderCommitPending = true;
}

alert(
  "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
  "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

