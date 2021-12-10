// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function initCharts() {
  console.log("initCharts");
  elm = document.getElementById("chartContainerDiv");
  elm.innerHTML = "";
}
var analyzerChart = null;

function renderNewChart(chartJson) {
  container = document.getElementById("chartContainerDiv");
  if (analyzerChart) {
    analyzerChart.destroy();
    analyzerChart = null;
  }
  analyzerChart = new CanvasJS.Chart(container, chartJson);
  analyzerChart.render();
}

function createNewChart() {
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  initChartColor();
  var somethingToRender = false;
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
  elm = document.getElementById("fiO2Tick");
  fiO2Yes = elm.checked;
  elm = document.getElementById("o2PurityTick");
  o2PurityYes = elm.checked;
  elm = document.getElementById("o2FlowTick");
  o2FlowYes = elm.checked;
  elm = document.getElementById("timeTick");
  timeBased = elm.checked;
  nextYaxisNum = 0;
  pressureYaxisNum = -1;
  vtYaxisNum = -1;
  mvYaxisNum = -1;
  bpmYaxisNum = -1;
  errorWarningYaxisNum = -1;
  compYaxisNum = -1;
  tempYaxisNum = -1;
  percentYaxisNum = -1;
  o2FlowYaxisNum = -1;
  var chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = title;
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (peakYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(peakValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(platValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(mpeepValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(vtdelValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(mvdelValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(mbpmValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(sbpmValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(scompValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    somethingToRender
  }
  if (dcompYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(dcompValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(tempValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(warningValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
    paramData = createCanvasChartData(errorValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
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
  if (fiO2Yes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(fiO2Values, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
      paramData.name = "FiO2 (%)";
      paramData.color = getNextChartColor();
      if (percentYaxisNum == -1) {
        percentYaxisNum = nextYaxisNum++;
        yaxis = createPercentYaxis(percentYaxisNum, paramData.color);
        chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = percentYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot FiO2\nNo data points found!");
    }
  }
  if (o2PurityYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(o2PurityValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
      paramData.name = "O2 Purity (%)";
      paramData.color = getNextChartColor();
      if (percentYaxisNum == -1) {
        percentYaxisNum = nextYaxisNum++;
        yaxis = createPercentYaxis(percentYaxisNum, paramData.color);
        chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = percentYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot O2 Purity\nNo data points found!");
    }
  }
  if (o2FlowYes) {
    flagError = false;
    flagWarning = false;
    paramData = createCanvasChartData(o2FlowValues, timeBased, flagError, flagWarning);
    if (paramData) {
      somethingToRender = true;
      paramData.name = "O2 Flow Rate (litres/min)";
      paramData.color = getNextChartColor();
      if (o2FlowYaxisNum == -1) {
        o2FlowYaxisNum = nextYaxisNum++;
        yaxis = createO2FlowYaxis(o2FlowYaxisNum, paramData.color);
        chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = o2FlowYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot O2 Flow Rate\nNo data points found!");
    }
  }
  if (somethingToRender) {
    renderNewChart(chartJson);
  } else {
    alert("Please select Parameter(s) to Chart");
  }
}

function displayCharts() {
  console.log("displayCharts");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
}
