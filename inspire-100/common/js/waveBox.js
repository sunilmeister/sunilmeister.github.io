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

	// Resize according to latest sessionData
	resizeFonts() {
		if (this.pChart) this.pChart.resizeFonts();
		if (this.fChart) this.fChart.resizeFonts();
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
