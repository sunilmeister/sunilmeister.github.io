// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var dashboardChart = null;

function createPeakGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peak Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: peakValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createPlatGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Plateau Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: platValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createPeepGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peep Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: mpeepValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createVtdelGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:700, reuseAxisNum:reuseAxisNum,
               yName:"Volume (ml)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Tidal Volume (ml)" ,
    color: newGraphColor(),
    transitions: vtdelValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createMvdelGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Minute Volume (litres/min)" ,
    color: newGraphColor(),
    transitions: mvdelValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createO2FlowGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Flow Rate (litres/min)" ,
    color: newGraphColor(),
    transitions: o2FlowValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createSbpmGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: sbpmValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createMbpmGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: mbpmValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createScompGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: scompValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createDcompGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Dynamic Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: dcompValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createTempGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"System Temp (deg C)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "System Temp (deg C)" ,
    color: newGraphColor(),
    transitions: tempValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createWarningGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:true, error:false}
  paramInfo = {
    name: "Warnings" ,
    color: newGraphColor(),
    transitions: warningValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createErrorGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:false, error:true}
  paramInfo = {
    name: "Errors" ,
    color: newGraphColor(),
    transitions: errorValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createFiO2Graph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "FiO2 (%)" ,
    color: newGraphColor(),
    transitions: fiO2Values
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

function createPurityGraph(chart, reuseAxisNum) {
  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Purity (%)" ,
    color: newGraphColor(),
    transitions: o2PurityValues
  };

  return addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo);
}

var pressureChart = null;
function createPressureCharts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("PressuresTick").checked) return;
  if (pressureChart) {
    pressureChart.destroy();
    delete pressureChart;
    pressureChart = null;
  }
  pressureChart = new LineChart("Pressures", height, timeBased);
  pressureChart.addXaxis(init, min, max, missing);

  pressureAxisNum = null;
  pressureAxisNum = createPeakGraph(pressureChart, pressureAxisNum);
  pressureAxisNum = createPlatGraph(pressureChart, pressureAxisNum);
  pressureAxisNum = createPeepGraph(pressureChart, pressureAxisNum);

  containerDiv = document.getElementById("chartPressureDiv");
  pressureChart.render(containerDiv);
}

var volumeChart = null;
function createVolumeCharts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("VolumesTick").checked) return;
  if (volumeChart) {
    volumeChart.destroy();
    delete volumeChart;
    volumeChart = null;
  }
  volumeChart = new LineChart("Volumes", height, timeBased);
  volumeChart.addXaxis(init, min, max, missing);

  volumeAxisNum = null;
  volumeAxisNum = createVtdelGraph(volumeChart, volumeAxisNum);
  mvAxisNum = null;
  mvAxisNum = createMvdelGraph(volumeChart, mvAxisNum);

  containerDiv = document.getElementById("chartVolumeDiv");
  volumeChart.render(containerDiv);
}

var bpmChart = null;
function createBpmCharts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("BpmTick").checked) return;
  if (bpmChart) {
    bpmChart.destroy();
    delete bpmChart;
    bpmChart = null;
  }
  bpmChart = new LineChart("BPM", height, timeBased);
  bpmChart.addXaxis(init, min, max, missing);

  bpmAxisNum = null;
  bpmAxisNum = createSbpmGraph(bpmChart, bpmAxisNum);
  bpmAxisNum = createMbpmGraph(bpmChart, bpmAxisNum);

  containerDiv = document.getElementById("chartBpmDiv");
  bpmChart.render(containerDiv);
}

var compChart = null;
function createCompCharts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("CompTick").checked) return;
  if (compChart) {
    compChart.destroy();
    delete compChart;
    compChart = null;
  }
  compChart = new LineChart("Lung Compliances", height, timeBased);
  compChart.addXaxis(init, min, max, missing);

  compAxisNum = null;
  compAxisNum = createScompGraph(compChart, compAxisNum);
  compAxisNum = createDcompGraph(compChart, compAxisNum);

  containerDiv = document.getElementById("chartCompDiv");
  compChart.render(containerDiv);
}

var miscChart = null;
function createMiscCharts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("MiscTick").checked) return;
  if (miscChart) {
    miscChart.destroy();
    delete miscChart;
    miscChart = null;
  }
  miscChart = new LineChart("Miscellaneous", height, timeBased);
  miscChart.addXaxis(init, min, max, missing);

  tempAxisNum = null;
  tempAxisNum = createTempGraph(miscChart, tempAxisNum);

  flagAxisNum = null;
  flagAxisNum = createWarningGraph(miscChart, flagAxisNum);
  flagAxisNum = createErrorGraph(miscChart, flagAxisNum);

  containerDiv = document.getElementById("chartMiscDiv");
  miscChart.render(containerDiv);
}

var fiO2Chart = null;
function createFiO2Charts(height, timeBased, init, min, max, missing) {
  if (!document.getElementById("FiO2Tick").checked) return;
  if (fiO2Chart) {
    fiO2Chart.destroy();
    delete fiO2Chart;
    fiO2Chart = null;
  }
  fiO2Chart = new LineChart("FiO2", height, timeBased);
  fiO2Chart.addXaxis(init, min, max, missing);

  pctAxisNum = null;
  pctAxisNum = createFiO2Graph(fiO2Chart, pctAxisNum);
  pctAxisNum = createPurityGraph(fiO2Chart, pctAxisNum);
  mvAxisNum = null;
  mvAxisNum = createO2FlowGraph(fiO2Chart, mvAxisNum);

  containerDiv = document.getElementById("chartFiO2Div");
  fiO2Chart.render(containerDiv);
}

  /*



  */

function createDashboardCharts() {
  elm = document.getElementById("timeTick");
  timeBased = elm.checked;
  var height=475
  var init = null;
  var min = null;
  var max = null;
  var missing = [];
  if (timeBased) {
    init = startDate;
    min = breathTimes[minChartBreathNum].time;
    max = breathTimes[maxChartBreathNum-1].time;
    missing = missingTimeWindows;
  } else {
    init = 0;
    min = minChartBreathNum;
    max = maxChartBreathNum;
    missing = missingBreathWindows;
  }

  createPressureCharts(height, timeBased, init, min, max, missing);
  createVolumeCharts(height, timeBased, init, min, max, missing);
  createBpmCharts(height, timeBased, init, min, max, missing);
  createFiO2Charts(height, timeBased, init, min, max, missing);
  createCompCharts(height, timeBased, init, min, max, missing);
  createMiscCharts(height, timeBased, init, min, max, missing);
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

