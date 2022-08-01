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
  //console.log(d);

  for (i=0;;i++) {
    key = String(i);
    if (typeof d.content[key] == "undefined")  break;
    fragment = d.content[key];
    dTime = fragment.DTIME;
    if (!startDTIME) startDTIME = dTime;

    if (typeof fragment.content['CLEAR_ALL'] != "undefined")  {
      // replace CLEAR_ALL with a preconstructed dweet
      fragment = createNewInstance(clearAllDweet);
      //console.log("Encountered CLEAR_ALL");
      //console.log(fragment);
    }

    fragment.DTIME = dTime;
    fragment.created = new Date(addMsToDate(startDate,(fragment.DTIME - startDTIME)));
    //console.log(fragment);

    dweetQ.push(createNewInstance(fragment));
  }
}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    if (simulatedTimeInMs-lastDweetInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstDweet) {
      //console.log(d);
      simulatedTimeInMs = d.content["0"].DTIME;
      startDate = new Date(d.created);
      elm = document.getElementById("startTime");
      elm.innerHTML = "Starting Time " + dateToTimeStr(d.created);
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
  elm.innerHTML = "Session Duration " + msToTimeStr(sessionDurationInMs);

  elm = document.getElementById("dashboardBreathNum");
  if (updatePaused) {
    elm.innerHTML = "&nbsp&nbspDashboard Paused at&nbsp&nbsp Breath " + breathPausedAt;
  } else {
    elm.innerHTML = "&nbsp&nbspNumber of Breaths&nbsp&nbsp " + dashboardBreathNum;
  }

  checkFiO2Calculation(d);
  snapshotProcessJsonRecord(d);
  chartProcessJsonRecord(d);
  statProcessJsonRecord(d);
  if ((currentView=="snapshots") && !updatePaused) updateSnapshot();
  if ((currentView=="charts") && !updatePaused) createDashboardCharts();
  if ((currentView=="stats") && !updatePaused) createDashboardStats();
  if ((currentView=="alerts") && !updatePaused) createDashboardAlerts();
  
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
    if (flowDivBackground=="DARKBLUE") {
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
  hdr = document.getElementById("headerDiv");
  var style = getComputedStyle(document.body)
  if (updatePaused) {
    if (pauseButtonBackground=="BLUE") {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_orange');
      hdr.style.backgroundColor = style.getPropertyValue('--rsp_orange');
      pauseButtonBackground = "ORANGE";
    } else {
      btn.style.backgroundColor = style.getPropertyValue('--rsp_blue');
      hdr.style.backgroundColor = style.getPropertyValue('--rsp_darkblue');
      pauseButtonBackground = "BLUE";
    }
  } else {
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
  } else {
    changeToSnapshotView();
  }
}

function changeView2() {
  if (currentView == "snapshots") {
    changeToStatView();
  } else if (currentView == "charts") {
    changeToStatView();
  } else {
    changeToChartView();
  }
}

function changeView3() {
  if (currentView == "alerts") {
    changeToStatView();
  } else if (currentView == "records") {
    changeToStatView();
  } else {
    changeToAlertView();
  }
}

function changeView4() {
  if (currentView == "records") {
    changeToAlertView();
  } else {
    changeToRecordView();
  }
}

var pressureChart = null;
var volumeChart = null;
var bpmChart = null;
var fiO2Chart = null;
var miscChart = null;
var timeBased = false;

function createDashboardCharts() {
  elm = document.getElementById("timeTick");
  timeBased = elm.checked;

  createDashboardPressureCharts();
  createDashboardVolumeCharts();
  createDashboardBpmCharts();
  createDashboardFiO2Charts();
  createDashboardMiscCharts();
}

function createDashboardPressureCharts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Pressures";
  createChartsXaxis(chartJson);
  chartJson.height = 475;
  chartJson.backgroundColor = style.getPropertyValue('--rsp_lightblue');
  flagError = false;
  flagWarning = false;
  paramData = createCanvasChartData(peakValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[0];
  yaxis = createPressureYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "Peak Pressure (cm H20)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(platValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "Plateau Pressure (cm H20)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(mpeepValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[2];
  if (paramData) {
    paramData.name = "PEEP Pressure (cm H20)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  container = document.getElementById("chartPressureDiv");
  if (pressureChart) {
    pressureChart.destroy();
    pressureChart = null;
  }
  pressureChart = new CanvasJS.Chart(container, chartJson);
  pressureChart.render();
}

function createDashboardVolumeCharts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Volumes";
  createChartsXaxis(chartJson);
  chartJson.height = 475;
  chartJson.backgroundColor = style.getPropertyValue('--rsp_lightblue');
  flagError = false;
  flagWarning = false;
  paramData = createCanvasChartData(vtdelValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[0];
  yaxis = createVtYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "Delivered Tidal Volume (ml)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(mvdelValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[1];
  yaxis = createMvYaxis(1, chartColor);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.name = "Delivered Minute Volume (litres/min)";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }
  container = document.getElementById("chartVolumeDiv");
  if (volumeChart) {
    volumeChart.destroy();
    volumeChart = null;
  }
  volumeChart = new CanvasJS.Chart(container, chartJson);
  volumeChart.render();
}

function createDashboardFiO2Charts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "FiO2";
  createChartsXaxis(chartJson);
  chartJson.height = 475;
  chartJson.backgroundColor = style.getPropertyValue('--rsp_lightblue');
  flagError = false;
  flagWarning = false;
  paramData = createCanvasChartData(fiO2Values, timeBased, flagError, flagWarning);
  chartColor = graphColors[0];
  yaxis = createPercentYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "FiO2 (%)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(o2PurityValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "O2 Purity (%)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(o2FlowValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[2];
  yaxis = createO2FlowYaxis(0, chartColor);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.name = "O2 Flow (litres/min)";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }
  container = document.getElementById("chartFiO2Div");
  if (fiO2Chart) {
    fiO2Chart.destroy();
    fiO2Chart = null;
  }
  fiO2Chart = new CanvasJS.Chart(container, chartJson);
  fiO2Chart.render();
}

function createDashboardMiscCharts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Miscellaneous";
  createChartsXaxis(chartJson);
  chartJson.height = 475;
  chartJson.backgroundColor = style.getPropertyValue('--rsp_lightblue');
  flagError = false;
  flagWarning = false;
  paramData = createCanvasChartData(tempValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[0];
  yaxis = createTempYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "System Temperature (deg C)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(warningValues, timeBased, false, true);
  chartColor = graphColors[1];
  yaxis = createErrorWarningYaxis(0, chartColor);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.name = "Warnings";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(errorValues, timeBased, true, false);
  chartColor = graphColors[2];
  if (paramData) {
    paramData.name = "Errors";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }
  container = document.getElementById("chartMiscDiv");
  if (miscChart) {
    miscChart.destroy();
    miscChart = null;
  }
  miscChart = new CanvasJS.Chart(container, chartJson);
  miscChart.render();
}

function createDashboardBpmCharts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Breaths per Minute";
  createChartsXaxis(chartJson);
  chartJson.height = 475;
  chartJson.backgroundColor = style.getPropertyValue('--rsp_lightblue');
  flagError = false;
  flagWarning = false;
  paramData = createCanvasChartData(sbpmValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[0];
  yaxis = createBpmYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "Spontaneous Breaths (bpm)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  paramData = createCanvasChartData(mbpmValues, timeBased, flagError, flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "Mandatory Breaths (bpm)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }
  container = document.getElementById("chartBpmDiv");
  if (bpmChart) {
    bpmChart.destroy();
    bpmChart = null;
  }
  bpmChart = new CanvasJS.Chart(container, chartJson);
  bpmChart.render();
}

