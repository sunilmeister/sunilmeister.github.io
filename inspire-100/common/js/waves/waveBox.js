// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class WaveBox {
  // containerBodyDiv is an HTML object
  constructor(containerBodyDiv) {
    this.containerBodyDiv = containerBodyDiv;
		this.pressureChartDiv = findChildNodeByClass(containerBodyDiv, PRESSURE_WAVE_BODY_CLASS);
		this.flowChartDiv = findChildNodeByClass(containerBodyDiv, FLOW_WAVE_BODY_CLASS);
		this.volumeChartDiv = findChildNodeByClass(containerBodyDiv, VOLUME_WAVE_BODY_CLASS);
    this.options = {};
    this.pChart = null;
    this.fChart = null;
    this.vChart = null;
    this.rangeX = null;
  }

	// Resize according to latest sessionData
	resizeFonts() {
		if (this.pChart) this.pChart.resizeFonts();
		if (this.fChart) this.fChart.resizeFonts();
		if (this.vChart) this.vChart.resizeFonts();
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
    if (this.tooManyWaves()) {
      modalAlert("Too many Breath Waveforms",
        "\nUse Range Selector to select " + WAVE_ALERT_THRESHOLD + " or less"
        + "\nto waveforms to display");
      return;
    }

    this.createCharts();
    if (this.pChart) this.pChart.render(this.pressureChartDiv);
    if (this.fChart) this.fChart.render(this.flowChartDiv);
    if (this.vChart) this.vChart.render(this.volumeChartDiv);
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
    if (this.vChart) {
      this.vChart.destroy();
      delete this.vChart;
      this.vChart = null;
    }
  }

  markPartialStripLines(strips, partial) {
    for (let i=0; i<strips.length; i++) {
      let strip = strips[i];
      let sysBreathNum = strip.sysBreathNum;
      if (partial.includes(sysBreathNum)) {
        strip.labelFontColor = "red";
      } else {
        strip.labelFontColor = "darkgreen";
      }
    }
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
      let labelFontColor = "darkgreen";
      if (pIx < pLen) pBnum = pStrips[pIx].breathNum;
      if (fIx < fLen) fBnum = fStrips[fIx].breathNum;
      if (fBnum < pBnum) pBnum = null;
      if (pBnum < fBnum) fBnum = null;
      if ((fBnum === null) && (pBnum === null)) break;

      if (fBnum == pBnum) {
        // use pData
        let labelText = "#" + pBnum;
        let elem = cloneObject(pStrips[pIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        pIx++;
        fIx++;
      } else if (fBnum) {
        // use fData
        let labelText = "#" + fBnum;
        let elem = cloneObject(fStrips[fIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        fIx++;
      } else {
        // use pData
        let labelText = "#" + pBnum;
        let elem = cloneObject(pStrips[pIx]);
        elem.label = labelText;
        elem.labelFontColor = labelFontColor;
        cStrips.push(elem);

        pIx++;
      }
    }

    /*
    console.log("pStrips");
    for (let i=0; i<pStrips.length; i++) console.log(i,pStrips[i]);
    console.log("fStrips");
    for (let i=0; i<fStrips.length; i++) console.log(i,fStrips[i]);
    console.log("cStrips");
    for (let i=0; i<cStrips.length; i++) console.log(i,cStrips[i]);
    */
    return cStrips;
  }

  createCustomBreaks(strips) {
    let len = strips.length;
    if (!len) return null;

    let breaks = [];
    let startVal = 0;
    for (let i=0; i<len; i++) {
      let strip = strips[i];
      //console.log("strip", strip);
      breaks.push({startValue:startVal, endValue:(strip.startValue)});
      startVal = strip.endValue;
    }
    return breaks;
  }

  deleteUnmatchedWaveformData() {
    let minBnum = this.rangeX.minBnum;
    let maxBnum = this.rangeX.maxBnum;

    for (let i=minBnum; i<= maxBnum; i++) {
      if (!isUndefined(session.waves.pwData[i]) && (session.waves.pwData[i] !== null)) {
        if (!isUndefined(session.waves.fwData[i]) && (session.waves.fwData[i] !== null)) {
          continue;
        }
      }
      session.waves.pwData[i] = null;
      session.waves.fwData[i] = null;
      session.waves.vwData[i] = null;
    }
  }

  createCharts() {
    this.deleteUnmatchedWaveformData();

		// Pressure Chart
    let pressureYaxisTicks  = {min:0, max:null, interval: 50};
    this.pChart = new WavePane(
      this.options.title,
      null,
      pressureYaxisTicks,
      this.pressureChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Measured Pressure (mmH2O)",
			"#AED6F1",
			session.waves.pwData
    );
    this.pChart.addGraph();

		// Flow Chart
    let flowYaxisTicks  = {min:-80, max:80, interval: 20};
    this.fChart = new WavePane(
      null,
      null,
      flowYaxisTicks,
      this.flowChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Estimated Flow (ltr/min)",
			"#FFD0D0",
			session.waves.fwData
    );
    this.fChart.addGraph();

		// Volume Chart
    let volumeYaxisTicks  = {min:0, max:800, interval: 100};
    this.vChart = new WavePane(
      null,
      "Elapsed Time (H:MM:SS)",
      volumeYaxisTicks,
      this.volumeChartDiv.offsetHeight,
      this.rangeX,
      this.options,
			"Estimated Volume (ml)",
			"#C1CFA1",
			session.waves.vwData
    );
    this.vChart.addGraph();

		// Make sure both charts have the same breaks and strip lines
    let pStrips = this.pChart.getStripLines();
    let fStrips = this.fChart.getStripLines();
    let cStrips = this.mergeStripLines(pStrips, fStrips);
    this.markPartialStripLines(cStrips, session.waves.pwPartial);
    this.pChart.setStripLines(cloneObject(cStrips));
    this.markPartialStripLines(cStrips, session.waves.fwPartial);
    this.fChart.setStripLines(cloneObject(cStrips));
    this.vChart.setStripLines(cloneObject(cStrips));

    let cBreaks = this.createCustomBreaks(cStrips);
    //for (let i=0; i<cBreaks.length; i++) console.log(i,cBreaks[i]);
    this.pChart.setCustomBreaks(cBreaks);
    this.fChart.setCustomBreaks(cBreaks);
    this.vChart.setCustomBreaks(cBreaks);
  }

}
