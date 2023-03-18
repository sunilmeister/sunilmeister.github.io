// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// Template for function arguments
// //////////////////////////////////////////////////////
var markerInfoTemplate = {
  label: null,
  type: null,
  color: null,
  size: 16,
};
var paramInfoTemplate = {
  name: null,
  transitions: [],
  color: null,
  graphType: 'stepLine',
  breathType: null,
  snapYval: null,
};
var yAxisInfoTemplate = {
  primary: true,
  color: null,
  yName: null,
  yMin: null,
  yMax: null,
  yInterval: null,
  yFormat: null,
  reuseAxisNum: null,
};

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct ChartPane object
// 2. add Graph(s)
// 3. Render ChartPane object
// 
// The constructor inputs are
// Title of chart
// Height in pixels
// Whether time based or breathnumber based
// rangeX = {rolling:, 
//           initBnum:Number, minBnum:Number, maxBnum:Number, missingBnum[]:,
//           initTime:Date, minTime:Date, maxTime:Date, missingTime[]:}
// //////////////////////////////////////////////////////
class ChartPane {

  constructor(title, height, timeUnits, rangeX) {
    this.chart = null;
    this.timeUnits = timeUnits;
    this.rangeX = rangeX;
    this.yAxisInfo = null;
    this.paramInfo = null;
    this.markerInfo = null;

    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {
        text: title,
        padding: 10
      },
      axisY: [],
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
        fontSize: session.charts.fontSize
      },
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };

    this.addXaxis();
  }

  // returns the Y-axis number for possible reuse
  // or null if no graph created
  addGraph(breathTimes, yAxisInfo, paramInfo, markerInfo) {

    this.yAxisInfo = yAxisInfo;
    this.paramInfo = paramInfo;
    this.markerInfo = markerInfo;

    var xyPoints;
    if (this.paramInfo.graphType == "scatter") {
      if (!this.paramInfo.breathType) {
        xyPoints = this.createScatterXYPoints(breathTimes);
      } else {
        xyPoints = this.createSpanXYPoints(breathTimes);
      }
    } else {
      xyPoints = this.createContinuousXYPoints(breathTimes);
    }

    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length == 0)) return null;

    var yAxis = null;
    if (yAxisInfo.reuseAxisNum == null) {
      yAxis = this.createYaxis();
      if (yAxisInfo.primary) {
        return this.addXYPointsPrimaryYNew(yAxis, xyPoints);
      } else {
        this.addXYPointsSecondaryYNew(yAxis, xyPoints);
        return null;
      }
    } else {
      if (yAxisInfo.primary) {
        return this.addXYPointsPrimaryYReuse(xyPoints);
      } else {
        this.addXYPointsSecondaryYReuse(xyPoints);
        return null;
      }
    }
    return null;
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

  // X axis is the same for all charts in our application
  addXaxis() {
    var Xaxis = {};
    var missingWindows = [];
    if (this.timeUnits) {
      Xaxis.title = "Elapsed Time (secs)";
      missingWindows = this.rangeX.missingTime;
    } else {
      Xaxis.title = "Breath Number";
      missingWindows = this.rangeX.missingBnum;
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize = CHART_FONT_SIZE;
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
    if (missingWindows && missingWindows.length) {
      Xaxis.scaleBreaks = {};
      Xaxis.scaleBreaks.customBreaks = cloneObject(missingWindows);
    }
    this.chartJson.axisX = Xaxis;
  }

  calculateXaxisInterval() {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    var numPoints = 0;
    if (this.timeUnits) {
      numPoints = (maxTime - minTime) / 1000;
    } else {
      numPoints = maxBnum - minBnum + 1;
    }
    var interval = Math.ceil(numPoints / CHART_XAXIS_MAX_TICK_MARKS);
    return interval;
  }


  calculateXaxisMinimum() {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    if (this.timeUnits) {
      return Math.floor(minTime - initTime) / 1000;
    } else {
      return minBnum - initBnum + 1;
    }
  }

  createYaxis() {
    var Yaxis = {};
    Yaxis.title = this.yAxisInfo.yName;
    Yaxis.lineColor = this.yAxisInfo.color;
    Yaxis.tickColor = this.yAxisInfo.color;
    Yaxis.labelFontColor = this.yAxisInfo.color;
    Yaxis.titleFontColor = this.yAxisInfo.color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (this.yAxisInfo.yMin != null) Yaxis.minimum = this.yAxisInfo.yMin;
    if (this.yAxisInfo.yMax != null) Yaxis.maximum = this.yAxisInfo.yMax;
    if (this.yAxisInfo.yInterval != null) Yaxis.interval = this.yAxisInfo.yInterval;
    Yaxis.suffix = "";
    var y = cloneObject(Yaxis);
    if (this.yAxisInfo.yFormat != null) {
      y.labelFormatter = this.yAxisInfo.yFormat;
    }
    return y;
  }

  createContinuousXYPoints(breathTimes) {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    var transitions = this.paramInfo.transitions;

    if (transitions.length == 0) {
      console.log("No transitions for createContinuousXYPoints");
      return null;
    }
    var yDatapoints = [];
    var xyPoints = [];
    var numPoints = maxBnum - minBnum + 1;

    // Collect Y dapoints
    var curValue = 0;
    var curIx = 0;
    var curValue = transitions[0].value; // guaranteed to have at least one entry
    for (let i = 1; i < breathTimes.length; i++) {
      if (curIx == transitions.length - 1) {
        curValue = transitions[curIx].value;
      } else {
        if (breathTimes[i] >= transitions[curIx + 1].time) {
          curValue = transitions[++curIx].value;
        } else {
          curValue = transitions[curIx].value;
        }
      }
      if ((i <= maxBnum) && (i >= minBnum)) {
        yDatapoints.push(curValue);
      }
    }

    // Attach X dataPoints
    var xval;
    var prevXval = -1;
    var ignoreDatapoint = false;
    for (let i = 0; i < numPoints; i++) {
      ignoreDatapoint = false;
      if (this.timeUnits) {
        var ms = new Date(breathTimes[i + minBnum - 1]) - initTime;
        xval = Math.round(ms / 1000);
        if (xval <= prevXval) ignoreDatapoint = true;
        else prevXval = xval;
      } else {
        xval = i + minBnum - 1;
      }
      if (!ignoreDatapoint) {
        if (this.paramInfo.snapYval) {
          xyPoints.push({
            "x": xval,
            "y": this.paramInfo.snapYval,
            "toolTipContent": this.paramInfo.name + '# ' + yDatapoints[i],
          });
        } else {
          xyPoints.push({
            "x": xval,
            "y": yDatapoints[i],
          });
        }
      }
    }

    var chartData = {};
    chartData.type = this.paramInfo.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  createScatterXYPoints(breathTimes) {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    var transitions = this.paramInfo.transitions;

    if (transitions.length == 0) {
      console.log("No transitions for createScatterXYPoints");
      return null;
    }

    var xyPoints = [];
    var xval, yval, ignoreDatapoint;
    var prevXval = -1;
    var b = minBnum;

    for (let t = 1; t < transitions.length; t++) {
      var cTime = transitions[t].time;
      for (b = minBnum; b <= maxBnum; b++) {
        if (breathTimes[b] == cTime) {
          yval = transitions[t].value;
          ignoreDatapoint = false;
          if (this.timeUnits) {
            var ms = new Date(breathTimes[b]) - initTime;
            xval = Math.round(ms / 1000);
            if (xval <= prevXval) ignoreDatapoint = true;
            else prevXval = xval;
          } else {
            xval = b;
          }
          if (!ignoreDatapoint) {
            if (this.paramInfo.snapYval) {
              xyPoints.push({
                "x": xval,
                "y": this.paramInfo.snapYval,
                "toolTipContent": this.paramInfo.name + '# ' + yval,
              });
            } else {
              xyPoints.push({
                "x": xval,
                "y": yval,
              });
            }
          }
          break;
        }
      }
    }

    var chartData = {};
    chartData.type = this.paramInfo.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    if (this.markerInfo.type) chartData.markerType = this.markerInfo.type;
    if (this.markerInfo.color) chartData.markerColor = this.markerInfo.color;
    if (this.markerInfo.label) chartData.indexLabel = this.markerInfo.label;
    if (this.markerInfo.size) chartData.markerSize = this.markerInfo.size;
    return chartData;
  }

 createSpanXYPoints(breathTimes) {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    var transitions = this.paramInfo.transitions;
    var bType = this.paramInfo.breathType;
    var timeSpans = [];

    if (transitions.length == 0) {
      console.log("No transitions for createSpanXYPoints");
      return null;
    }

    var xyPoints = [];
    var xval, yval, ignoreDatapoint;
    var prevXval = -1;
    var startTime = null;
    var endTime = null;

    for (let t = 1; t < transitions.length; t++) {
      yval = transitions[t].value;
      if (yval == bType) {
        if (!startTime) startTime = transitions[t].time;
        if (t==transitions.length-1) endTime = breathTimes[breathTimes.length-1];
      } else if (startTime) {
        endTime = transitions[t].time;
      }
      if (!(startTime && endTime)) continue;
      timeSpans.push({startTime:startTime, endTime:endTime});
      startTime = endTime = null;
    }

    // now we have an array of startTime and endTime for bType breaths
    var bnum = minBnum;
    yval = bType;
    for (let i = 0; i < timeSpans.length; i++) {
      startTime = timeSpans[i].startTime;
      endTime = timeSpans[i].endTime;
      for (bnum = minBnum; bnum < maxBnum; bnum++) {
        if ((breathTimes[bnum] >= startTime) && (breathTimes[bnum] < endTime)) {
          ignoreDatapoint = false;
          if (this.timeUnits) {
            var ms = new Date(breathTimes[bnum]) - initTime;
            xval = Math.round(ms / 1000);
            if (xval <= prevXval) ignoreDatapoint = true;
            else prevXval = xval;
          } else {
            xval = bnum;
          }
          if (!ignoreDatapoint) {
            if (this.paramInfo.snapYval) {
              xyPoints.push({
                "x": xval,
                "y": this.paramInfo.snapYval,
                "toolTipContent": this.paramInfo.name,
              });
            } else {
              xyPoints.push({
                "x": xval,
                "y": yval,
              });
            }
          }
        }
      }
    }

    var chartData = {};
    chartData.type = this.paramInfo.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    if (this.markerInfo.type) chartData.markerType = this.markerInfo.type;
    if (this.markerInfo.color) chartData.markerColor = this.markerInfo.color;
    if (this.markerInfo.label) chartData.indexLabel = this.markerInfo.label;
    if (this.markerInfo.size) chartData.markerSize = this.markerInfo.size;
    return chartData;
  }

  // return Y-axis number for possible reuse
  addXYPointsPrimaryYNew(Yaxis, xyPoints) {
    var axisNum = this.chartJson.axisY.length;
    xyPoints.name = this.paramInfo.name;
    xyPoints.color = this.paramInfo.color;
    if (this.yAxisInfo.yInterval) {
      Yaxis.interval = this.yAxisInfo.yInterval;
    }
    this.chartJson.axisY.push(Yaxis);
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  // return Y-axis number for possible reuse
  addXYPointsPrimaryYReuse(xyPoints) {
    var axisNum = this.yAxisInfo.reuseAxisNum;
    xyPoints.name = this.paramInfo.name;
    xyPoints.color = this.paramInfo.color;
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  addXYPointsSecondaryYNew(Yaxis, xyPoints) {
    xyPoints.name = this.paramInfo.name;
    xyPoints.color = this.paramInfo.color;
    this.chartJson.axisY2 = Yaxis;
    xyPoints.axisYType = "secondary";
    this.chartJson.data.push(cloneObject(xyPoints));
  }

  addXYPointsSecondaryYReuse(xyPoints) {
    xyPoints.name = this.paramInfo.name;
    xyPoints.color = this.paramInfo.color;
    xyPoints.axisYType = "secondary";
    this.chartJson.data.push(cloneObject(xyPoints));
  }

  addDummyY2axis() {
    var minX = this.chartJson.axisX.minimum;
    var minY = this.chartJson.axisY[0].minimum;
    var maxY = this.chartJson.axisY[0].maximum;
    var color = this.chartJson.backgroundColor;

    var Y2axis = {};
    Y2axis.title = "Dummy";
    Y2axis.lineColor = color;
    Y2axis.tickColor = color;
    Y2axis.labelFontColor = color;
    Y2axis.titleFontColor = color;
    Y2axis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    Y2axis.minimum = minY;
    Y2axis.maximum = maxY;
    Y2axis.suffix = "";
    this.chartJson.axisY2 = cloneObject(Y2axis);
    this.chartJson.data.push({
      axisYType: "secondary",
      dataPoints: [{
        x: minX,
        y: minY
      }]
    });
  }
};