function togglePause() {
  elm = document.getElementById("btnPause");
  if (updatePaused) {
    elm.textContent = "Pause Dashboard";
    updatePaused = false;
    
    if (currentView=="snapshots") updateSnapshot();
    if (currentView=="charts") createDashboardCharts();
    if (currentView=="stats") createDashboardStats();
  } else {
    elm.textContent = "Resume Dashboard";
    updatePaused = true;
    
    breathPausedAt = dashboardBreathNum;
    elm = document.getElementById("dashboardBreathNum");
    elm.innerHTML = "&nbsp&nbspDashboard Paused at&nbsp&nbsp Breath " + breathPausedAt;
  }
  updateDashboardAndRecordingStatus();
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('','_self').close();
}

function installFiO2Gauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 200 x 200 px in size.
  fiO2Gauge = pureknob.createKnob(150, 150);
  // Set properties.
  fiO2Gauge.setProperty('angleStart', -0.75 * Math.PI);
  fiO2Gauge.setProperty('angleEnd', 0.75 * Math.PI);
  fiO2Gauge.setProperty('colorFG', 'white');
  fiO2Gauge.setProperty('colorBG', style.getPropertyValue('--rsp_mediumblue'));
  fiO2Gauge.setProperty('trackWidth', 0.4);
  fiO2Gauge.setProperty('valMin', 21);
  fiO2Gauge.setProperty('valMax', 100);
  fiO2Gauge.setProperty('needle', true);
  fiO2Gauge.setProperty('readonly', true);
  fiO2Gauge.setProperty('textScale', 1);
  // Set initial value.
  fiO2Gauge.setValue();
  // Create element node.
  const node = fiO2Gauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('fiO2Div');
  elem.appendChild(node);
}

function installPurityGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 200 x 200 px in size.
  purityGauge = pureknob.createKnob(150, 150);
  // Set properties.
  purityGauge.setProperty('angleStart', -0.75 * Math.PI);
  purityGauge.setProperty('angleEnd', 0.75 * Math.PI);
  purityGauge.setProperty('colorFG', 'white');
  purityGauge.setProperty('colorBG', style.getPropertyValue('--rsp_mediumblue'));
  purityGauge.setProperty('trackWidth', 0.4);
  purityGauge.setProperty('valMin', 21);
  purityGauge.setProperty('valMax', 100);
  purityGauge.setProperty('needle', true);
  purityGauge.setProperty('readonly', true);
  purityGauge.setProperty('textScale', 1);
  // Set initial value.
  purityGauge.setValue();
  // Create element node.
  const node = purityGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('purityDiv');
  elem.appendChild(node);
}

function installPeakGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 175 x 175 px in size.
  peakGauge = pureknob.createKnob(175, 175);
  // Set properties.
  peakGauge.setProperty('angleStart', -0.75 * Math.PI);
  peakGauge.setProperty('angleEnd', 0.75 * Math.PI);
  peakGauge.setProperty('colorFG', 'white');
  peakGauge.setProperty('colorBG', style.getPropertyValue('--rsp_darkblue'));
  peakGauge.setProperty('trackWidth', 0.5);
  peakGauge.setProperty('valMin', 0);
  peakGauge.setProperty('valMax', 70);
  peakGauge.setProperty('needle', true);
  peakGauge.setProperty('readonly', true);
  peakGauge.setProperty('textScale', 1.75);
  // Set initial value.
  peakGauge.setValue();
  // Create element node.
  const node = peakGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PeakGauge');
  elem.appendChild(node);
}

function installPlatGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 175 x 175 px in size.
  platGauge = pureknob.createKnob(175, 175);
  // Set properties.
  platGauge.setProperty('angleStart', -0.75 * Math.PI);
  platGauge.setProperty('angleEnd', 0.75 * Math.PI);
  platGauge.setProperty('colorFG', 'white');
  platGauge.setProperty('colorBG', style.getPropertyValue('--rsp_darkblue'));
  platGauge.setProperty('trackWidth', 0.5);
  platGauge.setProperty('valMin', 0);
  platGauge.setProperty('valMax', 70);
  platGauge.setProperty('needle', true);
  platGauge.setProperty('readonly', true);
  platGauge.setProperty('textScale', 1.75);
  // Set initial value.
  platGauge.setValue();
  // Create element node.
  const node = platGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PlatGauge');
  elem.appendChild(node);
}

function installPeepGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 175 x 175 px in size.
  peepGauge = pureknob.createKnob(175, 175);
  // Set properties.
  peepGauge.setProperty('angleStart', -0.75 * Math.PI);
  peepGauge.setProperty('angleEnd', 0.75 * Math.PI);
  peepGauge.setProperty('colorFG', 'white');
  peepGauge.setProperty('colorBG', style.getPropertyValue('--rsp_darkblue'));
  peepGauge.setProperty('trackWidth', 0.5);
  peepGauge.setProperty('valMin', 0);
  peepGauge.setProperty('valMax', 70);
  peepGauge.setProperty('needle', true);
  peepGauge.setProperty('readonly', true);
  peepGauge.setProperty('textScale', 1.75);
  // Set initial value.
  peepGauge.setValue();
  // Create element node.
  const node = peepGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PeepGauge');
  elem.appendChild(node);
}

function installTempGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 150 x 150 px in size.
  tempGauge = pureknob.createKnob(150, 150);
  // Set properties.
  tempGauge.setProperty('angleStart', -0.75 * Math.PI);
  tempGauge.setProperty('angleEnd', 0.75 * Math.PI);
  tempGauge.setProperty('colorFG', style.getPropertyValue('--rsp_darkblue'));
  tempGauge.setProperty('colorBG', style.getPropertyValue('--rsp_blue'));
  tempGauge.setProperty('trackWidth', 0.5);
  tempGauge.setProperty('valMin', -20);
  tempGauge.setProperty('valMax', 70);
  tempGauge.setProperty('needle', true);
  tempGauge.setProperty('readonly', true);
  tempGauge.setProperty('textScale', 1.75);
  // Set initial value.
  tempGauge.setValue();
  // Create element node.
  const node = tempGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('TempGauge');
  elem.appendChild(node);
}

