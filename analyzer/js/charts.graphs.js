// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const graphColors = [
  "Maroon",
  "Red",
  "Purple",
  "Blue",
  "Olive",
  "Green",
  "Fuchsia",
  "Aqua",
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
  height: 500,
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

function initCharts() {
  console.log("initCharts");

  elm = document.getElementById("chartContainerDiv");
  elm.innerHTML = "";
}

function createDatapoints(transitions) {
  var curValue = 0;
  var curIx = 0;

  if (transitions.length>1) {
    curValue = transitions[0].value;
    curIx = 1;
  }

  var datapoints = [];
  for (i=1; i<breathTimes.length; i++) {
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
  for (i=1; i<numPoints; i++) {
    if (timeBased) {
      ms = new Date(breathTimes[i]) - new Date(breathTimes[1]);
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
  container = document.getElementById("chartContainerDiv");

  chart = new CanvasJS.Chart(container, chartJson);
  chart.render();
}

function createPressureYaxis(num, color) {
  var yaxis = {
    title: "Pressure (cm H20)",
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
    title: "Tidal Volume (ml)",
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
    title: "Minute Volume (litres/min)",
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
    title: "Breaths per Min (bpm)",
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
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }

  var elm;
  elm = document.getElementById("chartTitle");
  title = elm.value;

  elm = document.getElementById("peakTick");
  peakYes = elm.checked;

  elm = document.getElementById("platTick");
  platYes = elm.checked;

  elm = document.getElementById("peepTick");
  peepYes = elm.checked;

  elm = document.getElementById("vtdelTick");
  vtdelYes = elm.checked;

  elm = document.getElementById("mvdelTick");
  mvdelYes = elm.checked;

  elm = document.getElementById("mbpmTick");
  mbpmYes = elm.checked;

  elm = document.getElementById("sbpmTick");
  sbpmYes = elm.checked;

  elm = document.getElementById("timeTick");
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
    paramData = createCanvasChartData(mpeepValues,timeBased);
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

function displayCharts() {
  console.log("displayCharts");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
}
