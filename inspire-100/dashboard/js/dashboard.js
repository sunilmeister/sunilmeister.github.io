// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var maxMILLIS = null;
//var lastChirpQueued = null;
function disassembleAndQueueChirp(d) {
	//let saveChirp = cloneObject(d);
  let fragmentIndex = 0;
  while (1) {
    let key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    fragment = d.content[key];
    let millisStr = fragment.MILLIS;
    let millis = parseChecksumString(millisStr);

		// ERROR detection
    if (millis == null) {
			console.error("*** MILLIS checksum error");
			continue // ignore this malformed chirp
		} else if (maxMILLIS && (millis < maxMILLIS)) {
			// MILLIS should be monotonically increasing
			// unless the chirps arrive out of order because of network buffering and latency
			console.log("*** Chirp out of order: Last MILLIS",maxMILLIS, " > New MILLIS",millis);
			//console.log("Last CHIRP",lastChirpQueued);
			//console.log("New CHIRP",d);
		}

		// Reach here if all is good - no ERRORs
    if (!startMillis) startMillis = Number(millis);
    fragment.MILLIS = Number(millis);
		let date = session.firstChirpDate;
		if (date === null) date = new Date(d.created);
    fragment.created = new Date(addMsToDate(date, (fragment.MILLIS - startMillis)));
    chirpQ.push(cloneObject(fragment));

		// For error checking the next round
		if (!maxMILLIS || (maxMILLIS < fragment.MILLIS)) maxMILLIS = fragment.MILLIS;
  }
	//lastChirpQueued = saveChirp;
}

function getCurrentSimulatedMillis() {
  let curDate = new Date();
  let deltaTimeInMs = curDate - startSystemDate;
  return startSimulatedMillis + deltaTimeInMs;
}

