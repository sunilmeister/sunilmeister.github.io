// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class ShapeBox {
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
    if (Object.keys(this.options).length==0) return;
    if (!document.getElementById(menuId)) return;
    document.getElementById("MandatoryVC").checked = this.options.MandatoryVC;
    document.getElementById("SpontaneousVC").checked = this.options.SpontaneousVC;
    document.getElementById("SpontaneousPS").checked = this.options.SpontaneousPS;
    document.getElementById("VCError").checked = this.options.VCError;
    document.getElementById("PSError").checked = this.options.PSError;
    document.getElementById("Abnormal").checked = this.options.Abnormal;
    document.getElementById("ShapeTitleId").value = this.options.title;
  }

  // Update stored options from the HTML dropdown menu
  updateOptions(menuId) {
    if (!document.getElementById(menuId)) return;

    this.options.MandatoryVC = document.getElementById("MandatoryVC").checked;
    this.options.SpontaneousVC = document.getElementById("SpontaneousVC").checked;
    this.options.SpontaneousPS = document.getElementById("SpontaneousPS").checked;
    this.options.VCError = document.getElementById("VCError").checked;
    this.options.PSError = document.getElementById("PSError").checked;
    this.options.Abnormal = document.getElementById("Abnormal").checked;
    this.options.title = document.getElementById("ShapeTitleId").value;
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
    this.chart = new BreathShapes(
      this.options.title,
      this.containerBodyDiv.offsetHeight,
      this.rangeX
    );
  }

}
