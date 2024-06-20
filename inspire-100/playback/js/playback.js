// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var sessionBannerHTML = null;
var exportRowDiv = null;
var cumulativeChartBreaths = 0;
var dbName = null;

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
  cell.innerHTML = selectButtonHTML("selectRowBtn", 2, "Select");
  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn", 2, "Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn", 2, "Delete");

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

  sessionInfo.style.backgroundColor = palette.darkblue;
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

  let msg = row.cells[0].innerHTML + " " + row.cells[1].innerHTML;
  modalConfirm("Delete Recording", msg, doDeleteDbRow, null, {
      row: row
    },
    "DELETE", "DO NOT DELETE");
}

function doDeleteDbRow(arg) {
  let row = arg.row;
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
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
  let exportDiv = document.getElementById("exportRecordingDiv");
	exportDiv.style.display = "block";
  document.getElementById("exportRecordingFileName").value =
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
  let numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    let row = table.rows[1];
    let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  selectSession();
  table = document.getElementById("dbExportTable");
  if (!table) return;
  numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    let row = table.rows[1];
    let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
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
  let nameTm = parseDbName(session.database.dbName);
  let sessionName = nameTm[1] + ' [ ' + nameTm[2] + ' ]';
  modalAlert('Recording ' + sessionName + '\nNot yet ready","Please try again');
  return false;
}

function selectSession() {
  undisplayAllPanes();
	session.select.visible = true;

  document.getElementById("selectorDiv").style.display = "block";
  enableAllButtons();

  let numSessions = listAllDbs();
  let bnr = document.getElementById("sessionNameSelector");

  if (!numSessions) {
    bnr.innerHTML = "No Recordings Found. Use Dashboard to record";
    let bgd = palette.darkred;
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

function selectSnapshots() {
  undisplayAllPanes();
	resumeSnapshotsTimer();
	session.snapshot.visible = true;
	showRangeOnSlider(session.snapshot.range);
	
  document.getElementById("snapshotsDiv").style.display = "inline-grid";
  document.getElementById("playbackWindowDiv").style.display = "block";
  let sessionInfo = document.getElementById("sliderCaption");
  sessionInfo.innerHTML = sessionBannerHTML;

  if (session.sessionDataValid) enableAllButtons();
  document.getElementById("btnSnap").disabled = true;

  createSnapshots();
}

function selectStats() {
  if (!checkDbReady()) return;
  if (!checkValidPlaybackDuration()) return;

  undisplayAllPanes();
	session.stats.visible = true;
	showRangeOnSlider(session.stats.range);
	
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
	session.alerts.visible = true;
	showRangeOnSlider(session.alerts.range);
	
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
	session.waves.visible = true;
	showRangeOnSlider(session.waves.range);
	
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
	session.charts.visible = true;
	showRangeOnSlider(session.charts.range);
	
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
	session.rawData.visible = true;
	
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
	session.select.visible = true;
	showRangeOnSlider(session.search.range);
	
	if (!session.search.criteria) {
		session.search.criteria = new searchExpr({}, "exprContainer", "exprString", "searchResults");
	}
  document.getElementById("playbackWindowDiv").style.display = "block";
  document.getElementById("searchDiv").style.display = "block";

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
      session.playback.allDbKeys = keys;
      if (keys.length == 0) {
        modalAlert("Selected Recording has no data", "");
        return;
      }
      disableAllButtons();
      gatherSessionData(playbackGatherDoneCallback);
      updateDocumentTitle();
    }
  }
}

function enableAllButtons() {
  document.getElementById("btnSelect").disabled = false;
  document.getElementById("btnSnap").disabled = false;
  document.getElementById("btnRaw").disabled = false;
  document.getElementById("btnStat").disabled = false;
  document.getElementById("btnChart").disabled = false;
  document.getElementById("btnAlert").disabled = false;
  document.getElementById("btnWave").disabled = false;
  document.getElementById("btnSearch").disabled = false;
}

function disableAllButtons() {
  // Never disable the select session
  document.getElementById("btnSnap").disabled = true;
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
  if (session.charts.visible) {
  	renderAllCharts();
	}
	resizeAllWaves();
  if (session.waves.visible) {
  	renderAllWaves();
	}
}

function initGlobals() {
  // Create new data objects
  createNewSession();

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
  if (session.snapshot.visible || session.charts.visible || session.waves.visible ||
  		session.stats.visible || session.alerts.visible) { 
    document.getElementById("playbackWindowDiv").style.display = "block";
  }
}

