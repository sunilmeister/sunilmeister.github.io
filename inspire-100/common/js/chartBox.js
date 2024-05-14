// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// Special function for Y-axis of markers
function markerFormatter(e) {
  if (e.value == SPONTANEOUS_BREATH) return 'S';
  if (e.value == MANDATORY_BREATH) return 'M';
  if (e.value == MAINTENANCE_BREATH) return 'X';
  if (e.value == NOTIFICATION_YVAL) return 'N';
  if (e.value == WARNING_YVAL) return 'W';
  if (e.value == ERROR_YVAL) return 'E';
  if (e.value == VOLUME_CONTROL_YVAL) return 'V';
  if (e.value == PRESSURE_SUPPORT_YVAL) return 'P';
  return '';
}

class ChartBox {
  // containerBodyDiv is an HTML object
  constructor(containerBodyDiv) {
    this.containerBodyDiv = containerBodyDiv;
    this.options = {};
    this.chart = null;
    this.rangeX = null;
  }

	// Resize according to latest sessionData
	resizeFonts() {
		if (this.chart) this.chart.resizeFonts();
	}

  // rangeX = {moving:, 
  //           initBnum:Number, minBnum:Number, maxBnum:Number, missingBnum[]:,
  //           initTime:Date, minTime:Date, maxTime:Date, missingTime[]:}
  render() {
    this.cleanupCharts();
    if (!session.reportRange) {
      this.rangeX = null;
      return; 
    }

 		let container = findAncestorNodeByClassName(this.containerBodyDiv, CHART_CONTAINER_CLASS);
 		let txt = findChildNodeByClass(container, CHART_BANNER_TEXT_CLASS);
		if (session.charts.sparseInterval > 1) {
			txt.innerHTML = "Plotted with interval of " + session.charts.sparseInterval + " breaths";
		} else {
			txt.innerHTML = "";
		}

    this.rangeX = session.reportRange;
    this.createChart();
    if (this.chart) this.chart.render(this.containerBodyDiv);
  }

  clearMenu(menuId) {
    if (!document.getElementById(menuId)) return;
    document.getElementById("Peak").checked = false;
    document.getElementById("Plat").checked = false;
    document.getElementById("PEEP").checked = false;
    document.getElementById("Tidal").checked = false;
    document.getElementById("MinuteTotal").checked = false;
    document.getElementById("MinuteSpont").checked = false;
    document.getElementById("MinuteMand").checked = false;
    document.getElementById("Mandatory").checked = false;
    document.getElementById("Spontaneous").checked = false;
    document.getElementById("MBreath").checked = false;
    document.getElementById("SBreath").checked = false;
    document.getElementById("EBreath").checked = false;
    document.getElementById("VCBreath").checked = false;
    document.getElementById("PSBreath").checked = false;
    document.getElementById("Static").checked = false;
    document.getElementById("Dynamic").checked = false;
    document.getElementById("FiO2").checked = false;
    document.getElementById("O2Flow").checked = false;
    document.getElementById("O2Purity").checked = false;
    document.getElementById("Errors").checked = false;
    document.getElementById("Warnings").checked = false;
    document.getElementById("Notifications").checked = false;
    document.getElementById("Temperature").checked = false;

    document.getElementById("ChartTitleId").value = "";
    document.getElementById("chartTIME").checked = false;
    document.getElementById("chartBNUM").checked = true;
	}

