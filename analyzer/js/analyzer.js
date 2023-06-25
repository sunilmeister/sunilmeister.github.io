// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var analysisRangeSlider = null;
var sessionBannerHTML = null;
var sliderCommitPending = false;
if (!window.indexedDB) {
  modalAlert("IndexedDB not available in your browser", "Switch browsers");
}
// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function listDbTableRow(item, index) {
  nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return false;
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
  cell.innerHTML = selectButtonHTML("selectRowBtn", 25, "Select");
  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn", 25, "Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn", 25, "Delete");

  // Highlight selected database
  banner = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  if (sessionBannerHTML == banner) {
    var style = getComputedStyle(document.body)
    row.style.backgroundColor = style.getPropertyValue('--rsp_blue');
  }

  return true;
}

function selectDbRow(row) {
  if (isUndefined(row) || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  dbName = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  session.database.dbName = dbName;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_mediumblue');
  var sessionInfo = document.getElementById("sessionNameSelector");

  sessionInfo.style.backgroundColor = bgd;
  sessionInfo.innerHTML = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  sessionBannerHTML = sessionInfo.innerHTML;
  initSession(dbName);
  selectSession();

  return dbName;
}

function deleteDbRow(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }

  dbName = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  if (dbName == session.database.dbName) {
    modalAlert("Cannot Delete", "Recording currently in use\n" + sessionBannerHTML);
    return;
  }

  msg = row.cells[0].innerHTML + " " + row.cells[1].innerHTML;
  modalConfirm("Delete Recording", msg, doDeleteDbRow, null, {
      row: row
    },
    "DELETE", "DO NOT DELETE");
}

function doDeleteDbRow(arg) {
  row = arg.row;
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  // Delete the actual database
  deleteDb(name);
  // remove from HTML table
  row.parentNode.removeChild(row);
  selectSession();
}

function selectRowBtn(btn) {
  selectDbRow(btn.parentNode.parentNode);
}

var exportRowDiv = null;

function exportRowBtn(btn) {
  exportRowDiv = btn.parentNode.parentNode;
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value =
    exportRowDiv.cells[0].innerHTML + ' ' + exportRowDiv.cells[1].innerHTML;;
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
  if (!retrieved_dbs) return 0;
  var count = 0;
  for (i = retrieved_dbs.length - 1; i >= 0; i--) {
    if (listDbTableRow(retrieved_dbs[i], i)) count++;
  }
  return count;
}

function deleteAllDbs() {
  if (sessionBannerHTML) {
    modalAlert("Cannot Delete ALL", "Recording currently in use\n" + sessionBannerHTML);
    return;
  }
  modalConfirm("Delete All Saved Recordings", "", doDeleteAllDbs, null, null,
    "DELETE ALL", "DO NOT DELETE");
}

function doDeleteAllDbs() {
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  if (!table) return;
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  selectSession();
  table = document.getElementById("dbExportTable");
  if (!table) return;
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  selectSession();
}

function checkDbReady() {
  if (session.database.dbReady && session.database.dbName) {
    if (session.analyzer.recVersion != CURRENT_RECORDING_VERSION) {
      modalAlert("VERSION MISMATCH",
        "Recorded with Software Version " + session.recVersion +
        "\nCurrent Software Version is " + CURRENT_RECORDING_VERSION + "\n" +
        "\nVersion " + session.analyzer.recVersion + " not supported");
      return false;
    }
    return true;
  }

  if (!session.database.dbName) {
    modalAlert('No Recording Selected","Please Select Recording for Analysis');
    return false;
  }
  nameTm = parseDbName(session.database.dbName);
  sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]';
  modalAlert('Recording ' + sessionName + '\nNot yet ready","Please try again');
  return false;
}

