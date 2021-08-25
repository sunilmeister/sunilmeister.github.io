// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const graphColors = [
  "Maroon",
  "Blue",
  "Green",
  "Indigo",
  "Purple",
  "Olive",
  "Fuchsia",
  "Aqua",
  "Navy",
  "Silver",
  "Crimson",
  "Slategrey",
  "Violet",
  "SteelBlue",
];
var nextChartColor = 0;

function getNextChartColor() {
  color = graphColors[nextChartColor++];
  if (nextChartColor==graphColors.length) nextChartColor = 0;
  return color;
}

function initChartColor() {
  nextChartColor = 0;
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

// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// value transitions
var breathTimes = [];
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

var warningNum = 0;
var errorNum = 0;

// error and warning messages
var errorMsgs = [];
var warningMsgs = [];
var expectWarningMsg;
var expectErrorMsg;
var l1;
var l2;
var l3;
var l4;

function initChartData() {
  console.log("initChartData");
  initChartColor();

  breathTimes = [];
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

  warningNum = 0;
  errorNum = 0;

  errorMsgs = [];
  warningMsgs = [];
  expectWarningMsg = false;
  expectErrorMsg = false;
  l1 = "";
  l2 = "";
  l3 = "";
  l4 = "";
}

function initGraphStartValues() {
 if (breathTimes.length==0) breathTimes = [0];
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
 if (errorValues.length==0) errorValues.push({"time":0,"value":null});
 if (warningValues.length==0) warningValues.push({"time":0,"value":null});
}

function chartProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  for (var key in jsonData) {
    if (key=='content') {
      if (typeof jsonData.content["WMSG"] != 'undefined') {
        expectWarningMsg = true;
        warningValues.push({"time":curTime,"value":++warningNum});
      } 
      if (typeof jsonData.content["EMSG"] != 'undefined') {
        expectErrorMsg = true;
        errorValues.push({"time":curTime,"value":++errorNum});
      }

      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (l1 && l2 && l3 && l4) {
	  if (expectErrorMsg || expectWarningMsg) {
	    var msg = {
	      'created' : jsonData.created,
	      'L1' : l1,
	      'L2' : l2,
	      'L3' : l3,
	      'L4' : l4
	    };

	    if (expectWarningMsg) {
	      warningMsgs.push(createNewInstance(msg));
	    } else {
	      errorMsgs.push(createNewInstance(msg));
	    }
	    expectWarningMsg = false;
	    expectErrorMsg = false;
	    l1 = l2 = l3 = l4 = "";
	  }
	}

        if (ckey=="L1") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l1) l1 = jsonData.content['L1'];
	  }
        } else if (ckey=="L2") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l2) l2 = jsonData.content['L2'];
	  }
        } else if (ckey=="L3") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l3) l3 = jsonData.content['L3'];
	  }
        } else if (ckey=="L4") {
	  if (expectWarningMsg || expectErrorMsg) {
	    if (!l4) l4 = jsonData.content['L4'];
	  }
        } else if (ckey=="BTOG") {
	  breathTimes.push(curTime);
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

