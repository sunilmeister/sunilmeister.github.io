const graphColors = [
  "Black",
  "Maroon",
  "Gray",
  "Yellow",
  "Red",
  "Yellow",
  "Olive",
  "Lime",
  "Green",
  "Aqua",
  "Blue",
  "Navy",
  "Fuchsia",
  "Purple",
  "Silver",
];
var nextColor = 0;

function getNextColor() {
  color = graphColors[nextColor++];
  if (nextColor==graphColors.length) nextColor = 0;
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
      ms = Math.round(ms/1000);
      xyPoints.push({"x":ms, "y":yDatapoints[i]});
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
  var chart = new CanvasJS.Chart("chartContainer", chartJson);
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

function createPressureYaxis(num) {
  var color = getNextColor();
  var yaxis = {
    title: "Pressure",
    lineColor: color,
    tickColor: color,
    labelFontColor: color,
    titleFontColor: color,
    suffix: " (cm H20)"
  };
  return createNewInstance(yaxis);
}

function createNewChart() {
  var elm;
  elm = document.getElementById("chartTitle");
  title = elm.value;
  if (!title) {
    alert("Please enter a Title for the new Chart");
    return;
  }

  elm = document.getElementById("peak");
  peakYes = elm.checked;

  elm = document.getElementById("plat");
  platYes = elm.checked;

  elm = document.getElementById("peep");
  peepYes = elm.checked;

  elm = document.getElementById("vtdel");
  vtdelYes = elm.checked;

  elm = document.getElementById("mvdel");
  mvdelYes = elm.checked;

  elm = document.getElementById("mbpm");
  mbpmYes = elm.checked;

  elm = document.getElementById("sbpm");
  sbpmYes = elm.checked;

  elm = document.getElementById("xaxis");
  timeBased = (elm.value=="Time");

  if (!(peakYes || platYes || peepYes || vtdelYes || mvdelYes || mbpmYes || sbpmYes)) {
    alert("Please select Parameter(s) to Chart");
    return;
  }

  nextYaxisNum = 0;
  var chartJson = createNewInstance(chartTemplate);
  chartJson.title.text = title;
  chartJson.axisX.title = timeBased ? "Time" : "Breath Number" ;

  pressureYaxisNum = -1;
  if (peakYes) {
    paramData = createCanvasChartData(peakValues,timeBased);
    if (paramData) {
      paramData.name = "Peak Pressure";
      paramData.color = getNextColor();
      if (pressureYaxisNum == -1) {
	pressureYaxisNum = nextYaxisNum++;
	yaxis = createPressureYaxis(pressureYaxisNum);
	chartJson.axisY.push(yaxis);
      }
      paramData.axisYIndex = pressureYaxisNum;
      chartJson.data.push(paramData);
    } else {
      alert("Cannot plot Peak pressures\nNo data points found!");
    }
  }

  renderNewChart(chartJson);
}

function createCharts() {
  if (chartsDataGathered) return;
  gatherChartData();

  elm = document.getElementById("xaxis");
  elm.value = "Breath Number" ;
}
