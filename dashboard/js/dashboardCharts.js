// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var dashboardChart = null;
var prevMinBreathNum = 0;
var prevMaxBreathNum = 0;

function createPeakGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peak Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: peakValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createPlatGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Plateau Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: platValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createPeepGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peep Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: mpeepValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createVtdelGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:700, reuseAxisNum:reuseAxisNum,
               yName:"Volume (ml)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Tidal Volume (ml)" ,
    color: newGraphColor(),
    transitions: vtdelValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createMvdelGraph(chart, reuseAxisNum, rangeInfo) {
  yAxisInfo = {primary:false, reuse:false, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Minute Volume (litres/min)" ,
    color: newGraphColor(),
    transitions: mvdelValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createO2FlowGraph(chart, reuseAxisNum, rangeInfo) {
  yAxisInfo = {primary:false, reuse:false, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Flow Rate (litres/min)" ,
    color: newGraphColor(),
    transitions: o2FlowValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createSbpmGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: sbpmValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createMbpmGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: mbpmValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createScompGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: scompValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createDcompGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Dynamic Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: dcompValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createTempGraph(chart, reuseAxisNum, rangeInfo) {
  yAxisInfo = {primary:false, reuse:false, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"System Temp (deg C)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "System Temp (deg C)" ,
    color: newGraphColor(),
    transitions: tempValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createWarningGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:true, error:false}
  paramInfo = {
    name: "Warnings" ,
    color: newGraphColor(),
    transitions: warningValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createErrorGraph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:false, error:true}
  paramInfo = {
    name: "Errors" ,
    color: newGraphColor(),
    transitions: errorValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createFiO2Graph(chart, reuseAxisNum, rangeInfo) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "FiO2 (%)" ,
    color: newGraphColor(),
    transitions: fiO2Values
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

function createPurityGraph(chart, reuseAxisNum, rangeInfo) {
  yAxisInfo = {primary:false, reuse:false, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Purity (%)" ,
    color: newGraphColor(),
    transitions: o2PurityValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo);
}

var pressureChart = null;
function createPressureCharts(height, timeBased, initX, minX, maxX) {
  if (!document.getElementById("PressuresTick").checked) return;
  initGraphColor();
  if (pressureChart) {
    pressureChart.destroy();
    delete pressureChart;
    pressureChart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  pressureChart = new LineChart("Pressures (Peak, Plateau, Peep)", height, timeBased);

  if (timeBased) {
    pressureChart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    pressureChart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  pressureAxisNum = null;
  pressureAxisNum = createPeakGraph(pressureChart, pressureAxisNum, rangeInfo);
  pressureAxisNum = createPlatGraph(pressureChart, pressureAxisNum, rangeInfo);
  pressureAxisNum = createPeepGraph(pressureChart, pressureAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartPressureDiv");
  pressureChart.render(containerDiv);
}

var volumeChart = null;
function createVolumeCharts(height, timeBased, initX, minX, maxX, missing) {
  if (!document.getElementById("VolumesTick").checked) return;
  initGraphColor();
  if (volumeChart) {
    volumeChart.destroy();
    delete volumeChart;
    volumeChart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  volumeChart = new LineChart("Volumes (Tidal, Minute)", height, timeBased);

  if (timeBased) {
    volumeChart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    volumeChart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  volumeAxisNum = null;
  volumeAxisNum = createVtdelGraph(volumeChart, volumeAxisNum, rangeInfo);
  mvAxisNum = null;
  mvAxisNum = createMvdelGraph(volumeChart, mvAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartVolumeDiv");
  volumeChart.render(containerDiv);
}

var bpmChart = null;
function createBpmCharts(height, timeBased, initX, minX, maxX, missing) {
  if (!document.getElementById("BpmTick").checked) return;
  initGraphColor();
  if (bpmChart) {
    bpmChart.destroy();
    delete bpmChart;
    bpmChart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  bpmChart = new LineChart("BPM (Mandatory, Spontaneous)", height, timeBased);

  if (timeBased) {
    bpmChart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    bpmChart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  bpmAxisNum = null;
  bpmAxisNum = createSbpmGraph(bpmChart, bpmAxisNum, rangeInfo);
  bpmAxisNum = createMbpmGraph(bpmChart, bpmAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartBpmDiv");
  bpmChart.render(containerDiv);
}

var compChart = null;
function createCompCharts(height, timeBased, initX, minX, maxX, missing) {
  if (!document.getElementById("CompTick").checked) return;
  initGraphColor();
  if (compChart) {
    compChart.destroy();
    delete compChart;
    compChart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  compChart = new LineChart("Instant Lung Compliances (Static, Dynamic)", height, timeBased);

  if (timeBased) {
    compChart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    compChart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  compAxisNum = null;
  compAxisNum = createScompGraph(compChart, compAxisNum, rangeInfo);
  compAxisNum = createDcompGraph(compChart, compAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartCompDiv");
  compChart.render(containerDiv);
}

var miscChart = null;
function createMiscCharts(height, timeBased, initX, minX, maxX, missing) {
  if (!document.getElementById("MiscTick").checked) return;
  initGraphColor();
  if (miscChart) {
    miscChart.destroy();
    delete miscChart;
    miscChart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  miscChart = new LineChart("Miscellaneous (Errors, Warnings, Temperature)", height, timeBased);

  if (timeBased) {
    miscChart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    miscChart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  tempAxisNum = null;
  tempAxisNum = createTempGraph(miscChart, tempAxisNum, rangeInfo);

  flagAxisNum = null;
  flagAxisNum = createWarningGraph(miscChart, flagAxisNum, rangeInfo);
  flagAxisNum = createErrorGraph(miscChart, flagAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartMiscDiv");
  miscChart.render(containerDiv);
}

var fiO2Chart = null;
function createFiO2Charts(height, timeBased, initX, minX, maxX, missing) {
  if (!document.getElementById("FiO2Tick").checked) return;
  initGraphColor();
  if (fiO2Chart) {
    fiO2Chart.destroy();
    delete fiO2Chart;
    fiO2Chart = null;
  }
  rangeInfo = {minX:minX, maxX:maxX};
  fiO2Chart = new LineChart("Oxygen (FiO2, Purity, Flow Rate)", height, timeBased);

  if (timeBased) {
    fiO2Chart.addXaxis(startDate,
      breathTimes[minX].time, breathTimes[maxX].time, missingTimeWindows);
  } else {
    fiO2Chart.addXaxis(initX, minX, maxX, missingBreathWindows);
  }

  pctAxisNum = null;
  pctAxisNum = createFiO2Graph(fiO2Chart, pctAxisNum, rangeInfo);
  pctAxisNum = createPurityGraph(fiO2Chart, pctAxisNum, rangeInfo);
  mvAxisNum = null;
  mvAxisNum = createO2FlowGraph(fiO2Chart, mvAxisNum, rangeInfo);

  containerDiv = document.getElementById("chartFiO2Div");
  fiO2Chart.render(containerDiv);
}

function createDashboardCharts() {
  elm = document.getElementById("timeTick");
  var timeBased = elm.checked;
  //console.log("createDashboardCharts() timeBased=" + timeBased);
  var height=475
  var minX = minChartBreathNum;
  var maxX = maxChartBreathNum;
  var initX = 0;

  createPressureCharts(height, timeBased, initX, minX, maxX);
  createVolumeCharts(height, timeBased, initX, minX, maxX);
  createBpmCharts(height, timeBased, initX, minX, maxX);
  createFiO2Charts(height, timeBased, initX, minX, maxX);
  createCompCharts(height, timeBased, initX, minX, maxX);
  createMiscCharts(height, timeBased, initX, minX, maxX);

  prevMinBreathNum = minX;
  prevMaxBreathNum = maxX;
}

////////////////////////////////////////////////////////

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
  document.getElementById("CompTick").checked = false;
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
  //console.log("chartRangeSliderCallback");
  values = chartRangeSlider.getSlider();
  selectChartRange(chartRangeSlider, values[0], values[1]);
  createDashboardCharts();
}

function selectChartRange(slider, minB, maxB) {
  l = Number(minB);
  r = Number(maxB);
  if (dashboardBreathNum) {
    if (r>dashboardBreathNum) r = dashboardBreathNum;
    if (l<1) l = 1;
  } else {
    r = l = 0;
  }

  minChartBreathNum = l;
  maxChartBreathNum = r;
  //console.log("Select min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  slider.setSlider([l, r]);
}

function updateChartRangeOnNewBreath(num) {
  chartRangeLimit = dashboardBreathNum;
  if (chartRangeLimit==1) chartRangeLimit=2; // max must be > min
  chartRangeSlider.setRange([1, chartRangeLimit]);

  // If update is paused
  if (updatePaused) return;

  //console.log("Before min=" + minChartBreathNum + " max=" + maxChartBreathNum);

  maxChartBreathNum = dashboardBreathNum;
  minChartBreathNum = maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (minChartBreathNum <= 0) {
    minChartBreathNum = 1;
  }
  //console.log("After min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
}

