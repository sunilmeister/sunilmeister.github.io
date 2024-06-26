// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function disassembleAndQueueChirp(d) {
  let fragmentIndex = 0;
  while (1) {
    let key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    fragment = d.content[key];
    let millisStr = fragment.MILLIS;
    let millis = parseChecksumString(millisStr);
    if (millis == null) continue // ignore this malformed chirp

    if (!startMillis) startMillis = Number(millis);
    fragment.MILLIS = Number(millis);
		let date = session.firstChirpDate;
		if (date === null) date = new Date(d.created);
    fragment.created = new Date(addMsToDate(date, (fragment.MILLIS - startMillis)));
    chirpQ.push(cloneObject(fragment));
  }
}

function getCurrentSimulatedMillis() {
  let curDate = new Date();
  let deltaTimeInMs = curDate - startSystemDate;
  return startSimulatedMillis + deltaTimeInMs;
}

function waitForChirps() {
  waitForHwPosts(inspireUid, function (d) {
    dormantTimeInSec = 0;
    wifiDropped = false;
    autoCloseDormantPopup();
		// ignore old chirps
		if (d.created < dashboardLaunchTime) return;

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
  })
}

var prevResetStatus = RESET_NONE;
var resetRequestTime = null;

function deduceSystemReset() {
	if (prevResetStatus != RESET_PENDING) return;
	if (resetRequestTime === null) return;

	let now = new Date();
 	let title = "RESET Button change Breath# " + session.maxBreathNum;

	// If it has not been declined or timed-out for a while after request
	// assume system has been reset
	let pendingTime = now.getTime() - resetRequestTime.getTime();
	//console.log("pendingTime",pendingTime,"prevResetStatus",prevResetStatus);
	if (pendingTime > RESET_CONFIRMATION_TIMEOUT_IN_MS) {
		let info1 = "RESET Request Confirmed";
		let info2 = "SYSTEM RESET";
		msg = info1 + "\n" + info2;
   	modalAlert(title, msg);
		startErrorBeep();
		resetRequestTime = null;
	}
}

setInterval(() => {
  deduceSystemReset();
}, 1000)

function createAlarms(chirp) {
	// Prioritized
	let resetStatus =  session.params.resetStatus.LastChangeValue();
	let resetChangeTime = session.params.resetStatus.LastChangeTime();
	let resetStatusChange = true;
	if (resetStatus !== null) {
		resetStatusChange = (prevResetStatus != resetStatus);
	}
	prevResetStatus = resetStatus;

 	let title = "RESET Activity Breath# " + session.maxBreathNum;
	let resetInfo1 = "";
	let resetInfo2 = "";
	if (resetStatusChange) {
		if (resetStatus == RESET_PENDING) {
			resetInfo1 = "RESET requested";
			resetInfo2 = "Waiting for Confirmation";
			resetRequestTime = chirp.created;
		} else if (resetStatus == RESET_TIMEOUT) {
			resetInfo1 = "RESET Confirmation Timed out";
			resetInfo2 = "RESET Request Cancelled";
			resetRequestTime = null;
		} else if (resetStatus == RESET_DECLINED) {
			resetInfo1 = "RESET Confirmation Declined";
			resetInfo2 = "RESET Request Cancelled";
			resetRequestTime = null;
		} else if (resetStatus == RESET_CONFIRMED) {
			resetInfo1 = "RESET Request Confirmed";
			resetInfo2 = "System Reset";
			resetRequestTime = null;
		}
	}

	if (resetInfo1 != "") {
		let msg = resetInfo1 + "\n" + resetInfo2;
		if ((resetStatus !== null) && (resetStatus != RESET_NONE)) {
			if (resetStatus == RESET_PENDING) {
    		modalWarning(title, msg);
				startErrorBeep();
				return;
			} else if (resetStatus == RESET_TIMEOUT) {
	    	modalInfo(title, msg);
				stopErrorBeep();
			} else if (resetStatus == RESET_DECLINED) {
	    	modalInfo(title, msg);
				stopErrorBeep();
			}
		}
	}

	let errorTag =  session.params.errorTag.LastChangeValue();
	if (errorTag) { // must report the error
		let errorTime =  session.params.errorTag.LastChangeTime();
		let msgJson = lookupAlertMessage(errorTime);
		let msg = formAlertMessageStr(msgJson);
    let title = "Error Breath# " + session.maxBreathNum;
    modalAlert(title, msg);
		startErrorBeep();
		return;
  } else {
		stopErrorBeep();
	}

	let warningTag =  session.params.warningTag.LastChangeValue();
	if (warningTag) { // must report the warning
		let warningTime =  session.params.warningTag.LastChangeTime();
		let msgJson = lookupAlertMessage(warningTime);
		let msg = formAlertMessageStr(msgJson);
    let title = "Warning Breath# " + session.maxBreathNum;
    modalWarning(title, msg);
		startWarningBeep();
		return;
  } else {
		stopWarningBeep();
	}
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
	createAlarms(d);

  return d;
}

function createDashboards() {
  if (updatePaused) return;

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

function undisplayAllViews() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  document.getElementById("btnSearch").disabled = false;

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

  document.getElementById("btnSnapshots").disabled = true;
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

  document.getElementById("btnCharts").disabled = true;
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

  document.getElementById("btnWaves").disabled = true;
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

  document.getElementById("btnStats").disabled = true;
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

  document.getElementById("btnAlerts").disabled = true;
  document.getElementById("alert-pane").style.display = "block";
	rangeWindowDiv.style.display = "block";

  updateAlertRangeOnEntry();
  createDashboardAlerts();
}

function changeToSearchView() {
	undisplayAllViews();
	session.search.visible = true;
	showRangeOnSlider(session.search.range);

  document.getElementById("btnSearch").disabled = true;
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

  document.getElementById("btnRecording").disabled = true;
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

function receivedNewWave() {
  if (session.charts.visible) return;
  if ((session.waves.sendPeriod) && !session.waves.onDemand) return;

  console.log("On demand snapshot received pwBreathNum=" + session.waves.pwBreathNum);
  Swal.fire({
    icon: 'info',
    title: ON_DEMAND_TITLE_STR,
    text: ON_DEMAND_MESSAGE_STR,
    width: 800,
    showConfirmButton: false,
    color: 'white',
    background: '#2C94BC',
    timer: 4000
  })
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
  finishedLoading = false;
	console.log("Testing github update 26-06-2024 7:48AM");

	dashboardLaunchTime = new Date();

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

  session.waves.newPwDataCallback = receivedNewWave;
	resizeChartsWaves();

  initDbNames();
  let heading = document.getElementById("SysUid");
  if (inspireTag) {
    heading.innerHTML = inspireUid + "<br>(" + inspireTag + ")";
  } else {
    heading.innerHTML = "NOT SPECIFIED"
  }
  updateDocumentTitle();  

	changeToSnapshotView();
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

function fullInterval() {
  document.getElementById("btnPlayInterval").src = "../common/img/play.png";

	fullRange();
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
		if (isUndefined(d["content"])) break;

    if (!isUndefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
      let bnumObj = parseJSONSafely(bnumContent);
      session.systemBreathNum = bnumObj[0];
      if (session.startSystemBreathNum == null) {
        session.startSystemBreathNum = session.systemBreathNum;
        let elm = document.getElementById("priorBreathNum");
        elm.innerHTML = String(session.systemBreathNum - 1);
      }
      session.maxBreathNum = 
        session.systemBreathNum - session.startSystemBreathNum + 1;
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


