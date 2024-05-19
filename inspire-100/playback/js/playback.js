// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var sessionBannerHTML = null;
var exportRowDiv = null;
var cumulativeChartBreaths = 0;

if (!window.indexedDB) {
  modalAlert("IndexedDB not available in your browser", "Switch browsers");
}
// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function listDbTableRow(item, index) {
  let nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != inspireUid) return false;
  let table = document.getElementById("dbTable");
  let row = table.insertRow();
  row.style.cursor = "pointer";
  let cell;
  cell = row.insertCell();
  cell.style.paddingRight = "1.5rem";
  cell.style.paddingTop = "0.5rem";
  cell.style.paddingBottom = "0.5rem";
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.style.paddingTop = "0.5rem";
  cell.style.paddingBottom = "0.5rem";
  cell.style.textAlign = "center";
  cell.innerHTML = nameTm[2];

  cell = row.insertCell();
  cell.innerHTML = selectButtonHTML("selectRowBtn", 1.5, "Select");
  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn", 1.5, "Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn", 1.5, "Delete");

  // Highlight selected database
  banner = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  if (sessionBannerHTML == banner) {
    row.style.backgroundColor = palette.blue;
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
  dbName = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  session.database.dbName = dbName;
  let sessionInfo = document.getElementById("sliderCaption");

  sessionInfo.style.backgroundColor = palette.green;
  sessionInfo.style.color = palette.brightgreen;
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

  dbName = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
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
  name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  // Delete the actual database
  deleteDb(name);
  // remove from HTML table
  row.parentNode.removeChild(row);
  selectSession();
}

function selectRowBtn(btn) {
  selectDbRow(btn.parentNode.parentNode);
}

function exportRowBtn(btn) {
  exportRowDiv = btn.parentNode.parentNode;
  let exportBtn = document.getElementById("exportFileBtn");
	exportBtn.onclick = function() { exportFile() };
  let exportDiv = document.getElementById("exportDiv");
	exportDiv.style.display = "block";
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
  let table = document.getElementById("dbTable");
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  let retrieved_dbs = getAllDbs();
  if (!retrieved_dbs) return 0;
  let count = 0;
  for (let i = retrieved_dbs.length - 1; i >= 0; i--) {
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
  let table = document.getElementById("dbTable");
  if (!table) return;
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  selectSession();
  table = document.getElementById("dbExportTable");
  if (!table) return;
  numRows = table.rows.length;
  for (i = 1; i < numRows; i++) {
    row = table.rows[1];
    name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  selectSession();
}

function checkDbReady() {
  if (session.database.dbReady && session.database.dbName) {
    if (!recordedDataCompatible(session.playback.recVersion, CURRENT_RECORDING_VERSION)) {
      modalAlert("VERSION INCOMPATIBLE",
        "Recorded with Software Version " + session.playback.recVersion +
        "\nCurrent Software Version is " + CURRENT_RECORDING_VERSION + "\n" +
        "\nVersion " + session.playback.recVersion + " not supported");
      return false;
    }
    return true;
  }

  if (!session.database.dbName) {
    modalAlert('No Recording Selected","Please Select Recording for Playback');
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
  let bnr = document.getElementById("sessionNameSelector");

  if (!numSessions) {
    bnr.innerHTML = "No Recordings Found. Use Dashboard to record";
    bgd = palette.darkred;
    bnr.style.backgroundColor = bgd;
    disableAllButtons();
  } else if (sessionBannerHTML) {
    bnr.innerHTML = sessionBannerHTML;
    bnr.style.backgroundColor = palette.green;
    bnr.style.color = palette.brightgreen;
    enableAllButtons();
   } else {
    bnr.innerHTML = "No Selected Recording";
    bnr.style.backgroundColor = palette.darkred;
    bnr.style.color = "white";
    disableAllButtons();
  }
}

function selectImport() {
  document.getElementById("importSessionName").value = "Imported Recording";
	let importDiv = document.getElementById("importDiv");
	importDiv.style.display = "block";
  if (session.sessionDataValid) enableAllButtons();
}

function selectExport() {
  exportDbRow(exportRowDiv);
  if (session.sessionDataValid) enableAllButtons();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("statsDiv").style.display = "block";
  document.getElementById("playbackWindowDiv").style.display = "block";
  let sessionInfo = document.getElementById("sliderCaption");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnStat").disabled = true;

  createAllStats();
}

function selectAlerts() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("alertsDiv").style.display = "block";
  document.getElementById("playbackWindowDiv").style.display = "block";
  let sessionInfo = document.getElementById("sliderCaption");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnAlert").disabled = true;

  createAllAlerts();
}

function selectWaves() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("wavesDiv").style.display = "block";
  document.getElementById("playbackWindowDiv").style.display = "block";
  let sessionInfo = document.getElementById("sliderCaption");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnWave").disabled = true;

  createAllWaves();
}

function selectCharts() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("chartsDiv").style.display = "block";
  document.getElementById("playbackWindowDiv").style.display = "block";
  let sessionInfo = document.getElementById("sliderCaption");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnChart").disabled = true;

  createAllCharts();
}

