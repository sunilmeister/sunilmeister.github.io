var chartTemplate = {
  title:{
    text: "Peak Pressure per Breath"
  },
  axisX:{
    title: "Breath Number",
  },

  axisY:[{
    title: "Pressure",
    lineColor: "#C24642",
    tickColor: "#C24642",
    labelFontColor: "#C24642",
    titleFontColor: "#C24642",
    suffix: " (cm H20)"
  }],
  legend: {
    cursor: "pointer",
  },
  data: []
};

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

var chartsConstructed;
function initCharts() {
  chartsConstructed = false;
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

function renderCharts() {
  var yDatapoints = [];
  var xyPoints = [];

  numPoints = breathTimes.length;

  xyPoints.length = 0;
  yDatapoints = createDatapoints(peakValues);
  for (i=0; i<numPoints; i++) {
    xyPoints.push({"x":i, "y":yDatapoints[i]});
    //xyPoints.push({"x":breathTimes[i], "y":yDatapoints[i]});
  }

  var chartData = {
    "type": "line",
    "name": "PEAK PRESSURE",
    "color": "#369EAD",
    "showInLegend": true,
    "axisYIndex": 1,
    "dataPoints" : xyPoints,
  };
  chartTemplate.data.push(chartData);
  var chart = new CanvasJS.Chart("chartContainer", chartTemplate);
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
	  if (validDecimalInteger(value)) {
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
      if (lastRecord) {
	renderCharts();
      }
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

function createCharts() {
  if (chartsConstructed) return;
  gatherChartData();
  chartsConstructed = true;
}