function undisplayAllPanes() {
	pauseSnapshotsTimer();
	hideAllPopups();

  document.getElementById("snapshotsDiv").style.display = "none";
  document.getElementById("statsDiv").style.display = "none";
  document.getElementById("chartsDiv").style.display = "none";
  document.getElementById("rawDataDiv").style.display = "none";
  document.getElementById("alertsDiv").style.display = "none";
  document.getElementById("wavesDiv").style.display = "none";
  document.getElementById("playbackWindowDiv").style.display = "none";
  document.getElementById("selectorDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
  document.getElementById("exportRecordingDiv").style.display = "none";
  document.getElementById("searchDiv").style.display = "none";

	session.snapshot.visible = false;
	session.charts.visible = false;
	session.stats.visible = false;
	session.alerts.visible = false;
	session.record.visible = false;
	session.waves.visible = false;
	session.search.visible = false;
	session.rawData.visible = false;
	session.select.visible = false;
}

function checkValidPlaybackDuration() {
  //return true;
  let diff = findVisibleRangeTimeDuration();
  if (diff <= 0) {
    modalAlert("Playback EndTime must be greater than StartTime", "");
    return false;
  } else return true;
}

function updateLogDuration() {
  let diff = session.lastChirpDate.getTime() - session.firstChirpDate.getTime();
	session.sessionDurationInMs = diff;
  let elm = document.getElementById("logTimeDuration");
  if (diff >= 0) {
    elm.innerHTML = msToHHMMSS(diff);
  } else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("logStartDate");
	elm.innerHTML = dateToDateStr(session.firstChirpDate);
  elm = document.getElementById("logStartTime");
	elm.innerHTML = dateToTimeStr(session.firstChirpDate);
}

function updateSelectedDuration() {
  let elm = document.getElementById("selectedTimeDuration");
  let diff = findVisibleRangeTimeDuration();
  if (diff >= 0) {
    elm.innerHTML = msToHHMMSS(diff);
  } else {
    elm.innerHTML = "NaN";
  }

  elm = document.getElementById("selectedBreathRange");
  elm.innerHTML = String(findVisibleRangeMinBnum()) + '-' + findVisibleRangeMaxBnum();
  elm = document.getElementById("priorNumBreaths");
  elm.innerHTML = String(session.startSystemBreathNum - 1);
}

function refreshActivePane() {
  if (session.snapshot.visible) {
		createSnapshots();
	} else if (session.stats.visible) {
    createAllStats();
	} else if (session.charts.visible) {
    createAllCharts();
	} else if (session.alerts.visible) {
    createAllAlerts();
	} else if (session.waves.visible) {
    createAllWaves();
	} else if (session.search.visible) {
    updateSearchResults();
  }
}

function autoRangeSliderChange() {
  updateSelectedDuration();
  refreshActivePane();
}

function playbackRangeSliderCallback() {
  let values = session.rangeSelector.rangeSlider.getSlider();
  let s = parseInt(values[0]);
  let e = parseInt(values[1]);

  if (session.snapshot.visible) {
		s = 0;
	}

	updateVisibleViewRange(false, s, e);
  updateSelectedDuration();
  refreshActivePane();
}

function forwardTimeInterval() {
	forwardRange();
}

function rewindTimeInterval() {
	rewindRange();
}

function fullInterval() {
	fullRange();
}

function playbackGatherDoneCallback() {
  if (!checkDbReady()) return;

  session.sessionDataValid = true;
  session.database.dbReady = true;

	session.maxBreathNum = session.loggedBreaths.length - 1;
  if (session.maxBreathNum == 0) {
    modalAlert("No recorded breath for this session", "Select another session");
    return;
  }

	updateLogDuration();

  if (session.maxBreathNum < 20) {
		updateAllRanges(false, 0, session.maxBreathNum);
  } else {
		updateAllRanges(false, 0, 20);
  }

  enableAllButtons();
  updateSelectedDuration();

  createPlaybackRangeSlider();
}

window.onload = function () {
  session.appId = PLAYBACK_APP_ID;
  session.launchDate = new Date();

	initCommonDivElements();
	
	resizeChartsWaves();
	alignSidebar();

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

	setRootFontSize("fullPlayback", "fullPlayback");
	resizeChartsWaves();

  disableAllButtons();
	appResize();
	appResizeFunction = appResize;

  // All forms
  new KeypressEnterSubmit('exportRecordingFileName', 'exportRecordingFileBtn');
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
  nonMenuArea.style.marginTop = "-" + String(convertPixelsToRem(menuBarHeight)) + "rem";
  nonMenuArea.style.marginLeft = String(convertPixelsToRem(menuBarWidth + 24)) + "rem";
}

function appResize() {
	alignSidebar();
	resizeChartsWaves();
	resizeSnapshots();
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
	// empty in playback
}

function createPlaybackRangeSlider() {
  if (session.maxBreathNum == 0) {
    modalAlert("No recorded breath for this session", "");
  }

  // Create playback range slider
  if (!session.rangeSelector.rangeSlider) {
    playbackRangeSliderDiv = document.getElementById('playbackRangeSliderDiv');
    session.rangeSelector.rangeSlider = new IntRangeSlider(
      playbackRangeSliderDiv,
      0, session.maxBreathNum,
      0, session.maxBreathNum,
      1
    );
    session.rangeSelector.rangeSlider.setChangeCallback(playbackRangeSliderCallback);
  }

  session.rangeSelector.rangeSlider.setRange([0, session.maxBreathNum]);
  session.rangeSelector.rangeSlider.setSlider([findVisibleRangeMinBnum(), findVisibleRangeMinBnum()]);

  let elm = document.getElementById("playbackWindowDiv");
  elm.style.display = "none";
  elm = document.getElementById("logNumBreaths");
  elm.innerHTML = session.maxBreathNum;

  updateSelectedDuration();

}

