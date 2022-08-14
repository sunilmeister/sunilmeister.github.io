/*
// Author: Sunil Nanda
*/

const CHART_XAXIS_MAX_TICK_MARKS = 20;
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
  "Aqua",
  "Navy",
  "Silver",
  "Slategrey",
  "Violet",
  "SteelBlue",
];

function toggleDataSeries(e) {
  if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  }
  else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

class LineChart {
  static timeUnits = false;
  static nextGraphColor = 0;

  static newColor() {
    color = LINE_GRAPH_COLORS[nextGraphColor++];
    if (nextGraphColor == graphColors.length) nextGraphColor = 0;
    return color;
  }

  static #createNewInstance(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // if timeBased, init/min/max are Date else breath numbers
  static #calculateXaxisInterval(min, max) {
    var numPoints = 0;
    if (LineChart.timeUnits) {
      numPoints = (max - min)/1000;
    } else {
      numPoints = max - min + 1;
    }
    var interval = Math.ceil(numPoints/CHART_XAXIS_MAX_TICK_MARKS);
    //console.log("max=" + max + " min=" + min);
    //console.log("numPoints=" + numPoints + " interval=" + interval);
    return interval;
  }


  // if timeUnits, init/min/max are Date else breath numbers
  static #calculateXaxisMinimum(init, min) {
    if (LineChart.timeUnits) {
      return (min - init)/1000 ;
    } else {
      return min - init;
    }
  }

  // X axis is the same for all charts in our application
  // if timeBased, init/min/max are Date else breath numbers
  static createXaxis(init, min, max, missingWindows) {
    var Xaxis = {};
    if (LineChart.timeUnits) {
      Xaxis.title = "Elapsed Time (secs)";
    } else {
      Xaxis.title = "Breath Number";
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize = CHART_FONT_SIZE;
    Xaxis.interval = LineChart.calculateXaxisInterval(min, max);
    Xaxis.minimum = LineChart.calculateXaxisMinimum(init, min);
    if (missingWindows && missingWindows.length) {
      Xaxis.scaleBreaks = {};
      Xaxis.scaleBreaks.customBreaks = LineChart.createNewInstance(missingWindows);
    }
    return LineChart.createNewInstance(Xaxis);
  }

  static createYaxis(title,color,min) {
    var Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    Yaxis.minimum = min;
    Yaxis.suffix = "";
    return LineChart.createNewInstance(Yaxis);
  }

  // Set min and max to null to process the entire data
  static createXYPoints(breathTimes, transitions, min, max, flagError, flagWarning) {
    if (transitions.length == 0) return null;
    var yDatapoints = [];
    var xyPoints = [];
    var doFull = (min==null) && (max==null);
  
    if (doFull) {
      numPoints = breathTimes.length;
    } else {
      numPoints = max - min + 1;
    }
    xyPoints.length = 0;
    yDatapoints = createDatapoints(breathTimes, transitions, min, max);
    var xval;
    for (i = 1; i < numPoints; i++) {
      if (LineChart.timeUnits) {
        var ms;
        if (doFull) {
          ms = new Date(breathTimes[i].time) - new Date(breathTimes[1].time);
        } else {
          ms = new Date(breathTimes[i+min-1].time) - new Date(breathTimes[1].time);
        }
        sec = Math.round(ms / 1000);
        xval = sec;
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
          if (flagError) {
            label = "E";
            marker = "cross";
            color = "red";
          } else {
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
    if (flagError || flagWarning) noLegend = true;
    else noLegend = false;
  
    var chartData = {};
    chartData.type = "line";
    chartData.name = "";
    chartData.color = "";
    chartData.showInLegend = !noLegend;
    chartData.axisYIndex = 0;
    chartData.dataPoints = xyPoints;
    return chartData;
  }

  // return Y-axis number for possible reuse
  addXYPointsNewPrimaryY(Yaxis, name, color, xyPoints) {
    axisNum = this.chartJson.axisY.length;
    xyPoints.name = name;
    xyPoints.color = color;
    this.chartJson.axisY.push(LineChart.createInstance(Yaxis));
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(LineChart.createInstance(xyPoints));
    return axisNum;
  }

  // return Y-axis number for possible reuse
  addXYPointsOldPrimaryY(axisNum, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(LineChart.createInstance(xyPoints));
    return axisNum;
  }

  addXYPointsSecondaryY(Yaxis, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    this.chartJson.axisY2 = LineChart.createInstance(Yaxis);
    xyPoints.axisYType = "secondary";
    this.chartJson.data.push(LineChart.createInstance(xyPoints));
  }

  constructor(title, Xaxis, timeUnits) {
    LineChart.timeUnits = timeUnits;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {text: title, padding: 10},
      axisX: Xaxis,
      axisY: [],
      toolTip: {shared: true},
      legend: {cursor: "pointer", itemclick: toggleDataSeries, fontSize: 25},
      height: 600,
      backgroundColor: "#D5F3FE",
      data: [],
    };
  }

  render(containerDiv) {
    chart = new CanvasJS.Chart(containerDiv, this.chartJson);
    chart.render();
  }

  // Set min and max to null to process the entire data
  static #createDatapoints(breathTimes, transitions, min, max) {
    var doFull = (min==null) && (max==null);
    var curValue = 0;
    var curIx = 0;
    var curValue = transitions[0].value; // guaranteed to have at least one entry
    var datapoints = [];
    for (i = 1; i < breathTimes.length; i++) {
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
        datapoints.push(curValue);
      }
    }
    return datapoints;
  }

};
