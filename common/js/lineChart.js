/*
// Author: Sunil Nanda
*/

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct LineChart object
// 2. add X-axis
// 3. add Graph(s)
// 4. Render LineChart object
// //////////////////////////////////////////////////////
class LineChart {

  constructor(title, height, timeUnits, dummyY2) {
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
    this.needDummyY2 = true;
  }

  // returns the Y-axis number for possible reuse
  // or null if no graph created
  // yAxisInfo = {primary:true, reuse:false, yName:"", yMin:1, yMax:null, reuseAxisNum:2}
  // flags = {warning:true, error:false}
  // paramInfo = {name:"", transitions:[], color:""}
  // rangeInfo = {minX:, maxX:}
  addGraph(yAxisInfo, breathTimes, flags, paramInfo, rangeInfo) {
    var paramTransitions = paramInfo.transitions;
    var paramName = paramInfo.name;
    var paramColor = paramInfo.color;
    var minX = rangeInfo.minX;
    var maxX = rangeInfo.maxX;
  
    var xyPoints = this.createXYPoints(breathTimes, paramTransitions, minX, maxX, 
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
  addXaxis(initX, minX, maxX, missingWindows) {
    var Xaxis = {};
    if (this.timeUnits) {
      Xaxis.title = "Elapsed Time (secs)";
    } else {
      Xaxis.title = "Breath Number";
    }
    Xaxis.interlacedColor = CHART_INTERLACED_COLOR;
    Xaxis.fontSize = CHART_FONT_SIZE;
    Xaxis.interval = this.calculateXaxisInterval(minX, maxX);
    Xaxis.minimum = this.calculateXaxisMinimum(initX, minX);
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
  calculateXaxisInterval(minX, maxX) {
    var numPoints = 0;
    if (this.timeUnits) {
      numPoints = (maxX - minX)/1000;
    } else {
      numPoints = maxX - minX + 1;
    }
    var interval = Math.ceil(numPoints/CHART_XAXIS_MAX_TICK_MARKS);
    return interval;
  }


  // if timeUnits, init/min/max are Date else breath numbers
  calculateXaxisMinimum(initX, minX) {
    if (this.timeUnits) {
      return Math.floor(minX - initX)/1000 ;
    } else {
      return minX - initX;
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

  // Set min and max to null to process the entire data
  createXYPoints(breathTimes, transitions, minX, maxX, flagError, flagWarning) {
    if (transitions.length == 0) return null;
    var yDatapoints = [];
    var xyPoints = [];
    var doFull = (minX==null) && (maxX==null);
    var numPoints = 0;
    if (doFull) {
      numPoints = breathTimes.length;
    } else {
      numPoints = maxX - minX + 1;
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
      if (doFull || ((i<=maxX) && (i>=minX))) {
        yDatapoints.push(curValue);
      }
    }
  
    // Attach X datapoints
    var xval;
    var prevXval = -1;
    var ignoreDatapoint = false;
    for (let i = 1; i < numPoints; i++) {
      ignoreDatapoint = false;
      if (this.timeUnits) {
        var ms;
        if (doFull) {
          ms = new Date(breathTimes[i].time) - new Date(breathTimes[1].time);
        } else {
          ms = new Date(breathTimes[i+minX-1].time) - new Date(breathTimes[1].time);
        }
        xval = Math.round(ms / 1000);
	if (xval <= prevXval) ignoreDatapoint = true;
	else prevXval = xval;
      } else {
        if (doFull) {
          xval = i;
        } else {
          xval = i+minX-1;
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
    this.chartJson.data.push({axisYType: "secondary", datapoints:[{x:minX,y:minY}]});
  }
};
