// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct BreathShapes object
// 2. add Graph
// 3. Render BreathShapes object
// 
// The constructor inputs are
// Title of chart
// Height in pixels
// rangeX = {rolling:, 
//           initBnum:Number, minBnum:Number, maxBnum:Number, 
//           initTime:Date, minTime:Date, maxTime:Date, 
// //////////////////////////////////////////////////////
function breathShapeXaxisFormatter(e) {
  iPart = Math.floor(e.value);
  if (Number(iPart) != Number(e.value)) return ""
  else return iPart;
}

class ShapePane {

  constructor(title, height, rangeX, menu) {
    this.graphType = "spline";
    this.rangeX = rangeX;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {
        text: title,
        padding: 10,
        fontSize: session.shapes.titleFontSize
      },
      axisY: [],
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
        fontSize: session.shapes.legendFontSize
      },
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };
    this.chart = null;
    this.menu = menu;
    this.numSelectedShapes = 0;
    this.data = session.shapes.pwData;
    this.isFlowGraph = false;

    this.addXaxis();
  }

  breathSelectedInMenu(breathInfo) {
    var bInfo = parseBreathInfo(breathInfo);
    //console.log(bInfo);
    // Order below is important
    if (this.menu.ErrorB) {
      if (bInfo.isError) return true;
    }
    if (this.menu.AbnormalB) {
      if (bInfo.Abnormal) return true;
    }
    if (this.menu.MaintenanceB) {
      if (bInfo.isMaintenance) return true;
    }

    // Exceptional Breaths taken care of above
    var isExceptional = bInfo.isError || bInfo.Abnormal || bInfo.isMaintenance;

    if (this.menu.MandatoryVC) {
      if (bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
    }
    if (this.menu.SpontaneousVC) {
      if (!bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
    }
    if (this.menu.SpontaneousPS) {
      if (!bInfo.isMandatory && !bInfo.isVC && !isExceptional) return true;
    }
    return false;
  }

  numShapesInRange() {
    var minBnum = session.reportRange.minBnum;
    var maxBnum = session.reportRange.maxBnum;
    var n = 0;
    for (let i = 0; i < this.data.length; i++) {
      var breathNum = this.data[i].systemBreathNum - session.startSystemBreathNum + 1;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      n++;
    }
    return n;
  }

  numSelectedShapesInRange() {
    var minBnum = session.reportRange.minBnum;
    var maxBnum = session.reportRange.maxBnum;
    var n = 0;
    for (let i = 0; i < this.data.length; i++) {
      var breathNum = this.data[i].systemBreathNum - session.startSystemBreathNum + 1;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      var breathInfo = this.data[i].breathInfo;
      if (!this.breathSelectedInMenu(breathInfo)) continue;
      n++;
    }
    return n;
  }


  addGraph() {
    this.addPressureGraph();
    this.addFlowGraph();
  }

  addPressureGraph() {
    this.numSelectedShapes = this.numSelectedShapesInRange();
    this.data = session.shapes.pwData;
    this.isFlowGraph = false;
    if (this.numSelectedShapes <= session.shapes.confirmThreshold) {
      this.addGraphNoConfirm();
    } else {
       modalConfirm("Too many Breath Shapes", 
        "It may take time to render " + this.numSelectedShapes + " shapes\n" +
        "Range Selector can be used to limit the number", 
        this.addGraphNoConfirm.bind(this), null, null, "UPDATE", "DO NOT UPDATE");    }
  }

  addFlowGraph() {
    this.numSelectedShapes = this.numSelectedShapesInRange();
    this.data = session.shapes.flowData;
    this.isFlowGraph = true;
    if (this.numSelectedShapes <= session.shapes.confirmThreshold) {
      this.addGraphNoConfirm();
    } else {
       modalConfirm("Too many Breath Shapes", 
        "It may take time to render " + this.numSelectedShapes + " shapes\n" +
        "Range Selector can be used to limit the number", 
        this.addGraphNoConfirm.bind(this), null, null, "UPDATE", "DO NOT UPDATE");    }
  }

  addGraphNoConfirm() {
    // update the threshold
    if (this.numSelectedShapes >  session.shapes.confirmThreshold) {
       session.shapes.confirmThreshold = this.numSelectedShapes + SHAPE_CONFIRM_INCREMENT;
    }
    var paramName = "Pressure (mm H2O)"
    var paramColor = "blue";
    var xyPoints = this.createXYPoints();
    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length == 0)) return null;

    if (this.isFlowGraph) {
      paramName = "Flow (ml/sec)"
      paramColor = "magenta";
    } else {
      paramName = "Pressure (mmH2O)"
      paramColor = "blue";
    }
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
    Xaxis.gridColor = "grey";
    Xaxis.gridThickness = 1;
    Xaxis.labelFontSize = session.shapes.labelFontSize;
    Xaxis.labelFormatter = breathShapeXaxisFormatter;
    this.chartJson.axisX = Xaxis;
  }

  getLineColor(breathInfo) {
    var style = getComputedStyle(document.body)
    var bInfo = parseBreathInfo(breathInfo);

    // The order below matters
    if (bInfo.isError) return 'white';
    if (bInfo.Abnormal) return 'white'
    return 'blue';
  }

  getStripColor(breathInfo) {
    var style = getComputedStyle(document.body)
    var bInfo = parseBreathInfo(breathInfo);

    // The order below matters
    if (bInfo.isError)
      return style.getPropertyValue('--colorError');

    if (bInfo.Abnormal)
      return style.getPropertyValue('--colorAbnormal');

    if (bInfo.isMaintenance)
      return style.getPropertyValue('--colorMaintenance');

    if (bInfo.isMandatory && bInfo.isVC)
      return style.getPropertyValue('--colorMandatoryVC');
    if (!bInfo.isMandatory && bInfo.isVC)
      return style.getPropertyValue('--colorSpontaneousVC');
    if (!bInfo.isMandatory && !bInfo.isVC)
      return style.getPropertyValue('--colorSpontaneousPS');

    return style.getPropertyValue('--rsp_yellow');;
  }

  createYaxis(title, color, minY, maxY) {
    var Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (minY != null) Yaxis.minimum = minY;
    if (maxY != null) Yaxis.maximum = maxY;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  createXYPoints() {
    var initBnum = this.rangeX.initBnum;
    var minBnum = this.rangeX.minBnum;
    var maxBnum = this.rangeX.maxBnum;

    // init Breaks in the graph
    var Xaxis = this.chartJson.axisX;
    if (!this.isFlowGraph) {
      Xaxis.scaleBreaks = {};
      Xaxis.scaleBreaks.customBreaks = [];
      this.chartJson.axisX.stripLines = [];
    }

    var xyPoints = [];
    var prevXval = 0;

    var partial  = false;
    for (let i = 0; i < this.data.length; i++) {
      var breathNum = this.data[i].systemBreathNum - session.startSystemBreathNum + 1;
      var sampleInterval = this.data[i].sampleInterval;
      var breathInfo = this.data[i].breathInfo;
      var samples = this.data[i].samples;
      partial = this.data[i].partial;

      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      if (!this.breathSelectedInMenu(breathInfo)) continue;

      if (!session.breathTimes[breathNum]) {
        continue;
      }
      var xval = session.breathTimes[breathNum] - this.rangeX.initTime;
      var initXval = xval;
      xyPoints.push({
        "x": (xval - 200) / 1000,
        "y": null
      });

      var stripLine = {};
      if (!this.isFlowGraph) {
        stripLine.color = this.getStripColor(breathInfo);
        stripLine.startValue = (xval - 200) / 1000;
      }

      var lastY = null;
      var lastX = null;
      for (let j = 0; j < samples.length; j++) {
        if (samples[j] !== null) {
          lastY = samples[j];
          lastX = xval;
          if (partial) {
            xyPoints.push({
              "x": lastX / 1000,
              "y": lastY,
              "lineDashType": "dashDot"
            });
          } else {
            xyPoints.push({
              "x": lastX / 1000,
              "y": lastY
            });
          }
        }
        xval += sampleInterval;
      }
      if (this.isFlowGraph) {
        xyPoints.push({
          "x": (lastX + sampleInterval) / 1000,
          "y": 0
        });
      }

      if (!this.isFlowGraph) {
        // Do strip lines
        stripLine.endValue = (xval) / 1000;
        //stripLine.label = prefix + "Breath #" + breathNum;
        stripLine.label = "Breath #" + breathNum;
        stripLine.labelPlacement = "inside";
        stripLine.labelAlign = "near";
        stripLine.labelWrap = true;
        stripLine.labelMaxWidth = 80;
        stripLine.labelFontColor = "grey";
        stripLine.labelFontSize = session.shapes.stripLineFontSize;
        Xaxis.stripLines.push(cloneObject(stripLine));

        // Do custom scaleBreaks
        // Make sure that the graphs do not connect end-to-end
        Xaxis.scaleBreaks.customBreaks.push({
          startValue: prevXval,
          endValue: stripLine.startValue - 0.1,
          color: "orange",
          type: "zigzag"
        });
        prevXval = stripLine.endValue + 0.1;
      }
    }

    var chartData = {};
    chartData.type = this.graphType;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  createYaxis(title, color, minY, maxY) {
    var Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (minY != null) Yaxis.minimum = minY;
    if (maxY != null) Yaxis.maximum = maxY;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  addXYPoints(Yaxis, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    if (this.isFlowGraph) {
      this.chartJson.axisY2 = cloneObject(Yaxis);
      xyPoints.axisYType = "secondary";
      this.chartJson.data.push(cloneObject(xyPoints));
      return 0;
    } else {
      var axisNum = this.chartJson.axisY.length;
      this.chartJson.axisY.push(cloneObject(Yaxis));
      xyPoints.axisYIndex = axisNum;
      this.chartJson.data.push(cloneObject(xyPoints));
      return axisNum;
    }
  }

  calculateXaxisInterval() {
    return 0.2;
  }


  calculateXaxisMinimum() {
    var initTime = this.rangeX.initTime;
    var minTime = this.rangeX.minTime;
    return (minTime - initTime) / 1000;
  }

};