function selectSession() {
  undisplayAllPanes();
  document.getElementById("selectorDiv").style.display = "block";
  enableAllButtons();

  numSessions = listAllDbs();
  var bnr = document.getElementById("sessionNameSelector");
  var style = getComputedStyle(document.body)

  if (!numSessions) {
    bnr.innerHTML = "No Recordings Found. Use Dashboard to record";
    bgd = style.getPropertyValue('--rsp_darkred');
    bnr.style.backgroundColor = bgd;
    disableAllButtons();
  } else if (sessionBannerHTML) {
    bnr.innerHTML = sessionBannerHTML;
    bgd = style.getPropertyValue('--rsp_mediumblue');
    bnr.style.backgroundColor = bgd;
    enableAllButtons();
   } else {
    bnr.innerHTML = "No Selected Recording";
    bgd = style.getPropertyValue('--rsp_darkred');
    bnr.style.backgroundColor = bgd;
    disableAllButtons();
  }
}

function selectImport() {
  document.getElementById("importDiv").style.display = "block";
  document.getElementById("importSessionName").value = "Imported Recording";
  if (session.sessionDataValid) enableAllButtons();
}

function selectExport() {
  exportDbRow(exportRowDiv);
  if (session.sessionDataValid) enableAllButtons();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnStat").disabled = true;

  createAllStats();
}

function selectAlerts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("alertsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnAlert").disabled = true;

  createAllAlerts();
}

function selectWaves() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("wavesDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnWave").disabled = true;

  createAllWaves();
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("analysisWindowDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameSlider");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnChart").disabled = true;

  createAllCharts();
}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidAnalysisDuration()) return;

  undisplayAllPanes();
  document.getElementById("rawDataDiv").style.display = "block";
  var sessionInfo = document.getElementById("sessionNameData");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnRaw").disabled = true;

  displayRawData();
}

