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

	tooManyWaves() {
		let numWaves = numSelectedWavesInRange(this.options);
		return (numWaves > WAVE_ALERT_THRESHOLD);
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
    this.options.title = "";
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

  mergeCustomBreaks(pBreaks, fBreaks) {
    let cBreaks = [];

    let pLen = pBreaks.length;
    if (!pLen) return fBreaks;

    let fLen = fBreaks.length;
    if (!fLen) return pBreaks;
    
    let pIx = 0;
    let fIx = 0;
    while (1) {
      let pBnum = null;
      let fBnum = null;
      if (pIx < pLen) pBnum = pBreaks[pIx].breathNum;
      if (fIx < fLen) fBnum = fBreaks[fIx].breathNum;
      if (fBnum < pBnum) pBnum = null;
      if (pBnum < fBnum) fBnum = null;
      if ((fBnum === null) && (pBnum === null)) break;

      if (fBnum == pBnum) {
        // use pData
        let elem = cloneObject(pBreaks[pIx]);
        cBreaks.push(elem);

        pIx++;
        fIx++;
      } else if (fBnum) {
        // use fData
        let elem = cloneObject(fBreaks[fIx]);
        cBreaks.push(elem);

        fIx++;
      } else {
        // use pData
        let elem = cloneObject(pBreaks[pIx]);
        cBreaks.push(elem);

        pIx++;
      }
    }

    return cBreaks;
  }

  mergeStripLines(pStrips, fStrips) {
    let cStrips = [];

    let pLen = pStrips.length;
    if (!pLen) return fStrips;

    let fLen = fStrips.length;
    if (!fLen) return pStrips;
    
    let pIx = 0;
    let fIx = 0;
    while (1) {
      let pBnum = null;
      let fBnum = null;
      if (pIx < pLen) pBnum = pStrips[pIx].breathNum;
      if (fIx < fLen) fBnum = fStrips[fIx].breathNum;
      if (fBnum < pBnum) pBnum = null;
      if (pBnum < fBnum) fBnum = null;
      if ((fBnum === null) && (pBnum === null)) break;

      if (fBnum == pBnum) {
        // use pData
        let labelFontColor = "darkgreen";
        let labelText = "#" + pBnum;
        if (session.waves.pwPartial.includes(pStrips[pIx].sysBreathNum) 
          || session.waves.fwPartial.includes(fStrips[fIx].sysBreathNum)) {
          labelFontColor = "red";
        }
        let elem = cloneObject(pStrips[pIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        pIx++;
        fIx++;
      } else if (fBnum) {
        // use fData
        let labelFontColor = "red";
        let elem = cloneObject(fStrips[fIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        fIx++;
      } else {
        // use pData
        let labelFontColor = "red";
        let elem = cloneObject(pStrips[pIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        pIx++;
      }
    }

    return cStrips;
  }

  createCharts() {
		// Pressure Chart
    this.pChart = new WavePane(
      this.options.title,
      null,
      25,
      this.pressureChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Pressure (mmH2O)",
			"#AED6F1",
			session.waves.pwData,
			session.waves.pwMissing
    );
    this.pChart.addGraph();

		// Flow Chart
    this.fChart = new WavePane(
      null,
      "Elapsed Time (H:MM:SS)",
      20,
      this.flowChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Flow (ltr/min)",
			"#ECF0F1",
			session.waves.fwData,
			session.waves.fwMissing
    );
    this.fChart.addGraph();

		// Make sure both charts have the same breaks and strip lines
    let pBreaks = this.pChart.getCustomBreaks();
    let fBreaks = this.fChart.getCustomBreaks();
    let cBreaks = this.mergeCustomBreaks(pBreaks, fBreaks);
    this.pChart.setCustomBreaks(cBreaks);
    this.fChart.setCustomBreaks(cBreaks);

    let pStrips = this.pChart.getStripLines();
    let fStrips = this.fChart.getStripLines();
    let cStrips = this.mergeStripLines(pStrips, fStrips);
    this.pChart.setStripLines(cStrips);
    this.fChart.setStripLines(cStrips);
  }

}
