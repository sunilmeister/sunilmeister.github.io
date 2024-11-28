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
  paramName: "",
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
// IMPORTANT!!!!
// Note that BNUM time is the breath starting time
// At that time, the results of the breath are not known
// The results such as Peak, VT etc. are known just before the next breath starts
// Accordingly, the results are shifted left by 1 breath just for charts
// so that the results of a breath show against the breath number
//
// The constructor inputs are
// Title of chart
// Height in pixels
// Whether time based or breathnumber based
// rangeX = {moving:boolean, 
//           minBnum:Number, maxBnum:Number, 
//           minTime:Date, maxTime:Date, }
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
			if (axisX.scaleBreaks) {
				let customBreaks = axisX.scaleBreaks.customBreaks;
				if (!isUndefined(customBreaks) && customBreaks) {
					for (let i=0; i<customBreaks.length; i++) {
						let cb = customBreaks[i];
						cb.lineThickness = session.waves.stripLineThickness;
					}
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
  addGraph(loggedBreaths, yAxisInfo, paramInfo, markerInfo) {

    this.yAxisInfo = yAxisInfo;
    this.paramInfo = paramInfo;
    this.markerInfo = markerInfo;

    let xyPoints = null;
    if (this.paramInfo.graphType == "scatter") {
      if (this.paramInfo.selectVal === null) {
        xyPoints = this.createScatterXYPoints(loggedBreaths);
      } else {
        xyPoints = this.createSpanXYPoints(loggedBreaths);
      }
    } else {
      xyPoints = this.createContinuousXYPoints(loggedBreaths);
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
    if (this.timeUnits) {
      Xaxis.title = "Elapsed Time (H:MM:SS)";
    	Xaxis.labelFormatter = breathTimeXaxisFormatter;
    } else {
      Xaxis.title = "Breath Number";
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize =  session.charts.labelFontSize
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
		this.calculateXaxisCustomBreaks(Xaxis);
    this.chartJson.axisX = Xaxis;
  }

  calculateXaxisCustomBreaks(Xaxis) {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
  	Xaxis.scaleBreaks = {type: "straight", color:"orange"};
		for (let i=minBnum+1; i<=maxBnum; i++) {
			let breath = session.loggedBreaths[i];
			if (isUndefined(breath) || breath.missed) {
				if (this.timeUnits) {
					let prevBreathTime = session.loggedBreaths[i-1].time;
					let newBreathTime = session.loggedBreaths[i].time;
					let startTime = prevBreathTime - session.firstChirpDate;
					let endTime = newBreathTime - session.firstChirpDate;
					let cBreak = {
    				"startValue": (startTime/1000) + 0.5,
    				"endValue": (endTime/1000) - 0.5,
						"lineThickness": session.waves.stripLineThickness,
    				"autoCalculate": true
					}
      		Xaxis.scaleBreaks.customBreaks.push(cloneObject(cBreak));
				} else {
					let cBreak =    {
						"startValue": i + 0.5,
    				"endValue": i + 1.5,
						"lineThickness": session.waves.stripLineThickness,
    				"autoCalculate": true
					}
      		Xaxis.scaleBreaks.customBreaks.push(cloneObject(cBreak));
				}
			}
		}
	}

	calculateXaxisInterval() {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
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
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    if (this.timeUnits) {
      return Math.floor(minTime.getTime() - session.firstChirpDate.getTime()) / 1000;
    } else {
      return minBnum;
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

  createContinuousXYPoints(loggedBreaths) {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let numPoints = maxBnum - minBnum + 1;
		let sparseInterval = session.charts.sparseInterval;

		let paramObj = session.params[this.paramInfo.paramName];
		let yvals = paramObj.Values(minBnum, maxBnum, sparseInterval);
    if (yvals.length == 0) {
      console.log("No transitions for ", this.paramInfo.paramName);
      return null;
    }

		let xval = null;
		let yval = null;
    let xyPoints = [];
		for (let i=0; i<yvals.length; i++) {
			yval = yvals[i];
			let bnum = minBnum + (i * sparseInterval);
			if (isUndefined(session.loggedBreaths[bnum])) continue;
      if (this.timeUnits) {
				let dt = session.loggedBreaths[bnum].time;
				if (dt === null) dt = session.firstChirpDate;
        let ms = new Date(dt.getTime()) - session.firstChirpDate.getTime();
        xval = (ms / 1000);
      } else {
        xval = bnum - 1;
      }

      if (this.paramInfo.snapYval) {
        xyPoints.push({
          "x": xval,
          "y": this.paramInfo.snapYval,
          "toolTipContent": this.paramInfo.name + '# ' + yDatapoints[i],
        });
      } else {
        xyPoints.push({
          "x": xval,
          "y": yval,
        });
      }
		}

    let chartData = {};
    chartData.type = this.paramInfo.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  createScatterXYPoints(loggedBreaths) {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
		let sparseInterval = session.charts.sparseInterval;

		let paramObj = session.params[this.paramInfo.paramName];
    let transitions = paramObj.Changes();

    if (transitions.length == 0) {
      console.log("No transitions for ", this.paramInfo.paramName);
      return null;
    }

    let xyPoints = [];
    let xval, yval;
    let b = minBnum;

    for (let t = 1; t < transitions.length; t++) {
      let cTime = transitions[t].time;
      for (b = minBnum; b <= maxBnum; b+=sparseInterval) {
				if (isUndefined(session.loggedBreaths[b])) continue;
        if (loggedBreaths[b].time.getTime() == cTime.getTime()) {
          yval = transitions[t].value;
          if (this.timeUnits) {
						let dt = session.loggedBreaths[bnum].time;
						if (dt === null) dt = session.firstChirpDate;
        		let ms = new Date(dt.getTime()) - session.firstChirpDate.getTime();
            xval = (ms / 1000);
          } else {
            xval = b - 1;
          }
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

 createSpanXYPoints(loggedBreaths) {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;
    let minTime = this.rangeX.minTime;
    let maxTime = this.rangeX.maxTime;
    let selectVal = this.paramInfo.selectVal;
    let timeSpans = [];

		let paramObj = session.params[this.paramInfo.paramName];
    let transitions = paramObj.Changes();

    if (transitions.length == 0) {
      console.log("No transitions for ", this.paramInfo.paramName);
      return null;
    }

    let xyPoints = [];
    let xval, yval;
    let prevXval = -1;
    let startTime = null;
    let endTime = null;

    for (let t = 1; t < transitions.length; t++) {
      yval = transitions[t].value;
      if (yval == selectVal) {
        if (!startTime) startTime = transitions[t].time;
        if (t==transitions.length-1) endTime = loggedBreaths[loggedBreaths.length-1].time;
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
      for (bnum = minBnum; bnum < maxBnum; bnum+=session.charts.sparseInterval) {
				if (isUndefined(session.loggedBreaths[bnum])) continue;
        if ((loggedBreaths[bnum].time.getTime() >= startTime.getTime()) && (loggedBreaths[bnum].time.getTime() < endTime.getTime())) {
          if (this.timeUnits) {
						let dt = session.loggedBreaths[bnum].time;
						if (dt === null) dt = session.firstChirpDate;
        		let ms = new Date(dt.getTime()) - session.firstChirpDate.getTime();
            xval = (ms / 1000);
          } else {
            xval = bnum - 1;
          }
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
