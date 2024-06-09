// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

	// various gauges
var peakGauge = null;
var platGauge = null;
var peepGauge = null;

// Various HTML divs for updating
var stateDIV = null;
var pline1DIV = null;
var pline2DIV = null;
var pline3DIV = null;
var sbpmDIV = null;
var mbpmDIV = null;
var vtdelDIV = null;
var mvdelDIV = null;
var mmvdelDIV = null;
var smvdelDIV = null;
var scompDIV = null;
var dcompDIV = null;
var locationDIV = null;
var altDIV = null;
var atmDIV = null;
var breathTypeDIV = null;
var tpsDIV = null;
var tpsUnitsDIV = null;
var imgStateDIV = null;
var imgBreathDIV = null;

var sbpmValELM = null;
var mbpmValELM = null;
var vtdelValELM = null;
var mvdelValELM = null;
var mmvdelValELM = null;
var smvdelValELM = null;
var scompValELM = null;
var dcompValELM = null;
var breathTypeValELM = null;
var tpsValELM = null;
var vtValELM = null;
var pmaxValELM = null;
var ipeepValELM = null;
var psValELM = null;
var modeValELM = null;
var tpsValELM = null;
var ieValELM = null;
var rrValELM = null;
var vtMvTitleELM = null;
var vtMvUnitsELM = null;

function installPeakGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeakGauge');
	containerDiv.innerHTML = "";
  peakGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  peakGauge.setProperty('readonly', true);
}

function installPlatGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PlatGauge');
	containerDiv.innerHTML = "";
  platGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  platGauge.setProperty('readonly', true);
}

function installPeepGauge() {
  let bgColor = palette.darkblue;
  let fgColor = palette.brightgreen;
  let containerDiv = document.getElementById('PeepGauge');
	containerDiv.innerHTML = "";
  peepGauge = new CircularGauge(containerDiv, convertRemToPixels(6.5), fgColor, bgColor, 0, 70);
  peepGauge.setProperty('readonly', true);
}

function initCommonDivElements() {
	// install all gauges
	installPeakGauge();
	installPlatGauge();
	installPeepGauge();

	// Front  panel divs
	createFpDivs();

	// snapshot divs
	stateDIV = document.getElementById("StateDiv");
  pline1DIV = document.getElementById("Pline1");
  pline2DIV = document.getElementById("Pline2");
  pline3DIV = document.getElementById("Pline3");
  stateDIV = document.getElementById("State");
  sbpmDIV = document.getElementById("SBPM");
  mbpmDIV = document.getElementById("MBPM");
  vtdelDIV = document.getElementById("VTDEL");
  mvdelDIV = document.getElementById("MVDEL");
  mmvdelDIV = document.getElementById("MMVDEL");
  smvdelDIV = document.getElementById("SMVDEL");
  scompDIV = document.getElementById("SCOMP");
  dcompDIV = document.getElementById("DCOMP");
  locationDIV = document.getElementById("locationDiv");
  altDIV = document.getElementById("altDiv");
  atmDIV = document.getElementById("atmDiv");
  breathTypeDIV = document.getElementById("BreathType");
  tpsDIV = document.getElementById("TPS");
  tpsUnitsDIV = document.getElementById("TPS_UNITS");
  imgStateDIV = document.getElementById("StateImg")
  imgBreathDIV = document.getElementById("ImgBreath");

  vtDIV = document.getElementById("VTDiv");
  pmaxDIV = document.getElementById("PMAXDiv");
  ipeepDIV = document.getElementById("IPEEPDiv");
  psDIV = document.getElementById("PSDiv");
  modeDIV = document.getElementById("MODEDiv");
  tpsDIV = document.getElementById("TPSDiv");
  ieDIV = document.getElementById("IEDiv");
  rrDIV = document.getElementById("RRDiv");

  sbpmValELM = document.getElementById("SBPM");
  mbpmValELM = document.getElementById("MBPM");
  vtdelValELM = document.getElementById("VTDEL");
  mvdelValELM = document.getElementById("MVDEL");
  mmvdelValELM = document.getElementById("MMVDEL");
  smvdelValELM = document.getElementById("SMVDEL");
  scompValELM = document.getElementById("SCOMP");
  dcompValELM = document.getElementById("DCOMP");
  breathTypeValELM = document.getElementById("BreathType");
  tpsValELM = document.getElementById("TPS");
  tpsUnitsValELM = document.getElementById("TPS_UNITS");
  vtValELM = document.getElementById("VT");
  pmaxValELM = document.getElementById("PMAX");
  ipeepValELM = document.getElementById("IPEEP");
  psValELM = document.getElementById("PS");
  modeValELM = document.getElementById("MODE");
  ieValELM = document.getElementById("IE");
  rrValELM = document.getElementById("RR");
  vtMvTitleELM = document.getElementById('VtMvTitle');
  vtMvUnitsELM = document.getElementById('VtMvUnits');
}
  
