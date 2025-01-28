// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class WaveBox {
  // containerBodyDiv is an HTML object
  constructor(containerBodyDiv) {
    this.containerBodyDiv = containerBodyDiv;
		this.pressureChartDiv = findChildNodeByClass(containerBodyDiv, PRESSURE_WAVE_BODY_CLASS);
		this.flowChartDiv = findChildNodeByClass(containerBodyDiv, FLOW_WAVE_BODY_CLASS);
    this.options = {};
    this.pChart = null;
    this.fChart = null;
    this.rangeX = null;
  }

	breathSelectedInMenu(breathInfo) {
    let bInfo = parseBreathInfo(breathInfo);
    // Order below is important
    if (this.options.ErrorB) {
      if (bInfo.isError) return true;
    }
    if (this.options.AbnormalB) {
      if (bInfo.Abnormal) return true;
    }
    if (this.options.MaintenanceB) {
      if (bInfo.isMaintenance) return true;
    }

    // Exceptional Breaths taken care of above
    let isExceptional = bInfo.isError || bInfo.Abnormal || bInfo.isMaintenance;

    if (this.options.MandatoryVC) {
      if (bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
    }
    if (this.options.SpontaneousVC) {
      if (!bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
    }
    if (this.options.SpontaneousPS) {
      if (!bInfo.isMandatory && !bInfo.isVC && !isExceptional) return true;
    }
    return false;
  }


	// Resize according to latest sessionData
	resizeFonts() {
		if (this.pChart) this.pChart.resizeFonts();
		if (this.fChart) this.fChart.resizeFonts();
	}

	//
  // Depends on what breaths have been chosen for display in this box
	//
	NumWavesInRange() {
    let minBnum = session.waves.range.minBnum;
    let maxBnum = session.waves.range.maxBnum;
    let n = 0;
    for (let i = 0; i < session.waves.pwData.length; i++) {
      let breathNum = session.waves.pwData[i].systemBreathNum - session.startSystemBreathNum + 1;
      if (breathNum < minBnum) continue;
      if (breathNum > maxBnum) break;
      let breathInfo = session.waves.pwData[i].breathInfo;
      if (!this.breathSelectedInMenu(breathInfo)) continue;
      n++;
    }
    return n;
	}

	//
  // rangeX = {moving:, 
  //           minBnum:Number, maxBnum:Number, missingBnum[]:,
  //           minTime:Date, maxTime:Date, missingTime[]:}
  render() {
    this.cleanupCharts();
    this.rangeX = session.waves.range;
    this.createCharts();
    if (this.pChart) this.pChart.render(this.pressureChartDiv);
    if (this.fChart) this.fChart.render(this.flowChartDiv);
  }

  clearMenu(menuId) {
    document.getElementById("MandatoryVC").checked = false;
    document.getElementById("SpontaneousVC").checked = false;
    document.getElementById("SpontaneousPS").checked = false;
    document.getElementById("MaintenanceB").checked = false;
    document.getElementById("ErrorB").checked = false;
    document.getElementById("AbnormalB").checked = false;
    document.getElementById("WaveTitleId").value = "";
  }

  // Update the HTML dropdown menu using stored options
  updateMenu(menuId) {
		this.clearMenu(menuId);

    if (Object.keys(this.options).length == 0) return;
    if (!document.getElementById(menuId)) return;
    document.getElementById("MandatoryVC").checked = this.options.MandatoryVC;
    document.getElementById("SpontaneousVC").checked = this.options.SpontaneousVC;
    document.getElementById("SpontaneousPS").checked = this.options.SpontaneousPS;
    document.getElementById("MaintenanceB").checked = this.options.MaintenanceB;
    document.getElementById("ErrorB").checked = this.options.ErrorB;
    document.getElementById("AbnormalB").checked = this.options.AbnormalB;
    document.getElementById("WaveTitleId").value = this.options.title;
  }

  // Options for mini dashboard waves
  setMiniOptions() {
    this.options.MandatoryVC = true;
    this.options.SpontaneousVC = true;
    this.options.SpontaneousPS = true;
    this.options.MaintenanceB = true;
    this.options.ErrorB = true;
    this.options.AbnormalB = true;
    this.options.title = false;
  }

  // Update stored options from the HTML dropdown menu
  updateOptions(menuId) {
    if (!document.getElementById(menuId)) return;

    this.options.MandatoryVC = document.getElementById("MandatoryVC").checked;
    this.options.SpontaneousVC = document.getElementById("SpontaneousVC").checked;
    this.options.SpontaneousPS = document.getElementById("SpontaneousPS").checked;
    this.options.MaintenanceB = document.getElementById("MaintenanceB").checked;
    this.options.ErrorB = document.getElementById("ErrorB").checked;
    this.options.AbnormalB = document.getElementById("AbnormalB").checked;
    this.options.title = document.getElementById("WaveTitleId").value;
  }

  ////////////////////////////////////////////////////////
  // Below are all private methods
  ////////////////////////////////////////////////////////
  cleanupCharts() {
    if (this.pChart) {
      this.pChart.destroy();
      delete this.pChart;
      this.pChart = null;
    }
    if (this.fChart) {
      this.fChart.destroy();
      delete this.fChart;
      this.fChart = null;
    }
  }

  createCharts() {
		// Pressure Chart
    this.pChart = new WavePane(
      this.options.title,
      this.pressureChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Pressure (mmH2O)",
			"#AED6F1",
			session.waves.pwData,
			false // not a flow graph
    );
    this.pChart.addGraph();

		// Flow Chart
    this.fChart = new WavePane(
      this.options.title,
      this.flowChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Flow (ltr/sec)",
			"#ECF0F1",
			session.waves.flowData,
			true // is a flow graph
    );
    this.fChart.addGraph();

		// Make sure both charts have the same breaks and strip lines
    this.fChart.setCustomBreaks(this.pChart.getCustomBreaks());
    this.fChart.setStripLines(this.pChart.getStripLines());
  }

}