var dashboardChirpCount = 0;
function waitForChirps() {
  waitForHwPosts(inspireUid, function (d) {
		//console.log("dashboardLaunchTime",dashboardLaunchTime);
		//console.log("chirpTime",d.created);
    dormantTimeInSec = 0;
    wifiDropped = false;
    autoCloseDormantPopup();

		// ignore old chirps
		dashboardChirpCount++;
		if ((dashboardChirpCount == 1) && (d.created < dashboardLaunchTime)) return;

    if (simulatedMillis - lastChirpInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstChirp) {
      let millisStr = d.content["0"].MILLIS
      let millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed chirp

      simulatedMillis = Number(millis);
      startSimulatedMillis = simulatedMillis;
      startSystemDate = new Date();
      let elm = document.getElementById("logStartDate");
      elm.innerHTML = dateToDateStr(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstChirp = false;
    lastChirpInMs = simulatedMillis;
    disassembleAndQueueChirp(d);
		displaySelectiveButtons();
  })
}

function processDashboardChirp(d) {
  let curDate = new Date(d.created);
	let date = session.firstChirpDate;
	if (date === null) date = new Date(d.created);
  session.sessionDurationInMs = Math.abs(curDate.getTime() - date.getTime());
  let elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToHHMMSS(session.sessionDurationInMs);

  if (!updatePaused) {
    elm = document.getElementById("breathNum");
    animateNumberValueTo(elm, session.maxBreathNum);
  }

  processJsonRecord(d);
  createDashboards(d);
	createAlarmModals(d);

  return d;
}

function createDashboards() {
  if (updatePaused) return;
 	updateSidebar();

  if (session.snapshot.visible) createDashboardSnapshots();
  if (session.charts.visible) createDashboardCharts();
  if (session.stats.visible) createDashboardStats();
  if (session.waves.visible) createDashboardWaves();
  if (session.alerts.visible) createDashboardAlerts();
  if (session.search.visible) createDashboardSearch();
  if (session.record.visible) {
    if (!session.database.dbName) {
      blankRecordingBox();
    }
  }
}

function blinkFlowRate() {
  let flowDiv = document.getElementById("flowDiv");
  if (flowDivBackground == "GREEN") {
    flowDiv.style.backgroundColor = palette.mediumgreen;
    flowDiv.style.color = palette.darkblue;
    flowDivBackground = "MEDIUMGREEN";
  } else {
    flowDiv.style.backgroundColor = palette.green;
    flowDiv.style.color = "white"
    flowDivBackground = "GREEN";
  }
}

//////////////////////////////////////////////
// Beep buttons
//////////////////////////////////////////////
function toggleAudio() {
  let btnAudio = document.getElementById("btnAudio"); 
  if (errorBeepEnabled && warningBeepEnabled) {
    disableAllBeeps();
    btnAudio.textContent = "Enable Audio Alarms" ;
  } else {
    enableAllBeeps();
    btnAudio.textContent = "Mute Audio Alarms" ;
  }
}

function blinkSliderDiv() {
  let div = document.getElementById("rangeWindowDiv");
	if (!isSomeViewVisible()) return;

	if (!isVisibleRangeMoving()) {
    if (sliderDivBackground == "NONE") {
  		document.getElementById("btnPlayInterval").src = "../common/img/playOrange.png";
    	div.style.backgroundColor = palette.orange;
			sliderDivBackground = "ORANGE";
		} else {
  		//document.getElementById("btnPlayInterval").src = "../common/img/play.png";
			div.style. removeProperty("background-color")
			sliderDivBackground = "NONE";
		}
	} else {
 		document.getElementById("btnPlayInterval").src = "../common/img/pause.png";
		div.style. removeProperty("background-color")
		sliderDivBackground = "NONE";
	}
}

function blinkPauseButton() {
	if (dashboardSessionClosed) return;

  let btn = document.getElementById("btnPause");
  let ttl = document.getElementById("breathsHeading");
  let bnum = document.getElementById("breathNum");
  let bdiv = document.getElementById("curBreathDiv");
  if (updatePaused) {
    if (pauseButtonForeground == "WHITE") {
      ttl.style.backgroundColor = palette.orange;
      bnum.style.backgroundColor = palette.orange;
      bdiv.style.backgroundColor = palette.orange;
      ttl.innerHTML = "Dashboard Paused"
      bnum.innerHTML = breathPausedAt;
      pauseButtonForeground = "ORANGE";
    } else {
      ttl.style.backgroundColor = palette.mediumgreen;
      bnum.style.backgroundColor = palette.mediumgreen;
      bdiv.style.backgroundColor = palette.mediumgreen;
      ttl.innerHTML = "LOGGED BREATHS"
      bnum.innerHTML = session.maxBreathNum;
      pauseButtonForeground = "WHITE";
    }
  } else {
    ttl.style.backgroundColor = palette.mediumgreen;
    bnum.style.backgroundColor = palette.mediumgreen;
    bdiv.style.backgroundColor = palette.mediumgreen;
    ttl.innerHTML = "LOGGED BREATHS"
    bnum.innerHTML = session.maxBreathNum;
    pauseButtonForeground = "WHITE";
  }
}

function displaySelectiveButtons() {
	displayAllButtons();

	// Now turn OFF selectively
	if (!session.firstChirpDate) {
  	document.getElementById("btnStats").disabled = true;
  	document.getElementById("btnAlerts").disabled = true;
  	document.getElementById("btnRecording").disabled = true;
	}
	if (!session.maxBreathNum) {
  	document.getElementById("btnCharts").disabled = true;
  	document.getElementById("btnWaves").disabled = true;
  	document.getElementById("btnSearch").disabled = true;
	}
	if (session.snapshot.visible) {
  	document.getElementById("btnSnapshots").disabled = true;
	}
	if (session.charts.visible) {
  	document.getElementById("btnCharts").disabled = true;
	}
	if (session.waves.visible) {
  	document.getElementById("btnWaves").disabled = true;
	}
	if (session.search.visible) {
  	document.getElementById("btnSearch").disabled = true;
	}
	if (session.stats.visible) {
  	document.getElementById("btnStats").disabled = true;
	}
	if (session.alerts.visible) {
  	document.getElementById("btnAlerts").disabled = true;
	}
	if (session.record.visible) {
  	document.getElementById("btnRecording").disabled = true;
	}
}

function displayAllButtons() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  document.getElementById("btnSearch").disabled = false;
}

function undisplayAllButtons() {
  document.getElementById("btnSnapshots").disabled = true;
  document.getElementById("btnCharts").disabled = true;
  document.getElementById("btnStats").disabled = true;
  document.getElementById("btnAlerts").disabled = true;
  document.getElementById("btnRecording").disabled = true;
  document.getElementById("btnWaves").disabled = true;
  document.getElementById("btnSearch").disabled = true;
}

function undisplayAllViews() {
	undisplayAllButtons();

  document.getElementById("snapshot-pane").style.display = "none";
  document.getElementById("chart-pane").style.display = "none";
  document.getElementById("stat-pane").style.display = "none";
  document.getElementById("alert-pane").style.display = "none";
  document.getElementById("record-pane").style.display = "none";
  document.getElementById("waves-pane").style.display = "none";
  document.getElementById("searchDiv").style.display = "none";
	rangeWindowDiv.style.display = "none";

	session.snapshot.visible = false;
	session.charts.visible = false;
	session.stats.visible = false;
	session.alerts.visible = false;
	session.record.visible = false;
	session.waves.visible = false;
	session.search.visible = false;

	pauseSnapshotsTimer();
	hideAllPopups();
}

function changeToSnapshotView() {
	undisplayAllViews();
  if (updatePaused) togglePause();

	session.snapshot.visible = true;
	showRangeOnSlider(session.snapshot.range);
	resumeSnapshotsTimer();

	displaySelectiveButtons();
  document.getElementById("snapshot-pane").style.display = "inline-grid";
  rangeWindowDiv.style.display = "block";

  updateSnapshotRangeOnEntry();
  createDashboardSnapshots();
}

function changeToChartView() {
	undisplayAllViews();
  if (updatePaused) togglePause();
	session.charts.visible = true;
	showRangeOnSlider(session.charts.range);

	displaySelectiveButtons();
  document.getElementById("chart-pane").style.display = "block";
  rangeWindowDiv.style.display = "block";

  updateChartRangeOnEntry();
  createDashboardCharts();
}

function changeToWaveView() {
	undisplayAllViews();
  if (updatePaused) togglePause();
	session.waves.visible = true;
	showRangeOnSlider(session.waves.range);

	displaySelectiveButtons();
  document.getElementById("waves-pane").style.display = "block";
  rangeWindowDiv.style.display = "block";

  updateWaveRangeOnEntry();
  createDashboardWaves();
}

function changeToStatView() {
	undisplayAllViews();
  if (updatePaused) togglePause();
	session.stats.visible = true;
	showRangeOnSlider(session.stats.range);

	displaySelectiveButtons();
  document.getElementById("stat-pane").style.display = "block";
	rangeWindowDiv.style.display = "block";

  updateStatRangeOnEntry();
  createDashboardStats();
}

function changeToAlertView() {
	undisplayAllViews();
  if (updatePaused) togglePause();
	session.alerts.visible = true;
	showRangeOnSlider(session.alerts.range);

	displaySelectiveButtons();
  document.getElementById("alert-pane").style.display = "block";
	rangeWindowDiv.style.display = "block";

  updateAlertRangeOnEntry();
  createDashboardAlerts();
}

function changeToSearchView() {
	undisplayAllViews();
	session.search.visible = true;
	showRangeOnSlider(session.search.range);

	displaySelectiveButtons();
  document.getElementById("searchDiv").style.display = "block";
	rangeWindowDiv.style.display = "block";

	if (!session.search.criteria) {
		session.search.criteria = new searchExpr({}, "exprContainer", "exprString", "searchResults");
	}

  updateSearchRangeOnEntry();
}


function changeToRecordView() {
	undisplayAllViews();
	session.record.visible = true;

	displaySelectiveButtons();
  document.getElementById("record-pane").style.display = "block";
  rangeWindowDiv.style.display = "none";
  if (updatePaused) togglePause();
}

function updateRangeOnNewBreath() {
  if (session.snapshot.visible) updateSnapshotRange();
  if (session.charts.visible) updateChartRange();
  if (session.stats.visible) updateStatRange();
  if (session.alerts.visible) updateAlertRange();
  if (session.waves.visible) updateWaveRange();
  if (session.search.visible) updateSearchRange();
}

function togglePause() {
  let elm = document.getElementById("btnPause");
  if (updatePaused) {
    elm.textContent = "Pause Dashboard";
    updatePaused = false;
    if (session.snapshot.visible) createDashboardSnapshots();
    if (session.charts.visible) createDashboardCharts();
    if (session.stats.visible) createDashboardStats();
    if (session.search.visible) createDashboardSearch();
    if (session.alerts.visible) createDashboardAlerts();
    if (session.waves.visible) createDashboardWaves();
  } else {
    elm.textContent = "Resume Dashboard";
    updatePaused = true;
    breathPausedAt = session.maxBreathNum;
  }
  updateDashboardAndRecordingStatus();
}

function selectExit() {
  window.open('', '_self').close();
}

function installTempGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('TempGauge');
	containerDiv.innerHTML = "";
  tempGauge = new CircularGauge(containerDiv, convertRemToPixels(6), fgColor, bgColor, -20, 70);
  tempGauge.setProperty('readonly', true);
}

