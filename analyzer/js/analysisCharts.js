// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var analysisChart = null;

function createPeakGraph(chart, reuseAxisNum) {
  elm = document.getElementById('peakTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peak Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: peakValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createPlatGraph(chart, reuseAxisNum) {
  elm = document.getElementById('platTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Plateau Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: platValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createPeepGraph(chart, reuseAxisNum) {
  elm = document.getElementById('peepTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peep Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: mpeepValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createVtdelGraph(chart, reuseAxisNum) {
  elm = document.getElementById('vtdelTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:700, reuseAxisNum:reuseAxisNum,
               yName:"Volume (ml)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Tidal Volume (ml)" ,
    color: newGraphColor(),
    transitions: vtdelValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createMvdelGraph(chart, reuseAxisNum) {
  elm = document.getElementById('mvdelTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Minute Volume (litres/min)" ,
    color: newGraphColor(),
    transitions: mvdelValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createO2FlowGraph(chart, reuseAxisNum) {
  elm = document.getElementById('o2FlowTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:20, reuseAxisNum:reuseAxisNum,
               yName:"Minute Volume (litres/min)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Flow Rate (litres/min)" ,
    color: newGraphColor(),
    transitions: o2FlowValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createSbpmGraph(chart, reuseAxisNum) {
  elm = document.getElementById('sbpmTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: sbpmValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createMbpmGraph(chart, reuseAxisNum) {
  elm = document.getElementById('mbpmTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Breaths per Min (bpm)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static BPM (bpm)" ,
    color: newGraphColor(),
    transitions: mbpmValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createScompGraph(chart, reuseAxisNum) {
  elm = document.getElementById('scompTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Static Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: scompValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createDcompGraph(chart, reuseAxisNum) {
  elm = document.getElementById('dcompTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Compliance (ml/cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Dynamic Compliance (ml/cm H20)" ,
    color: newGraphColor(),
    transitions: dcompValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createTempGraph(chart, reuseAxisNum) {
  elm = document.getElementById('tempTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"System Temp (deg C)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "System Temp (deg C)" ,
    color: newGraphColor(),
    transitions: tempValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createWarningGraph(chart, reuseAxisNum) {
  elm = document.getElementById('warningTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:true, error:false}
  paramInfo = {
    name: "Warnings" ,
    color: newGraphColor(),
    transitions: warningValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createErrorGraph(chart, reuseAxisNum) {
  elm = document.getElementById('errorTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Errors & Warnings"};
  flags = {warning:false, error:true}
  paramInfo = {
    name: "Errors" ,
    color: newGraphColor(),
    transitions: errorValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createFiO2Graph(chart, reuseAxisNum) {
  elm = document.getElementById('fiO2Tick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "FiO2 (%)" ,
    color: newGraphColor(),
    transitions: fiO2Values
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createPurityGraph(chart, reuseAxisNum) {
  elm = document.getElementById('o2PurityTick');
  if (!elm.checked) return reuseAxisNum;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, yMax:null, reuseAxisNum:reuseAxisNum,
               yName:"Percentage (%)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "O2 Purity (%)" ,
    color: newGraphColor(),
    transitions: o2PurityValues
  };

  return chart.addGraph(yAxisInfo, breathTimes, flags, paramInfo);
}

function createAnalysisChart() {
  cleanupCharts();
  height = 650;
  elm = document.getElementById("chartTitle");
  title = elm.value;
  elm = document.getElementById("timeTick");
  timeBased = elm.checked;

  analysisChart = new LineChart(title, height, timeBased);

  var init = null;
  var min = null;
  var max = null;
  var missing = [];
  if (timeBased) {
    init = logStartTime;
    min = analysisStartTime;
    max = analysisEndTime;
    missing = missingTimeWindows;
  } else {
    init = 0;
    min = 1;
    max = breathTimes.length;
    missing = missingBreathWindows;
  }
  analysisChart.addXaxis(init, min, max, missing);

  pressureAxisNum = null;
  pressureAxisNum = createPeakGraph(analysisChart, pressureAxisNum);
  pressureAxisNum = createPlatGraph(analysisChart, pressureAxisNum);
  pressureAxisNum = createPeepGraph(analysisChart, pressureAxisNum);

  vtAxisNum = null;
  vtAxisNum = createVtdelGraph(analysisChart, vtAxisNum);

  mvAxisNum = null;
  mvAxisNum = createMvdelGraph(analysisChart, mvAxisNum);
  mvAxisNum = createO2FlowGraph(analysisChart, mvAxisNum);

  bpmAxisNum = null;
  bpmAxisNum = createSbpmGraph(analysisChart, bpmAxisNum);
  bpmAxisNum = createMbpmGraph(analysisChart, bpmAxisNum);

  compAxisNum = null;
  compAxisNum = createScompGraph(analysisChart, compAxisNum);
  compAxisNum = createDcompGraph(analysisChart, compAxisNum);

  tempAxisNum = null;
  tempAxisNum = createTempGraph(analysisChart, tempAxisNum);

  flagAxisNum = null;
  flagAxisNum = createWarningGraph(analysisChart, flagAxisNum);
  flagAxisNum = createErrorGraph(analysisChart, flagAxisNum);

  pctAxisNum = null;
  pctAxisNum = createFiO2Graph(analysisChart, pctAxisNum);
  pctAxisNum = createPurityGraph(analysisChart, pctAxisNum);

  containerDiv = document.getElementById("chartContainerDiv");
  analysisChart.render(containerDiv);
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
}

function cleanupCharts() {
  if (analysisChart) {
    analysisChart.destroy();
    delete analysisChart;
    analysisChart = null;
  }
  elm = document.getElementById("chartContainerDiv");
  elm.innerHTML = "";
}

function initSelection() {
  document.getElementById('peakTick').checked = false;
  document.getElementById('platTick').checked = false;
  document.getElementById('peepTick').checked = false;
  document.getElementById('vtdelTick').checked = false;
  document.getElementById('mvdelTick').checked = false;
  document.getElementById('mbpmTick').checked = false;
  document.getElementById('sbpmTick').checked = false;
  document.getElementById('errorTick').checked = false;
  document.getElementById('warningTick').checked = false;
  document.getElementById('scompTick').checked = false;
  document.getElementById('dcompTick').checked = false;
  document.getElementById('tempTick').checked = false;
  document.getElementById('fiO2Tick').checked = false;
  document.getElementById('o2PurityTick').checked = false;
  document.getElementById('o2FlowTick').checked = false;
  document.getElementById('timeTick').checked = false;
  document.getElementById('breathTick').checked = true;
}

function initCharts() {
  //console.log("initCharts");
  cleanupCharts();
  initSelection();
}

