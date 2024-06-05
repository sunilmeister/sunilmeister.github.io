// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateFiO2Display(fiO2, o2Purity, o2Flow) {
  //fiO2Gauge.setValue(fiO2);
  //purityGauge.setValue(o2Purity);
  let elm = document.getElementById("fiO2Value");
  elm.innerHTML = String(fiO2) + '%';
  elm = document.getElementById("o2PurityValue");
  elm.innerHTML = String(o2Purity) + '%';
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = parseFloat(o2Flow / 10).toFixed(1);
}

function checkFiO2Calculation(d) {
  let newFiO2 = desiredFiO2;
  let newPurity = o2Purity;
  let newO2Flow = reqO2Flow;
  let change = false;
  let value = d.content["FIO2"];
  if (!isUndefined(value)) {
    if (validDecimalInteger(value) && (value <= 100)) {
      newFiO2 = value;
      change = true;
    }
  }
  value = d.content["O2PURITY"];
  if (!isUndefined(value)) {
    if (validDecimalInteger(value) && (value <= 100)) {
      newPurity = value;
      change = true;
    }
  }
  value = d.content["O2FLOWX10"];
  if (!isUndefined(value)) {
    if (validDecimalInteger(value)) {
      newO2Flow = value;
      change = true;
    }
  }
  if (change) {
    desiredFiO2 = newFiO2;
    o2Purity = newPurity;
    reqO2Flow = newO2Flow;
    updateFiO2Display(newFiO2, newPurity, newO2Flow);
  }
}

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
    fragment.created = new Date(addMsToDate(session.startDate, (fragment.MILLIS - startMillis)));
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
      session.startDate = new Date(d.created);
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

function processDashboardChirp(d) {
  let curDate = new Date(d.created);
  session.sessionDurationInMs = Math.abs(curDate.getTime() - session.startDate.getTime());
  let elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToHHMMSS(session.sessionDurationInMs);

  if (!updatePaused) {
    elm = document.getElementById("breathNum");
    animateNumberValueTo(elm, session.dashboardBreathNum);
  }

	latestChirp = cloneObject(d);
  checkFiO2Calculation(d);
  processJsonRecord(d);
  createDashboards();

  if (prevAlarmErrorNum != (session.errorMsgs.length - 1)) {
    prevAlarmErrorNum = session.errorMsgs.length - 1;
    let title = "Error encountered Breath# " + session.dashboardBreathNum;
    let msg = session.errorMsgs[prevAlarmErrorNum].L1 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L2 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L3 + "\n"
        + session.errorMsgs[prevAlarmErrorNum].L4;
    modalAlert(title, msg);
		startErrorBeep();
  } else {
		stopErrorBeep();
	}

  return d;
}

function createDashboards() {
  if (updatePaused) return;

  // update Snapshot on every chirp
  updateSnapshot();

  let bothRolling = session.reportRange.moving && prevUpdateRange.moving;

  // update rest of the views selectively
  if (currentView == "search") {
  	if (equalObjects(prevSearchRange,  session.search.range)) return;
  	prevSearchRange = cloneObject(session.search.range);
	} else {
  	if (equalObjects(prevUpdateRange,  session.reportRange)) return;
  	prevUpdateRange = cloneObject(session.reportRange);
	}

  if (currentView == "charts") createDashboardCharts();
  if (currentView == "stats") createDashboardStats();
  if (currentView == "search") createDashboardSearch();

  let currNumAlerts = numberOfExistingAlerts();
  if (currentView == "alerts") {
    if (!bothRolling || (prevUpdateNumAlerts != currNumAlerts)) {
      createDashboardAlerts();
      prevUpdateNumAlerts = currNumAlerts;
    }
  }  

  let currNumWaves = numberOfExistingWaves();
  if (currentView == "waves") {
    if (!bothRolling || (prevUpdateNumWaves != currNumWaves)) {
      createDashboardWaves();
      prevUpdateNumWaves = currNumWaves;
    }
  }

  if (currentView == "records") {
    if (!session.database.dbName) {
      blankRecordingBox();
    }
  }
}

function createDashboardStats() {
	rangeWindowDiv.style.display = "block";
  createAllStats();
}