  // Update the HTML dropdown menu using stored options
  updateMenu(menuId) {
		this.clearMenu(menuId);

    if (Object.keys(this.options).length == 0) return;
    if (!document.getElementById(menuId)) return;
    document.getElementById("Peak").checked = this.options["Peak"];
    document.getElementById("Plat").checked = this.options["Plat"];
    document.getElementById("PEEP").checked = this.options["PEEP"];
    document.getElementById("Tidal").checked = this.options["Tidal"];
    document.getElementById("MinuteTotal").checked = this.options["MinuteTotal"];
    document.getElementById("MinuteSpont").checked = this.options["MinuteSpont"];
    document.getElementById("MinuteMand").checked = this.options["MinuteMand"];
    document.getElementById("Mandatory").checked = this.options["Mandatory"];
    document.getElementById("Spontaneous").checked = this.options["Spontaneous"];
    document.getElementById("MBreath").checked = this.options["MBreath"];
    document.getElementById("SBreath").checked = this.options["SBreath"];
    document.getElementById("EBreath").checked = this.options["EBreath"];
    document.getElementById("VCBreath").checked = this.options["VCBreath"];
    document.getElementById("PSBreath").checked = this.options["PSBreath"];
    document.getElementById("Static").checked = this.options["Static"];
    document.getElementById("Dynamic").checked = this.options["Dynamic"];
    document.getElementById("FiO2").checked = this.options["FiO2"];
    document.getElementById("O2Flow").checked = this.options["O2Flow"];
    document.getElementById("O2Purity").checked = this.options["O2Purity"];
    document.getElementById("Errors").checked = this.options["Errors"];
    document.getElementById("Warnings").checked = this.options["Warnings"];
    document.getElementById("Notifications").checked = this.options["Notifications"];
    document.getElementById("Temperature").checked = this.options["Temperature"];

    document.getElementById("ChartTitleId").value = this.options["title"];
    this.setXunitsValue();
  }

  // Update stored options from the HTML dropdown menu
  updateOptions(menuId) {
    if (!document.getElementById(menuId)) return;

    this.options["Peak"] = document.getElementById("Peak").checked;
    this.options["Plat"] = document.getElementById("Plat").checked;
    this.options["PEEP"] = document.getElementById("PEEP").checked;
    this.options["Tidal"] = document.getElementById("Tidal").checked;
    this.options["MinuteTotal"] = document.getElementById("MinuteTotal").checked;
    this.options["MinuteSpont"] = document.getElementById("MinuteSpont").checked;
    this.options["MinuteMand"] = document.getElementById("MinuteMand").checked;
    this.options["Mandatory"] = document.getElementById("Mandatory").checked;
    this.options["Spontaneous"] = document.getElementById("Spontaneous").checked;
    this.options["MBreath"] = document.getElementById("MBreath").checked;
    this.options["SBreath"] = document.getElementById("SBreath").checked;
    this.options["EBreath"] = document.getElementById("EBreath").checked;
    this.options["VCBreath"] = document.getElementById("VCBreath").checked;
    this.options["PSBreath"] = document.getElementById("PSBreath").checked;
    this.options["Static"] = document.getElementById("Static").checked;
    this.options["Dynamic"] = document.getElementById("Dynamic").checked;
    this.options["FiO2"] = document.getElementById("FiO2").checked;
    this.options["O2Flow"] = document.getElementById("O2Flow").checked;
    this.options["O2Purity"] = document.getElementById("O2Purity").checked;
    this.options["Errors"] = document.getElementById("Errors").checked;
    this.options["Warnings"] = document.getElementById("Warnings").checked;
    this.options["Notifications"] = document.getElementById("Notifications").checked;
    this.options["Temperature"] = document.getElementById("Temperature").checked;

    this.options["title"] = document.getElementById("ChartTitleId").value;
    this.options["timeUnits"] = (this.getXunitsValue() == "chartTIME");
  }

  ////////////////////////////////////////////////////////
  // Below are all private methods
  ////////////////////////////////////////////////////////
  getXunitsValue() {
    let elem = document.getElementById("chartTIME");
    if (elem.checked) return "chartTIME";
    else return "chartBNUM";
  }

  setXunitsValue() {
    if (this.options.timeUnits) {
      let r = document.getElementById("chartTIME");
      r.checked = true;
    } else {
      let r = document.getElementById("chartBNUM");
      r.checked = true;
    }
  }

  cleanupCharts() {
    if (this.chart) {
      this.chart.destroy();
      delete this.chart;
      this.chart = null;
    }
  }

  createChart() {
    this.chart = new ChartPane(
      this.options.title,
      this.containerBodyDiv.offsetHeight,
      this.options.timeUnits,
      this.rangeX
    );
    this.createIndividualGraphs();
  }