function initSession(dbName) {
  if (!dbName) {
    modalAlert("No Recording selected", "Please Select Recording");
    return;
  }
  resetAnalysisData();
  var req = indexedDB.open(dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    session.database.dbReady = true;
    session.database.dbName = dbName;
    var tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    var store = tx.objectStore(session.database.dbObjStoreName);
    var keyReq = store.getAllKeys();
    keyReq.onsuccess = function (event) {
      var keys = event.target.result;
      allDbKeys = keys;
      if (keys.length == 0) {
        modalAlert("Selected Recording has no data", "");
        return;
      }
      session.analyzer.logStartTime = new Date(keys[0]);
      session.analyzer.logStartTime.setMilliseconds(0);
      session.analyzer.logEndTime = new Date(keys[keys.length - 1]);
      session.analyzer.logEndTime.setMilliseconds(0);
      session.analyzer.analysisStartTime = new Date(session.analyzer.logStartTime);
      session.analyzer.analysisEndTime = new Date(session.analyzer.logEndTime);
      session.startDate = session.analyzer.logStartTime;

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
  document.getElementById("btnWave").disabled = false;
}

function disableAllButtons() {
  // Never disable the select session
  //document.getElementById("btnSelect").disabled = true;
  document.getElementById("btnRaw").disabled = true;
  document.getElementById("btnStat").disabled = true;
  document.getElementById("btnChart").disabled = true;
  document.getElementById("btnAlert").disabled = true;
  document.getElementById("btnWave").disabled = true;
}

function initGlobals() {
  // Create new data objects
  if (session) delete session;
  session = cloneObject(SessionDataTemplate);
  session.appId = ANALYZER_APP_ID;
  session.charts.fontSize = 15;
  session.waves.labelFontSize = 15;
  session.waves.legendFontSize = 20;
  session.waves.titleFontSize = 30;
  session.waves.stripLineFontSize = 20;
}

function resetAnalysisData() {
  initStats();
  initCharts();
  initWaves();
  initRawDump();
  initAlerts();
  initImportExport();
  initGlobals();
  initDbNames();
  if ((document.getElementById("statsDiv").style.display == "block") ||
    (document.getElementById("chartsDiv").style.display == "block") ||
    (document.getElementById("wavesDiv").style.display == "block") ||
    (document.getElementById("alertsDiv").style.display == "block")) {
    document.getElementById("analysisWindowDiv").style.display = "block";
  }
}

function undisplayAllPanes() {
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("alertsDiv").style.display = "none";
  document.getElementById("wavesDiv").style.display = "none";
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
}

function checkValidAnalysisDuration() {
  //return true;
  var diff = session.analyzer.analysisEndTime - session.analyzer.analysisStartTime;
  if (diff <= 0) {
    modalAlert("Analysis EndTime must be greater than StartTime", "");
    return false;
  } else return true;
}

function updateLogDuration() {
  var diff = session.analyzer.logEndTime - session.analyzer.logStartTime;
  elm = document.getElementById("logTimeDuration");
  if (diff >= 0) {
    elm.innerHTML = msToTimeStr(diff);
  } else {
    elm.innerHTML = "NaN";
  }
}

function updateSelectedDuration() {
  elm = document.getElementById("selectedTimeDuration");
  var diff = session.analyzer.analysisEndTime - session.analyzer.analysisStartTime;
  if (diff >= 0) {
    elm.innerHTML = msToTimeStr(diff);
  } else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("selectedBreathRange");
  elm.innerHTML = String(session.analyzer.analysisStartBreath) + '-' + session.analyzer.analysisEndBreath;
  elm = document.getElementById("priorNumBreaths");
  elm.innerHTML = String(session.startSystemBreathNum - 1);
}

function setAnalysisRanges(rolling) {
  session.reportRange = createReportRange(rolling, session.analyzer.analysisStartBreath, session.analyzer.analysisEndBreath);
}

function refreshActivePane() {
  if (document.getElementById("statsDiv").style.display == "block") {
    createAllStats();
  } else if (document.getElementById("chartsDiv").style.display == "block") {
    createAllCharts();
  } else if (document.getElementById("alertsDiv").style.display == "block") {
    createAllAlerts();
  } else if (document.getElementById("wavesDiv").style.display == "block") {
    createAllWaves();
  }
}

function setTimeInterval() {
  if (!sliderCommitPending) return;
  sliderCommitPending = false;
  values = analysisRangeSlider.getSlider();
  s = parseInt(values[0]);
  if (!session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (!session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  session.analyzer.analysisStartBreath = s;
  session.analyzer.analysisEndBreath = e;
  session.analyzer.analysisStartTime = session.breathTimes[s];
  session.analyzer.analysisEndTime = session.breathTimes[e];
  analysisRangeSlider.setSlider([session.analyzer.analysisStartBreath, session.analyzer.analysisEndBreath]);

  setAnalysisRanges(false);
  updateSelectedDuration();
  //resetAnalysisData();
  refreshActivePane();
}

function setFullInterval() {
  sliderCommitPending = false;
  values = analysisRangeSlider.getRange();
  s = parseInt(values[0]);
  if (!session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (!session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  session.analyzer.analysisStartBreath = s;
  session.analyzer.analysisEndBreath = e;
  session.analyzer.analysisStartTime = session.breathTimes[s];
  session.analyzer.analysisEndTime = session.breathTimes[e];
  analysisRangeSlider.setSlider([session.analyzer.analysisStartBreath, session.analyzer.analysisEndBreath]);

  setAnalysisRanges(false);
  updateSelectedDuration();
  //resetAnalysisData();
  refreshActivePane();
}

function resetTimeInterval() {
  sliderCommitPending = false;
  session.analyzer.analysisStartBreath = session.analyzer.logStartBreath;
  session.analyzer.analysisEndBreath = session.analyzer.logEndBreath;
  session.analyzer.analysisStartTime = session.analyzer.logStartTime;
  session.analyzer.analysisEndTime = session.analyzer.logEndTime;
  analysisRangeSlider.setSlider([session.analyzer.analysisStartBreath, session.analyzer.analysisEndBreath]);

  setAnalysisRanges(true);
  updateSelectedDuration();
  //resetAnalysisData();
  document.getElementById("analysisWindowDiv").style.display = "block";

  refreshActivePane();
}

function analysisGatherDoneCallback() {
  if (!checkDbReady()) return;

  session.sessionDataValid = true;
  session.database.dbReady = true;

  session.analyzer.logStartBreath = 1;
  session.analyzer.logEndBreath = session.breathTimes.length - 1;

  session.analyzer.analysisStartBreath = session.analyzer.logStartBreath;
  session.analyzer.analysisEndBreath = session.analyzer.logEndBreath;
  session.analyzer.analysisStartTime = session.analyzer.logStartTime;
  session.analyzer.analysisEndTime = session.analyzer.logEndTime;

  if (session.analyzer.logEndBreath == 0) {
    modalAlert("No recorded breath for this session", "Select another session");
    return;
  }

  enableAllButtons();
  setAnalysisRanges(true);
  updateSelectedDuration();

  createAnalysisRangeSlider();
}

window.onload = function () {
  setModalWidth(600);
  showZoomReminder();

  initGlobals();
  initDbNames();
  document.title = respimaticTag + " (ANALYZER)";
  session.sessionDataValid = false;
  session.database.dbName = "";
  session.database.dbReady = false;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  var sessionInfo = document.getElementById("sessionNameSelector");
  sessionInfo.innerHTML = 'No Selected Recording';

  var exportFileNameInput = document.getElementById("exportFileName");
  exportFileNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("exportFileBtn").click();
    }
  });

  var importSessionNameInput = document.getElementById("importSessionName");
  importSessionNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("importFileBtn").click();
    }
  });

  undisplayAllPanes();
  disableAllButtons();
  var menuBar = document.getElementById("sideMenuBar");
  menuBarHeight = menuBar.offsetHeight;
  menuBarWidth = menuBar.offsetWidth;
  var nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth + 30) + "px";
  //console.log("menuBarHeight = " + menuBarHeight);
  //console.log("menuBarWidth = " + menuBarWidth);

  session.reportRange = createReportRange(false, 0, 0);

  resetAnalysisData();
  selectSession();
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('', '_self').close();
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