function createDashboardAlerts() {
	rangeWindowDiv.style.display = "block";
  createAllAlerts();
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
	if (!session.reportRange.moving) {
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
      bnum.innerHTML = session.dashboardBreathNum;
      pauseButtonForeground = "WHITE";
    }
  } else {
    ttl.style.backgroundColor = palette.mediumgreen;
    bnum.style.backgroundColor = palette.mediumgreen;
    bdiv.style.backgroundColor = palette.mediumgreen;
    ttl.innerHTML = "LOGGED BREATHS"
    bnum.innerHTML = session.dashboardBreathNum;
    pauseButtonForeground = "WHITE";
  }
}

function setSliderMinMax() {
	let s = session.reportRange.minBnum;
	let e = session.reportRange.maxBnum;
  if (document.getElementById("searchDiv").style.display == "block") {
		if (session.search.range) {
			s = session.search.range.minBnum;
			e = session.search.range.maxBnum;
		}
	}
  stopSliderCallback = true;
  session.rangeSlider.setSlider([s, e]);
  stopSliderCallback = false;
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

	hideAllPopups();
}

function changeToSnapshotView() {
	undisplayAllViews();
  document.getElementById("btnSnapshots").disabled = true;
  document.getElementById("snapshot-pane").style.display = "inline-grid";

  rangeWindowDiv.style.display = "none";
  currentView = "snapshots";

  if (updatePaused) togglePause();
}

function changeToChartView() {
	undisplayAllViews();
  document.getElementById("btnCharts").disabled = true;
  document.getElementById("chart-pane").style.display = "block";
  rangeWindowDiv.style.display = "block";
	setSliderMinMax();

  if (updatePaused) togglePause();
  currentView = "charts";

  updateChartRangeOnEntry();
  createDashboardCharts();
}

function changeToWaveView() {
	undisplayAllViews();
  document.getElementById("btnWaves").disabled = true;
  document.getElementById("waves-pane").style.display = "block";
  rangeWindowDiv.style.display = "block";
	setSliderMinMax();

  if (updatePaused) togglePause();
  currentView = "waves";

  updateWaveRangeOnEntry();
  createDashboardWaves();
}

function changeToStatView() {
	undisplayAllViews();
  document.getElementById("btnStats").disabled = true;
  document.getElementById("stat-pane").style.display = "block";
	rangeWindowDiv.style.display = "block";
	setSliderMinMax();

  if (updatePaused) togglePause();
  currentView = "stats";

  updateStatRangeOnEntry();
  createDashboardStats();
}

function changeToAlertView() {
	undisplayAllViews();
  document.getElementById("btnAlerts").disabled = true;
  document.getElementById("alert-pane").style.display = "block";
	rangeWindowDiv.style.display = "block";
	setSliderMinMax();

  if (updatePaused) togglePause();
  currentView = "alerts";

  updateAlertRangeOnEntry();
  createDashboardAlerts();
}

function changeToSearchView() {
	undisplayAllViews();
  document.getElementById("btnSearch").disabled = true;
  document.getElementById("searchDiv").style.display = "block";
	rangeWindowDiv.style.display = "block";
	setSliderMinMax();

	if (!session.search.criteria) {
		session.search.criteria = new searchExpr({}, "exprContainer", "exprString", "searchResults");
	}

  currentView = "search";
  updateSearchRangeOnEntry();
}


function changeToRecordView() {
	undisplayAllViews();
  document.getElementById("btnRecording").disabled = true;
  document.getElementById("record-pane").style.display = "block";
  rangeWindowDiv.style.display = "none";
  if (updatePaused) togglePause();
  currentView = "records";
}

function updateRangeOnNewBreath() {
  session.charts.rangeLimit++;
  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "waves") updateWaveRange();
  if (currentView == "search") updateSearchRange();
}

function togglePause() {
  let elm = document.getElementById("btnPause");
  if (updatePaused) {
    elm.textContent = "Pause Dashboard";
    updatePaused = false;
    if (currentView == "snapshots") updateSnapshot();
    if (currentView == "charts") createDashboardCharts();
    if (currentView == "stats") createDashboardStats();
    if (currentView == "search") createDashboardSearch();
    if (currentView == "alerts") createDashboardAlerts();
    if (currentView == "waves") createDashboardWaves();
  } else {
    elm.textContent = "Resume Dashboard";
    updatePaused = true;
    breathPausedAt = session.dashboardBreathNum;
  }
  updateDashboardAndRecordingStatus();
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('', '_self').close();
}

function installFiO2Gauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('fiO2Div');
	containerDiv.innerHTML = "";
  fiO2Gauge = new CircularGauge(containerDiv, convertRemToPixels(6), fgColor, bgColor, 21, 100);
  fiO2Gauge.setProperty('readonly', true);
}

function installPurityGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('purityDiv');
	containerDiv.innerHTML = "";
  purityGauge = new CircularGauge(containerDiv, convertRemToPixels(6), fgColor, bgColor, 21, 100);
  purityGauge.setProperty('readonly', true);

}

function installPeakGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeakGauge');
	containerDiv.innerHTML = "";
  peakGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  peakGauge.setProperty('readonly', true);
}

function installPlatGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PlatGauge');
	containerDiv.innerHTML = "";
  platGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  platGauge.setProperty('readonly', true);
}

function installPeepGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeepGauge');
	containerDiv.innerHTML = "";
  peepGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  peepGauge.setProperty('readonly', true);
}

function installTempGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('TempGauge');
	containerDiv.innerHTML = "";
  tempGauge = new CircularGauge(containerDiv, convertRemToPixels(5.6), fgColor, bgColor, -20, 70);
  tempGauge.setProperty('readonly', true);
}

function receivedNewWave() {
  if (currentView == "waves") return;
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

window.onload = function () {
  finishedLoading = false;

	dashboardLaunchTime = new Date();

	// create all elements for the front panel display
	createFpDivs();

	disableAllBeeps();  
	openAudioControl();

  initDivElements();

  createNewSession();
  session.appId = DASHBOARD_APP_ID;
  session.launchDate = new Date();

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

  initStats();
  initAlerts();
  let snapshot = document.getElementById("snapshot-pane");
  snapshot.style.display = "inline-grid";
  let charts = document.getElementById("chart-pane");
  charts.style.display = "none";
  let stats = document.getElementById("stat-pane");
  stats.style.display = "none";
  // Install all gauges
  installPeakGauge();
  installPlatGauge();
  installPeepGauge();
  installTempGauge();

	alignSidebar();

	// After all the gauges are installed and sidebar aligned
	setRootFontSize("fullDashboard", "sideMenuBar");

  // Create range slider
  rangeWindowDiv = document.getElementById("rangeWindowDiv");
  sliderDiv = document.getElementById("rangeSliderDiv");
  createRangeSlider(sliderDiv);

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
  nonMenuArea.style.marginTop = "-" + String(convertPixelsToRem(menuBarHeight)) + "rem";
  nonMenuArea.style.marginLeft = String(convertPixelsToRem(menuBarWidth + 8)) + "rem";
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
  if (currentView == "charts") renderAllCharts();
	resizeAllWaves();
  if (currentView == "waves") renderAllWaves();
}

function appResize() {
	resizeChartsWaves();
	installPeakGauge();
	installPlatGauge();
	installPeepGauge();
	installTempGauge();
	alignSidebar();
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  let msg = 'Charts waveform history will be lost';
  if (session.dashboardBreathNum != 0) {
    if (!session.recorder.off) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}

function createRangeSlider(div) {
  if (session.rangeSlider) return;
  session.rangeSlider = new IntRangeSlider(
    div,
    0,
    CHART_NUM_ROLLING_BREATHS,
    0,
    0,
    1
  );
  session.rangeSlider.setChangeCallback(rangeSliderCallback);
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  let values = chartRangeSlider.getSlider();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);

  stopSliderCallback = true;
  session.rangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
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

function setTimeInterval() {
  let values = session.rangeSlider.getSlider();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);
  if (currentView == "search") {
  	session.search.range = createReportRange(false, bmin, bmax);
	} else {
  	session.reportRange = createReportRange(false, bmin, bmax);
	}

  createDashboards();
}

function playPauseTimeInterval() {
	if (session.reportRange.moving) {
		session.reportRange.moving = false;
  	document.getElementById("btnPlayInterval").src = "../common/img/playOrange.png";
		return;
	}

  document.getElementById("btnPlayInterval").src = "../common/img/pause.png";
  session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  stopSliderCallback = true;
  session.rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;

  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "waves") updateWaveRange();
  if (currentView == "search") updateSearchRange();

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

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  let values = session.rangeSlider.getSlider();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);
  setTimeInterval();
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
    if (timeAwaitingFirstChirp > MAX_AWAIT_FIRST_CHIRP_IN_MS) {
      displayWifiDropped();
    }
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
    displayWifiDropped();
    if (dormantPopupManualCloseTime) {
      if ((new Date() - dormantPopupManualCloseTime) >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) showDormantPopup();
      }
    } else if (!dormantPopupDisplayed) showDormantPopup();
  } else {
    displayNormalMessages();
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
      session.dashboardBreathNum = 
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