  createIndividualGraphs() {
    let pressureAxisNum = null;
    pressureAxisNum = this.createPeakGraph(pressureAxisNum);
    pressureAxisNum = this.createPlatGraph(pressureAxisNum);
    pressureAxisNum = this.createPeepGraph(pressureAxisNum);

    let vtAxisNum = null;
    vtAxisNum = this.createVtdelGraph(vtAxisNum);

    let mvAxisNum = null;
    mvAxisNum = this.createMvdelGraph(mvAxisNum);
    mvAxisNum = this.createMMvdelGraph(mvAxisNum);
    mvAxisNum = this.createSMvdelGraph(mvAxisNum);
    mvAxisNum = this.createO2FlowGraph(mvAxisNum);

    let bpmAxisNum = null;
    bpmAxisNum = this.createSbpmGraph(bpmAxisNum);
    bpmAxisNum = this.createMbpmGraph(bpmAxisNum);

    let markerAxisNum = null;
    markerAxisNum = this.createMBreathGraph(markerAxisNum);
    markerAxisNum = this.createSBreathGraph(markerAxisNum);
    markerAxisNum = this.createEBreathGraph(markerAxisNum);
    markerAxisNum = this.createVCBreathGraph(markerAxisNum);
    markerAxisNum = this.createPSBreathGraph(markerAxisNum);
    markerAxisNum = this.createErrorGraph(markerAxisNum);
    markerAxisNum = this.createWarningGraph(markerAxisNum);
    markerAxisNum = this.createNotificationGraph(markerAxisNum);

    let compAxisNum = null;
    compAxisNum = this.createScompGraph(compAxisNum);
    compAxisNum = this.createDcompGraph(compAxisNum);

    let tempAxisNum = null;
    tempAxisNum = this.createTempGraph(tempAxisNum);

    let pctAxisNum = null;
    pctAxisNum = this.createPurityGraph(pctAxisNum);
    pctAxisNum = this.createFiO2Graph(pctAxisNum);
  }