window.onload = function () {
	dashboardLaunchTime = new Date();
  finishedLoading = false;

	// find and store often used div elements
  rangeWindowDiv = document.getElementById("rangeWindowDiv");
	installTempGauge();
	initCommonDivElements();

	disableAllBeeps();  

  createNewSession();
  session.appId = DASHBOARD_APP_ID;
  session.launchDate = new Date();

  // Create range slider
  sliderDiv = document.getElementById("rangeSliderDiv");
  createRangeSlider(sliderDiv);

  initDbNames();
  let heading = document.getElementById("SysUid");
  if (inspireTag) {
    heading.innerHTML = inspireUid + "<br>(" + inspireTag + ")";
  } else {
    heading.innerHTML = "NOT SPECIFIED"
  }
  updateDocumentTitle();  

	changeToSnapshotView();
	undisplayAllButtons();
  initStats();
  initAlerts();

  // Install all gauges
  installPeakGauge();
  installPlatGauge();
  installPeepGauge();
  installTempGauge();

	openAudioControl();

	alignSidebar();

	// After all the gauges are installed and sidebar aligned
	setRootFontSize("fullDashboard", "fullDashboard");

  // Treat <ENTER> as accept button
  new KeypressEnterSubmit('recordName', 'acceptRecordNameBtn');

  displayMessageLine("Mline1", banner1);
  displayMessageLine("Mline2", banner2);
  displayMessageLine("Mline3", banner3);
  displayMessageLine("Mline4", banner4);
  displayMessageLine("lcdline1", banner1);
  displayMessageLine("lcdline2", banner2);
  displayMessageLine("lcdline3", banner3);
  displayMessageLine("lcdline4", banner4);

  // now wait for chirps and act accordingly
  chirpQ = new Queue();
  waitForChirps();

	appResize();
	appResizeFunction = appResize;
  finishedLoading = true;
}

