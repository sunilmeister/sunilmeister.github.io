// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct BreathPressureGraph object
// 2. add Graph
// 3. Render BreathPressureGraph object
// 
// The constructor inputs are
// Title of chart
// Height in pixels
// rangeX = {doFull:, 
//           initBnum:Number, minBnum:Number, maxBnum:Number, 
//           initTime:Date, minTime:Date, maxTime:Date, 
// //////////////////////////////////////////////////////
class BreathPressureGraph {

  constructor(title, height, rangeX) {
    this.graphType = "spline";
    this.rangeX = rangeX;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {text: title, padding: 10},
      axisY: [],
      toolTip: {shared: true},
      legend: {cursor: "pointer", itemclick: toggleDataSeries, fontSize: app.chartFontSize},
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };
    this.chart = null;

    this.addXaxis();
  }

  addGraph() {
    var paramName = "Pressure (mm H2O)"
    var paramColor = "blue";
    var xyPoints = this.createXYPoints();
    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length==0)) return null;
  
    var yAxis = this.createYaxis(paramName, paramColor, 0, null);
    return this.addXYPoints(yAxis, paramName, paramColor, xyPoints);
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
    Xaxis.title = "Elapsed Time (secs)";
    Xaxis.fontSize = CHART_FONT_SIZE;
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
    Xaxis.gridColor = "black";
    Xaxis.gridThickness = 1;
    this.chartJson.axisX = Xaxis;
    this.stripColors = [
      "#B3B6B7",
      "#FCF3CF",
      "#D5F5E3",
      "#D4E6F1"
    ];
    this.colorIndex = 0;
  }
 
  getNextStripColor() {
    var color = this.stripColors[this.colorIndex++];
    if (this.colorIndex==this.stripColors.length-1) this.colorIndex = 0;
    return color;
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

  createXYPoints() {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;
    var doFull = this.rangeX.doFull;

    // init Breaks in the graph
    var Xaxis = this.chartJson.axisX;
    Xaxis.scaleBreaks = {};
    Xaxis.scaleBreaks.customBreaks = [];

    var xyPoints = [];
    var prevXval = 0;
    this.chartJson.axisX.stripLines = [];

    for (i=0; i<app.pwData.length; i++) {
      var breathNum = app.pwData[i].systemBreathNum - app.startSystemBreathNum +1;
      var sampleInterval = app.pwData[i].sampleInterval;
      var samples = app.pwData[i].samples;

      if (!doFull) {
	if (breathNum<minBnum) continue;
	if (breathNum>maxBnum) break;
      }

      var xval = session.breathTimes[breathNum].time - this.rangeX.initTime;
      Xaxis.scaleBreaks.customBreaks.push({
	startValue: (prevXval+100)/1000,
        endValue: (xval-100)/1000,
        color: "orange",
        type: "zigzag"
      });

      // Make sure that the graphs do not connect end-to-end
      xyPoints.push({
        "x": (xval-200)/1000,
        "y": null
      });
      var stripLine = {};
      stripLine.color = this.getNextStripColor();
      stripLine.startValue = (xval-200)/1000;

      for (j=0; j<samples.length; j++) {
        xyPoints.push({
          "x": xval/1000,
          "y": samples[j]
        });
	xval += sampleInterval;
      }
      prevXval = xval;
      stripLine.endValue = (xval)/1000;
      this.chartJson.axisX.stripLines.push(cloneObject(stripLine));

      stripLine = {};
      stripLine.label = "Breath# " + breathNum;
      stripLine.value = xval/1000;
      stripLine.labelAngle = "0";
      stripLine.labelPlacement = "inside";
      stripLine.labelFontColor = "black";
      stripLine.labelFontSize = "50px";
      this.chartJson.axisX.stripLines.push(cloneObject(stripLine));
    }


    var chartData = {};
    chartData.type = this.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
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

  addXYPoints(Yaxis, name, color, xyPoints) {
    var axisNum = this.chartJson.axisY.length;
    xyPoints.name = name;
    xyPoints.color = color;
    this.chartJson.axisY.push(cloneObject(Yaxis));
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  calculateXaxisInterval() {
    return 0.2;
  }


  calculateXaxisMinimum() {
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    return (minTime - initTime)/1000 ;
  }


};
