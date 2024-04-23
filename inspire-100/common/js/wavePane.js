// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// Recommended sequence
// 1. construct BreathWaves object
// 2. add Graph
// 3. Render BreathWaves object
// 
// The constructor inputs are
// Title of chart
// Height in pixels
// rangeX = {rolling:, 
//           initBnum:Number, minBnum:Number, maxBnum:Number, 
//           initTime:Date, minTime:Date, maxTime:Date, 
// //////////////////////////////////////////////////////
function breathWaveXaxisFormatter(e) {
  iPart = Math.floor(e.value);
  if (Number(iPart) != Number(e.value)) return ""
  else return iPart;
}

class WavePane {

  constructor(title, height, rangeX, menu) {
    this.graphType = "splineArea";
    this.rangeX = rangeX;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
      title: {
        text: title,
        padding: 10,
        fontSize: session.waves.titleFontSize
      },
      axisY: [],
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
        fontSize: session.waves.legendFontSize
      },
      height: height,
      backgroundColor: "#D5F3FE",
      data: []
    };
    this.chart = null;
    this.menu = menu;
    this.numSelectedWaves = 0;
    this.data = session.waves.pwData;
    this.isFlowGraph = false;

    this.addXaxis();
  }

  // resize according to latest sessionData
 	resizeFonts() {
		// do for only one graph
    if (this.isFlowGraph) return;

		this.chartJson.legend.fontSize = session.waves.legendFontSize;
		this.chartJson.title.fontSize = session.waves.titleFontSize;
		let axisX = this.chartJson.axisX;
		if (axisX) {
    	axisX.labelFontSize = session.waves.labelFontSize;
			if (axisX.stripLines) {
				for (let i=0; i<axisX.stripLines.length; i++) {
					let stripLine = axisX.stripLines[i];
      		stripLine.labelFontSize = session.waves.stripLineFontSize;
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

	breathSelectedInMenu(breathInfo) {
    let bInfo = parseBreathInfo(breathInfo);
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
    let isExceptional = bInfo.isError || bInfo.Abnormal || bInfo.isMaintenance;

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

  numWavesInRange() {
    let minBnum = session.reportRange.minBnum;
    let maxBnum = session.reportRange.maxBnum;
    let n = 0;
    for (let i = 0; i < this.data.length; i++) {
      let breathNum = this.data[i].systemBreathNum - session.startSystemBreathNum + 1;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      n++;
    }
    return n;
  }

  numSelectedWavesInRange() {
    let minBnum = session.reportRange.minBnum;
    let maxBnum = session.reportRange.maxBnum;
    let n = 0;
    for (let i = 0; i < this.data.length; i++) {
      let breathNum = this.data[i].systemBreathNum - session.startSystemBreathNum + 1;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      let breathInfo = this.data[i].breathInfo;
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
    this.numSelectedWaves = this.numSelectedWavesInRange();
    this.data = session.waves.pwData;
    this.isFlowGraph = false;
    if (this.numSelectedWaves <= WAVE_ALERT_THRESHOLD) {
      this.addGraphNoConfirm();
    } else {
       modalAlert("Too many Breath Waveforms (" + this.numSelectedWaves +")", 
        "Use Range Selector to select " + WAVE_ALERT_THRESHOLD + " or less"
        + "\nto waveforms to display");
    }
  }

  addFlowGraph() {
    this.numSelectedWaves = this.numSelectedWavesInRange();
    this.data = session.waves.flowData;
    this.isFlowGraph = true;
    if (this.numSelectedWaves <= WAVE_ALERT_THRESHOLD) {
      this.addGraphNoConfirm();
    }
  }

  addGraphNoConfirm() {
    let paramName = "Pressure (mm H2O)"
    let paramColor = "blue";
    let axisColor = "black";
    let lineColor = "black";
    let xyPoints = this.createXYPoints();
    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length == 0)) return null;

    if (this.isFlowGraph) {
      paramName = "Flow (ml/sec)"
      axisColor = "black";
      paramColor = "#ECF0F1";
    } else {
      paramName = "Pressure (mmH2O)"
      axisColor = "black";
      paramColor = "#AED6F1";
    }
    let yAxis = this.createYaxis(paramName, axisColor, 0, null);
    return this.addXYPoints(yAxis, paramName, paramColor, xyPoints);
  }

  render(containerDiv) {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
	this.chartJson.animationEnabled = true;
	this.chartJson.animationDuration = 250;
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
    Xaxis.title = "Elapsed Time (secs)";
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
		Xaxis.labelFontSize = session.waves.labelFontSize;
    Xaxis.gridColor = "grey";
    Xaxis.gridThickness = 1;
    Xaxis.labelFormatter = breathWaveXaxisFormatter;
    this.chartJson.axisX = Xaxis;
  }

  getLineColor(breathInfo) {
    let bInfo = parseBreathInfo(breathInfo);

    // The order below matters
    if (bInfo.isError) return 'white';
    if (bInfo.Abnormal) return 'white'
    return 'blue';
  }

  getStripColor(breathInfo) {
    let bInfo = parseBreathInfo(breathInfo);

    // The order below matters
    if (bInfo.isError)
      return palette.Error;

    if (bInfo.Abnormal)
      return palette.Abnormal;

    if (bInfo.isMaintenance) {
      if (bInfo.isMandatory && bInfo.isVC)
        return palette.MandatoryVCMaint;
      if (!bInfo.isMandatory && bInfo.isVC)
        return palette.SpontaneousVCMaint;
      if (!bInfo.isMandatory && !bInfo.isVC)
        return palette.SpontaneousPSMaint;
    } else {
      if (bInfo.isMandatory && bInfo.isVC)
        return palette.MandatoryVC;
      if (!bInfo.isMandatory && bInfo.isVC)
        return palette.SpontaneousVC;
      if (!bInfo.isMandatory && !bInfo.isVC)
        return palette.SpontaneousPS;
    }

    return palette.yellow;
  }

  tooFewDatapoints(sysBreathNum) {
    if (session.waves.tooFewDatapoints.includes(sysBreathNum)) {
      return true;
    }
    return !(
      session.waves.pwRecordedBreaths.includes(sysBreathNum) && 
      session.waves.flowRecordedBreaths.includes(sysBreathNum));
  }

  createYaxis(title, color, minY, maxY) {
    let Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
   	Yaxis.labelFontSize = session.charts.labelFontSize;
    Yaxis.labelFontColor = color;
    Yaxis.titleFontColor = color;
    Yaxis.gridColor = CHART_HORIZONTAL_GRID_COLOR;
    if (minY != null) Yaxis.minimum = minY;
    if (maxY != null) Yaxis.maximum = maxY;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  createXYPoints() {
    let initBnum = this.rangeX.initBnum;
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;

    // init Breaks in the graph
    let Xaxis = this.chartJson.axisX;
    if (!this.isFlowGraph) {
      Xaxis.scaleBreaks = {type: "straight", color:"orange"};
      Xaxis.scaleBreaks.customBreaks = [];
      this.chartJson.axisX.stripLines = [];
    }

    let xyPoints = [];
    let prevXval = 0;

    let partial  = false;
    for (let i = 0; i < this.data.length; i++) {
      let sysBreathNum = this.data[i].systemBreathNum;
      let breathNum = sysBreathNum - session.startSystemBreathNum + 1;
      let sampleInterval = this.data[i].sampleInterval;
      let breathInfo = this.data[i].breathInfo;
      let samples = this.data[i].samples;
      partial = this.data[i].partial;

      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      if (!this.breathSelectedInMenu(breathInfo)) continue;

      if (!session.breathTimes[breathNum]) {
        continue;
      }
      let xval = session.breathTimes[breathNum] - this.rangeX.initTime;
      let initXval = xval;
      xyPoints.push({
        "x": (xval - 200) / 1000,
        "y": null
      });

      let stripLine = {};
      if (!this.isFlowGraph) {
        stripLine.color = this.getStripColor(breathInfo);
        stripLine.startValue = (xval - 200) / 1000;
      }

      let lastY = null;
      let lastX = null;
      for (let j = 0; j < samples.length; j++) {
        if (samples[j] !== null) {
          lastY = samples[j];
          lastX = xval;
          if (partial) {
            xyPoints.push({
              "x": lastX / 1000,
              "y": lastY,
              "lineDashType": "longDashDotDot"
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

      let labelFontColor = "darkgreen";
      let labelText = "#" + breathNum;
      let labelAlign = "near";
      if (this.tooFewDatapoints(sysBreathNum)) {
        //console.log("Too few datapoints #" + sysBreathNum);
        labelFontColor = "red";
        //labelText = "XXXX #" + breathNum;
        labelAlign = "far";
      }
      if (!this.isFlowGraph) {
        // Do strip lines
        stripLine.endValue = (xval) / 1000;
        stripLine.label = labelText;
        stripLine.labelPlacement = "inside";
        stripLine.labelAlign = labelAlign;
        stripLine.labelWrap = true;
        stripLine.labelMaxWidth = 80;
        stripLine.labelFontColor = labelFontColor;
        stripLine.labelBackgroundColor = "none";
        stripLine.labelFontSize = session.waves.stripLineFontSize;
        Xaxis.stripLines.push(cloneObject(stripLine));

        // Do custom scaleBreaks
        // Make sure that the graphs do not connect end-to-end
        Xaxis.scaleBreaks.customBreaks.push({
          startValue: prevXval,
          endValue: stripLine.startValue - 0.1,
					lineThickness: session.waves.stripLineThickness,
        });
        prevXval = stripLine.endValue + 0.1;
      }
    }

    let chartData = {};
    chartData.type = this.graphType;
    chartData.lineColor = "black";
    chartData.markerSize = 0;
    chartData.showInLegend = true;
    chartData.dataPoints = cloneObject(xyPoints);
    return chartData;
  }

  createYaxis(title, color, minY, maxY) {
    let Yaxis = {};
    Yaxis.title = title;
    Yaxis.lineColor = color;
    Yaxis.tickColor = color;
   	Yaxis.labelFontSize = session.charts.labelFontSize;
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
      let axisNum = this.chartJson.axisY.length;
      this.chartJson.axisY.push(cloneObject(Yaxis));
      xyPoints.axisYIndex = axisNum;
      this.chartJson.data.push(cloneObject(xyPoints));
      return axisNum;
    }
  }

  calculateXaxisInterval() {
    return 1.0;
  }


  calculateXaxisMinimum() {
    let initTime = this.rangeX.initTime;
    let minTime = this.rangeX.minTime;
    return (minTime - initTime) / 1000;
  }

};

