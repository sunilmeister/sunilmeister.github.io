// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// Special function for Y-axis of Breath Types
function breathTypeFormatter(e) {
  if (e.value == SPONTANEOUS_BREATH) return 'S';
  if (e.value == MANDATORY_BREATH) return 'M';
  else return 'E';
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
    //console.log("app.reportRange=" + app.reportRange);
    if (!app.reportRange) {
      this.rangeX = null;
      return; // reportRange is a global variable
    }

    this.rangeX = app.reportRange;
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
    document.getElementById("BreathType").checked = this.options["BreathType"];
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
    this.options["BreathType"] = document.getElementById("BreathType").checked;
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
    this.chart = new LineChart(
      this.options.title,
      this.containerBodyDiv.offsetHeight,
      this.options.timeUnits,
      this.rangeX,
      false
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

    var btypeAxisNum = null;
    btypeAxisNum = this.createBreathTypeGraph(btypeAxisNum);

    var compAxisNum = null;
    compAxisNum = this.createScompGraph(compAxisNum);
    compAxisNum = this.createDcompGraph(compAxisNum);

    var tempAxisNum = null;
    tempAxisNum = this.createTempGraph(tempAxisNum);

    var flagAxisNum = null;
    flagAxisNum = this.createErrorGraph(flagAxisNum);
    flagAxisNum = this.createWarningGraph(flagAxisNum);
    flagAxisNum = this.createNotificationGraph(flagAxisNum);

    var pctAxisNum = null;
    pctAxisNum = this.createFiO2Graph(pctAxisNum);
    pctAxisNum = this.createPurityGraph(pctAxisNum);
  }

  createPeakGraph(reuseAxisNum) {
    if (!this.options.Peak) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Pressure (cm H20)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Peak Pressure (cm H20)",
      color: "red",
      transitions: session.peakValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createPlatGraph(reuseAxisNum) {
    if (!this.options.Plat) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Pressure (cm H20)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Plateau Pressure (cm H20)",
      color: "silver",
      transitions: session.platValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createPeepGraph(reuseAxisNum) {
    if (!this.options.PEEP) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Pressure (cm H20)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Peep Pressure (cm H20)",
      color: "green",
      transitions: session.mpeepValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createVtdelGraph(reuseAxisNum) {
    if (!this.options.Tidal) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Volume (ml)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Tidal Volume (ml)",
      color: "purple",
      transitions: session.vtdelValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createMvdelGraph(reuseAxisNum) {
    if (!this.options.Minute) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: 20,
      reuseAxisNum: reuseAxisNum,
      yName: "Minute Volume (litres/min)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Minute Volume (litres/min)",
      color: "olive",
      transitions: session.mvdelValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createO2FlowGraph(reuseAxisNum) {
    if (!this.options.O2Flow) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: 20,
      reuseAxisNum: reuseAxisNum,
      yName: "Minute Volume (litres/min)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "O2 Flow Rate (litres/min)",
      color: "Indigo",
      transitions: session.o2FlowValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createSbpmGraph(reuseAxisNum) {
    if (!this.options.Spontaneous) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Breaths per Min (bpm)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Static BPM (bpm)",
      color: "Maroon",
      transitions: session.sbpmValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createMbpmGraph(reuseAxisNum) {
    if (!this.options.Mandatory) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Breaths per Min (bpm)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Static BPM (bpm)",
      color: "Violet",
      transitions: session.mbpmValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createBreathTypeGraph(reuseAxisNum) {
    if (!this.options.BreathType) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: 2,
      reuseAxisNum: reuseAxisNum,
      yName: "Breath Type"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Breath TypeMandatory/Spontaneous/Error",
      color: "#E78A61",
      transitions: session.breathTypeValues,
      yFormat: breathTypeFormatter,
      yInterval: 1,
      //graphType: "stepArea"
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createScompGraph(reuseAxisNum) {
    if (!this.options.Static) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Compliance (ml/cm H20)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Static Compliance (ml/cm H20)",
      color: "Navy",
      transitions: session.scompValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createDcompGraph(reuseAxisNum) {
    if (!this.options.Dynamic) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Compliance (ml/cm H20)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Dynamic Compliance (ml/cm H20)",
      color: "Crimson",
      transitions: session.dcompValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createTempGraph(reuseAxisNum) {
    if (!this.options.Temperature) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: -20,
      yMax: 70,
      reuseAxisNum: reuseAxisNum,
      yName: "System Temp (deg C)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "System Temp (deg C)",
      color: "Fuchsia",
      transitions: session.tempValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createWarningGraph(reuseAxisNum) {
    if (!this.options.Warnings) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "System Alerts"
    };
    var flags = {
      warning: true,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "Warnings",
      color: "Orange",
      transitions: session.warningValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createNotificationGraph(reuseAxisNum) {
    if (!this.options.Notifications) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "System Alerts"
    };
    var flags = {
      warning: false,
      error: false,
      info: true
    }
    var paramInfo = {
      name: "Notifications",
      color: "Yellow",
      transitions: session.infoValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createErrorGraph(reuseAxisNum) {
    if (!this.options.Errors) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "System Alerts"
    };
    var flags = {
      warning: false,
      error: true,
      info: false
    };
    var paramInfo = {
      name: "Errors",
      color: "Pink",
      transitions: session.errorValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createFiO2Graph(reuseAxisNum) {
    if (!this.options.FiO2) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Percentage (%)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "FiO2 (%)",
      color: "Brown",
      transitions: session.fiO2Values
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

  createPurityGraph(reuseAxisNum) {
    if (!this.options.O2Purity) return reuseAxisNum;

    var reuse = (reuseAxisNum != null);
    var yAxisInfo = {
      primary: true,
      reuse: reuse,
      yMin: 0,
      yMax: null,
      reuseAxisNum: reuseAxisNum,
      yName: "Percentage (%)"
    };
    var flags = {
      warning: false,
      error: false,
      info: false
    };
    var paramInfo = {
      name: "O2 Purity (%)",
      color: "lightGreen",
      transitions: session.o2PurityValues
    };

    return this.chart.addGraph(yAxisInfo, session.breathTimes, flags, paramInfo);
  }

}