function selectRawData() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("rawDataDiv").style.display = "block";
  let sessionInfo = document.getElementById("sessionNameData");
  sessionInfo.innerHTML = sessionBannerHTML;
  sessionInfo.style.color = palette.brightgreen;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnRaw").disabled = true;

  displayRawData();
}

function selectSearch() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
  document.getElementById("playbackWindowDiv").style.display = "block";
  document.getElementById("searchExprDiv").style.display = "block";

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnSearch").disabled = true;
}

function initSession(dbName) {
  if (!dbName) {
    modalAlert("No Recording selected", "Please Select Recording");
    return;
  }
  resetPlaybackData();
  let req = indexedDB.open(dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    let db = event.target.result;
    session.database.dbReady = true;
    session.database.dbName = dbName;
    let tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    let store = tx.objectStore(session.database.dbObjStoreName);
    let keyReq = store.getAllKeys();
    keyReq.onsuccess = function (event) {
      let keys = event.target.result;
      allDbKeys = keys;
      if (keys.length == 0) {
        modalAlert("Selected Recording has no data", "");
        return;
      }
      session.playback.logStartTime = new Date(keys[0]);
      session.playback.logStartTime.setMilliseconds(0);
      session.playback.logEndTime = new Date(keys[keys.length - 1]);
      session.playback.logEndTime.setMilliseconds(0);
      session.playback.playbackStartTime = new Date(session.playback.logStartTime);
      session.playback.playbackEndTime = new Date(session.playback.logEndTime);
      session.startDate = session.playback.logStartTime;

      updateSelectedDuration();
      updateLogDuration();
      disableAllButtons();
      gatherSessionData(playbackGatherDoneCallback);
      updateDocumentTitle();
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
  document.getElementById("btnSearch").disabled = false;
}

function disableAllButtons() {
  // Never disable the select session
  //document.getElementById("btnSelect").disabled = true;
  document.getElementById("btnRaw").disabled = true;
  document.getElementById("btnStat").disabled = true;
  document.getElementById("btnChart").disabled = true;
  document.getElementById("btnAlert").disabled = true;
  document.getElementById("btnWave").disabled = true;
  document.getElementById("btnSearch").disabled = true;
}

function resizeChartsWaves() {
  let style = getComputedStyle(document.body);

  session.waves.labelFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveLabelFontSize'));
  session.waves.legendFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveLegendFontSize'));
  session.waves.titleFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveTitleFontSize'));
  session.waves.stripLineFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveStripLineFontSize'));
  session.waves.stripLineThickness = 
		convertRemToPixelsInt(style.getPropertyValue('--waveStripLineThickness'));

  session.charts.labelFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartLabelFontSize'));
  session.charts.legendFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartLegendFontSize'));
  session.charts.titleFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartTitleFontSize'));
  session.charts.stripLineFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartStripLineFontSize'));
  session.charts.stripLineThickness = 
		convertRemToPixelsInt(style.getPropertyValue('--chartStripLineThickness'));

	resizeAllCharts();
  if (document.getElementById("chartsDiv").style.display == "block") {
  	renderAllCharts();
	}
	resizeAllWaves();
  if (document.getElementById("wavesDiv").style.display == "block") {
  	renderAllWaves();
	}
}

function initGlobals() {
  // Create new data objects
  createNewSession();

	session.searchExpression = new searchExpr({}, "exprContainer", "exprString", null);
  session.appId = PLAYBACK_APP_ID;
}

function resetPlaybackData() {
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
    document.getElementById("playbackWindowDiv").style.display = "block";
  }
}

function undisplayAllPanes() {
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("alertsDiv").style.display = "none";
  document.getElementById("wavesDiv").style.display = "none";
  document.getElementById("playbackWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("searchExprDiv").style.display = "none";
}

function checkValidPlaybackDuration() {
  //return true;
  let diff = session.playback.playbackEndTime - session.playback.playbackStartTime;
  if (diff <= 0) {
    modalAlert("Playback EndTime must be greater than StartTime", "");
    return false;
  } else return true;
}

function updateLogDuration() {
  let diff = session.playback.logEndTime - session.playback.logStartTime;
	session.sessionDurationInMs = diff;
  let elm = document.getElementById("logTimeDuration");
  if (diff >= 0) {
    elm.innerHTML = msToHHMMSS(diff);
  } else {
    elm.innerHTML = "NaN";
  }
}

function updateSelectedDuration() {
  let elm = document.getElementById("selectedTimeDuration");
  let diff = session.playback.playbackEndTime - session.playback.playbackStartTime;
  if (diff >= 0) {
    elm.innerHTML = msToHHMMSS(diff);
  } else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("selectedBreathRange");
  elm.innerHTML = String(session.playback.playbackStartBreath) + '-' + session.playback.playbackEndBreath;
  elm = document.getElementById("priorNumBreaths");
  elm.innerHTML = String(session.startSystemBreathNum - 1);
}

function setPlaybackRanges() {
  session.reportRange = createReportRange(false, session.playback.playbackStartBreath, session.playback.playbackEndBreath);
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
  values = session.rangeSlider.getSlider();
  s = parseInt(values[0]);
  if (!session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (!session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  session.playback.playbackStartBreath = s;
  session.playback.playbackEndBreath = e;
  session.playback.playbackStartTime = session.breathTimes[s];
  session.playback.playbackEndTime = session.breathTimes[e];
  session.rangeSlider.setSlider([s, e]);

  setPlaybackRanges();
  updateSelectedDuration();
  //resetPlaybackData();
  refreshActivePane();
}

function forwardTimeInterval() {
	forwardRange();
  session.playback.playbackStartBreath = session.reportRange.minBnum;
  session.playback.playbackEndBreath = session.reportRange.maxBnum;
  session.playback.playbackStartTime = session.reportRange.minTime;
  session.playback.playbackEndTime = session.reportRange.maxTime;
  updateSelectedDuration();
  refreshActivePane();
}

function rewindTimeInterval() {
	rewindRange();
  session.playback.playbackStartBreath = session.reportRange.minBnum;
  session.playback.playbackEndBreath = session.reportRange.maxBnum;
  session.playback.playbackStartTime = session.reportRange.minTime;
  session.playback.playbackEndTime = session.reportRange.maxTime;
  updateSelectedDuration();
  refreshActivePane();
}

function fullInterval() {
  values = session.rangeSlider.getRange();
  s = parseInt(values[0]);
  if (!session.breathTimes[s]) { // missing breath
    s = closestNonNullEntryIndex(session.breathTimes, s);
  }
  e = parseInt(values[1]);
  if (!session.breathTimes[e]) { // missing breath
    e = closestNonNullEntryIndex(session.breathTimes, e);
  }

  session.playback.playbackStartBreath = s;
  session.playback.playbackEndBreath = e;
  session.playback.playbackStartTime = session.breathTimes[s];
  session.playback.playbackEndTime = session.breathTimes[e];
  session.rangeSlider.setSlider([session.playback.playbackStartBreath, session.playback.playbackEndBreath]);

  setPlaybackRanges();
  updateSelectedDuration();
  refreshActivePane();
}

function resetTimeInterval() {
  session.playback.playbackStartBreath = session.playback.logStartBreath;
  session.playback.playbackEndBreath = session.playback.logEndBreath;
  session.playback.playbackStartTime = session.playback.logStartTime;
  session.playback.playbackEndTime = session.playback.logEndTime;
  session.rangeSlider.setSlider([session.playback.playbackStartBreath, session.playback.playbackEndBreath]);

  setPlaybackRanges();
  updateSelectedDuration();
  //resetPlaybackData();
  document.getElementById("playbackWindowDiv").style.display = "block";

  refreshActivePane();
}

function playbackGatherDoneCallback() {
  if (!checkDbReady()) return;

  session.sessionDataValid = true;
  session.database.dbReady = true;

  session.playback.logStartBreath = 1;
  session.playback.logEndBreath = session.breathTimes.length - 1;

  let n = session.playback.logEndBreath - session.playback.logStartBreath;
  if (n < 20) {
    session.playback.playbackStartBreath = session.playback.logStartBreath;
    session.playback.playbackEndBreath = session.playback.logEndBreath;
    session.playback.playbackStartTime = session.playback.logStartTime;
    session.playback.playbackEndTime = session.playback.logEndTime;
  } else {
    session.playback.playbackStartBreath = session.playback.logStartBreath;
    session.playback.playbackEndBreath = session.playback.logStartBreath + 19;
    session.playback.playbackStartTime = session.playback.logStartTime;
    session.playback.playbackEndTime = 
      session.breathTimes[session.playback.playbackEndBreath];
  }

  if (session.playback.logEndBreath == 0) {
    modalAlert("No recorded breath for this session", "Select another session");
    return;
  }

  enableAllButtons();
  setPlaybackRanges();
  updateSelectedDuration();

  createPlaybackRangeSlider();
}

window.onload = function () {
	alignSidebar();
	setRootFontSize("fullPlayback", "sideMenuBar");
	resizeChartsWaves();

  initGlobals();
  initDbNames();
  updateDocumentTitle();

  session.sessionDataValid = false;
  session.database.dbName = "";
  session.database.dbReady = false;
  let heading = document.getElementById("SysUid");
  heading.innerHTML = inspireUid + "<br>(" + inspireTag + ")";
  let sessionInfo = document.getElementById("sessionNameSelector");
  sessionInfo.innerHTML = 'No Selected Recording';

  undisplayAllPanes();
  disableAllButtons();
	appResize();
	appResizeFunction = appResize;

  session.reportRange = createReportRange(false, 0, 0);

  // All forms
  new KeypressEnterSubmit('exportFileName', 'exportFileBtn');
  new KeypressEnterSubmit('rangeFromBnum', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeNumBreaths', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeFromBtime', 'acceptRangeBtn');
  new KeypressEnterSubmit('rangeDuration', 'acceptRangeBtn');

  resetPlaybackData();
  selectSession();
}

function alignSidebar() {
  let menuBar = document.getElementById("sideMenuBar");
  let menuBarHeight = menuBar.offsetHeight;
  let menuBarWidth = menuBar.offsetWidth;
  let nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(convertPixelsToRem(0 - menuBarHeight)) + "rem";
  nonMenuArea.style.marginLeft = String(convertPixelsToRem(menuBarWidth +30)) + "rem";
}

function appResize() {
	alignSidebar();
	resizeChartsWaves();
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
  bgd = palette.brightgreen;
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
}

function changeIconButtonColor(btn, bgd) {
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  btn.firstElementChild.style.backgroundColor = bgd;
  btn.firstElementChild.style.borderColor = bgd;
}

function changePlaybackWindowButtonsColor(bgd) {
  changeIconButtonColor(document.getElementById("btnSetInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnCancelInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnResetInterval"), bgd);
  changeIconButtonColor(document.getElementById("btnFullInterval"), bgd);
}

function updateRangeOnNewBreath(num) {
  session.reportRange.minBnum = 1;
  session.reportRange.maxBnum += num;
}

function createPlaybackRangeSlider() {
  // Create playback range slider
  if (!session.rangeSlider) {
    playbackRangeSliderDiv = document.getElementById('playbackRangeSliderDiv');
    session.rangeSlider = new IntRangeSlider(
      playbackRangeSliderDiv,
      session.playback.playbackStartBreath,
      session.playback.playbackEndBreath,
      session.playback.playbackStartBreath,
      session.playback.playbackEndBreath,
      1
    );
    session.rangeSlider.setChangeCallback(playbackRangeSliderCallback);
  }

  session.rangeSlider.setRange([session.playback.logStartBreath, session.playback.logEndBreath]);
  session.rangeSlider.setSlider([session.playback.playbackStartBreath, session.playback.playbackEndBreath]);

  elm = document.getElementById("playbackWindowDiv");
  elm.style.display = "none";
  elm = document.getElementById("logNumBreaths");
  elm.innerHTML = session.playback.logEndBreath;

  setPlaybackRanges();
  updateSelectedDuration();

  if (session.playback.logEndBreath == 0) {
    modalAlert("No recorded breath for this session", "");
  }
}

function playbackRangeSliderCallback() {
  setTimeInterval();
}

