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

  // rangeX = {rolling:, 
  //           initBnum:Number, minBnum:Number, maxBnum:Number, missingBnum[]:,
  //           initTime:Date, minTime:Date, maxTime:Date, missingTime[]:}
  render() {
    this.cleanupCharts();
    if (!session.reportRange) {
      this.rangeX = null;
      return; // reportRange is a global variable
    }

    this.rangeX = session.reportRange;
    this.createChart();
    if (this.chart) this.chart.render(this.containerBodyDiv);
  }

  // Update the HTML dropdown menu using stored options
  updateMenu(menuId) {
    if (Object.keys(this.options).length == 0) return;
    if (!document.getElementById(menuId)) return;
    document.getElementById("Peak").checked = this.options["Peak"];
    document.getElementById("Plat").checked = this.options["Plat"];
    document.getElementById("PEEP").checked = this.options["PEEP"];
    document.getElementById("Tidal").checked = this.options["Tidal"];
    document.getElementById("Minute").checked = this.options["Minute"];
    document.getElementById("Mandatory").checked = this.options["Mandatory"];
    document.getElementById("Spontaneous").checked = this.options["Spontaneous"];
    document.getElementById("MBreath").checked = this.options["MBreath"];
    document.getElementById("SBreath").checked = this.options["SBreath"];
    document.getElementById("EBreath").checked = this.options["EBreath"];
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
    this.options["Minute"] = document.getElementById("Minute").checked;
    this.options["Mandatory"] = document.getElementById("Mandatory").checked;
    this.options["Spontaneous"] = document.getElementById("Spontaneous").checked;
    this.options["MBreath"] = document.getElementById("MBreath").checked;
    this.options["SBreath"] = document.getElementById("SBreath").checked;
    this.options["EBreath"] = document.getElementById("EBreath").checked;
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
    this.options["timeUnits"] = (this.getXunitsValue() == "TIME");
  }

  ////////////////////////////////////////////////////////
  // Below are all private methods
  ////////////////////////////////////////////////////////
  getXunitsValue() {
    var elem = document.getElementById("TIME");
    if (elem.checked) return "TIME";
    else return "BNUM";
  }

  setXunitsValue() {
    if (this.options.timeUnits) {
      var r = document.getElementById("TIME");
      r.checked = true;
    } else {
      var r = document.getElementById("BNUM");
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
    var pressureAxisNum = null;
    pressureAxisNum = this.createPeakGraph(pressureAxisNum);
    pressureAxisNum = this.createPlatGraph(pressureAxisNum);
    pressureAxisNum = this.createPeepGraph(pressureAxisNum);

    var vtAxisNum = null;
    vtAxisNum = this.createVtdelGraph(vtAxisNum);

    var mvAxisNum = null;
    mvAxisNum = this.createMvdelGraph(mvAxisNum);
    mvAxisNum = this.createO2FlowGraph(mvAxisNum);

    var bpmAxisNum = null;
    bpmAxisNum = this.createSbpmGraph(bpmAxisNum);
    bpmAxisNum = this.createMbpmGraph(bpmAxisNum);

    var markerAxisNum = null;
    markerAxisNum = this.createMBreathGraph(markerAxisNum);
    markerAxisNum = this.createSBreathGraph(markerAxisNum);
    markerAxisNum = this.createEBreathGraph(markerAxisNum);
    markerAxisNum = this.createErrorGraph(markerAxisNum);
    markerAxisNum = this.createWarningGraph(markerAxisNum);
    markerAxisNum = this.createNotificationGraph(markerAxisNum);

    var compAxisNum = null;
    compAxisNum = this.createScompGraph(compAxisNum);
    compAxisNum = this.createDcompGraph(compAxisNum);

    var tempAxisNum = null;
    tempAxisNum = this.createTempGraph(tempAxisNum);

    var pctAxisNum = null;
    pctAxisNum = this.createPurityGraph(pctAxisNum);
    pctAxisNum = this.createFiO2Graph(pctAxisNum);
  }

  createPeakGraph(reuseAxisNum) {
    if (!this.options.Peak) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "red";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Peak Pressure (cm H20)";
    paramInfo.color = "red";
    paramInfo.transitions = session.peakChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPlatGraph(reuseAxisNum) {
    if (!this.options.Plat) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "silver";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Plateau Pressure (cm H20)";
    paramInfo.color = "silver";
    paramInfo.transitions = session.platChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPeepGraph(reuseAxisNum) {
    if (!this.options.PEEP) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Pressure (cm H20)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Peep Pressure (cm H20)";
    paramInfo.color = "green";
    paramInfo.transitions = session.mpeepChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createVtdelGraph(reuseAxisNum) {
    if (!this.options.Tidal) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "purple";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Volume (ml)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Tidal Volume (ml)";
    paramInfo.color = "purple";
    paramInfo.transitions = session.vtdelChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMvdelGraph(reuseAxisNum) {
    if (!this.options.Minute) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "olive";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Minute Volume (litres/min)";
    paramInfo.color = "olive";
    paramInfo.transitions = session.mvdelChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createO2FlowGraph(reuseAxisNum) {
    if (!this.options.O2Flow) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "indigo";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 20;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Minute Volume (litres/min)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "O2 Flow Rate (litres/min)";
    paramInfo.color = "indigo";
    paramInfo.transitions = session.o2FlowX10Changes;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createSbpmGraph(reuseAxisNum) {
    if (!this.options.Spontaneous) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "maroon";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Breaths per Min (bpm)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Spontaneous BPM (bpm)";
    paramInfo.color = "maroon";
    paramInfo.transitions = session.sbpmChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMbpmGraph(reuseAxisNum) {
    if (!this.options.Mandatory) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "violet";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Breaths per Min (bpm)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Mandatory BPM (bpm)";
    paramInfo.color = "violet";
    paramInfo.transitions = session.mbpmChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createScompGraph(reuseAxisNum) {
    if (!this.options.Static) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "navy";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Compliance (ml/cm H20)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Static Compliance (ml/cm H20)";
    paramInfo.color = "navy";
    paramInfo.transitions = session.scompChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createDcompGraph(reuseAxisNum) {
    if (!this.options.Dynamic) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "crimson";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = null;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Compliance (ml/cm H20)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Dynamic Compliance (ml/cm H20)";
    paramInfo.color = "crimson";
    paramInfo.transitions = session.dcompChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createTempGraph(reuseAxisNum) {
    if (!this.options.Temperature) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "fuchsia";
    yAxisInfo.yMin = -25;
    yAxisInfo.yMax = 75;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "System Temp (deg C)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "System Temp (deg C)";
    paramInfo.color = "fuchsia";
    paramInfo.transitions = session.tempChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createMBreathGraph(reuseAxisNum) {
    if (!this.options.MBreath) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'lime';
    markerInfo.label = 'M';
    markerInfo.size = 25;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Mandatory Breath";
    paramInfo.color = "lime";
    paramInfo.transitions = session.breathTypeChanges;
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = MANDATORY_BREATH;
    paramInfo.snapYval = MANDATORY_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createSBreathGraph(reuseAxisNum) {
    if (!this.options.SBreath) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'orange';
    markerInfo.label = 'S';
    markerInfo.size = 25;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Spontaneous Breath";
    paramInfo.color = "orange";
    paramInfo.transitions = session.breathTypeChanges;
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = SPONTANEOUS_BREATH;
    paramInfo.snapYval = SPONTANEOUS_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createEBreathGraph(reuseAxisNum) {
    if (!this.options.EBreath) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "green";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'circle';
    markerInfo.color = 'salmon';
    markerInfo.label = 'X';
    markerInfo.size = 25;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Maintenance Breath";
    paramInfo.color = "salmon";
    paramInfo.transitions = session.breathTypeChanges;
    paramInfo.graphType = "scatter";
    paramInfo.selectVal = MAINTENANCE_BREATH;
    paramInfo.snapYval = MAINTENANCE_BREATH;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
   }

  createNotificationGraph(reuseAxisNum) {
    if (!this.options.Notifications) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'square';
    markerInfo.color = 'lightblue';
    markerInfo.label = 'N';
    markerInfo.size = 25;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Notification";
    paramInfo.color = "lightblue";
    paramInfo.transitions = session.infoChanges;
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = NOTIFICATION_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createWarningGraph(reuseAxisNum) {
    if (!this.options.Warnings) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'triangle';
    markerInfo.color = 'wheat';
    markerInfo.label = 'W';
    markerInfo.size = 30;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Warning";
    paramInfo.color = "wheat";
    paramInfo.transitions = session.warningChanges;
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = WARNING_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createErrorGraph(reuseAxisNum) {
    if (!this.options.Errors) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "blue";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 8;
    yAxisInfo.yInterval = 1;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Markers";
    yAxisInfo.yFormat = markerFormatter;

    var markerInfo = cloneObject(markerInfoTemplate);
    markerInfo.type = 'cross';
    markerInfo.color = 'salmon';
    //markerInfo.label = 'X';
    markerInfo.size = 15;

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "Error";
    paramInfo.color = "salmon";
    paramInfo.transitions = session.errorChanges;
    paramInfo.graphType = "scatter";
    paramInfo.snapYval = ERROR_YVAL;

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createFiO2Graph(reuseAxisNum) {
    if (!this.options.FiO2) return reuseAxisNum;

    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "brown";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 100;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Percentage (%)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "FiO2 (%)";
    paramInfo.color = "brown";
    paramInfo.transitions = session.fiO2Changes;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

  createPurityGraph(reuseAxisNum) {
    if (!this.options.O2Purity) return reuseAxisNum;
    var yAxisInfo = cloneObject(yAxisInfoTemplate);
    yAxisInfo.primary = true;
    yAxisInfo.color = "lightgreen";
    yAxisInfo.yMin = 0;
    yAxisInfo.yMax = 100;
    yAxisInfo.reuseAxisNum = reuseAxisNum;
    yAxisInfo.yName = "Percentage (%)";

    var markerInfo = cloneObject(markerInfoTemplate);

    var paramInfo = cloneObject(paramInfoTemplate);
    paramInfo.name = "O2 Purity (%)";
    paramInfo.color = "lightgreen";
    paramInfo.transitions = session.o2PurityChanges;
    paramInfo.graphType = "stepLine";

    return this.chart.addGraph(session.breathTimes, yAxisInfo, paramInfo, markerInfo);
  }

}

