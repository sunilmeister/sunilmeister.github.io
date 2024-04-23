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
  selectVal: null,
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
// rangeX = {moving:, 
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
      },
      axisY: [],
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
        fontSize: session.charts.legendFontSize
      },
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };

    this.addXaxis();
  }

  // resize according to latest sessionData
 	resizeFonts() {
		this.chartJson.legend.fontSize = session.charts.legendFontSize;
		this.chartJson.title.fontSize = session.charts.titleFontSize;
		let axisX = this.chartJson.axisX;
		if (axisX) {
    	axisX.labelFontSize = session.charts.labelFontSize;
			if (axisX.stripLines) {
				for (let i=0; i<axisX.stripLines.length; i++) {
					let stripLine = axisX.stripLines[i];
      		stripLine.labelFontSize = session.charts.stripLineFontSize;
				}
			}
			let customBreaks = axisX.scaleBreaks.customBreaks;
			if (customBreaks) {
				for (let i=0; i<axisX.customBreaks.length; i++) {
					let cb = customBreaks[i];
					cb.lineThickness = session.waves.stripLineThickness;
				}
			}
		}

		let axisY = this.chartJson.axisY;
		if (axisY) {
    	axisY.labelFontSize = session.charts.labelFontSize;
		}
		let axisY2 = this.chartJson.axisY2;
		if (axisY2) {
    	axisY2.labelFontSize = session.charts.labelFontSize;
		}
	}

  // returns the Y-axis number for possible reuse
  // or null if no graph created
  addGraph(breathTimes, yAxisInfo, paramInfo, markerInfo) {

    this.yAxisInfo = yAxisInfo;
    this.paramInfo = paramInfo;
    this.markerInfo = markerInfo;

    let xyPoints = null;
    if (this.paramInfo.graphType == "scatter") {
      if (!this.paramInfo.selectVal) {
        xyPoints = this.createScatterXYPoints(breathTimes);
      } else {
        xyPoints = this.createSpanXYPoints(breathTimes);
      }
    } else {
      xyPoints = this.createContinuousXYPoints(breathTimes);
    }

    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length == 0)) return null;

    let yAxis = null;
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
    let Xaxis = {};
    let missingWindows = [];
    if (this.timeUnits) {
      Xaxis.title = "Elapsed Time (secs)";
      missingWindows = this.rangeX.missingTime;
    } else {
      Xaxis.title = "Breath Number";
      missingWindows = this.rangeX.missingBnum;
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize =  session.charts.labelFontSize
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
    if (missingWindows && missingWindows.length) {
      Xaxis.scaleBreaks = {type: "straight", color:"orange"};
      Xaxis.scaleBreaks.customBreaks = cloneObject(missingWindows);
    }
    this.chartJson.axisX = Xaxis;
  }

  calculateXaxisInterval() {
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let numPoints = 0;
    if (this.timeUnits) {
      numPoints = (maxTime - minTime) / 1000;
    } else {
      numPoints = maxBnum - minBnum + 1;
    }
    let interval = Math.ceil(numPoints / CHART_XAXIS_MAX_TICK_MARKS);
    return interval;
  }


  calculateXaxisMinimum() {
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    if (this.timeUnits) {
      return Math.floor(minTime - initTime) / 1000;
    } else {
      return minBnum - initBnum + 1;
    }
  }

  createYaxis() {
    let Yaxis = {};
    Yaxis.title = this.yAxisInfo.yName;
    Yaxis.lineColor = this.yAxisInfo.color;
    Yaxis.tickColor = this.yAxisInfo.color;
   	Yaxis.labelFontSize = session.charts.labelFontSize;
    Yaxis.labelFontColor = this.yAxisInfo.color;
    Yaxis.titleFontColor = this.yAxisInfo.color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (this.yAxisInfo.yMin != null) Yaxis.minimum = this.yAxisInfo.yMin;
    if (this.yAxisInfo.yMax != null) Yaxis.maximum = this.yAxisInfo.yMax;
    if (this.yAxisInfo.yInterval != null) Yaxis.interval = this.yAxisInfo.yInterval;
    Yaxis.suffix = "";
    let y = cloneObject(Yaxis);
    if (this.yAxisInfo.yFormat != null) {
      y.labelFormatter = this.yAxisInfo.yFormat;
    }
    return y;
  }

  createContinuousXYPoints(breathTimes) {
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let transitions = this.paramInfo.transitions;

    if (transitions.length == 0) {
      console.log("No transitions for createContinuousXYPoints");
      return null;
    }
    let yDatapoints = [];
    let xyPoints = [];
    let numPoints = maxBnum - minBnum + 1;

    // Collect Y dapoints
    let curValue = 0;
    let curIx = 0;
    curValue = transitions[0].value; // guaranteed to have at least one entry
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
    let xval;
    let prevXval = -1;
    let ignoreDatapoint = false;
    for (let i = 0; i < numPoints; i++) {
      ignoreDatapoint = false;
      if (this.timeUnits) {
        let ms = new Date(breathTimes[i + minBnum - 1]) - initTime;
        xval = (ms / 1000);
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

    let chartData = {};
    chartData.type = this.paramInfo.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  createScatterXYPoints(breathTimes) {
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let transitions = this.paramInfo.transitions;

    if (transitions.length == 0) {
      console.log("No transitions for createScatterXYPoints");
      return null;
    }

    let xyPoints = [];
    let xval, yval, ignoreDatapoint;
    let prevXval = -1;
    let b = minBnum;

    for (let t = 1; t < transitions.length; t++) {
      let cTime = transitions[t].time;
      for (b = minBnum; b <= maxBnum; b++) {
        if (breathTimes[b] == cTime) {
          yval = transitions[t].value;
          ignoreDatapoint = false;
          if (this.timeUnits) {
            let ms = new Date(breathTimes[b]) - initTime;
            xval = (ms / 1000);
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

    let chartData = {};
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
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let transitions = this.paramInfo.transitions;
    let selectVal = this.paramInfo.selectVal;
    let timeSpans = [];

    if (transitions.length == 0) {
      console.log("No transitions for createSpanXYPoints");
      return null;
    }

    let xyPoints = [];
    let xval, yval, ignoreDatapoint;
    let prevXval = -1;
    let startTime = null;
    let endTime = null;

    for (let t = 1; t < transitions.length; t++) {
      yval = transitions[t].value;
      if (yval == selectVal) {
        if (!startTime) startTime = transitions[t].time;
        if (t==transitions.length-1) endTime = breathTimes[breathTimes.length-1];
      } else if (startTime) {
        endTime = transitions[t].time;
      }
      if (!(startTime && endTime)) continue;
      timeSpans.push({startTime:startTime, endTime:endTime});
      startTime = endTime = null;
    }

    // now we have an array of startTime and endTime for selectVal breaths
    let bnum = minBnum;
    yval = selectVal;
    for (let i = 0; i < timeSpans.length; i++) {
      startTime = timeSpans[i].startTime;
      endTime = timeSpans[i].endTime;
      for (bnum = minBnum; bnum < maxBnum; bnum++) {
        if ((breathTimes[bnum] >= startTime) && (breathTimes[bnum] < endTime)) {
          ignoreDatapoint = false;
          if (this.timeUnits) {
            let ms = new Date(breathTimes[bnum]) - initTime;
            xval = (ms / 1000);
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

    let chartData = {};
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
    let axisNum = this.chartJson.axisY.length;
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
    let axisNum = this.yAxisInfo.reuseAxisNum;
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
    let minX = this.chartJson.axisX.minimum;
    let minY = this.chartJson.axisY[0].minimum;
    let maxY = this.chartJson.axisY[0].maximum;
    let color = this.chartJson.backgroundColor;

    let Y2axis = {};
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
