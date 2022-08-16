var currentView = "snapshots";
var breathPausedAt = 0;

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
var startDTIME = 0;

function disassembleAndQueueDweet(d) {
  fragmentIndex = 0;
  while (1) {
    key = String(fragmentIndex);
    fragmentIndex++;

    if (typeof d.content[key] == "undefined") break;
    fragment = d.content[key];
    dTimeStr = fragment.DTIME;
    dTime = parseDTIME(dTimeStr);
    if (dTime==null) continue // ignore this malformed dweet

    if (!startDTIME) startDTIME = Number(dTime);
    if (typeof fragment.content['CLEAR_ALL'] != "undefined") {
      // replace CLEAR_ALL with a preconstructed dweet
      fragment = createNewInstance(clearAllDweet);
    }
    fragment.DTIME = Number(dTime);
    fragment.created = new Date(addMsToDate(startDate, (fragment.DTIME - startDTIME)));
    dweetQ.push(createNewInstance(fragment));
  }
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    if (simulatedTimeInMs - lastDweetInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstDweet) {
      dTimeStr = d.content["0"].DTIME 
      //console.log("dTimeStr=" + dTimeStr);
      dTime = parseDTIME(dTimeStr);
      if (dTime==null) return; // ignore this malformed dweet

      simulatedTimeInMs = Number(dTime);
      //console.log("simulatedTimeInMs=" + simulatedTimeInMs);
      startDate = new Date(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstDweet = false;
    lastDweetInMs = simulatedTimeInMs;
    disassembleAndQueueDweet(d);
  })
}

function processDashboardDweet(d) {
  curDate = new Date(d.created);
  sessionDurationInMs = curDate - startDate;
  elm = document.getElementById("logTimeDuration");
  elm.innerHTML = msToTimeStr(sessionDurationInMs);
  elm = document.getElementById("dashboardBreathNum");
  pd = document.getElementById("pausedOrDuring");
  if (updatePaused) {
    pd.innerHTML = "&nbspPaused At";
    elm.innerHTML = breathPausedAt;
  }
  else {
    pd.innerHTML = "&nbspDuring";
    elm.innerHTML = dashboardBreathNum;
  }
  checkFiO2Calculation(d);
  snapshotProcessJsonRecord(d);
  chartProcessJsonRecord(d);
  statProcessJsonRecord(d);
  if ((currentView == "snapshots") && !updatePaused) updateSnapshot();
  if ((currentView == "charts") && !updatePaused) createDashboardCharts();
  if ((currentView == "stats") && !updatePaused) createDashboardStats();
  if ((currentView == "alerts") && !updatePaused) createDashboardAlerts();
  return d;
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
  globalDataValid = true;
  displayStats();
}

function createDashboardAlerts() {
  globalDataValid = true;
  displayErrorWarnings();
}

function blinkFlowRate() {
  flowDiv = document.getElementById("flowDiv");
  var style = getComputedStyle(document.body)
  if (flowDivBackground == "DARKBLUE") {
    flowDiv.style.backgroundColor = style.getPropertyValue('--rsp_lightblue');
    flowDiv.style.color = style.getPropertyValue('--rsp_darkblue');
    flowDivBackground = "LIGHTBLUE";
  }
  else {
    flowDiv.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
    flowDiv.style.color = "white";
    flowDivBackground = "DARKBLUE";
  }
}

function blinkPauseButton() {
  btn = document.getElementById("btnPause");
  hdr = document.getElementById("headerDiv");
  var style = getComputedStyle(document.body)
  if (updatePaused) {
    if (pauseButtonBackground == "BLUE") {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_orange');
      hdr.style.backgroundColor = style.getPropertyValue('--rsp_orange');
      pauseButtonBackground = "ORANGE";
    }
    else {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_blue');
      hdr.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
      pauseButtonBackground = "BLUE";
    }
  }
  else {
    btn.style.backgroundColor = style.getPropertyValue('--rsp_blue');
    hdr.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
    pauseButtonBackground = "BLUE";
  }
}

function changeToSnapshotView() {
  btn1 = document.getElementById("btnViewChange1");
  btn2 = document.getElementById("btnViewChange2");
  btn3 = document.getElementById("btnViewChange3");
  btn4 = document.getElementById("btnViewChange4");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  updatePaused = false;
  currentView = "snapshots";
  snapshot.style.display = "inline-grid";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  btn1.textContent = "Charts View";
  btn2.textContent = "Statistics View";
  btn3.textContent = "Alerts View";
  btn4.textContent = "Recording View";
}

