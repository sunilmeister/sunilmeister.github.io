// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
  // returns the Y-axis number for possible reuse
  // or null if no graph created
  // yAxisInfo = {primary:true, reuse:false, yName:"", yMin:1, reuseAxisNum:2}
  // flags = {warning:true, error:false}
  // paramInfo = {name:"", transitions:[], color:""}
function addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo) {
    var paramTransitions = paramInfo.transitions;
    var paramName = paramInfo.name;
    var paramColor = paramInfo.color;
  
    var xyPoints = chart.createXYPoints(breathTimes, paramTransitions, null, null, 
      flags.error, flags.warning);
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length==0)) return null;
  
    var yAxis = null;
    if (!yAxisInfo.reuse) {
      yAxis = chart.createYaxis(yAxisInfo.yName, paramColor, yAxisInfo.yMin);
      if (yAxisInfo.primary) {
        return chart.addXYPointsPrimaryYNew(yAxis, paramName, paramColor,  xyPoints);
      } else {
        chart.addXYPointsSecondaryYNew(yAxis, paramName, paramColor,  xyPoints);
        return null;
      }
    } else {
      if (yAxisInfo.primary) {
        return chart.addXYPointsPrimaryYReuse(
  	  yAxisInfo.reuseAxisNum, paramName, paramColor,  xyPoints);
      } else {
        chart.addXYPointsSecondaryYReuse(paramName, paramColor,  xyPoints);
        return null;
      }
    }
    return null;
  }


function createPeakGraph(chart, reuseAxisNum) {
  elm = document.getElementById('peakTick');
  if (!elm.checked) return null;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peak Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: peakValues
  };

  return addGraph(chart,yAxisInfo, breathTimes, flags, paramInfo);
}

function createPlatGraph(chart, reuseAxisNum) {
  elm = document.getElementById('platTick');
  if (!elm.checked) return null;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Plateau Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: platValues
  };

  return addGraph(chart,yAxisInfo, breathTimes, flags, paramInfo);
}

function createPeepGraph(chart, reuseAxisNum) {
  elm = document.getElementById('peepTick');
  if (!elm.checked) return null;

  reuse = (reuseAxisNum != null);
  yAxisInfo = {primary:true, reuse:reuse, yMin:0, reuseAxisNum:reuseAxisNum,
               yName:"Pressure (cm H20)"};
  flags = {warning:false, error:false}
  paramInfo = {
    name: "Peep Pressure (cm H20)" ,
    color: newGraphColor(),
    transitions: mpeepValues
  };

  return addGraph(chart,yAxisInfo, breathTimes, flags, paramInfo);
}

function createNewChart() {
  height = 600;
  elm = document.getElementById("chartTitle");
  title = elm.value;
  elm = document.getElementById("timeTick");
  timeBased = elm.checked;

  chart = new LineChart(title, height, timeBased);

  var init = null;
  var min = null;
  var max = null;
  var missing = [];
  if (timeBased) {
    init = logStartTime;
    min = analysisStartTime;
    max = analysisEndTime;
  } else {
    init = 0;
    min = 1;
    max = breathTimes.length;
  }
  chart.addXaxis(init, min, max, missing);

  pressureAxisNum = null;
  pressureAxisNum = createPeakGraph(chart, pressureAxisNum);
  pressureAxisNum = createPlatGraph(chart, pressureAxisNum);
  pressureAxisNum = createPeepGraph(chart, pressureAxisNum);

  containerDiv = document.getElementById("chartContainerDiv");
  chart.render(containerDiv);
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
}

function initCharts() {
  //console.log("initCharts");
  elm = document.getElementById("chartContainerDiv");
  elm.innerHTML = "";
}


