function createLineChart() {
	var chart = new CanvasJS.Chart("chartContainer", {
	title:{
		text: "Weekly Revenue Analysis for First Quarter"
	},
	axisY:[{
		title: "Order",
		lineColor: "#C24642",
		tickColor: "#C24642",
		labelFontColor: "#C24642",
		titleFontColor: "#C24642",
		suffix: "k"
	},
	{
		title: "Footfall",
		lineColor: "#369EAD",
		tickColor: "#369EAD",
		labelFontColor: "#369EAD",
		titleFontColor: "#369EAD",
		suffix: "k"
	}],
	axisY2: {
		title: "Revenue",
		lineColor: "#7F6084",
		tickColor: "#7F6084",
		labelFontColor: "#7F6084",
		titleFontColor: "#7F6084",
		prefix: "$",
		suffix: "k"
	},
	toolTip: {
		shared: true
	},
	legend: {
		cursor: "pointer",
		itemclick: toggleDataSeries
	},
	data: [{
		type: "line",
		name: "Footfall",
		color: "#369EAD",
		showInLegend: true,
		axisYIndex: 1,
		dataPoints: [
			{ x: new Date(2017, 00, 7), y: 85.4 }, 
			{ x: new Date(2017, 00, 14), y: 92.7 },
			{ x: new Date(2017, 00, 21), y: 64.9 },
			{ x: new Date(2017, 00, 28), y: 58.0 },
			{ x: new Date(2017, 01, 4), y: 63.4 },
			{ x: new Date(2017, 01, 11), y: 69.9 },
			{ x: new Date(2017, 01, 18), y: 88.9 },
			{ x: new Date(2017, 01, 25), y: 66.3 },
			{ x: new Date(2017, 02, 4), y: 82.7 },
			{ x: new Date(2017, 02, 11), y: 60.2 },
			{ x: new Date(2017, 02, 18), y: 87.3 },
			{ x: new Date(2017, 02, 25), y: 98.5 }
		]
	},
	{
		type: "line",
		name: "Order",
		color: "#C24642",
		axisYIndex: 0,
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017, 00, 7), y: 32.3 }, 
			{ x: new Date(2017, 00, 14), y: 33.9 },
			{ x: new Date(2017, 00, 21), y: 26.0 },
			{ x: new Date(2017, 00, 28), y: 15.8 },
			{ x: new Date(2017, 01, 4), y: 18.6 },
			{ x: new Date(2017, 01, 11), y: 34.6 },
			{ x: new Date(2017, 01, 18), y: 37.7 },
			{ x: new Date(2017, 01, 25), y: 24.7 },
			{ x: new Date(2017, 02, 4), y: 35.9 },
			{ x: new Date(2017, 02, 11), y: 12.8 },
			{ x: new Date(2017, 02, 18), y: 38.1 },
			{ x: new Date(2017, 02, 25), y: 42.4 }
		]
	},
	{
		type: "line",
		name: "Revenue",
		color: "#7F6084",
		axisYType: "secondary",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017, 00, 7), y: 42.5 }, 
			{ x: new Date(2017, 00, 14), y: 44.3 },
			{ x: new Date(2017, 00, 21), y: 28.7 },
			{ x: new Date(2017, 00, 28), y: 22.5 },
			{ x: new Date(2017, 01, 4), y: 25.6 },
			{ x: new Date(2017, 01, 11), y: 45.7 },
			{ x: new Date(2017, 01, 18), y: 54.6 },
			{ x: new Date(2017, 01, 25), y: 32.0 },
			{ x: new Date(2017, 02, 4), y: 43.9 },
			{ x: new Date(2017, 02, 11), y: 26.4 },
			{ x: new Date(2017, 02, 18), y: 40.3 },
			{ x: new Date(2017, 02, 25), y: 54.2 }
		]
	}]
});
chart.render();

function toggleDataSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else {
		e.dataSeries.visible = true;
	}
	e.chart.render();
}

}

var breathTimes = [];
var peakValues = [];
var platValues = [];
var peepValues = [];
var tempValues = [];

function initCharts() {
  breathTimes = [];
  peakValues = [];
  platValues = [];
  peepValues = [];
  tempValues = [];
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
	  }
        } else if (ckey=="SBPM") {
	  if (validDecimalInteger(value)) {
	  }
        } else if (ckey=="STATIC") {
	  if (validDecimalInteger(value)) {
	  }
        } else if (ckey=="DYNAMIC") {
	  if (validDecimalInteger(value)) {
	  }
        } else if (ckey=="VTDEL") {
	  if (validDecimalInteger(value)) {
	  }
        } else if (ckey=="MVDEL") {
	  if (validDecimalInteger(value)) {
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
  initCharts();
  gatherChartData();
}