function alignSidebar() {
  let menuBar = document.getElementById("sideMenuBar");
  let menuBarHeight = menuBar.offsetHeight;
  let menuBarWidth = menuBar.offsetWidth;
  let nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = "-" + String(convertPixelsToRem(menuBarHeight - 10)) + "rem";
  nonMenuArea.style.marginLeft = String(convertPixelsToRem(menuBarWidth + 20)) + "rem";
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

  session.charts.labelFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartLabelFontSize'));
  session.charts.legendFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartLegendFontSize'));
  session.charts.titleFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartTitleFontSize'));
  session.charts.stripLineFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--chartStripLineFontSize'));

	resizeAllCharts();
  if (session.charts.visible) renderAllCharts();
	resizeAllWaves();
  if (session.waves.visible) renderAllWaves();
}

function appResize() {
	resizeChartsWaves();
	resizeSnapshots();
	installTempGauge();
	alignSidebar();
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  let msg = 'Charts waveform history will be lost';
  if (session.maxBreathNum != 0) {
    if (!session.recorder.off) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}

function createRangeSlider(div) {
  if (session.rangeSelector.rangeSlider) return;
  session.rangeSelector.rangeSlider = new IntRangeSlider(
    div,
    0,
    1,
    0,
    0,
    1
  );
  session.rangeSelector.rangeSlider.setChangeCallback(rangeSliderCallback);
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  let values = session.rangeSelector.rangeSlider.getSlider();

  let min = parseInt(values[0]);
  let max = parseInt(values[1]);
	if (session.snapshot.visible) {
		min = 0;
	}

 	updateVisibleViewRange(false, min, max);
  createDashboards();
}

function outIconButton(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
}

function overIconButton(btn) {
  let bgd = palette.brightgreen;
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
}

function setBackGroundBreathWindowButton(id, bgd) {
  let el = document.getElementById(id);
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;

  el = el.firstElementChild;
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;
}

function autoRangeSliderChange() {
	// range object already updated
	// slider endpoints already updated
  createDashboards();
}

function playPauseTimeInterval() {
	if (isVisibleRangeMoving()) {
		pauseVisibleRange();
  	document.getElementById("btnPlayInterval").src = "../common/img/playOrange.png";
		return;
	}

  document.getElementById("btnPlayInterval").src = "../common/img/pause.png";
  updateVisibleViewRange(true, 1, session.maxBreathNum);

  stopSliderCallback = true;
  session.rangeSelector.rangeSlider.setSlider([findVisibleRangeMinBnum(), findVisibleRangeMaxBnum()]);
  stopSliderCallback = false;

  if (session.snapshot.visible) updateSnapshotRange();
  if (session.charts.visible) updateChartRange();
  if (session.stats.visible) updateStatRange();
  if (session.alerts.visible) updateAlertRange();
  if (session.waves.visible) updateWaveRange();
  if (session.search.visible) updateSearchRange();

  createDashboards();
}

function rewindTimeInterval() {
  document.getElementById("btnPlayInterval").src = "../common/img/play.png";

	rewindRange();
  createDashboards();
}

function forwardTimeInterval() {
  document.getElementById("btnPlayInterval").src = "../common/img/play.png";

	forwardRange();
  createDashboards();
}

function fullTimeInterval() {
  document.getElementById("btnPlayInterval").src = "../common/img/play.png";

	fullRange();
  createDashboards();
}

function editTimeInterval() {
  document.getElementById("btnPlayInterval").src = "../common/img/play.png";
  createDashboards();
}

function HandlePeriodicTasks() {
  if (!finishedLoading) return;
  updateAlert(true);
  updatePending(true);
  let invokeTimeInMs = (new Date()).getTime();
  let blinkInterval = invokeTimeInMs - prevBlinkTimeInMs;
  if (blinkInterval >= BLINK_INTERVAL_IN_MS) {
    blinkPauseButton();
    blinkFlowRate();
		blinkSliderDiv();
    prevBlinkTimeInMs = invokeTimeInMs;
  }
  if (awaitingFirstChirp) {
    let timeAwaitingFirstChirp = new Date() - dashboardLaunchTime ;
    if (dormantPopupManualCloseTime) {
      if ((new Date() - dormantPopupManualCloseTime) >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) {
          showDormantPopup();
        }
      }
    } else if ((new Date() - session.launchDate) >= MAX_CHIRP_INTERVAL_IN_MS) {
      if (!dormantPopupDisplayed) showDormantPopup();
    }
  } else if ((chirpQ.size() == 0) &&
    ((simulatedMillis - lastChirpInMs) >= MAX_CHIRP_INTERVAL_IN_MS)) {
    if (dormantPopupManualCloseTime) {
      if ((new Date() - dormantPopupManualCloseTime) >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) showDormantPopup();
      }
    } else if (!dormantPopupDisplayed) showDormantPopup();
  }
}

