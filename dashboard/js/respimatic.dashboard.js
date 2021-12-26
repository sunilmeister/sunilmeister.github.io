document.title = respimaticUid + " (" + datasource_name + ")"

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

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    processDweet(d);
  });
}

function processDweet(d) {
  if (firstDweet) {
    firstDweet = false;
    startDate = d.created;
    elm = document.getElementById("startTime");
    elm.innerHTML = "Starting Time " + dateToTimeStr(d.created);
  } else {
    curDate = d.created;
    var diff = curDate - startDate;
    elm = document.getElementById("logTimeDuration");
    elm.innerHTML = "Session Duration " + msToTimeStr(diff);
  }
  checkFiO2Calculation(d);
  updateSnapshot(d);
  chartProcessJsonRecord(d);
  if (typeof d.content["BTOG"] == "undefined") return d;
  numBreaths++;
  elm = document.getElementById("numBreaths");
  elm.innerHTML = "&nbsp&nbspNumber of Breaths&nbsp&nbsp " + numBreaths;
  if (!currentViewIsSnapshot && !chartsPaused) createDashboardCharts();
  return d;
}

function toggleDashboardView() {
  btn = document.getElementById("btnViewChange");
  snapshot = document.getElementById("snapshot-pane");
  charts = document.getElementById("chart-pane");
  if (currentViewIsSnapshot) {
    currentViewIsSnapshot = false;
    snapshot.style.display = "none";
    charts.style.display = "block";
    btn.textContent = "Snapshots View";
    if (chartsPaused) selectTogglePause();
    createDashboardCharts();
  } else {
    snapshot.style.display = "inline-grid";
    charts.style.display = "none";
    currentViewIsSnapshot = true;
    btn.textContent = "Charts View";
    if (!chartsPaused) selectTogglePause();
  }
}
var pressureChart = null;
var volumeChart = null;
var bpmChart = null;
var fiO2Chart = null;
var miscChart = null;
var timeBased = false;

var updatingCharts = false;

function createDashboardCharts() {
  if (updatingCharts) return;
  updatingCharts = true;
  createDashboardPressureCharts();
  createDashboardVolumeCharts();
  createDashboardBpmCharts();
  createDashboardFiO2Charts();
  createDashboardMiscCharts();
  updatingCharts = false;
}

function createDashboardPressureCharts() {
  var style = getComputedStyle(document.body)
  var chartJson;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Pressures";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
  }
  chartJson.height = 700;
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
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
  }
  chartJson.height = 700;
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
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
  }
  chartJson.height = 700;
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
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
  }
  chartJson.height = 700;
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
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
  }
  chartJson.height = 700;
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

function selectTogglePause() {
  elm = document.getElementById("btnPauseCharts");
  if (chartsPaused) {
    elm.textContent = "Pause Charts";
    chartsPaused = false;
  } else {
    elm.textContent = "Resume Charts";
    chartsPaused = true;
  }
}

function selectExit() {
  //window.location.assign("../index.html");
  window.open('','_self').close();
}

function installFiO2Gauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 275 x 275 px in size.
  fiO2Gauge = pureknob.createKnob(275, 275);
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
  // Create knob element, 275 x 275 px in size.
  purityGauge = pureknob.createKnob(275, 275);
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
  // Create knob element, 275 x 275 px in size.
  peakGauge = pureknob.createKnob(275, 275);
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
  // Create knob element, 275 x 275 px in size.
  platGauge = pureknob.createKnob(275, 275);
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
  // Create knob element, 275 x 275 px in size.
  peepGauge = pureknob.createKnob(275, 275);
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
  // Create knob element, 225 x 225 px in size.
  tempGauge = pureknob.createKnob(225, 225);
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

window.onload = function() {
  initChartData();
  firstDweet = true;
  numBreaths = 0;
  var style = getComputedStyle(document.body)
  blueColor = style.getPropertyValue('--rsp_blue');
  mediumblueColor = style.getPropertyValue('--rsp_mediumblue');
  darkblueColor = style.getPropertyValue('--rsp_darkblue');
  darkredColor = style.getPropertyValue('--rsp_darkred');
  greenColor = style.getPropertyValue('--rsp_green');
  orangeColor = style.getPropertyValue('--rsp_orange');
  alertImage = "OK";
  alertBackground = "GREEN";
  pendingBackground = "MEDIUMBLUE";
  currentViewIsSnapshot = true;
  snapshot = document.getElementById("snapshot-pane");
  snapshot.style.display = "inline-grid";
  charts = document.getElementById("chart-pane");
  charts.style.display = "none";
  btn = document.getElementById("btnViewChange");
  btn.textContent = "Charts View";

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
  waitForDweets();
  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );
}

window.onbeforeunload = function(e) {
  if (numBreaths!=0) {
    const msg = 'Charts waveform history will be lost';
    return msg;
  }
}