  createPeakGraph(reuseAxisNum) {
    if (!this.options.Peak) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "red";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Peak Pressure (cm H20)";
    paramInfo.color = "red";
    paramInfo.paramName = "peak";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPlatGraph(reuseAxisNum) {
    if (!this.options.Plat) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "silver";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Plateau Pressure (cm H20)";
    paramInfo.color = "silver";
    paramInfo.paramName = "plat";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPeepGraph(reuseAxisNum) {
    if (!this.options.PEEP) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Peep Pressure (cm H20)";
    paramInfo.color = "green";
    paramInfo.paramName = "mpeep";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createVtdelGraph(reuseAxisNum) {
    if (!this.options.Tidal) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "purple";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Volume (ml)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Tidal Volume (ml)";
    paramInfo.color = "purple";
    paramInfo.paramName = "vtdel";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMvdelGraph(reuseAxisNum) {
    if (!this.options.MinuteTotal) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "olive";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Total Minute Volume (litres/min)";
    paramInfo.color = "olive";
    paramInfo.paramName = "mvdel";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMMvdelGraph(reuseAxisNum) {
    if (!this.options.MinuteMand) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "olive";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Mandatory Minute Volume (litres/min)";
    paramInfo.color = "blueviolet";
    paramInfo.paramName = "mmvdel";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createSMvdelGraph(reuseAxisNum) {
    if (!this.options.MinuteSpont) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "olive";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Spontaneous Minute Volume (litres/min)";
    paramInfo.color = "salmon";
    paramInfo.paramName = "smvdel";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createO2FlowGraph(reuseAxisNum) {
    if (!this.options.O2Flow) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "indigo";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "O2 Flow Rate (litres/min)";
    paramInfo.color = "indigo";
    paramInfo.paramName = "o2FlowX10";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createSbpmGraph(reuseAxisNum) {
    if (!this.options.Spontaneous) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "maroon";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Breaths per Min (bpm)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Spontaneous BPM (bpm)";
    paramInfo.color = "maroon";
    paramInfo.paramName = "sbpm";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMbpmGraph(reuseAxisNum) {
    if (!this.options.Mandatory) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "violet";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Breaths per Min (bpm)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Mandatory BPM (bpm)";
    paramInfo.color = "violet";
    paramInfo.paramName = "mbpm";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createScompGraph(reuseAxisNum) {
    if (!this.options.Static) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "navy";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "DeltaV/DeltaP (ml/cm H20)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Static DeltaV/DeltaP (ml/cm H20)";
    paramInfo.color = "navy";
    paramInfo.paramName = "scomp";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createDcompGraph(reuseAxisNum) {
    if (!this.options.Dynamic) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "crimson";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "DeltaV/DeltaP (ml/cm H20)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Dynamic DeltaV/DeltaP (ml/cm H20)";
    paramInfo.color = "crimson";
    paramInfo.paramName = "dcomp";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createTempGraph(reuseAxisNum) {
    if (!this.options.Temperature) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "fuchsia";
    yAxisInfo.yMin = -25;
    yAxisInfo.yMax = 75;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "System Temp (deg C)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "System Temp (deg C)";
    paramInfo.color = "fuchsia";
    paramInfo.paramName = "tempC";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMBreathGraph(reuseAxisNum) {
    if (!this.options.MBreath) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'lime';
    markerInfo.label = 'M';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Mandatory Breath";
    paramInfo.color = "lime";
    paramInfo.paramName = "btype";
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = MANDATORY_BREATH;
    paramInfo.snapYval = MANDATORY_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createSBreathGraph(reuseAxisNum) {
    if (!this.options.SBreath) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'orange';
    markerInfo.label = 'S';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Spontaneous Breath";
    paramInfo.color = "orange";
    paramInfo.paramName = "btype";
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = SPONTANEOUS_BREATH;
    paramInfo.snapYval = SPONTANEOUS_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createEBreathGraph(reuseAxisNum) {
    if (!this.options.EBreath) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'salmon';
    markerInfo.label = 'X';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Maintenance Breath";
    paramInfo.color = "salmon";
    paramInfo.paramName = "btype";
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = MAINTENANCE_BREATH;
    paramInfo.snapYval = MAINTENANCE_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createVCBreathGraph(reuseAxisNum) {
    if (!this.options.VCBreath) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'square';
    markerInfo.color = 'orange';
    markerInfo.label = 'V';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Volume Control";
    paramInfo.color = "orange";
    paramInfo.paramName = "bcontrol";
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = VOLUME_CONTROL;
    paramInfo.snapYval = VOLUME_CONTROL_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createPSBreathGraph(reuseAxisNum) {
    if (!this.options.PSBreath) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'square';
    markerInfo.color = 'pink';
    markerInfo.label = 'P';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Pressure Support";
    paramInfo.color = "pink";
    paramInfo.paramName = "bcontrol";
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = PRESSURE_SUPPORT;
    paramInfo.snapYval = PRESSURE_SUPPORT_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createNotificationGraph(reuseAxisNum) {
    if (!this.options.Notifications) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'square';
    markerInfo.color = 'lightblue';
    markerInfo.label = 'N';
    markerInfo.size = 25;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Notification";
    paramInfo.color = "lightblue";
    paramInfo.paramName = "infos";
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = NOTIFICATION_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createWarningGraph(reuseAxisNum) {
    if (!this.options.Warnings) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'triangle';
    markerInfo.color = 'wheat';
    markerInfo.label = 'W';
    markerInfo.size = 30;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Warning";
    paramInfo.color = "wheat";
    paramInfo.paramName = "warnings";
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = WARNING_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createErrorGraph(reuseAxisNum) {
    if (!this.options.Errors) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 11;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    let markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'cross';
    markerInfo.color = 'salmon';
    //markerInfo.label = 'X';
    markerInfo.size = 15;

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Error";
    paramInfo.color = "salmon";
    paramInfo.paramName = "errors";
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = ERROR_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createFiO2Graph(reuseAxisNum) {
    if (!this.options.FiO2) return reuseAxisNum;

    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "brown";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 100;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Percentage (%)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "FiO2 (%)";
    paramInfo.color = "brown";
    paramInfo.paramName = "fiO2";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPurityGraph(reuseAxisNum) {
    if (!this.options.O2Purity) return reuseAxisNum;
    let yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "lightgreen";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 100;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Percentage (%)";

    let markerInfo = cloneObject(markerInfoTemplate);

    let paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "O2 Purity (%)";
    paramInfo.color = "lightgreen";
    paramInfo.paramName = "o2Purity";
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

}

