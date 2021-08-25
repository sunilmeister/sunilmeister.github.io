var datasource_name = "RESPIMATIC100";

uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimaticUid;
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
function process_dweet_content(d) {
  chartProcessJsonRecord(d);
  if (typeof d.content["BTOG"] == "undefined") return d;

  if (!currentViewIsSnapshot) createDashboardCharts();
  return d;
}

window.onload = function () {
  var style = getComputedStyle(document.body)

  normal_background = style.getPropertyValue('--rsp_darkblue');
  initial_background = normal_background;
  standby_background = normal_background;
  error_background = style.getPropertyValue('--rsp_darkred');
  running_background = style.getPropertyValue('--rsp_green');
  attention_background = style.getPropertyValue('--rsp_orange');
  current_background = normal_background;
  background_before_error = initial_background;

  currentViewIsSnapshot = true;
  btn = document.getElementById("btnViewChange");
  snapshot = document.getElementById("board-content");
  charts = document.getElementById("chart-content");
  btn.textContent = "Switch to Charts View" ;
  snapshot.style.display = "block";
  charts.style.display = "none";
}

function toggleDashboardView() {
  btn = document.getElementById("btnViewChange");
  snapshot = document.getElementById("board-content");
  charts = document.getElementById("chart-content");
  if (currentViewIsSnapshot) {
    currentViewIsSnapshot = false;
    snapshot.style.display = "none";
    charts.style.display = "block";
    btn.textContent = "Switch to Snapshot View" ;
  } else {
    snapshot.style.display = "block";
    charts.style.display = "none";
    currentViewIsSnapshot = true;
    btn.textContent = "Switch to Charts View" ;
  }
}

var pressureChart = null;
var volumeChart = null;
var bpmChart = null;
var miscChart = null;

var timeBased = false;
function createDashboardCharts() {
  createDashboardPressureCharts();
  createDashboardVolumeCharts();
  createDashboardBpmCharts();
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
