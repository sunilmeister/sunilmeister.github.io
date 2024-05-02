// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class WaveBox {
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

	//
  // rangeX = {moving:, 
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
    if (this.chart) {
      this.chart.destroy();
      delete this.chart;
      this.chart = null;
    }
  }

  createChart() {
    this.chart = new WavePane(
      this.options.title,
      this.containerBodyDiv.offsetHeight,
      this.rangeX,
      this.options
    );
    this.chart.addGraph();
  }

}
