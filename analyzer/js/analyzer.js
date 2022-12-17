// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var analysisRangeSlider = null;
var sessionBannerHTML = null;
var sliderCommitPending = false;
if (!window.indexedDB) {
  modalAlert("IndexedDB not available in your browser","Switch browsers");
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
      modalAlert("No selected Session","Select by clicking on a table row\nTry again!");
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
      modalAlert("No selected Session","Select by clicking on a table row\nTry again!");
      return;
    }
  }

  msg = row.cells[0].innerHTML + " " + row.cells[1].innerHTML;
  modalConfirm("Delete Session", msg, doDeleteDbRow, null, {row:row},
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
  // return the name just in case
  return dbName;
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
  if (!retrieved_dbs) return;
  for (i = retrieved_dbs.length - 1; i >= 0; i--) {
    listDbTableRow(retrieved_dbs[i], i);
  }
}

function deleteAllDbs() {
  modalConfirm("Delete All Saved Sessions", "", doDeleteAllDbs, null, null,
               "DELETE ALL", "DO NOT DELETE");
}

function doDeleteAllDbs() {
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
      modalWarning("VERSION MISMATCH",
	"Retrieved Session recorded with Software Version " + app.sessionVersion + 
        "\nCurrent Software Version is " + SESSION_VERSION);
    }
    return true;
  }

  if (!app.sessionDbName) {
    modalAlert('No Session Selected","Please Select Session for Analysis');
    return false;
  }
  nameTm = parseDbName(app.sessionDbName);
  sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]';
  modalAlert('Session ' + sessionName + '\nNot yet ready","Please try again');
  return false;
}

function selectSession() {
  undisplayAllPanes();
  document.getElementById("selectorDiv").style.display = "block";

  if (app.sessionDataValid) enableAllButtons();

  listAllDbs();
}

function selectImport() {
  document.getElementById("importDiv").style.display = "block";
  if (app.sessionDataValid) enableAllButtons();
}

function selectExport() {
  exportDbRow(exportRowDiv);
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

  if (app.sessionDataValid) enableAllButtons();
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

  if (app.sessionDataValid) enableAllButtons();
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

  if (app.sessionDataValid) enableAllButtons();
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

  if (app.sessionDataValid) enableAllButtons();
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

  if (app.sessionDataValid) enableAllButtons();
  document.getElementById("btnRaw").disabled = true;

  displayRawData();
}

function initSession(dbName) {
  if (!dbName) {
    modalAlert("No Session selected","Please Select Session");
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
        modalAlert("Selected Session has no data","");
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
  document.getElementById("analysisWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
}

function checkValidAnalysisDuration() {
  //return true;
  var diff = app.analysisEndTime - app.analysisStartTime;
  if (diff <= 0) {
    modalAlert("Analysis EndTime must be greater than StartTime","");
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

function setAnalysisRanges(rolling) {
  app.reportRange = createReportRange(rolling, app.analysisStartBreath, app.analysisEndBreath);
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
  s = parseInt(values[0]);
  if (! session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (! session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  app.analysisStartBreath = s;
  app.analysisEndBreath = e;
  app.analysisStartTime = session.breathTimes[s];
  app.analysisEndTime = session.breathTimes[e];
  analysisRangeSlider.setSlider([app.analysisStartBreath, app.analysisEndBreath]);

  setAnalysisRanges(false);
  updateSelectedDuration();
  resetAnalysisData();
  refreshActivePane();
}

function setFullInterval() {
  sliderCommitPending = false;
  unflashAnalysisWindowButtons();
  values = analysisRangeSlider.getRange();
  s = parseInt(values[0]);
  if (! session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (! session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  app.analysisStartBreath = s;
  app.analysisEndBreath = e;
  app.analysisStartTime = session.breathTimes[s];
  app.analysisEndTime = session.breathTimes[e];
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
    modalAlert("No recorded breath for this session","Select another session");
    return;
  }

  enableAllButtons();
  setAnalysisRanges(true);
  updateSelectedDuration();

  createAnalysisRangeSlider();
}

window.onload = function() {
  Swal.fire({
    icon: 'info',
    title: ZOOM_TITLE_STR,
    html: "<pre>" + ZOOM_MESSAGE_STR + "</pre>",
    width: 900,
    showConfirmButton: false,
    color: 'white',
    background: '#2C94BC',
    timer: 5000,
  })

  // Create data objects
  app = cloneObject(AppDataTemplate);
  app.appId = ANALYZER_APP_ID;
  app.chartFontSize = 20;
  app.shapeLabelFontSize = 20;
  app.shapeLegendFontSize = 25;
  app.shapeTitleFontSize = 40;
  app.stripLineFontSize = 30;
  session = cloneObject(SessionDataTemplate);

  initDbNames();
  document.title = respimaticTag + " (ANALYZER)";
  app.sessionDataValid = false;
  app.sessionDbName = "";
  app.sessionDbReady = false;
  var heading = document.getElementById("SysUid");
  heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  var sessionInfo = document.getElementById("sessionNameSelector");
  sessionInfo.innerHTML = 'No Selected Session';

  undisplayAllPanes();
  disableAllButtons();

  app.reportRange = createReportRange(false, 0, 0);
  
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

function flashAnalysisWindowButtons() {
  analysisButtonsFlashed = true;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightgreen');
  changeAnalysisWindowButtonsColor(bgd);
}

function unflashAnalysisWindowButtons() {
  analysisButtonsFlashed = false;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('white');
  changeAnalysisWindowButtonsColor(bgd);
}

var cumulativeChartBreaths = 0;
function updateRangeOnNewBreath(num) {
  app.reportRange.minBnum = 1;
  app.reportRange.maxBnum += num;
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
    modalAlert("No recorded breath for this session","");
  }
}

function analysisRangeSliderCallback() {
  flashAnalysisWindowButtons();
  sliderCommitPending = true;
}


