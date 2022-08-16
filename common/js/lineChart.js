/*
// Author: Sunil Nanda
*/

const CHART_XAXIS_MAX_TICK_MARKS = 25;
const CHART_FONT_SIZE = 50;
const CHART_INTERLACED_COLOR = 'white' ;
const CHART_HORIZONTAL_GRID_COLOR = '#8F99FB' ;
const LINE_GRAPH_COLORS = [
  "Crimson",
  "Blue",
  "Green",
  "Indigo",
  "Purple",
  "Olive",
  "Fuchsia",
  "Maroon",
  "Navy",
  "Silver",
  "Slategrey",
  "Violet",
  "SteelBlue",
];

var graphColorIndex = 0;

function newGraphColor() {
  var color = LINE_GRAPH_COLORS[graphColorIndex++];
  if (graphColorIndex == LINE_GRAPH_COLORS.length) graphColorIndex = 0;
  return color;
}

function toggleDataSeries(e) {
  if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  }
  else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct LineChart object
// 2. add X-axis
// 3. create XY points
// 4. Create Y-axis
// 5. add XY points and Y-axis to LineChart object
// 6. Render LineChart object
// //////////////////////////////////////////////////////
class LineChart {

  constructor(title, height, timeUnits) {
    this.timeUnits = timeUnits;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {text: title, padding: 10},
      axisY: [],
      toolTip: {shared: true},
      legend: {cursor: "pointer", itemclick: toggleDataSeries, fontSize: 25},
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };
    this.chart = null;
  }

  // returns the Y-axis number for possible reuse
  // or null if no graph created
  // yAxisInfo = {primary:true, reuse:false, yName:"", yMin:1, yMax:null, reuseAxisNum:2}
  // flags = {warning:true, error:false}
  // paramInfo = {name:"", transitions:[], color:""}
  addGraph(yAxisInfo, breathTimes, flags, paramInfo) {
    var paramTransitions = paramInfo.transitions;
    var paramName = paramInfo.name;
    var paramColor = paramInfo.color;
  
    var xyPoints = this.createXYPoints(breathTimes, paramTransitions, null, null, 
      flags.error, flags.warning);
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length==0)) return null;
  
    var yAxis = null;
    if (!yAxisInfo.reuse) {
      yAxis = this.createYaxis(yAxisInfo.yName, paramColor, yAxisInfo.yMin, yAxisInfo.yMax);
      if (yAxisInfo.primary) {
        return this.addXYPointsPrimaryYNew(yAxis, paramName, paramColor,  xyPoints);
      } else {
        this.addXYPointsSecondaryYNew(yAxis, paramName, paramColor,  xyPoints);
        return null;
      }
    } else {
      if (yAxisInfo.primary) {
        return this.addXYPointsPrimaryYReuse(
  	  yAxisInfo.reuseAxisNum, paramName, paramColor,  xyPoints);
      } else {
        this.addXYPointsSecondaryYReuse(paramName, paramColor,  xyPoints);
        return null;
      }
    }
    return null;
  }
  
  // X axis is the same for all charts in our application
  // if timeBased, init/min/max are Date else breath numbers
  addXaxis(init, min, max, missingWindows) {
    var Xaxis = {};
    if (this.timeUnits) {
      Xaxis.title = "Elapsed Time (secs)";
    } else {
      Xaxis.title = "Breath Number";
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize = CHART_FONT_SIZE;
    Xaxis.interval = this.calculateXaxisInterval(min, max);
    Xaxis.minimum = this.calculateXaxisMinimum(init, min);
    if (missingWindows && missingWindows.length) {
      Xaxis.scaleBreaks = {};
      Xaxis.scaleBreaks.customBreaks = cloneObject(missingWindows);
    }
    this.chartJson.axisX = Xaxis;
  }

  render(containerDiv) {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.chart = new CanvasJS.Chart(containerDiv, this.chartJson);
    this.chart.render();
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // ////////////////////////////////////////////
  // Rest below are all private method
  // ////////////////////////////////////////////

  // if timeBased, init/min/max are Date else breath numbers
  calculateXaxisInterval(min, max) {
    var numPoints = 0;
    if (this.timeUnits) {
      numPoints = (max - min)/1000;
    } else {
      numPoints = max - min + 1;
    }
    var interval = Math.ceil(numPoints/CHART_XAXIS_MAX_TICK_MARKS);
    return interval;
  }


  // if timeUnits, init/min/max are Date else breath numbers
  calculateXaxisMinimum(init, min) {
    if (this.timeUnits) {
      return (min - init)/1000 ;
    } else {
      return min - init;
    }
  }

  createYaxis(title,color,min, max) {
    var Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (min!=null) Yaxis.minimum = min;
    if (max!=null) Yaxis.maximum = max;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  // Set min and max to null to process the entire data
  createXYPoints(breathTimes, transitions, min, max, flagError, flagWarning) {
    if (transitions.length == 0) return null;
    var yDatapoints = [];
    var xyPoints = [];
    var doFull = (min==null) && (max==null);
    var numPoints = 0;
    if (doFull) {
      numPoints = breathTimes.length;
    } else {
      numPoints = max - min + 1;
    }

    // Collect Y dapoints
    var curValue = 0;
    var curIx = 0;
    var curValue = transitions[0].value; // guaranteed to have at least one entry
    for (let i = 1; i < breathTimes.length; i++) {
      if (curIx == transitions.length - 1) {
        curValue = transitions[curIx].value;
      } else {
        if (breathTimes[i].time >= transitions[curIx + 1].time) {
          curValue = transitions[++curIx].value;
        } else {
          curValue = transitions[curIx].value;
        }
      }
      if (doFull || ((i<=max) && (i>=min))) {
        yDatapoints.push(curValue);
      }
    }
  
    // Attach X datapoints
    var xval;
    for (let i = 1; i < numPoints; i++) {
      if (this.timeUnits) {
        var ms;
        if (doFull) {
          ms = new Date(breathTimes[i].time) - new Date(breathTimes[1].time);
        } else {
          ms = new Date(breathTimes[i+min-1].time) - new Date(breathTimes[1].time);
        }
        xval = Math.round(ms / 1000);
      } else {
        if (doFull) {
          xval = i;
        } else {
          xval = i+min-1;
        }
      }
      if (!flagError && !flagWarning) {
        xyPoints.push({
          "x": xval,
          "y": yDatapoints[i]
        });
      } else {
        if (yDatapoints[i] != yDatapoints[i - 1]) {
	  var label = "E";
	  var marker = "cross";
	  var color = "red";
          if (flagWarning) {
            label = "W";
            marker = "triangle";
            color = "orange";
          }
          xyPoints.push({
            "x": xval,
            "y": yDatapoints[i],
            indexLabel: label,
            markerType: marker,
            markerColor: color,
            markerSize: 16
          });
        } else {
          xyPoints.push({
            "x": xval,
            "y": null
          });
        }
      }
    }
    var noLegend = false;
    if (flagError || flagWarning) noLegend = true;
  
    var chartData = {};
    chartData.type = "line";
    chartData.showInLegend = !noLegend;
    chartData.dataPoints = xyPoints;
    return chartData;
  }

  // return Y-axis number for possible reuse
  addXYPointsPrimaryYNew(Yaxis, name, color, xyPoints) {
    var axisNum = this.chartJson.axisY.length;
    xyPoints.name = name;
    xyPoints.color = color;
    this.chartJson.axisY.push(cloneObject(Yaxis));
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  // return Y-axis number for possible reuse
  addXYPointsPrimaryYReuse(axisNum, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  addXYPointsSecondaryYNew(Yaxis, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    this.chartJson.axisY2 = cloneObject(Yaxis);
    xyPoints.axisYType = "secondary";
    this.chartJson.data.push(cloneObject(xyPoints));
  }

  addXYPointsSecondaryYReuse(name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    xyPoints.axisYType = "secondary";
    this.chartJson.data.push(cloneObject(xyPoints));
  }

};