function changeToChartView() {
  btn1 = document.getElementById("btnViewChange1");
  btn2 = document.getElementById("btnViewChange2");
  btn3 = document.getElementById("btnViewChange3");
  btn4 = document.getElementById("btnViewChange4");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  updatePaused = false;
  currentView = "charts";
  snapshot.style.display = "none";
  charts.style.display = "block";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "none";
  btn1.textContent = "Snapshots View";
  btn2.textContent = "Statistics View";
  btn3.textContent = "Alerts View";
  btn4.textContent = "Recording View";
  createDashboardCharts();
}

function changeToStatView() {
  btn1 = document.getElementById("btnViewChange1");
  btn2 = document.getElementById("btnViewChange2");
  btn3 = document.getElementById("btnViewChange3");
  btn4 = document.getElementById("btnViewChange4");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  updatePaused = false;
  currentView = "stats";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "block";
  alerts.style.display = "none";
  records.style.display = "none";
  btn1.textContent = "Snapshots View";
  btn2.textContent = "Charts View";
  btn3.textContent = "Alerts View";
  btn4.textContent = "Recording View";
  createDashboardStats();
}

function changeToAlertView() {
  btn1 = document.getElementById("btnViewChange1");
  btn2 = document.getElementById("btnViewChange2");
  btn3 = document.getElementById("btnViewChange3");
  btn4 = document.getElementById("btnViewChange4");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  updatePaused = false;
  currentView = "alerts";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "block";
  records.style.display = "none";
  btn1.textContent = "Snapshots View";
  btn2.textContent = "Charts View";
  btn3.textContent = "Statistics View";
  btn4.textContent = "Recording View";
  createDashboardAlerts();
}

function changeToRecordView() {
  btn1 = document.getElementById("btnViewChange1");
  btn2 = document.getElementById("btnViewChange2");
  btn3 = document.getElementById("btnViewChange3");
  btn4 = document.getElementById("btnViewChange4");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  stats = document.getElementById("stat-pane");
  alerts = document.getElementById("alert-pane");
  records = document.getElementById("record-pane");
  updatePaused = false;
  currentView = "records";
  snapshot.style.display = "none";
  charts.style.display = "none";
  stats.style.display = "none";
  alerts.style.display = "none";
  records.style.display = "block";
  btn1.textContent = "Snapshots View";
  btn2.textContent = "Charts View";
  btn3.textContent = "Statistics View";
  btn4.textContent = "Alerts View";
}

function changeView1() {
  if (currentView == "snapshots") {
    changeToChartView();
  }
  else {
    changeToSnapshotView();
  }
}

function changeView2() {
  if (currentView == "snapshots") {
    changeToStatView();
  }
  else if (currentView == "charts") {
    changeToStatView();
  }
  else {
    changeToChartView();
  }
}

function changeView3() {
  if (currentView == "alerts") {
    changeToStatView();
  }
  else if (currentView == "records") {
    changeToStatView();
  }
  else {
    changeToAlertView();
  }
}

function changeView4() {
  if (currentView == "records") {
    changeToAlertView();
  }
  else {
    changeToRecordView();
  }
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
  }
  else {
    elm.textContent = "Resume Dashboard";
    updatePaused = true;
    breathPausedAt = dashboardBreathNum;
    pd = document.getElementById("pausedOrDuring");
    pd.innerHTML = "&nbspPaused At";
    elm = document.getElementById("dashboardBreathNum");
    elm.innerHTML = breathPausedAt;
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
  var fgColor = 'white' ;
  var containerDiv = document.getElementById('fiO2Div');
  fiO2Gauge = new CircularGauge(containerDiv, 150, fgColor, bgColor, 21, 100);
  fiO2Gauge.setProperty('readonly', true);
}

function installPurityGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_mediumblue');
  var fgColor = 'white' ;
  var containerDiv = document.getElementById('purityDiv');
  purityGauge = new CircularGauge(containerDiv, 150, fgColor, bgColor, 21, 100);
  purityGauge.setProperty('readonly', true);
  
}

function installPeakGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white' ;
  var containerDiv = document.getElementById('PeakGauge');
  peakGauge = new CircularGauge(containerDiv, 175, fgColor, bgColor, 0, 70);
  peakGauge.setProperty('readonly', true);
}

