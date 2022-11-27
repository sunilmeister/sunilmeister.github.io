/* *****************************************************************
   Author: Sunil Nanda
 ***************************************************************** */

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct LineChart object
// 2. add Graph(s)
// 3. Render LineChart object
// 
// The constructor inputs are
// Title of chart
// Height in pixels
// Whether time based or brathnumber based
// Whether a dummy secondary Y-axis is need for alignment
// rangeX = {doFull:, 
//           initBnum:Number, minBnum:Number, maxBnum:Number, missingBnum[]:,
//           initTime:Date, minTime:Date, maxTime:Date, missingTime[]:}
// //////////////////////////////////////////////////////
class LineChart {

  constructor(title, height, timeUnits, rangeX, dummyY2) {
    this.graphType = "stepLine";
    this.timeUnits = timeUnits;
    this.rangeX = rangeX;
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
    this.needDummyY2 = true;
    this.yFormat = null;
    this.yInterval = null;

    this.addXaxis();
  }

  // returns the Y-axis number for possible reuse
  // or null if no graph created
  // yAxisInfo = {primary:true, reuse:false, yName:"", yMin:1, yMax:null, reuseAxisNum:2}
  // flags = {warning:true, error:false}
  // paramInfo = {name:"", transitions:[], color:"", graphType:"stepLine"}
  addGraph(yAxisInfo, breathTimes, flags, paramInfo) {
    var paramTransitions = paramInfo.transitions;
    var paramName = paramInfo.name;
    var paramColor = paramInfo.color;
    if (typeof paramInfo["graphType"] != 'undefined') {
      this.graphType = paramInfo.graphType;
    }
    if (typeof paramInfo["yFormat"] != 'undefined') {
      this.yFormat = paramInfo.yFormat;
    }
    if (typeof paramInfo["yInterval"] != 'undefined') {
      this.yInterval = paramInfo.yInterval;
    }

    var xyPoints = this.createXYPoints(breathTimes, paramTransitions, flags);
    if (!xyPoints) return null;
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
      numPoints = (maxTime - minTime)/1000;
    } else {
      numPoints = maxBnum - minBnum + 1;
    }
    var interval = Math.ceil(numPoints/CHART_XAXIS_MAX_TICK_MARKS);
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
      return Math.floor(minTime - initTime)/1000 ;
    } else {
      return minBnum - initBnum;
    }
  }

  createYaxis(title,color,minY, maxY) {
    var Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (minY!=null) Yaxis.minimum = minY;
    if (maxY!=null) Yaxis.maximum = maxY;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  createXYPoints(breathTimes, transitions, flags) {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    var maxTime = this.rangeX.maxTime;
    var flagWarning = flags.warning;
    var flagError = flags.error;

    if (transitions.length == 0) {
      console.log("No transitions for createXYPoints");
      return null;
    }
    var yDatapoints = [];
    var xyPoints = [];
    var doFull = this.rangeX.doFull;
    var numPoints = 0;
    if (doFull) {
      numPoints = breathTimes.length;
    } else {
      numPoints = maxBnum - minBnum + 1;
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
      if (doFull || ((i<=maxBnum) && (i>=minBnum))) {
        yDatapoints.push(curValue);
      }
    }
  
    // Attach X dataPoints
    var xval;
    var prevXval = -1;
    var ignoreDatapoint = false;
    for (let i = 1; i < numPoints; i++) {
      ignoreDatapoint = false;
      if (this.timeUnits) {
        var ms;
        if (doFull) {
          ms = new Date(breathTimes[i].time) - initTime;
        } else {
          ms = new Date(breathTimes[i+minBnum-1].time) - initTime;
        }
        xval = Math.round(ms / 1000);
	if (xval <= prevXval) ignoreDatapoint = true;
	else prevXval = xval;
      } else {
        if (doFull) {
          xval = i;
        } else {
          xval = i+minBnum-1;
        }
      }
      if (!flagError && !flagWarning) {
        if (!ignoreDatapoint) {
          xyPoints.push({
            "x": xval,
            "y": yDatapoints[i]
          });
	}
      } else {
        if (!ignoreDatapoint) {
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
    }
    var noLegend = false;
    if (flagError || flagWarning) noLegend = true;
  
    var chartData = {};
    chartData.type = this.graphType;
    chartData.showInLegend = !noLegend;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  // return Y-axis number for possible reuse
  addXYPointsPrimaryYNew(Yaxis, name, color, xyPoints) {
    var axisNum = this.chartJson.axisY.length;
    xyPoints.name = name;
    xyPoints.color = color;
    if (this.yInterval) {
      Yaxis.interval = this.yInterval;
    }
    this.chartJson.axisY.push(cloneObject(Yaxis));
    if (this.yFormat) {
      this.chartJson.axisY[axisNum].labelFormatter = this.yFormat;
    }
    if (this.needDummyY2) {
      this.needDummyY2 = false;
      this.addDummyY2axis();
    }
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
    this.chartJson.data.push({axisYType: "secondary", dataPoints:[{x:minX,y:minY}]});
  }
};