function changeIconButtonColor(btn, bgd) {
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  btn.firstElementChild.style.backgroundColor = bgd;
  btn.firstElementChild.style.borderColor = bgd;
}

function changeAnalysisWindowButtonsColor(bgd) {
  changeIconButtonColor(document.getElementById("btnSetInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnCancelInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnResetInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnFullInterval"), bgd);
}

var cumulativeChartBreaths = 0;

function updateRangeOnNewBreath(num) {
  session.reportRange.minBnum = 1;
  session.reportRange.maxBnum += num;
}

function createAnalysisRangeSlider() {
  // Create analysis range slider
  if (!analysisRangeSlider) {
    analysisRangeSliderDiv = document.getElementById('analysisRangeSliderDiv');
    analysisRangeSlider = new IntRangeSlider(
      analysisRangeSliderDiv,
      session.analyzer.analysisStartBreath,
      session.analyzer.analysisEndBreath,
      session.analyzer.analysisStartBreath,
      session.analyzer.analysisEndBreath,
      1
    );
    analysisRangeSlider.setChangeCallback(analysisRangeSliderCallback);
  }

  analysisRangeSlider.setRange([session.analyzer.logStartBreath, session.analyzer.logEndBreath]);
  analysisRangeSlider.setSlider([session.analyzer.analysisStartBreath, session.analyzer.analysisEndBreath]);

  elm = document.getElementById("analysisWindowDiv");
  elm.style.display = "none";
  elm = document.getElementById("logNumBreaths");
  elm.innerHTML = session.analyzer.analysisEndBreath;

  setAnalysisRanges(true);
  updateSelectedDuration();

  if (session.analyzer.logEndBreath == 0) {
    modalAlert("No recorded breath for this session", "");
  }
}

function analysisRangeSliderCallback() {
  sliderCommitPending = true;
  setTimeInterval();
}
