var datasource_name = "RESPIMATIC100";

document.title = respimaticUid + " (" + datasource_name + ")"

var normal_background;
var initial_background;
var standby_background;
var error_background;
var running_background;
var attention_background;
var current_background;
var background_before_error;
var gsw_elements = [];

var initial_state = false;
var standby_state = false;
var running_state = false;
var error_state = false;
var attention_state = false;

function set_current_background(color) {
  current_background = color;
  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }
  if (gsw_elements[0].style.backgroundColor == color) return;

  for (var i = 0; i < gsw_elements.length; i++) {
    gsw_elements[i].style.backgroundColor=color;
  }
}

function set_normal_background() {
  set_current_background(normal_background);
}

function set_initial_background() {
  set_current_background(initial_background);
}

function set_standby_background() {
  set_current_background(standby_background);
}

function set_running_background() {
  set_current_background(running_background);
}

function set_attention_background() {
  var color = current_background;

  if (current_background==attention_background) {
    if (initial_state) color = initial_background;
    else if (standby_state) color = standby_background;
    else if (running_state) color = running_background;
    else if (error_state) color = error_background;
  } else {
    color = attention_background;
  }

  set_current_background(color);
}

function set_error_background() {
  var color = current_background;

  if (current_background==error_background) {
    color = background_before_error;
  } else {
    color = error_background;
  }

  set_current_background(color);
}

function enter_initial_state() {
  initial_state = true;
  standby_state = false;
  running_state = false;
  error_state = false;
  attention_state = false;
  background_before_error = initial_background;

  set_initial_background();
}

function enter_standby_state() {
  initial_state = false;
  standby_state = true;
  running_state = false;
  error_state = false;
  background_before_error = standby_background;

  if (attention_state) set_current_background(attention_background);
  else set_standby_background();
}

function enter_running_state() {
  initial_state = false;
  standby_state = false;
  running_state = true;
  error_state = false;
  background_before_error = running_background;

  if (attention_state) set_attention_background();
  else set_running_background();
}

function enter_error_state() {
  attention_state = false;

  initial_state = false;
  standby_state = false;
  running_state = false;
  error_state = true;

  set_error_background();
}

function exit_error_state() {
}

function enter_attention_state() {
  if (error_state) {
    attention_state = false;
    set_error_background();
  } else {
    attention_state = true;
    set_attention_background();
  }
}

function exit_attention_state() {
  attention_state = false;
  var color = normal_background;

  if (initial_state) color = initial_background;
  else if (standby_state) color = standby_background;
  else if (running_state) color = running_background;
  else if (error_state) color = error_background;

  set_current_background(color);
}

var currentViewIsSnapshot = true;
var firstDweet = true;
var numBreaths = 0;
var chartsPaused = false;
var desiredFiO2 = 21;
var o2Purity = 21;
var reqO2Flow = 0;

var fiO2Gauge = null;
var purityGauge = null;
var peakGauge = null;
var platGauge = null;
var peepGauge = null;
var tempGauge = null;

function updateFiO2Display(fiO2, o2Purity, o2Flow) {
  fiO2Gauge.setValue(fiO2);
  purityGauge.setValue(o2Purity);

  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = parseFloat(o2Flow/10).toFixed(1) + " (litres/min)" ;
}

