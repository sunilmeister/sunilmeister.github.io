var desiredFiO2 = 21;
var desiredVt = 400;
var desiredRr = 15;
var o2Purity = 21;
var atmO2Purity = 21;
var altitude = 0;
var altitudeUnits = "feet";
var fiO2Knob = null;
var purityKnob = null;

alert(
  "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
  "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);

window.onload = function() {
  installVtKnob();
  installRrKnob();
  installPurityKnob();
  installFiO2Knob();
}

function altChanged() {
  var elm = document.getElementById('altitude');
  altitude=elm.value;
  elm = document.getElementById('altitudeUnits');
  altitudeUnits=elm.value;
  if (altitudeUnits=="feet") {
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

const vtKnobListener = function(knob, value) {
  desiredVt = 200 + value * 50;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installVtKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('vtRrDiv');
  const knob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 0, 8);
  knob.setValue(4);
  knob.setChangeCallback(vtKnobListener);

  knob.setProperty('fnStringToValue', function(string) {
    return (parseInt(string) - 200) / 50;
  });
  knob.setProperty('fnValueToString', function(value) {
    return ((value * 50) + 200).toString();
  });
}

const rrKnobListener = function(knob, value) {
  desiredRr = value;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installRrKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('vtRrDiv');
  const knob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 10, 30);
  knob.setValue(15);
  knob.setChangeCallback(rrKnobListener);
}

var settingFiO2KnobValues = false;
function adjustFiO2Max(o2Purity) {
  settingFiO2KnobValues = true;
  if (o2Purity < desiredFiO2) {
    alert("Max chievable FiO2 is " + o2Purity +'%\n' +
      "given the specified incoming O2 Purity value\n\n" +
      "Changing the FiO2 to " + o2Purity + '%');
    desiredFiO2 = o2Purity;
    fiO2Knob.setValue(o2Purity);
  }
  //fiO2Knob.setProperty('valMax', o2Purity);
  settingFiO2KnobValues = false;
}

const fiO2KnobListener = function(knob, value) {
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
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('fio2Div');
  fiO2Knob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 21, 100);
  fiO2Knob.setValue(21);
  fiO2Knob.setChangeCallback(fiO2KnobListener);
}

const purityKnobListener = function(knob, value) {
  o2Purity = value;
  adjustFiO2Max(o2Purity);
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity, atmO2Purity);
};

function installPurityKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('fio2Div');
  purityKnob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 21, 100);
  purityKnob.setValue(21);
  purityKnob.setChangeCallback(purityKnobListener);
}

function updateFiO2Calculation(vt, rr, fiO2, o2Purity, atmO2Purity) {
  f = lookupO2FlowRate(vt, rr, fiO2, o2Purity, atmO2Purity);
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = "<font size=6><b>" + parseFloat(f / 1000).toFixed(1) +
    " (litres/min)</b></font>";
}