var dashboardSessionClosed = false;
function closeCurrentSession() {
	// allow navigation and manipulation of current session views
	dashboardSessionClosed = true;

	// change sidebar to SESSION CLOSED
	let elm = document.getElementById("dashboardSessionHeader");
	elm.innerHTML = "<b>**SESSION CLOSED**</b>";
	elm = document.getElementById("headerDiv");
	elm.style.backgroundColor = palette.orange;

	// close any recording in progress
	closeRecording();

	// display and sound a warning
	modalWarning("SESSION CLOSED", SESSION_CLOSED_MSG);
	enableWarningBeep();
	startWarningBeep();
}

setTimeout(function periodicCheck() {
  if (!awaitingFirstChirp) {
    simulatedMillis = getCurrentSimulatedMillis();
  }
  HandlePeriodicTasks();
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (chirpQ && chirpQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return;
  let millis;
  while (1) {
    if (chirpQ.size() == 0) break;
    let d = chirpQ.peek();
    let millis = Number(d.MILLIS);
    if (simulatedMillis < millis) break;

    d = chirpQ.pop();
		if (dashboardSessionClosed) {
			return; // do not process any more chirps
		}

		if (isUndefined(d["content"])) break; // empty chirp

		// check if a new session has started without current one being closed
    if (!isUndefined(d.content["HWORLD"])) {
			if (session.firstChirpDate) {
				// A session was in progress but a new session started
				// must close current session and inform user
				closeCurrentSession();
				return;
			}
		}

    if (!isUndefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
      let bnumObj = parseBnumData(bnumContent);
			if (bnumObj) {
      	if (session.startSystemBreathNum == null) {
        	session.startSystemBreathNum = bnumObj.bnum;
        	let elm = document.getElementById("priorBreathNum");
        	elm.innerHTML = String(bnumObj.bnum - 1);
      	}
        let chirpBnum = bnumObj.bnum - session.startSystemBreathNum + 1;
        if (chirpBnum >	session.maxBreathNum) {
      	  session.systemBreathNum = bnumObj.bnum;
         	session.maxBreathNum = chirpBnum;
        }
			}
    }
    let dCopy; // a copy of the chirp
    dCopy = cloneObject(d);
    processDashboardChirp(d);
    processRecordChirp(dCopy);
  }

  if (millis - simulatedMillis > MAX_DIFF_CHIRP_SIMULATION_TIMES) {
    modalAlert("Dashboard out of Sync", "Something went wrong\nPlease relaunch the Dashboard");
    console.error("Chirps way ahead of simulated time " + millis +
      " v/s " + simulatedMillis);
  }
  return;
}

function autoCloseDormantPopup() {
  if (dormantPopupDisplayed) {
    Swal.close();
    dormantPopupManualCloseTime = null;
  }
}

function showDormantPopup() {
	if (dashboardSessionClosed) return;

  // do not do anything if some other modal is displayed
  // if ($(".sweet-alert.visible").length > 0) return;

  dormantPopupDisplayed = true;
  dormantPopupManualCloseTime = null;
  let modalColor = palette.modal;
  
  let dormantTimerInterval;
  Swal.fire({
    icon: 'info',
    title: DORMANT_TITLE_STR,
    html: DORMANT_MESSAGE_STR,
    color: 'white',
    background: modalColor,
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
    showClass: {
      popup: `animate__animated animate__fadeInDown`
    },
    hideClass: {
      popup: `animate__animated animate__fadeOutUp`
    },
    didOpen: () => {
      const b = Swal.getHtmlContainer().querySelector('b');
      dormantTimerInterval = setInterval(() => {
        b.textContent = msToHHMMSS(1000*dormantTimeInSec);
      }, 1000)
    },
    willClose: () => {
      clearInterval(dormantTimerInterval)
      dormantPopupDisplayed = false;
      dormantPopupManualCloseTime = new Date();
    }
  }).then((result) => {
    if (result.isConfirmed) {
      dormantPopupDisplayed = false;
      dormantPopupManualCloseTime = new Date();
    }
  })
}

setInterval(() => {
  dormantTimeInSec++;
}, 1000)

setInterval(() => {
	registerDashboardPing(inspireUid);
}, PING_INTERVAL_IN_MS)


