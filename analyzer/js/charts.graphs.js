const graphColors = [
  "Maroon",
  "Purple",
  "Red",
  "Blue",
  "Olive",
  "Aqua",
  "Green",
  "Fuchsia",
  "Navy",
  "Silver",
  "Gray",
];
var nextColor = 0;

function getNextColor() {
  color = graphColors[nextColor++];
  if (nextColor==graphColors.length) nextColor = 0;
  return color;
}

var chartTemplate = {
  title:{ text: "" },
  axisX:{ title: "", },
  axisY:[],
  toolTip: { shared: true },
  legend: { 
    cursor: "pointer", 
    itemclick: toggleDataSeries
  },
  data: []
};

function toggleDataSeries(e) {
  if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

var allCharts = [];
var chartNum = 1;

var breathTimes = [];
var vtdelValues = [];
var mvdelValues = [];
var sbpmValues = [];
var mbpmValues = [];
var scompValues = [];
var dcompValues = [];

var peakValues = [];
var platValues = [];
var peepValues = [];

var tempValues = [];

var chartsDataGathered = false;

function initCharts() {
  chartsDataGathered = false;
  allCharts = [];
  chartNum = 1;

  breathTimes = [];
  vtdelValues = [];
  mvdelValues = [];
  sbpmValues = [];
  mbpmValues = [];
  scompValues = [];
  dcompValues = [];
  peakValues = [];
  platValues = [];
  peepValues = [];
  tempValues = [];

  elm = document.getElementById("chartContainer");
  elm.innerHTML = "";
}

function createDatapoints(transitions) {
  var curValue = 0;
  var curIx = -1;

  if (transitions.length>0) {
    curValue = transitions[0].value;
    curIx = 0;
  }

  var datapoints = [];
  for (i=0; i<breathTimes.length; i++) {
    if (curIx==transitions.length-1) {
      datapoints.push(curValue);
    } else {
      if (breathTimes[i] >= transitions[curIx+1].time ) {
	curValue = transitions[curIx++].value;
        datapoints.push(curValue);
      } else {
	datapoints.push(curValue);
      }
    }
  }

  return datapoints;
}

function createCanvasChartData(valueArray, timeBased) {
  if (valueArray.length == 0) return null;

  var yDatapoints = [];
  var xyPoints = [];

  numPoints = breathTimes.length;

  xyPoints.length = 0;
  yDatapoints = createDatapoints(valueArray);
  for (i=0; i<numPoints; i++) {
    if (timeBased) {
      ms = breathTimes[i] - breathTimes[0];
      sec = Math.round(ms/1000);
      xyPoints.push({"x":sec, "y":yDatapoints[i]});
    } else {
      xyPoints.push({"x":i, "y":yDatapoints[i]});
    }
  }

  var chartData = {
    "type": "line",
    "name": "",
    "color": "",
    "showInLegend": true,
    "axisYIndex": 0,
    "dataPoints" : xyPoints
  };

  return createNewInstance(chartData);
}

function renderNewChart(chartJson) {
  chartDivId = "chart" + chartNum++;
  chartDiv = document.createElement("div");
  chartDiv.id = chartDivId;
  chartDiv.height = "400px" ;

  container = document.getElementById("chartContainer");
  container.appendChild(chartDiv);

  var chart = new CanvasJS.Chart(chartDiv, chartJson);
  allCharts.push(chart);
  chart.render();
}

function chartProcessData(jsonData) {
  curTime = jsonData.created;
  for (var key in jsonData) {
    if (key=='content') {
      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (ckey=="L1") {
        } else if (ckey=="L2") {
        } else if (ckey=="L3") {
        } else if (ckey=="L4") {
        } else if (ckey=="INITIAL") {
        } else if (ckey=="STANDBY") {
        } else if (ckey=="RUNNING") {
        } else if (ckey=="ERROR") {
        } else if (ckey=="MANDATORY") {
        } else if (ckey=="SPONTANEOUS") {
        } else if (ckey=="BTOG") {
	  breathTimes.push(curTime);
        } else if (ckey=="ATTENTION") {
        } else if (ckey=="MODE") {
	  if (modeValid(value)) {
	  }
        } else if (ckey=="VT") {
	  if (vtValid(value)) {
	  }
        } else if (ckey=="RR") {
	  if (rrValid(value)) {
	  }
        } else if (ckey=="EI") {
	  if (ieValid(value)) {
	  }
        } else if (ckey=="IPEEP") {
	  if (peepValid(value)) {
	  }
        } else if (ckey=="PMAX") {
	  if (pmaxValid(value)) {
	  }
        } else if (ckey=="PS") {
	  if (psValid(value)) {
	  }
        } else if (ckey=="TPS") {
	  if (tpsValid(value)) {
	  }
        } else if (ckey=="MBPM") {
	  if (validDecimalInteger(value)) {
	    mbpmValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="SBPM") {
	  if (validDecimalInteger(value)) {
	    sbpmValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="STATIC") {
	  if (validDecimalInteger(value)) {
	    scompValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="DYNAMIC") {
	  if (validDecimalInteger(value)) {
	    dcompValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="VTDEL") {
	  if (validDecimalInteger(value)) {
	    vtdelValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="MVDEL") {
	  if (validFloatNumber(value)) {
	    mvdelValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="PIP") {
	  if (validDecimalInteger(value)) {
	    peakValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="PLAT") {
	  if (validDecimalInteger(value)) {
	    platValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="MPEEP") {
	  if (validDecimalInteger(value)) {
	    peepValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="TEMP") {
	  if (validDecimalInteger(value)) {
	    tempValues.push({"time":curTime,"value":value});
	  }
        } else if (ckey=="ALT") {
        } else if (ckey=="PNAME") {
        } else if (ckey=="PMISC") {
        }
      }
    }
  }
}

function chartProcessJsonRecord(key, lastRecord) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    dbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function(event) {
      var jsonData = keyReq.result;
      chartProcessData(jsonData);
      chartsDataGathered = lastRecord;
    }
  }
}

function gatherChartData() {
    if (allDbKeys.length==0) {
    alert("Selected Session has no data");
    return;
  }

  for (i=0; i<allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (!keyWithinAnalysisRange(key)) continue;
    lastRecord = (i==(allDbKeys.length-1));
    chartProcessJsonRecord(key, lastRecord);
  }
}

function createPressureYaxis(num, color) {
  var yaxis = {
    title: "Pressure",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
}

function createVtYaxis(num, color) {
  var yaxis = {
    title: "Tidal Volume",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
}

function createMvYaxis(num, color) {
  var yaxis = {
    title: "Minute Volume",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
}

function createBpmYaxis(num, color) {
  var yaxis = {
    title: "Breaths per Min",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
}

function createNewChart() {
  if (!chartsDataGathered) {
    alert("Data Gathering in progressing\nPlease try again in a short while");
    return;
  }

  var elm;
  elm = document.getElementById("chartTitle");
  title = elm.value;

  elm = document.getElementById("peak");
  peakYes = elm.checked;

  elm = document.getElementById("plat");
  platYes = elm.checked;

  elm = document.getElementById("peepP");
  peepYes = elm.checked;

  elm = document.getElementById("vtdel");
  vtdelYes = elm.checked;

  elm = document.getElementById("mvdel");
  mvdelYes = elm.checked;

  elm = document.getElementById("mbpm");
  mbpmYes = elm.checked;

  elm = document.getElementById("sbpm");
  sbpmYes = elm.checked;

  elm = document.getElementById("timeBased");
  timeBased = elm.checked;

  if (!(peakYes || platYes || peepYes || vtdelYes || mvdelYes || mbpmYes || sbpmYes)) {
    alert("Please select Parameter(s) to Chart");
    return;
  }

  nextYaxisNum = 0;
  pressureYaxisNum = -1;
  vtYaxisNum = -1;
  mvYaxisNum = -1;
  bpmYaxisNum = -1;

  var chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = title;
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;

  if (peakYes) {
    paramData = createCanvasChartData(peakValues,timeBased);
    if (paramData) {
      paramData.name = "Peak Pressure (cm H20)";
      paramData.color = getNextColor();
      if (pressureYaxisNum == -1) {
	pressureYaxisNum = nextYaxisNum++;
	yaxis = createPressureYaxis(pressureYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = pressureYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Peak pressures\nNo data points found!");
    }
  }

  if (platYes) {
    paramData = createCanvasChartData(platValues,timeBased);
    if (paramData) {
      paramData.name = "Plateau Pressure (cm H20)";
      paramData.color = getNextColor();
      if (pressureYaxisNum == -1) {
	pressureYaxisNum = nextYaxisNum++;
	yaxis = createPressureYaxis(pressureYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = pressureYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Plateau pressures\nNo data points found!");
    }
  }

  if (peepYes) {
    paramData = createCanvasChartData(peepValues,timeBased);
    if (paramData) {
      paramData.name = "Peep Pressure (cm H20)";
      paramData.color = getNextColor();
      if (pressureYaxisNum == -1) {
	pressureYaxisNum = nextYaxisNum++;
	yaxis = createPressureYaxis(pressureYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = pressureYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Peep pressures\nNo data points found!");
    }
  }

  if (vtdelYes) {
    paramData = createCanvasChartData(vtdelValues,timeBased);
    if (paramData) {
      paramData.name = "Tidal Volume (ml)";
      paramData.color = getNextColor();
      if (vtYaxisNum == -1) {
	vtYaxisNum = nextYaxisNum++;
	yaxis = createVtYaxis(vtYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = vtYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Tidal Volume\nNo data points found!");
    }
  }

  if (mvdelYes) {
    paramData = createCanvasChartData(mvdelValues,timeBased);
    if (paramData) {
      paramData.name = "Minute Volume (litres/min)";
      paramData.color = getNextColor();
      if (mvYaxisNum == -1) {
	mvYaxisNum = nextYaxisNum++;
	yaxis = createMvYaxis(mvYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = mvYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Minute Volume\nNo data points found!");
    }
  }

  if (mbpmYes) {
    paramData = createCanvasChartData(mbpmValues,timeBased);
    if (paramData) {
      paramData.name = "Mandatory BPM (bpm)";
      paramData.color = getNextColor();
      if (bpmYaxisNum == -1) {
	bpmYaxisNum = nextYaxisNum++;
	yaxis = createBpmYaxis(bpmYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = bpmYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Mandatory BPM\nNo data points found!");
    }
  }

  if (sbpmYes) {
    paramData = createCanvasChartData(sbpmValues,timeBased);
    if (paramData) {
      paramData.name = "Spontaneous BPM (bpm)";
      paramData.color = getNextColor();
      if (bpmYaxisNum == -1) {
	bpmYaxisNum = nextYaxisNum++;
	yaxis = createBpmYaxis(bpmYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = bpmYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Spontaneous BPM\nNo data points found!");
    }
  }

  if ((pressureYaxisNum != -1) || (vtYaxisNum != -1) || (mvYaxisNum != -1) || (bpmYaxisNum != -1)) {
    renderNewChart(chartJson);
  }
}

function createCharts() {
  if (chartsDataGathered) return;
  gatherChartData();
}
