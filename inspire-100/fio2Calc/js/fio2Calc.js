// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var desiredFiO2 = 21;
var desiredVt = 400;
var desiredRr = 15;
var o2Purity = 21;
var atmO2Purity = 21;
var altitude = 0;
var altitudeUnits = "feet";
var fiO2Knob = null;
var purityKnob = null;
var vtKnob = null;
var rrKnob = null;

window.onload = function () {
	appScaleFactor = computeAppScalingFactor("wrapper");
	setRootFontSize(appScaleFactor);

  installVtKnob();
  installRrKnob();
  installPurityKnob();
  installFiO2Knob();

	appResize();
	appResizeFunction = appResize;
}

function appResize() {
  installVtKnob();
  installRrKnob();
  installPurityKnob();
  installFiO2Knob();
}

function altChanged() {
  var elm = document.getElementById('altitude');
  altitude = elm.value;
  elm = document.getElementById('altitudeUnits');
  altitudeUnits = elm.value;
  if (altitudeUnits == "feet") {
    atmO2Purity = o2PurityAtAltitudeFt(altitude);
  } else {
    atmO2Purity = o2PurityAtAltitudeMtr(altitude);
  }
  if (purityKnob.getProperty('valMin') != atmO2Purity) {
    purityKnob.setProperty('valMin', atmO2Purity);
    fiO2Knob.setProperty('valMin', atmO2Purity);
  }
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
}

const vtKnobListener = function (knob, value) {
  desiredVt = 200 + value * 50;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installVtKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('vtDiv');
	if (vtKnob) {
    containerDiv.removeChild(containerDiv.lastChild);
	}
	
  vtKnob = new CircularGauge(containerDiv, convertRemToPixels(7), fgColor, bgColor, 0, 8);
  vtKnob.setValue(4);
  vtKnob.setChangeCallback(vtKnobListener);

  vtKnob.setProperty('fnStringToValue', function (string) {
    return (parseInt(string) - 200) / 50;
  });
  vtKnob.setProperty('fnValueToString', function (value) {
    return ((value * 50) + 200).toString();
  });
}

const rrKnobListener = function (knob, value) {
  desiredRr = value;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installRrKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('rrDiv');
	if (rrKnob) {
    containerDiv.removeChild(containerDiv.lastChild);
	}
	
  rrKnob = new CircularGauge(containerDiv, convertRemToPixels(7), fgColor, bgColor, 10, 30);
  rrKnob.setValue(15);
  rrKnob.setChangeCallback(rrKnobListener);
}

var settingFiO2KnobValues = false;

function adjustFiO2Max(o2Purity) {
  settingFiO2KnobValues = true;
  if (o2Purity < desiredFiO2) {
    modalAlert("Inconsistent", "Max achievable FiO2 is " + o2Purity + '%\n' +
      "given the incoming O2 Purity value of " + o2Purity + "%\n\n" +
      "Changing FiO2 to " + o2Purity + '%');
    desiredFiO2 = o2Purity;
    fiO2Knob.setValue(o2Purity);
  }
  //fiO2Knob.setProperty('valMax', o2Purity);
  settingFiO2KnobValues = false;
}

const fiO2KnobListener = function (knob, value) {
  if (settingFiO2KnobValues) {
    // dont endlesslesly recurse
    return;
  }
  //console.log("FiO2 knob value=" + value);
  desiredFiO2 = value;
  if (o2Purity < desiredFiO2) {
    adjustFiO2Max(o2Purity);
  }
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installFiO2Knob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('fiO2Div');
	if (fiO2Knob) {
    containerDiv.removeChild(containerDiv.lastChild);
	}
	
  fiO2Knob = new CircularGauge(containerDiv, convertRemToPixels(7), fgColor, bgColor, 21, 100);
  fiO2Knob.setValue(21);
  fiO2Knob.setChangeCallback(fiO2KnobListener);
}

const purityKnobListener = function (knob, value) {
  o2Purity = value;
  adjustFiO2Max(o2Purity);
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installPurityKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('purityDiv');
	if (purityKnob) {
    containerDiv.removeChild(containerDiv.lastChild);
	}
	
  purityKnob = new CircularGauge(containerDiv, convertRemToPixels(7), fgColor, bgColor, 21, 100);
  purityKnob.setValue(21);
  purityKnob.setChangeCallback(purityKnobListener);
}

function updateFiO2Calculation(vt, rr, fiO2, o2Purity, atmO2Purity) {
  f = lookupO2FlowRate(vt, rr, fiO2, o2Purity, atmO2Purity);
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = "<font size=6><b>" + parseFloat(f / 1000).toFixed(1) +
    " (litres/min)</b></font>";
}