function checkFiO2Calculation(d) {
  var newFiO2 = desiredFiO2;
  var newPurity = o2Purity;
  var newO2Flow = reqO2Flow;
  var change = false;

  value = d.content["FIO2"];
  if (typeof value != "undefined") {
    if (validDecimalInteger(value) && (value<=100)) {
      newFiO2 = value;
      change = true;
    }
  }
  value = d.content["O2PURITY"];
  if (typeof value != "undefined") {
    if (validDecimalInteger(value) && (value<=100)) {
      newPurity = value;
      //console.log("Purity=" + newPurity);
      change = true;
    }
  }

  value = d.content["O2FLOWX10"];
  if (typeof value != "undefined") {
    if (validDecimalInteger(value)) {
      newO2Flow = value;
      //console.log("Flow=" + newO2Flow);
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

function process_dweet_content(d) {
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

  chartProcessJsonRecord(d);
  if (typeof d.content["BTOG"] == "undefined") return d;

  numBreaths++;
  elm = document.getElementById("numBreaths");
  elm.innerHTML = "&nbsp&nbspNumber of Breaths&nbsp&nbsp " + numBreaths ;

  if (!currentViewIsSnapshot && !chartsPaused) createDashboardCharts();
  return d;
}

window.onload = function () {
  firstDweet = true;
  numBreaths = 0;

  var style = getComputedStyle(document.body)

  normal_background = style.getPropertyValue('--rsp_darkblue');
  initial_background = normal_background;
  standby_background = normal_background;
  error_background = style.getPropertyValue('--rsp_darkred');
  running_background = style.getPropertyValue('--rsp_green');
  attention_background = style.getPropertyValue('--rsp_orange');
  current_background = normal_background;
  background_before_error = initial_background;

  /*
  currentViewIsSnapshot = true;
  snapshot = document.getElementById("board-content");
  snapshot.style.display = "block";

  charts = document.getElementById("chart-content");
  charts.style.display = "none";

  btn = document.getElementById("btnViewChange");
  btn.textContent = "Charts View" ;
  */

  installPurityGauge();
  installFiO2Gauge();

  installPeakGauge();
  installPlatGauge();
  installPeepGauge();

  installTempGauge();
}

function toggleDashboardView() {
  /*
  btn = document.getElementById("btnViewChange");
  snapshot = document.getElementById("board-content");
  charts = document.getElementById("chart-content");
  if (currentViewIsSnapshot) {
    currentViewIsSnapshot = false;
    snapshot.style.display = "none";
    charts.style.display = "block";
    btn.textContent = "Snapshots View" ;
    if (chartsPaused) selectTogglePause();
  } else {
    snapshot.style.display = "block";
    charts.style.display = "none";
    currentViewIsSnapshot = true;
    btn.textContent = "Charts View" ;
    if (!chartsPaused) selectTogglePause();
  }
  */
}

var pressureChart = null;
var volumeChart = null;
var bpmChart = null;
var fiO2Chart = null;
var miscChart = null;

var timeBased = false;
function createDashboardCharts() {
  createDashboardPressureCharts();
  createDashboardVolumeCharts();
  createDashboardBpmCharts();
  createDashboardFiO2Charts();
  createDashboardMiscCharts();
}

function createDashboardPressureCharts() {
  var chartJson ;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Pressures";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;
  chartJson.height = 300;
  flagError = false;
  flagWarning = false;

  paramData = createCanvasChartData(peakValues,timeBased,flagError,flagWarning);
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

  paramData = createCanvasChartData(platValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "Plateau Pressure (cm H20)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(mpeepValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[2];
  if (paramData) {
    paramData.name = "PEEP Pressure (cm H20)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  container = document.getElementById("chartPressureDiv");
  chartJson.backgroundColor = "lightgrey" ;
  if (pressureChart) {
    pressureChart.destroy();
    pressureChart = null;
  }
  pressureChart = new CanvasJS.Chart(container, chartJson);
  pressureChart.render();
}

function createDashboardVolumeCharts() {
  var chartJson ;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Volumes";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;
  chartJson.height = 300;
  flagError = false;
  flagWarning = false;

  paramData = createCanvasChartData(vtdelValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[0];
  yaxis = createVtYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "Delivered Tidal Volume (ml)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(mvdelValues,timeBased,flagError,flagWarning);
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
  chartJson.backgroundColor = "lightgrey" ;
  if (volumeChart) {
    volumeChart.destroy();
    volumeChart = null;
  }
  volumeChart = new CanvasJS.Chart(container, chartJson);
  volumeChart.render();
}

function createDashboardFiO2Charts() {
  var chartJson ;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "FiO2";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;
  chartJson.height = 300;
  flagError = false;
  flagWarning = false;

  paramData = createCanvasChartData(fiO2Values,timeBased,flagError,flagWarning);
  chartColor = graphColors[0];
  yaxis = createPercentYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "FiO2 (%)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(o2PurityValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "O2 Purity (%)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(o2FlowValues,timeBased,flagError,flagWarning);
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
  chartJson.backgroundColor = "lightgrey" ;
  if (fiO2Chart) {
    fiO2Chart.destroy();
    fiO2Chart = null;
  }
  fiO2Chart = new CanvasJS.Chart(container, chartJson);
  fiO2Chart.render();
}

function createDashboardMiscCharts() {
  var chartJson ;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Miscellaneous";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;
  chartJson.height = 300;
  flagError = false;
  flagWarning = false;

  paramData = createCanvasChartData(tempValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[0];
  yaxis = createTempYaxis(0, chartColor);
  chartJson.axisY.push(yaxis);
  if (paramData) {
    paramData.color = chartColor;
    paramData.name = "System Temperature (deg C)";
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(warningValues,timeBased,false,true);
  chartColor = graphColors[1];
  yaxis = createErrorWarningYaxis(0, chartColor);
  chartJson.axisY2 = createNewInstance(yaxis);
  if (paramData) {
    paramData.name = "Warnings";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }

  paramData = createCanvasChartData(errorValues,timeBased,true,false);
  chartColor = graphColors[2];
  if (paramData) {
    paramData.name = "Errors";
    paramData.color = chartColor;
    paramData.axisYType = "secondary";
    chartJson.data.push(paramData);
  }

  container = document.getElementById("chartMiscDiv");
  chartJson.backgroundColor = "lightgrey" ;
  if (miscChart) {
    miscChart.destroy();
    miscChart = null;
  }
  miscChart = new CanvasJS.Chart(container, chartJson);
  miscChart.render();
}

function createDashboardBpmCharts() {
  var chartJson ;
  chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = "Breaths per Minute";
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;
  chartJson.height = 300;
  flagError = false;
  flagWarning = false;

  paramData = createCanvasChartData(sbpmValues,timeBased,flagError,flagWarning);
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

  paramData = createCanvasChartData(mbpmValues,timeBased,flagError,flagWarning);
  chartColor = graphColors[1];
  if (paramData) {
    paramData.name = "Mandatory Breaths (bpm)";
    paramData.color = chartColor;
    paramData.axisYIndex = 0;
    chartJson.data.push(paramData);
  }

  container = document.getElementById("chartBpmDiv");
  chartJson.backgroundColor = "lightgrey" ;
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
  window.location.assign("../index.html");
}

function installFiO2Gauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 260 x 260 px in size.
  fiO2Gauge = pureknob.createKnob(260, 260);
  // Set properties.
  fiO2Gauge.setProperty('angleStart', -0.75 * Math.PI);
  fiO2Gauge.setProperty('angleEnd', 0.75 * Math.PI);
  fiO2Gauge.setProperty('colorFG', 'white');
  fiO2Gauge.setProperty('colorBG', style.getPropertyValue('--rsp_blue'));
  fiO2Gauge.setProperty('trackWidth', 0.4);
  fiO2Gauge.setProperty('valMin', 21);
  fiO2Gauge.setProperty('valMax', 100);
  fiO2Gauge.setProperty('needle', true);
  fiO2Gauge.setProperty('readonly', true);
  fiO2Gauge.setProperty('textScale', 1);
  // Set initial value.
  fiO2Gauge.setValue(desiredFiO2);
  // Create element node.
  const node = fiO2Gauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('fiO2Div');
  elem.appendChild(node);
}

function installPurityGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 250 x 250 px in size.
  purityGauge = pureknob.createKnob(260, 260);
  // Set properties.
  purityGauge.setProperty('angleStart', -0.75 * Math.PI);
  purityGauge.setProperty('angleEnd', 0.75 * Math.PI);
  purityGauge.setProperty('colorFG', 'white');
  purityGauge.setProperty('colorBG', style.getPropertyValue('--rsp_blue'));
  purityGauge.setProperty('trackWidth', 0.4);
  purityGauge.setProperty('valMin', 21);
  purityGauge.setProperty('valMax', 100);
  purityGauge.setProperty('needle', true);
  purityGauge.setProperty('readonly', true);
  purityGauge.setProperty('textScale', 1);
  // Set initial value.
  purityGauge.setValue(o2Purity);
  // Create element node.
  const node = purityGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('purityDiv');
  elem.appendChild(node);
}


function installPeakGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 250 x 250 px in size.
  peakGauge = pureknob.createKnob(260, 260);
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
  peakGauge.setValue(0);
  // Create element node.
  const node = peakGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PeakGauge');
  elem.appendChild(node);
}

function installPlatGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 250 x 250 px in size.
  platGauge = pureknob.createKnob(260, 260);
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
  platGauge.setValue(0);
  // Create element node.
  const node = platGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PlatGauge');
  elem.appendChild(node);
}

function installPeepGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 250 x 250 px in size.
  peepGauge = pureknob.createKnob(260, 260);
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
  peepGauge.setValue(0);
  // Create element node.
  const node = peepGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('PeepGauge');
  elem.appendChild(node);
}

function installTempGauge() {
  var style = getComputedStyle(document.body)
  // Create knob element, 250 x 250 px in size.
  tempGauge = pureknob.createKnob(260, 260);
  // Set properties.
  tempGauge.setProperty('angleStart', -0.75 * Math.PI);
  tempGauge.setProperty('angleEnd', 0.75 * Math.PI);
  tempGauge.setProperty('colorFG', 'white');
  tempGauge.setProperty('colorBG', style.getPropertyValue('--rsp_darkblue'));
  tempGauge.setProperty('trackWidth', 0.5);
  tempGauge.setProperty('valMin', 0);
  tempGauge.setProperty('valMax', 70);
  tempGauge.setProperty('needle', true);
  tempGauge.setProperty('readonly', true);
  tempGauge.setProperty('textScale', 1.75);
  // Set initial value.
  tempGauge.setValue(0);
  // Create element node.
  const node = tempGauge.node();
  // Add it to the DOM.
  const elem = document.getElementById('TempGauge');
  elem.appendChild(node);
}

