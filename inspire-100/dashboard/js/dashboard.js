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
      //console.log("simulatedMillis=" + simulatedMillis);
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
  let sessionDurationInMs = Math.abs(curDate - session.startDate);
  let elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToTimeStr(sessionDurationInMs);

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

  // update rest of the views selectively
  if (equalObjects(prevUpdateRange,  session.reportRange)) return;

  let bothRolling = session.reportRange.rolling && prevUpdateRange.rolling;
  prevUpdateRange = cloneObject(session.reportRange);

  if (currentView == "charts") createDashboardCharts();
  if (currentView == "stats") createDashboardStats();

  let currNumAlerts = numberOfExistingAlerts();
  if (currentView == "alerts") {
    if (!bothRolling || (prevUpdateNumAlerts != currNumAlerts)) {
      createDashboardAlerts(chirp);
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

function createDashboardStats(chirp) {
  createAllStats(chirp);
}

function createDashboardAlerts(chirp) {
  createAllAlerts(chirp);
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

function enterBreathInterval () {
  document.getElementById("fromBreath").value = session.reportRange.minBnum;
  document.getElementById("toBreath").value = session.reportRange.maxBnum;
  document.getElementById("enterRangeDiv").style.display = "block";
}

function acceptBreathRange () {
  let fromBreath = document.getElementById("fromBreath").value;
  let toBreath = document.getElementById("toBreath").value;
  document.getElementById("enterRangeDiv").style.display = "none";

  let badRange = false;
  badRange = badRange || (fromBreath <= 0);
  badRange = badRange || (toBreath <= 0);
  badRange = badRange || (toBreath > session.dashboardBreathNum);
  badRange = badRange || (fromBreath >= toBreath);

  if (badRange) {
    // console.log("Badrange: from " + fromBreath + " to " + toBreath);
    modalAlert("Invalid Breath Range", "Try again!");
    return;
  }

  stopSliderCallback = true;
  rangeSlider.setSlider([fromBreath, toBreath]);
  stopSliderCallback = false;

  sliderCommitPending = true;
  setTimeInterval();
}

function cancelBreathRange () {
  document.getElementById("enterRangeDiv").style.display = "none";
}

function changeToSnapshotView() {
  document.getElementById("btnSnapshots").disabled = true;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "snapshots";
  snapshot.style.display = "inline-grid";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  waves.style.display = "none";
  rangeWindowDiv.style.display = "none";
}

function changeToChartView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = true;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "charts";
  snapshot.style.display = "none";
  charts.style.display = "block";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  waves.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateChartRangeOnEntry();
  createDashboardCharts();
}

function changeToWaveView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = true;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "waves";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  waves.style.display = "block";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateWaveRangeOnEntry();
  createDashboardWaves();
}

function changeToStatView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = true;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "stats";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "block";
  alerts.style.display = "none";
  records.style.display = "none";
  waves.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateStatRangeOnEntry();
  createDashboardStats();
}

function changeToAlertView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = true;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnWaves").disabled = false;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "alerts";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "block";
  records.style.display = "none";
  waves.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateAlertRangeOnEntry();
  createDashboardAlerts();
}

function changeToRecordView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = true;
  document.getElementById("btnWaves").disabled = false;
  let snapshot = document.getElementById("snapshot-pane");
  let charts = document.getElementById("chart-pane");
  let stats = document.getElementById("stat-pane");
  let alerts = document.getElementById("alert-pane");
  let records = document.getElementById("record-pane");
  let waves = document.getElementById("waves-pane");
  if (updatePaused) togglePause();
  currentView = "records";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "block";
  waves.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "none";
}

function updateRangeOnNewBreath() {
  session.charts.rangeLimit++;
  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "waves") updateWaveRange();
}

function togglePause() {
  let elm = document.getElementById("btnPause");
  if (updatePaused) {
    elm.textContent = "Pause Dashboard";
    updatePaused = false;
    if (currentView == "snapshots") updateSnapshot();
    if (currentView == "charts") createDashboardCharts();
    if (currentView == "stats") createDashboardStats();
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
  fiO2Gauge = new CircularGauge(containerDiv, 75, fgColor, bgColor, 21, 100);
  fiO2Gauge.setProperty('readonly', true);
}

function installPurityGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('purityDiv');
  purityGauge = new CircularGauge(containerDiv, 75, fgColor, bgColor, 21, 100);
  purityGauge.setProperty('readonly', true);

}

function installPeakGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeakGauge');
  peakGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  peakGauge.setProperty('readonly', true);
}

function installPlatGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PlatGauge');
  platGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  platGauge.setProperty('readonly', true);
}

function installPeepGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeepGauge');
  peepGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  peepGauge.setProperty('readonly', true);
}

function installTempGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('TempGauge');
  tempGauge = new CircularGauge(containerDiv, 90, fgColor, bgColor, -20, 70);
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
	dashboardLaunchTime = new Date();
	setModalWidth(600);
  showZoomReminder();

	disableAllBeeps();  
	openAudioControl();

  finishedLoading = false;
  initDivElements();

  session = cloneObject(SessionDataTemplate);
  session.appId = DASHBOARD_APP_ID;
  session.launchDate = new Date();
  session.charts.fontSize = 12;
  session.waves.labelFontSize = 12;
  session.waves.legendFontSize = 15;
  session.waves.titleFontSize = 30;
  session.waves.stripLineFontSize = 20;
  session.waves.newPwDataCallback = receivedNewWave;

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
  //installPurityGauge();
  //installFiO2Gauge();
  installPeakGauge();
  installPlatGauge();
  installPeepGauge();
  installTempGauge();

  // Create range slider
  rangeWindowDiv = document.getElementById("rangeWindowDiv");
  sliderDiv = document.getElementById("rangeSliderDiv");
  createRangeSlider(sliderDiv);

  // Treat <ENTER> as accept button
  new KeypressEnterSubmit('exportFileName', 'exportFileBtn');
  new KeypressEnterSubmit('recordName', 'acceptRecordNameBtn');
  new KeypressEnterSubmit('fromBreath', 'acceptRangeBtn');
  new KeypressEnterSubmit('toBreath', 'acceptRangeBtn');

  displayMessageLine("Mline1", banner1);
  displayMessageLine("Mline2", banner2);
  displayMessageLine("Mline3", banner3);
  displayMessageLine("Mline4", banner4);

  // now wait for chirps and act accordingly
  chirpQ = new Queue();
  waitForChirps();
  finishedLoading = true;
  let menuBar = document.getElementById("sideMenuBar");
  let menuBarHeight = menuBar.offsetHeight;
  let menuBarWidth = menuBar.offsetWidth;
  let nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth + 30) + "px";
  //console.log("menuBarHeight = " + menuBarHeight);
  //console.log("menuBarWidth = " + menuBarWidth);
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
  if (rangeSlider) return;
  rangeSlider = new IntRangeSlider(
    div,
    0,
    CHART_NUM_ROLLING_BREATHS,
    0,
    0,
    1
  );
  rangeSlider.setChangeCallback(rangeSliderCallback);
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  sliderCommitPending = true;
  let values = chartRangeSlider.getSlider();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);

  stopSliderCallback = true;
  rangeSlider.setSlider([bmin, bmax]);
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
  if (!sliderCommitPending) return;
  let values = rangeSlider.getSlider();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);
  session.reportRange = createReportRange(false, bmin, bmax);

  createDashboards();
  sliderCommitPending = false;
}

function resetTimeInterval() {
  session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;

  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "waves") updateWaveRange();

  createDashboards();
  sliderCommitPending = false;
}

function setFullInterval() {
  let values = rangeSlider.getRange();
  let bmin = parseInt(values[0]);
  let bmax = parseInt(values[1]);
  session.reportRange = createReportRange(false, bmin, bmax);
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;

  createDashboards();
  sliderCommitPending = false;
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  sliderCommitPending = true;
  let values = rangeSlider.getSlider();
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
		//console.log("millis",millis);
		//console.log("simulatedMillis",simulatedMillis);
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
        b.textContent = msToHMS(1000*dormantTimeInSec);
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


