// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateFiO2Display(fiO2, o2Purity, o2Flow) {
  fiO2Gauge.setValue(fiO2);
  purityGauge.setValue(o2Purity);
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = parseFloat(o2Flow / 10).toFixed(1) + " (litres/min)";
}

function checkFiO2Calculation(d) {
  var newFiO2 = desiredFiO2;
  var newPurity = o2Purity;
  var newO2Flow = reqO2Flow;
  var change = false;
  value = d.content["FIO2"];
  if (typeof value != "undefined") {
    if (validDecimalInteger(value) && (value <= 100)) {
      newFiO2 = value;
      change = true;
    }
  }
  value = d.content["O2PURITY"];
  if (typeof value != "undefined") {
    if (validDecimalInteger(value) && (value <= 100)) {
      newPurity = value;
      change = true;
    }
  }
  value = d.content["O2FLOWX10"];
  if (typeof value != "undefined") {
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

function disassembleAndQueueDweet(d) {
  fragmentIndex = 0;
  while (1) {
    key = String(fragmentIndex);
    fragmentIndex++;

    if (typeof d.content[key] == "undefined") break;
    fragment = d.content[key];
    millisStr = fragment.MILLIS;
    millis = parseChecksumString(millisStr);
    if (millis == null) continue // ignore this malformed dweet

    if (!startMillis) startMillis = Number(millis);
    if (typeof fragment.content['CLEAR_ALL'] != "undefined") {
      // replace CLEAR_ALL with a preconstructed dweet
      // fragment = cloneObject(clearAllDweet);
    }
    fragment.MILLIS = Number(millis);
    fragment.created = new Date(addMsToDate(session.startDate, (fragment.MILLIS - startMillis)));
    dweetQ.push(cloneObject(fragment));
  }
}

function getCurrentSimulatedMillis() {
  curDate = new Date();
  deltaTimeInMs = curDate - startSystemDate;
  return startSimulatedMillis + deltaTimeInMs;
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function (d) {
    if (simulatedMillis - lastDweetInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstDweet) {
      millisStr = d.content["0"].MILLIS
      millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed dweet

      simulatedMillis = Number(millis);
      startSimulatedMillis = simulatedMillis;
      startSystemDate = new Date();
      //console.log("simulatedMillis=" + simulatedMillis);
      session.startDate = new Date(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstDweet = false;
    lastDweetInMs = simulatedMillis;
    disassembleAndQueueDweet(d);
  })
}

function processDashboardDweet(d) {
  curDate = new Date(d.created);
  sessionDurationInMs = curDate - session.startDate;
  elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToTimeStr(sessionDurationInMs);
  elm = document.getElementById("dashboardBreathNum");
  pd = document.getElementById("pausedOrDuring");
  if (updatePaused) {
    pd.innerHTML = "&nbspPaused At";
    elm.innerHTML = breathPausedAt;
  } else {
    pd.innerHTML = "&nbspDetected";
    elm.innerHTML = session.dashboardBreathNum;
  }
  elm = document.getElementById("numMissedBreaths");
  elm.innerHTML = session.numMissingBreaths;

  checkFiO2Calculation(d);
  snapshotProcessJsonRecord(d);
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
  }

  return d;
}

function createDashboards() {
  if (updatePaused) return;

  // update Snapshot on every dweet
  if ((currentView == "snapshots") && !updatePaused) updateSnapshot();

  // update rest of the views selectively
  if (equalObjects(prevUpdateRange,  session.reportRange)) return;
  //console.log("session.reportRange"); console.log(session.reportRange);
  //console.log("prevUpdateRange"); console.log(prevUpdateRange);
  //console.log("**** Not equal");

  bothRolling = session.reportRange.rolling && prevUpdateRange.rolling;
  prevUpdateRange = cloneObject(session.reportRange);

  if (currentView == "charts") createDashboardCharts();
  if (currentView == "stats") createDashboardStats();

  currNumAlerts = numberOfExistingAlerts();
  if (currentView == "alerts") {
    if (!bothRolling || (prevUpdateNumAlerts != currNumAlerts)) {
      createDashboardAlerts();
      prevUpdateNumAlerts = currNumAlerts;
    }
  }  

  currNumShapes = numberOfExistingShapes();
  if (currentView == "shapes") {
    if (!bothRolling || (prevUpdateNumShapes != currNumShapes)) {
      createDashboardShapes();
      prevUpdateNumShapes = currNumShapes;
    }
  }
}

function snapshotProcessJsonRecord(d) {
  updatedDweetContent.created = d.created;
  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
    updatedDweetContent.content[key] = value;
  }
}

function createDashboardStats() {
  createAllStats();
}

function createDashboardAlerts() {
  createAllAlerts();
}

function blinkFlowRate() {
  flowDiv = document.getElementById("flowDiv");
  var style = getComputedStyle(document.body)
  if (flowDivBackground == "DARKBLUE") {
    flowDiv.style.backgroundColor = style.getPropertyValue('--rsp_lightblue');
    flowDiv.style.color = style.getPropertyValue('--rsp_darkblue');
    flowDivBackground = "LIGHTBLUE";
  } else {
    flowDiv.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
    flowDiv.style.color = "white";
    flowDivBackground = "DARKBLUE";
  }
}

function blinkPauseButton() {
  btn = document.getElementById("btnPause");
  var style = getComputedStyle(document.body)
  if (updatePaused) {
    if (pauseButtonForeground == "WHITE") {
      btn.style.color = style.getPropertyValue('--rsp_orange');
      pauseButtonForeground = "ORANGE";
    } else {
      btn.style.color = 'white';
      pauseButtonForeground = "WHITE";
    }
  } else {
    btn.style.color = 'white';
    pauseButtonForeground = "WHITE";
  }
}

function changeToSnapshotView() {
  document.getElementById("btnSnapshots").disabled = true;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnShapes").disabled = false;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "snapshots";
  snapshot.style.display = "inline-grid";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  shapes.style.display = "none";
  rangeWindowDiv.style.display = "none";
}

function changeToChartView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = true;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnShapes").disabled = false;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "charts";
  snapshot.style.display = "none";
  charts.style.display = "block";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  shapes.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateChartRangeOnEntry();
  createDashboardCharts();
}

