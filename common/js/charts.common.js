// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var chartPrevSystemBreathNum = -1;

const graphColors = [
  "Crimson",
  "Blue",
  "Green",
  "Indigo",
  "Purple",
  "Olive",
  "Fuchsia",
  "Maroon",
  "Aqua",
  "Navy",
  "Silver",
  "Slategrey",
  "Violet",
  "SteelBlue",
];
var nextChartColor = 0;

var horizontalGridColor = "#8F99FB";
var bandColor = "white";
var maxTickMarksXaxis = 20;

function getNextChartColor() {
  color = graphColors[nextChartColor++];
  if (nextChartColor==graphColors.length) nextChartColor = 0;
  return color;
}

function initChartColor() {
  nextChartColor = 0;
}

var chartTemplate = {
  zoomEnabled: true, 
  zoomType: "x",
  title:{ 
    text: "" ,
    padding: 10,
  },
  axisX:{ 
    title: "", 
    fontSize: 50,
    interlacedColor: bandColor,
    scaleBreaks: {
      customBreaks: [],
    },
  },
  axisY:[],
  toolTip: { shared: true },
  legend: { 
    cursor: "pointer", 
    itemclick: toggleDataSeries,
    fontSize: 25,
  },
  height: 600,
  backgroundColor: "#D5F3FE",
  data: [],
};

function toggleDataSeries(e) {
  if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}


function createChartsXaxis(chartJson) {
  chartJson.axisX.title = timeBased ? "Elapsed Time (secs)" : "Breath Number";
  if (timeBased) {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingTimeWindows);
    chartJson.axisX.minimum = 0;
  } else {
    chartJson.axisX.scaleBreaks.customBreaks = createNewInstance(missingBreathWindows);
    chartJson.axisX.minimum = 1;
  }
}

// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// value transitions
var breathTimes = [];
var missingBreaths = [];
var missingBreathWindows = [];
var missingTimeWindows = [];
var vtdelValues = [];
var mvdelValues = [];
var sbpmValues = [];
var mbpmValues = [];
var scompValues = [];
var dcompValues = [];
var peakValues = [];
var platValues = [];
var mpeepValues = [];
var tempValues = [];
var warningValues = [];
var errorValues = [];
var fiO2Values = [];
var o2PurityValues = [];
var o2FlowValues = [];

function initChartData() {
  console.log("initChartData");
  initChartColor();

  chartPrevSystemBreathNum = -1;
  
  breathTimes = [];
  missingBreaths = [];
  missingBreathWindows = [];
  missingTimeWindows = [];
  vtdelValues = [];
  mvdelValues = [];
  sbpmValues = [];
  mbpmValues = [];
  scompValues = [];
  dcompValues = [];
  peakValues = [];
  platValues = [];
  mpeepValues = [];
  tempValues = [];
  warningValues = [];
  errorValues = [];
  fiO2Values = [];
  o2PurityValues = [];
  o2FlowValues = [];
}

function initChartStartValues() {
  console.log("initChartStartValues");
  if (breathTimes.length==0) breathTimes.push({"time":0,"valid":false});
  if (peakValues.length==0) peakValues.push({"time":0,"value":null});
  if (platValues.length==0) platValues.push({"time":0,"value":null});
  if (mpeepValues.length==0) mpeepValues.push({"time":0,"value":null});
  if (vtdelValues.length==0) vtdelValues.push({"time":0,"value":null});
  if (mvdelValues.length==0) mvdelValues.push({"time":0,"value":null});
  if (scompValues.length==0) scompValues.push({"time":0,"value":null});
  if (dcompValues.length==0) dcompValues.push({"time":0,"value":null});
  if (mbpmValues.length==0) mbpmValues.push({"time":0,"value":null});
  if (sbpmValues.length==0) sbpmValues.push({"time":0,"value":null});
  if (tempValues.length==0) tempValues.push({"time":0,"value":null});
  if (warningValues.length==0) warningValues.push({"time":0,"value":null});
  if (errorValues.length==0) errorValues.push({"time":0,"value":null});
  if (fiO2Values.length==0) fiO2Values.push({"time":0,"value":null});
  if (o2PurityValues.length==0) o2PurityValues.push({"time":0,"value":null});
  if (o2FlowValues.length==0) o2FlowValues.push({"time":0,"value":null});
}

var lastValidBreathTime = 0;
var lastWarningTime = 0;
var lastErrorTime = 0;

function chartProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  for (var key in jsonData) {
    if (key=='content') {
      if (typeof jsonData.content["WMSG"] != 'undefined') {
	if (chartExpectWarningMsg) { // back to back with Previous msg not yet fully received
	    var msg = {
	      'created' : lastWarningTime,
	      'L1' : chartL1,
	      'L2' : chartL2,
	      'L3' : chartL3,
	      'L4' : chartL4
	    };
            warningMsgs.push(msg);
	}
	lastWarningTime = jsonData.created;
        chartExpectWarningMsg = true;
        warningValues.push({"time":curTime,"value":++warningNum});
      } 
      if (typeof jsonData.content["EMSG"] != 'undefined') {
	if (chartExpectErrorMsg) { // back to back with Previous msg not yet fully received
	    var msg = {
	      'created' : lastErrorTime,
	      'L1' : chartL1,
	      'L2' : chartL2,
	      'L3' : chartL3,
	      'L4' : chartL4
	    };
            errorMsgs.push(msg);
	}
	lastErrorTime = jsonData.created;
        chartExpectErrorMsg = true;
        errorValues.push({"time":curTime,"value":++errorNum});
      }

      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (chartL1 && chartL2 && chartL3 && chartL4) {
	  if (chartExpectErrorMsg || chartExpectWarningMsg) {
	    var msgTime;
	    if (chartExpectWarningMsg) {
	      msgTime = lastWarningTime;
	    } else {
	      msgTime = lastErrorTime;
	    }
	    var msg = {
	      'created' : msgTime,
	      'L1' : chartL1,
	      'L2' : chartL2,
	      'L3' : chartL3,
	      'L4' : chartL4
	    };

	    if (chartExpectWarningMsg) {
	      warningMsgs.push(msg);
	    } else {
	      errorMsgs.push(msg);
	    }
	    chartExpectWarningMsg = false;
	    chartExpectErrorMsg = false;
	    chartL1 = chartL2 = chartL3 = chartL4 = "";
	  }
	}

        if (ckey=="L1") {
	  if (chartExpectWarningMsg || chartExpectErrorMsg) {
	    if (!chartL1) chartL1 = jsonData.content['L1'];
	  }
        } else if (ckey=="L2") {
	  if (chartExpectWarningMsg || chartExpectErrorMsg) {
	    if (!chartL2) chartL2 = jsonData.content['L2'];
	  }
        } else if (ckey=="L3") {
	  if (chartExpectWarningMsg || chartExpectErrorMsg) {
	    if (!chartL3) chartL3 = jsonData.content['L3'];
	  }
        } else if (ckey=="L4") {
	  if (chartExpectWarningMsg || chartExpectErrorMsg) {
	    if (!chartL4) chartL4 = jsonData.content['L4'];
	  }
        } else if (ckey=="BNUM") {
	  breathTimes.push({"time":curTime, "valid":true});
	  lastValidBreathTime = curTime;
	  if (chartPrevSystemBreathNum==-1) { // initialize
	    chartPrevSystemBreathNum = value-1;
	  }
	  systemBreathNum = value;
	  breathsMissing = systemBreathNum - chartPrevSystemBreathNum - 1;
	  chartPrevSystemBreathNum = value;
	  if (breathsMissing) {
	    console.log("Breaths Missing =" + breathsMissing);
	    console.log("Missing systemBreathNum=" + systemBreathNum + " prev=" + chartPrevSystemBreathNum);
            missingBreaths.push({"time":curTime,"value":breathsMissing});
	    // stuff dummy breaths 1 sec apart because the fastest breath is 2 secs
	    lastBreathNum = breathTimes.length;
	    for (i=1; i<=breathsMissing; i++) {
	      breathTimes.push({"time":lastValidBreathTime+i, "valid":false});
	    }

	    // record breaks for graphing
	    missingBreathWindows.push(
	      {"startValue":lastBreathNum+1,"endValue":lastBreathNum+breathsMissing,
		"type":"zigzag","lineColor": "black","autoCalculate":true});
	    
	    missingTimeWindows.push(
	      {"startValue":lastValidBreathTime+1,"endValue":curTime-1,
		"type":"zigzag","lineColor": "black","autoCalculate":true});

	  }
        } else if (ckey=="FIO2") {
	  if (validDecimalInteger(value) && (value<=100)) {
	    fiO2Values.push({"time":curTime,"value":value});
	  } else {
	    fiO2Values.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="O2PURITY") {
	  if (validDecimalInteger(value) && (value<=100)) {
	    o2PurityValues.push({"time":curTime,"value":value});
	  } else {
	    o2PurityValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="O2FLOWX10") {
	  if (validDecimalInteger(value)) {
	    o2FlowValues.push({"time":curTime,"value":(value/10)});
	  } else {
	    o2FlowValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="MBPM") {
	  if (validDecimalInteger(value)) {
	    mbpmValues.push({"time":curTime,"value":value});
	  } else {
	    mbpmValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="SBPM") {
	  if (validDecimalInteger(value)) {
	    sbpmValues.push({"time":curTime,"value":value});
	  } else {
	    sbpmValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="STATIC") {
	  if (validDecimalInteger(value)) {
	    scompValues.push({"time":curTime,"value":value});
	  } else {
	    scompValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="DYNAMIC") {
	  if (validDecimalInteger(value)) {
	    dcompValues.push({"time":curTime,"value":value});
	  } else {
	    dcompValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="VTDEL") {
	  //console.log("Push VTDEL=" + value + " " + curTime);
	  if (validDecimalInteger(value)) {
	    vtdelValues.push({"time":curTime,"value":value});
	  } else {
	    vtdelValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="MVDEL") {
	  if (validFloatNumber(value)) {
	    mvdelValues.push({"time":curTime,"value":value});
	  } else {
	    mvdelValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="PIP") {
	  if (validDecimalInteger(value)) {
	    peakValues.push({"time":curTime,"value":value});
	  } else {
	    peakValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="PLAT") {
	  if (validDecimalInteger(value)) {
	    platValues.push({"time":curTime,"value":value});
	  } else {
	    platValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="MPEEP") {
	  if (validDecimalInteger(value)) {
	    mpeepValues.push({"time":curTime,"value":value});
	  } else {
	    mpeepValues.push({"time":curTime,"value":null});
	  }
        } else if (ckey=="TEMP") {
	  if (validDecimalInteger(value)) {
	    tempValues.push({"time":curTime,"value":value});
	  } else {
	    tempValues.push({"time":curTime,"value":null});
	  }
        }
      }
    }
  }
}

function createO2FlowYaxis(num, color) {
  var yaxis = {
    title: "O2 Flow (litres/min)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createPercentYaxis(num, color) {
  var yaxis = {
    title: "Percentage (%)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createErrorWarningYaxis(num, color) {
  var yaxis = {
    title: "Errors & Warnings",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createPressureYaxis(num, color) {
  var yaxis = {
    title: "Pressure (cm H20)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createVtYaxis(num, color) {
  var yaxis = {
    title: "Tidal Volume (ml)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    maximum: 700,
    suffix: ""
  };
  return (yaxis);
}

function createMvYaxis(num, color) {
  var yaxis = {
    title: "Minute Volume (litres/min)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    maximum: 20,
    suffix: ""
  };
  return (yaxis);
}

function createBpmYaxis(num, color) {
  var yaxis = {
    title: "Breaths per Min (bpm)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createComplianceYaxis(num, color) {
  var yaxis = {
    title: "Compliance (ml/cm H20)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}

function createTempYaxis(num, color) {
  var yaxis = {
    title: "System Temp (deg C)",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    gridColor: horizontalGridColor,
    minimum: 0,
    suffix: ""
  };
  return (yaxis);
}


var debugLogDatapoints = false;
function createDatapoints(transitions) {
  var curValue = 0;
  var curIx = 0;
  var curValue = transitions[0].value; // guaranteed to have at least one entry

  if (debugLogDatapoints) {
    console.log("transitions.length="+transitions.length);
    for (i=0; i<transitions.length; i++) {
      console.log("transitions[" + i + "]=" +
	transitions[i].value + " (" +
	transitions[i].time + ")");
    }
  }
  var datapoints = [];
  for (i=1; i<breathTimes.length; i++) {
    if (curIx==transitions.length-1) {
      curValue = transitions[curIx].value;
    } else {
      if (breathTimes[i].time >= transitions[curIx+1].time ) {
        if (debugLogDatapoints) console.log("breath time >= curIx=" + curIx);
	curValue = transitions[++curIx].value;
      } else {
        if (debugLogDatapoints) console.log("breath time < curIx=" + curIx);
	curValue = transitions[curIx].value;
      }
    }
    datapoints.push(curValue);
  }
  if (debugLogDatapoints) {
    console.log("datapoints.length="+datapoints.length);
    for (i=0; i<datapoints.length; i++) {
      console.log("datapoints[" + i + "]=" + datapoints[i]);
    }
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
      ms = new Date(breathTimes[i].time) - new Date(breathTimes[1].time);
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

  return (chartData);
}

