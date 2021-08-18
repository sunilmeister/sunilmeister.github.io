// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initCharts() {
  console.log("initCharts");

  elm = document.getElementById("chartContainerDiv");
  elm.innerHTML = "";
}

function createDatapoints(transitions) {
  var curValue = 0;
  var curIx = 0;
  var curValue = transitions[0].value; // guaranteed to have at least one entry

  var datapoints = [];
  //console.log("trans=" + transitions.length);
  for (i=0; i<breathTimes.length; i++) {
    if (curIx==transitions.length-1) {
      curValue = transitions[curIx].value;
    } else {
      if (breathTimes[i] >= transitions[curIx+1].time ) {
	curValue = transitions[++curIx].value;
        datapoints.push(curValue);
      }
    }
    datapoints.push(curValue);
  }

  return datapoints;
}

function createCanvasChartData(valueArray, timeBased, flagError, flagWarning) {
  if (valueArray.length == 0) return null;

  var yDatapoints = [];
  var xyPoints = [];

  numPoints = breathTimes.length;

  xyPoints.length = 0;
  yDatapoints = createDatapoints(valueArray);
  var xval;
  for (i=1; i<numPoints; i++) {
    if (timeBased) {
      ms = new Date(breathTimes[i]) - new Date(breathTimes[1]);
      sec = Math.round(ms/1000);
      xval = sec;
    } else {
      xval = i;
    }

    if (!flagError && !flagWarning) {
      xyPoints.push({"x":xval, "y":yDatapoints[i]});
    } else {
      if (yDatapoints[i] != yDatapoints[i-1]) {
        if (flagError) {
	  label = "E";
	  marker = "cross" ;
	  color = "red";
        } else {
	  label = "W";
	  marker = "triangle" ;
	  color = "orange";
	}
        xyPoints.push({"x":xval, "y":yDatapoints[i], 
	  indexLabel: label, markerType: marker, markerColor: color, markerSize: 16});
      } else {
        xyPoints.push({"x":xval, "y":null});
      }
    }
  }

  if (flagError || flagWarning) noLegend = true;
  else noLegend = false;

  var chartData = {
    "type": "line",
    "name": "",
    "color": "",
    "showInLegend": !noLegend,
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

function createErrorWarningYaxis(num, color) {
  var yaxis = {
    title: "Errors & Warnings",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
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

function createComplianceYaxis(num, color) {
  var yaxis = {
    title: "Compliance (ml / cm H20)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    minimum: 0,
    suffix: ""
  };
  return createNewInstance(yaxis);
}

function createTempYaxis(num, color) {
  var yaxis = {
    title: "System Temperature (deg C)",
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

  elm = document.getElementById("errorTick");
  errorYes = elm.checked;

  elm = document.getElementById("warningTick");
  warningYes = elm.checked;

  elm = document.getElementById("scompTick");
  scompYes = elm.checked;

  elm = document.getElementById("dcompTick");
  dcompYes = elm.checked;

  elm = document.getElementById("tempTick");
  tempYes = elm.checked;

  elm = document.getElementById("timeTick");
  timeBased = elm.checked;

  if (!(peakYes || platYes || peepYes || vtdelYes || mvdelYes || mbpmYes || sbpmYes || errorTick || warningTick)) {
    alert("Please select Parameter(s) to Chart");
    return;
  }

  nextYaxisNum = 0;
  pressureYaxisNum = -1;
  vtYaxisNum = -1;
  mvYaxisNum = -1;
  bpmYaxisNum = -1;
  errorWarningYaxisNum = -1;
  compYaxisNum = -1;
  tempYaxisNum = -1;

  var chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = title;
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number" ;

  if (peakYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(peakValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Peak Pressure (cm H20)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(platValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Plateau Pressure (cm H20)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(mpeepValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Peep Pressure (cm H20)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(vtdelValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Tidal Volume (ml)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(mvdelValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Minute Volume (litres/min)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(mbpmValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Mandatory BPM (bpm)";
      paramData.color = getNextChartColor();
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
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(sbpmValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Spontaneous BPM (bpm)";
      paramData.color = getNextChartColor();
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

  if (scompYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(scompValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Instantaneous Static Compliance (ml / cm H20)";
      paramData.color = getNextChartColor();
      if (compYaxisNum == -1) {
	compYaxisNum = nextYaxisNum++;
	yaxis = createComplianceYaxis(compYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = compYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Spontaneous BPM\nNo data points found!");
    }
  }

  if (dcompYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(dcompValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Instantaneous Dynamic Compliance (ml / cm H20)";
      paramData.color = getNextChartColor();
      if (compYaxisNum == -1) {
	compYaxisNum = nextYaxisNum++;
	yaxis = createComplianceYaxis(compYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = compYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Spontaneous BPM\nNo data points found!");
    }
  }

  if (tempYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(tempValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "System Temperature (deg C)";
      paramData.color = getNextChartColor();
      if (tempYaxisNum == -1) {
	tempYaxisNum = nextYaxisNum++;
	yaxis = createTempYaxis(tempYaxisNum, paramData.color);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = tempYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Spontaneous BPM\nNo data points found!");
    }
  }

  if (warningYes) {
    flagError = false;
    flagWarning = true;
    paramData = createCanvasChartData(warningValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Warnings";
      if (errorWarningYaxisNum == -1) {
	errorWarningYaxisNum = nextYaxisNum++;
	yaxis = createErrorWarningYaxis(errorWarningYaxisNum, getNextChartColor());
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = errorWarningYaxisNum;
      chartJson.data.push(paramData);
    }
  }

  if (errorYes) {
    flagError = true;
    flagWarning = false;
    paramData = createCanvasChartData(errorValues,timeBased,flagError,flagWarning);
    if (paramData) {
      paramData.name = "Errors";
      if (errorWarningYaxisNum == -1) {
	errorWarningYaxisNum = nextYaxisNum++;
	yaxis = createErrorWarningYaxis(errorWarningYaxisNum, getNextChartColor());
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = errorWarningYaxisNum;
      chartJson.data.push(paramData);
    }
  }

  if ((pressureYaxisNum != -1) || (vtYaxisNum != -1) || (mvYaxisNum != -1) || (bpmYaxisNum != -1) || (errorWarningYaxisNum != -1)) {
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