function installPlatGauge() {
  var style = getComputedStyle(document.body);
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white' ;
  var containerDiv = document.getElementById('PlatGauge');
  platGauge = new CircularGauge(containerDiv, 175, fgColor, bgColor, 0, 70);
  platGauge.setProperty('readonly', true);
}

function installPeepGauge() {
  var style = getComputedStyle(document.body)
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = 'white' ;
  var containerDiv = document.getElementById('PeepGauge');
  peepGauge = new CircularGauge(containerDiv, 175, fgColor, bgColor, 0, 70);
  peepGauge.setProperty('readonly', true);
}

function installTempGauge() {
  var style = getComputedStyle(document.body)
  var bgColor = style.getPropertyValue('--rsp_darkblue');
  var fgColor = style.getPropertyValue('--rsp_mediumblue');
  var containerDiv = document.getElementById('TempGauge');
  tempGauge = new CircularGauge(containerDiv, 150, fgColor, bgColor, -20, 70);
  tempGauge.setProperty('readonly', true);
}

function PressuresClick() {
  if (document.getElementById("PressuresTick").checked) {
    document.getElementById("PressuresChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("PressuresChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function VolumesClick() {
  if (document.getElementById("VolumesTick").checked) {
    document.getElementById("VolumesChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("VolumesChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function BpmClick() {
  if (document.getElementById("BpmTick").checked) {
    document.getElementById("BpmChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("BpmChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function CompClick() {
  if (document.getElementById("CompTick").checked) {
    document.getElementById("CompChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("CompChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function FiO2Click() {
  if (document.getElementById("FiO2Tick").checked) {
    document.getElementById("FiO2ChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("FiO2ChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function MiscClick() {
  if (document.getElementById("MiscTick").checked) {
    document.getElementById("MiscChartWrapper").style.display = "block";
  }
  else {
    document.getElementById("MiscChartWrapper").style.display = "none";
  }
  createDashboardCharts();
}

function InitChartCheckBoxes() {
  document.getElementById("PressuresTick").checked = false;
  document.getElementById("VolumesTick").checked = false;
  document.getElementById("BpmTick").checked = false;
  document.getElementById("FiO2Tick").checked = false;
  document.getElementById("MiscTick").checked = false;
}

function createChartRangeSlider(div) {
  chartSliderPresent = true;
  chartRangeSlider = new IntRangeSlider(
    div,
    0,
    MAX_CHART_DATAPOINTS,
    0,
    0,
    1
  );
  chartRangeSlider.setChangeCallback(chartRangeSliderCallback);
}

function chartRangeSliderCallback() {
  values = chartRangeSlider.getSlider();
  selectChartRange(chartRangeSlider, values[0], values[1]);
  createDashboardCharts();
}

function selectChartRange(slider, minB, maxB) {
  l = Number(minB);
  r = Number(maxB);
  if (cumulativeChartBreaths) {
    if (r>cumulativeChartBreaths) r = cumulativeChartBreaths;
    if (l<1) l = 1;
  } else {
    r = l = 0;
  }

  if (l != minChartBreathNum) {
    // min changed
    if (r-l>MAX_CHART_DATAPOINTS) {
      r = l+MAX_CHART_DATAPOINTS-1;
    }
  } else if (r != maxChartBreathNum) {
    // max changed
    if (r-l>MAX_CHART_DATAPOINTS) {
      l = r-MAX_CHART_DATAPOINTS+1;
    }
  }
  
  minChartBreathNum = l;
  maxChartBreathNum = r;
  slider.setSlider([l, r]);
}

var cumulativeChartBreaths = 0;
function updateChartRangeOnNewBreath(num) {
  cumulativeChartBreaths+=num ;
  //console.log("Before min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  if (minChartBreathNum==0) minChartBreathNum = 1;

  maxChartBreathNum += num;
  if (cumulativeChartBreaths>MAX_CHART_DATAPOINTS) chartRangeLimit += num;
  if ((maxChartBreathNum - minChartBreathNum) >= MAX_CHART_DATAPOINTS) {
    minChartBreathNum += num;
  }
  //console.log("After min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  chartRangeSlider.setRange([1, chartRangeLimit]);
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
}

var finishedLoading = false;
window.onload = function() {
  initDbNames();
  InitRecorder();
  var heading = document.getElementById("SysUid");
  if (respimaticTag) {
    document.title = respimaticTag + " (" + datasource_name + ")"
    heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  }
  else {
    document.title = "NOT SPECIFIED"
    heading.innerHTML = "NOT SPECIFIED"
  }
  currentView = "snapshots";
  updatePaused = false;
  awaitingFirstDweet = true;
  dashboardBreathNum = 0;
  systemBreathNum = 0;
  updatedDweetContent = {
    "content": {}
  };
  simulatedTimeInMs = 0;
  lastDweetInMs = 0;
  wifiDropped = false;
  messagesBackground = "MEDIUMBLUE";
  alertBackground = "GREEN";
  pendingBackground = "MEDIUMBLUE";
  pauseButtonBackground = "MEDIUMBLUE";
  flowDivBackground = "DARKBLUE";
  alertImage = "OK";
  blinkInterval = 0;
  initGlobalData();
  initStats();
  initChartStartValues();
  initErrorWarnings();
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
  btn1 = document.getElementById("btnViewChange1");
  btn1.textContent = "Charts View";
  btn2 = document.getElementById("btnViewChange2");
  btn2.textContent = "Statistics View";
  // Install all gauges
  installPurityGauge();
  installFiO2Gauge();
  installPeakGauge();
  installPlatGauge();
  installPeepGauge();
  installTempGauge();
  // Chart types to display
  InitChartCheckBoxes();
  // Create chart range slider
  elm = document.getElementById('chartSliderCaption');
  elm.innerHTML = "Select Chart Window (MAX " + MAX_CHART_DATAPOINTS + " Breaths)";
  chartRangeDiv = document.getElementById('chartRangeDiv');
  createChartRangeSlider(chartRangeDiv);
  // now wait for dweets and act accordingly
  dweetQ = new Queue();
  waitForDweets();
  finishedLoading = true;
}

window.onbeforeunload = function(e) {
  if (db) db.close();
  var msg = 'Charts waveform history will be lost';
  if (dashboardBreathNum != 0) {
    if (!recordingOff) {
      msg = msg + '\nAlso recording will stop';
    }
    return msg;
  }
}

function HandlePeriodicTasks() {
  if (!finishedLoading) return;
  updateAlert(true);
  updatePending(true);
  blinkInterval += PERIODIC_INTERVAL_IN_MS;
  if (blinkInterval >= BLINK_INTERVAL_IN_MS) {
    blinkInterval = 0;
    blinkPauseButton();
    blinkRecordButton();
    blinkFlowRate();
  }
  if (awaitingFirstDweet) {
    displayWifiUnconnected();
  }
  else if ((dweetQ.size() == 0) &&
    ((simulatedTimeInMs - lastDweetInMs) >= MAX_DWEET_INTERVAL_IN_MS)) {
    displayWifiDropped();
  }
  else {
    displayNormalMessages();
  }
}

var periodicIntervalId = setInterval(function () {
  if (!awaitingFirstDweet) {
    simulatedTimeInMs += PERIODIC_INTERVAL_IN_MS;
  }
  HandlePeriodicTasks();
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (dweetQ && dweetQ.size()) {
    FetchAndExecuteFromQueue();
  }
}, PERIODIC_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return false;
  if (dweetQ.size() == 0) return false;
  d = dweetQ.peek();
  dTimeInMs = Number(d.DTIME);

  if (simulatedTimeInMs >= dTimeInMs) {
    d = dweetQ.pop();
    if (typeof d.content["BNUM"] != "undefined") {
      dashboardBreathNum++;
      systemBreathNum = d.content["BNUM"];
      if (startSystemBreathNum<0) {
	startSystemBreathNum = systemBreathNum;
        elm = document.getElementById("priorBreathNum");
	elm.innerHTML = String(systemBreathNum-1);
      }
    }
    var dCopy; // a copy of the dweet
    if (!recordingOff && !recordingPaused) dCopy = createNewInstance(d);
    processDashboardDweet(d);
    if (!recordingOff && !recordingPaused) processRecordDweet(dCopy);
    return true;
  }
  if (dTimeInMs - simulatedTimeInMs > MAX_DIFF_DWEET_SIMULAION_TIMES) {
    console.log("Dweets way ahead of simulated time " + dTimeInMs + " v/s " + simulatedTimeInMs);
  }
  return false;
}

alert(
  "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
  "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