function changeToShapeView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = false;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnShapes").disabled = true;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "shapes";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  shapes.style.display = "block";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "block";
  updateShapeRangeOnEntry();
  createDashboardShapes();
}

function changeToStatView() {
  document.getElementById("btnSnapshots").disabled = false;
  document.getElementById("btnCharts").disabled = false;
  document.getElementById("btnStats").disabled = true;
  document.getElementById("btnAlerts").disabled = false;
  document.getElementById("btnRecording").disabled = false;
  document.getElementById("btnShapes").disabled = false;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "stats";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "block";
  alerts.style.display = "none";
  records.style.display = "none";
  shapes.style.display = "none";
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
  document.getElementById("btnShapes").disabled = false;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "alerts";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "block";
  records.style.display = "none";
  shapes.style.display = "none";
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
  document.getElementById("btnShapes").disabled = false;
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  shapes = document.getElementById("shapes-pane");
  if (updatePaused) togglePause();
  currentView = "records";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "block";
  shapes.style.display = "none";
  document.getElementById('recordNameDiv').style.display = "none";

  rangeWindowDiv.style.display = "none";
}

function updateRangeOnNewBreath() {
  session.charts.rangeLimit++;
  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "shapes") updateShapeRange();
}

function togglePause() {
  elm = document.getElementById("btnPause");
  if (updatePaused) {
    elm.textContent = "Pause Dashboard";
    updatePaused = false;
    if (currentView == "snapshots") updateSnapshot();
    if (currentView == "charts") createDashboardCharts();
    if (currentView == "stats") createDashboardStats();
    if (currentView == "alerts") createDashboardAlerts();
    if (currentView == "shapes") createDashboardShapes();
  } else {
    elm.textContent = "Resume Dashboard";
    updatePaused = true;
    breathPausedAt = session.dashboardBreathNum;
    pd = document.getElementById("pausedOrDuring");
    pd.innerHTML = "&nbspPaused At";
    elm = document.getElementById("dashboardBreathNum");
    elm.innerHTML = breathPausedAt;
    //console.log("Peak Dweet Queue usage = " + dweetQ.peakSize());
  }
  updateDashboardAndRecordingStatus();
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('', '_self').close();
}

function installFiO2Gauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_mediumblue');
  var fgColor = 'white';
  var containerDiv = document.getElementById('fiO2Div');
  fiO2Gauge = new CircularGauge(containerDiv, 75, fgColor, bgColor, 21, 100);
  fiO2Gauge.setProperty('readonly', true);
}

function installPurityGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_mediumblue');
  var fgColor = 'white';
  var containerDiv = document.getElementById('purityDiv');
  purityGauge = new CircularGauge(containerDiv, 75, fgColor, bgColor, 21, 100);
  purityGauge.setProperty('readonly', true);

}

function installPeakGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white';
  var containerDiv = document.getElementById('PeakGauge');
  peakGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  peakGauge.setProperty('readonly', true);
}

function installPlatGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white';
  var containerDiv = document.getElementById('PlatGauge');
  platGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  platGauge.setProperty('readonly', true);
}

function installPeepGauge() {
  var style = getComputedStyle(document.body)
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white';
  var containerDiv = document.getElementById('PeepGauge');
  peepGauge = new CircularGauge(containerDiv, 110, fgColor, bgColor, 0, 70);
  peepGauge.setProperty('readonly', true);
}

function installTempGauge() {
  var style = getComputedStyle(document.body)
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = style.getPropertyValue('--rsp_mediumblue');
  var containerDiv = document.getElementById('TempGauge');
  tempGauge = new CircularGauge(containerDiv, 90, fgColor, bgColor, -20, 70);
  tempGauge.setProperty('readonly', true);
}

function receivedNewShape() {
  if (currentView == "shapes") return;
  if ((session.shapes.sendPeriod) && !session.shapes.onDemand) return;

  console.log("On demand snapshot received pwBreathNum=" + session.shapes.pwBreathNum);
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
  setModalWidth(600);
  showZoomReminder();

  finishedLoading = false;
  initDivElements();

  session = cloneObject(SessionDataTemplate);
  session.appId = DASHBOARD_APP_ID;
  session.charts.fontSize = 12;
  session.shapes.labelFontSize = 12;
  session.shapes.legendFontSize = 15;
  session.shapes.titleFontSize = 30;
  session.shapes.stripLineFontSize = 20;
  session.shapes.newPwDataCallback = receivedNewShape;

  initDbNames();
  InitRecorder();
  var heading = document.getElementById("SysUid");
  if (respimaticTag) {
    document.title = respimaticTag + " (DASHBOARD)"
    heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  } else {
    document.title = "NOT SPECIFIED"
    heading.innerHTML = "NOT SPECIFIED"
  }
  initStats();
  initAlerts();
  var style = getComputedStyle(document.body)
  blueColor = style.getPropertyValue('--rsp_blue');
  mediumblueColor = style.getPropertyValue('--rsp_mediumblue');
  darkblueColor = style.getPropertyValue('--rsp_darkblue');
  darkredColor = style.getPropertyValue('--rsp_darkred');
  greenColor = style.getPropertyValue('--rsp_green');
  orangeColor = style.getPropertyValue('--rsp_orange');
  snapshot = document.getElementById("snapshot-pane");
  snapshot.style.display = "inline-grid";
  charts = document.getElementById("chart-pane");
  charts.style.display = "none";
  stats = document.getElementById("stat-pane");
  stats.style.display = "none";
  // Install all gauges
  installPurityGauge();
  installFiO2Gauge();
  installPeakGauge();
  installPlatGauge();
  installPeepGauge();
  installTempGauge();

  // Create range slider
  rangeWindowDiv = document.getElementById("rangeWindowDiv");
  sliderDiv = document.getElementById("rangeSliderDiv");
  createRangeSlider(sliderDiv);

  // Treat <ENTER> as accept button
  var recordNameInput = document.getElementById("recordName");
  recordNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("acceptRecordNameBtn").click();
    }
  });

  // now wait for dweets and act accordingly
  dweetQ = new Queue();
  waitForDweets();
  finishedLoading = true;
  var menuBar = document.getElementById("sideMenuBar");
  menuBarHeight = menuBar.offsetHeight;
  menuBarWidth = menuBar.offsetWidth;
  var nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth + 50) + "px";
  //console.log("menuBarHeight = " + menuBarHeight);
  //console.log("menuBarWidth = " + menuBarWidth);
}

window.onbeforeunload = function (e) {
  if (db) db.close();
  var msg = 'Charts waveform history will be lost';
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
    MAX_CHART_DATAPOINTS,
    0,
    0,
    1
  );
  rangeSlider.setChangeCallback(rangeSliderCallback);
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = chartRangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);

  stopSliderCallback = true;
  rangeSlider.setSlider([bmin, bmax]);
  stopSliderCallback = false;
}

function outIconButton(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
  //console.log("out");
  //console.log(btn);
}

function overIconButton(btn) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  //console.log("hover");
  //console.log(btn);
}

function setBackGroundBreathWindowButton(id, bgd) {
  el = document.getElementById(id);
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;

  el = el.firstElementChild;
  el.style.backgroundColor = bgd;
  el.style.borderColor = bgd;
  el.style.opacity = 1;
}

