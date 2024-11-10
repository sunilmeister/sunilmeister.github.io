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
// rangeX = {moving:, 
//           minBnum:Number, maxBnum:Number, 
//           minTime:Date, maxTime:Date, 
// //////////////////////////////////////////////////////
class WavePane {
  constructor(title, height, rangeX, menu, paramName, paramColor, data, isFlowGraph) {
    this.title = title;
    this.graphType = "splineArea";
    this.rangeX = rangeX;
    this.chartJson = {
      zoomEnabled: true,
      zoomType: "x",
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
    this.paramName = paramName;
    this.paramColor = paramColor;
    this.data = data;
    this.isFlowGraph = isFlowGraph;

    this.addXaxis();
  }

  // resize according to latest sessionData
 	resizeFonts() {
		this.chartJson.legend.fontSize = session.waves.legendFontSize;
		if (this.chartJson.title) {
			this.chartJson.title.fontSize = session.waves.titleFontSize;
		}
		let axisX = this.chartJson.axisX;
		if (axisX) {
    	axisX.labelFontSize = session.waves.labelFontSize;
			if (axisX.stripLines) {
				for (let i=0; i<axisX.stripLines.length; i++) {
					let stripLine = axisX.stripLines[i];
      		stripLine.labelFontSize = session.waves.stripLineFontSize;
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
    let minBnum = session.waves.range.minBnum;
    let maxBnum = session.waves.range.maxBnum;
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
    let minBnum = session.waves.range.minBnum;
    let maxBnum = session.waves.range.maxBnum;
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
    this.numSelectedWaves = this.numSelectedWavesInRange();
    if (this.numSelectedWaves <= WAVE_ALERT_THRESHOLD) {
      this.addGraphNoConfirm();
    } else {
       modalAlert("Too many Breath Waveforms (" + this.numSelectedWaves +")", 
        "Use Range Selector to select " + WAVE_ALERT_THRESHOLD + " or less"
        + "\nto waveforms to display");
    }
  }

  addGraphNoConfirm() {
    let paramName = this.paramName;
    let paramColor = this.paramColor;
    let axisColor = "black";
    let lineColor = "black";
    let xyPoints = this.createXYPoints();
    if (!xyPoints) return null;
    if (!xyPoints.dataPoints || (xyPoints.dataPoints.length == 0)) return null;

    let yAxis = this.createYaxis(paramName, axisColor, 0, null);
    return this.addXYPoints(yAxis, paramName, paramColor, xyPoints);
  }

  render(containerDiv) {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (!this.isFlowGraph) {
      this.chartJson.title = {
        text: this.title,
        padding: 10,
        fontSize: session.waves.titleFontSize
      };
		} else {
      this.chartJson.title= null;
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
    if (this.isFlowGraph) {
    	Xaxis.title = "Elapsed Time (H:MM:SS)";
		}
    Xaxis.interval = this.calculateXaxisInterval();
    Xaxis.minimum = this.calculateXaxisMinimum();
		Xaxis.labelFontSize = session.waves.labelFontSize;
    Xaxis.gridColor = "grey";
    Xaxis.gridThickness = 1;
    Xaxis.labelFormatter = breathTimeXaxisFormatter;
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
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;

    // init Breaks in the graph
    let Xaxis = this.chartJson.axisX;
    Xaxis.scaleBreaks = {type: "straight", color:"orange"};
    Xaxis.scaleBreaks.customBreaks = [];
    this.chartJson.axisX.stripLines = [];

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

      if (breathNum < 0) continue;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      if (!this.breathSelectedInMenu(breathInfo)) continue;

			let breath = session.loggedBreaths[breathNum];
			if (isUndefined(breath)) {
				console.error("sysBreathNum",sysBreathNum);
				console.error("session.startSystemBreathNum",session.startSystemBreathNum);
				console.error("breathNum",breathNum);
				console.error("loggedBreaths",session.loggedBreaths);
			}
      let xval = breath.time.getTime() - session.firstChirpDate.getTime();
      let initXval = xval;
      xyPoints.push({
        "x": (xval - 200) / 1000,
        "y": null
      });

      let stripLine = {};
      stripLine.color = this.getStripColor(breathInfo);
      stripLine.startValue = (xval - 200) / 1000;

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
			/*
      if (this.isFlowGraph) {
        xyPoints.push({
          "x": (lastX + sampleInterval) / 1000,
          "y": 0
        });
      }
			*/

      let labelFontColor = "darkgreen";
      let labelText = "#" + breathNum;
      let labelAlign = "far";
      if (this.tooFewDatapoints(sysBreathNum)) {
        //console.log("Too few datapoints #" + sysBreathNum);
        labelFontColor = "red";
        //labelText = "XXXX #" + breathNum;
      }

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

    let chartData = {};
    chartData.type = this.graphType;
    chartData.showInLegend = false;
    chartData.lineColor = "black";
    chartData.markerSize = 0;
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
    //if (minY != null) Yaxis.minimum = minY;
    //if (maxY != null) Yaxis.maximum = maxY;
    Yaxis.suffix = "";
    return cloneObject(Yaxis);
  }

  addXYPoints(Yaxis, name, color, xyPoints) {
    xyPoints.name = name;
    xyPoints.color = color;
    let axisNum = this.chartJson.axisY.length;
    this.chartJson.axisY.push(cloneObject(Yaxis));
    xyPoints.axisYIndex = axisNum;
    this.chartJson.data.push(cloneObject(xyPoints));
    return axisNum;
  }

  calculateXaxisInterval() {
    return 1.0;
  }


  calculateXaxisMinimum() {
		/*
    let minTime = this.rangeX.minTime;
    return (minTime.getTime() - session.firstChirpDate.getTime()) / 1000;
		*/
		return null; // auto mode
  }

};