function PressuresClick() {
  if (document.getElementById("PressuresTick").checked) {
    document.getElementById("PressuresChartWrapper").style.display = "block";
  } else {
    document.getElementById("PressuresChartWrapper").style.display = "none";
  }
}

function VolumesClick() {
  if (document.getElementById("VolumesTick").checked) {
    document.getElementById("VolumesChartWrapper").style.display = "block";
  } else {
    document.getElementById("VolumesChartWrapper").style.display = "none";
  }
}

function BpmClick() {
  if (document.getElementById("BpmTick").checked) {
    document.getElementById("BpmChartWrapper").style.display = "block";
  } else {
    document.getElementById("BpmChartWrapper").style.display = "none";
  }
}

function FiO2Click() {
  if (document.getElementById("FiO2Tick").checked) {
    document.getElementById("FiO2ChartWrapper").style.display = "block";
  } else {
    document.getElementById("FiO2ChartWrapper").style.display = "none";
  }
}

function MiscClick() {
  if (document.getElementById("MiscTick").checked) {
    document.getElementById("MiscChartWrapper").style.display = "block";
  } else {
    document.getElementById("MiscChartWrapper").style.display = "none";
  }
}

function InitChartCheckBoxes() {
  document.getElementById("PressuresTick").checked = false;
  document.getElementById("VolumesTick").checked = false;
  document.getElementById("BpmTick").checked = false;
  document.getElementById("FiO2Tick").checked = false;
  document.getElementById("MiscTick").checked = false;
}

var finishedLoading = false;
window.onload = function() {
  initDbNames();
  InitRecorder();

  var heading = document.getElementById("SysUid");
  if (respimaticTag) {
    document.title = respimaticTag + " (" + datasource_name + ")"
    heading.innerHTML = respimaticUid + "<br>(" + respimaticTag + ")";
  } else {
    document.title = "NOT SPECIFIED"
    heading.innerHTML = "NOT SPECIFIED"
  }


  currentView = "snapshots";
  updatePaused = false;
  awaitingFirstDweet = true;
  dashboardBreathNum = 0;
  systemBreathNum = 0;
  updatedDweetContent = {"content":{}};

  simulatedTimeInMs = 0;
  lastDweetInMs = 0;
  wifiDropped = false;
  messagesBackground="MEDIUMBLUE";
  alertBackground = "GREEN";
  pendingBackground = "MEDIUMBLUE";
  pauseButtonBackground="MEDIUMBLUE";
  flowDivBackground="DARKBLUE";
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

  // now wait for dweets and act accordingly
  dweetQ = new Queue();
  waitForDweets();
  finishedLoading = true;
}

window.onbeforeunload = function(e) {
  if (db) db.close();
  var msg = 'Charts waveform history will be lost';
  if (dashboardBreathNum!=0) {
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
  } else if ((dweetQ.size()==0) &&
            ((simulatedTimeInMs-lastDweetInMs) >= MAX_DWEET_INTERVAL_IN_MS)) {
    displayWifiDropped();
  } else {
    displayNormalMessages();
  }
}

var periodicIntervalId = setTimeout(function mainLoop() {
//var periodicIntervalId = setInterval(function mainLoop() {
  simulatedTimeInMs += PERIODIC_INTERVAL_IN_MS;
  HandlePeriodicTasks();

  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (dweetQ && dweetQ.size()) {
    FetchAndExecuteFromQueue();
  }

  // nest so that the next one is scheduled only after current one finishes
  periodicIntervalId = setTimeout(mainLoop, PERIODIC_INTERVAL_IN_MS);

}, PERIODIC_INTERVAL_IN_MS);

function FetchAndExecuteFromQueue() {
  if (!finishedLoading) return false;
  if (dweetQ.size() == 0) return false;
  d = dweetQ.peek();
  dTimeInMs = d.DTIME;
  //console.log(d);
  //console.log("simulatedTimeInMs=" + simulatedTimeInMs);
  //console.log("Peeked dTimeInMs=" + dTimeInMs);
  if (simulatedTimeInMs >= dTimeInMs) {
    d = dweetQ.pop();
    //console.log("Popped dTimeInMs=" + dTimeInMs);
    
    if (typeof d.content["BNUM"] != "undefined") {
      dashboardBreathNum++;
      systemBreathNum = d.content["BNUM"];
    }

    var dCopy; // a copy of the dweet
    if (!recordingOff && !recordingPaused) dCopy = createNewInstance(d);
    processDashboardDweet(d);
    if (!recordingOff && !recordingPaused) processRecordDweet(dCopy);
    return true;
  } else {
    return false;
  }
}

alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