function colorBreathWindowButtons(bgd) {
  setBackGroundBreathWindowButton('btnSetInterval', bgd);
  setBackGroundBreathWindowButton('btnCancelInterval', bgd);
  setBackGroundBreathWindowButton('btnResetInterval', bgd);
  setBackGroundBreathWindowButton('btnFullInterval', bgd);
}

breathWindowButtonsFlashed = false;

function flashBreathWindowButtons() {
  breathWindowButtonsFlashed = true;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_mediumblue');
  colorBreathWindowButtons(bgd);
}

function unflashBreathWindowButtons() {
  breathWindowButtonsFlashed = false;
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('white');
  colorBreathWindowButtons(bgd);
}

function setTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  values = rangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveRange = session.reportRange;
  session.reportRange = createReportRange(false, bmin, bmax);

  createDashboards();
  sliderCommitPending = false;
}

var saveRange = null;

function cancelTimeInterval(btn) {
  if (!sliderCommitPending) return;
  unflashBreathWindowButtons();
  if (saveRange) {
    session.reportRange = saveRange;
  } else {
    session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  }
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;
  sliderCommitPending = false;
}

function resetTimeInterval(btn) {
  saveRange = null;
  unflashBreathWindowButtons();
  session.reportRange = createReportRange(true, 1, session.dashboardBreathNum);
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;

  if (currentView == "charts") updateChartRange();
  if (currentView == "stats") updateStatRange();
  if (currentView == "alerts") updateAlertRange();
  if (currentView == "shapes") updateShapeRange();

  createDashboards();
  sliderCommitPending = false;
}

function setFullInterval(btn) {
  unflashBreathWindowButtons();
  values = rangeSlider.getRange();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
  saveRange = session.reportRange;
  session.reportRange = createReportRange(false, bmin, bmax);
  stopSliderCallback = true;
  rangeSlider.setSlider([session.reportRange.minBnum, session.reportRange.maxBnum]);
  stopSliderCallback = false;

  createDashboards();
  sliderCommitPending = false;
}

function rangeSliderCallback() {
  if (stopSliderCallback) return;
  flashBreathWindowButtons();
  sliderCommitPending = true;
  values = rangeSlider.getSlider();
  bmin = parseInt(values[0]);
  bmax = parseInt(values[1]);
}

function HandlePeriodicTasks() {
  if (!finishedLoading) return;
  updateAlert(true);
  updatePending(true);
  var invokeTimeInMs = (new Date()).getTime();
  blinkInterval = invokeTimeInMs - prevBlinkTimeInMs;
  if (blinkInterval >= BLINK_INTERVAL_IN_MS) {
    blinkPauseButton();
    blinkRecordButton();
    blinkFlowRate();
    if (sliderCommitPending) {
      if (breathWindowButtonsFlashed) unflashBreathWindowButtons();
      else flashBreathWindowButtons();
    }
    prevBlinkTimeInMs = invokeTimeInMs;
  }
  if (awaitingFirstDweet) {
    displayWifiUnconnected();
  } else if ((dweetQ.size() == 0) &&
    ((simulatedMillis - lastDweetInMs) >= MAX_DWEET_INTERVAL_IN_MS)) {
    displayWifiDropped();
  } else {
    displayNormalMessages();
  }
}

setTimeout(function periodicCheck() {
  if (!awaitingFirstDweet) {
    simulatedMillis = getCurrentSimulatedMillis();
  }
  HandlePeriodicTasks();
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (dweetQ && dweetQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return;
  var millis;
  while (1) {
    if (dweetQ.size() == 0) break;
    d = dweetQ.peek();
    millis = Number(d.MILLIS);
    if (simulatedMillis < millis) break;

    d = dweetQ.pop();
    if (typeof d.content["BNUM"] != "undefined") {
      session.dashboardBreathNum++;
      session.systemBreathNum = parseChecksumString(d.content["BNUM"]);
      if (session.startSystemBreathNum == null) {
        session.startSystemBreathNum = session.systemBreathNum;
        elm = document.getElementById("priorBreathNum");
        elm.innerHTML = String(session.systemBreathNum - 1);
      }
    }
    var dCopy; // a copy of the dweet
    dCopy = cloneObject(d);
    processDashboardDweet(d);
    processRecordDweet(dCopy);
  }

  if (millis - simulatedMillis > MAX_DIFF_DWEET_SIMULAION_TIMES) {
    console.log("Dweets way ahead of simulated time " + millis +
      " v/s " + simulatedMillis);
  }
  return;
}
