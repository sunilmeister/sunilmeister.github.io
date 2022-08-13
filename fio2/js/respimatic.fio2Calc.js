var desiredFiO2 = 21;
var desiredVt = 400;
var desiredRr = 15;
var o2Purity = 100;

window.onload = function() {
  installVtKnob();
  installRrKnob();
  installPurityKnob();
  installFiO2Knob();
  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n" +
    "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );
}
const vtKnobListener = function(knob, value) {
  desiredVt = 200 + value * 50;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
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
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installRrKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('vtRrDiv');
  const knob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 10, 30);
  knob.setValue(15);
  knob.setChangeCallback(rrKnobListener);
}

var fiO2Knob = null;
var purityKnob = null;

function adjustFiO2Max() {
  degradedPurity = DegradedPurity(o2Purity);
  if (degradedPurity < desiredFiO2) {
    desiredFiO2 = degradedPurity;
    //fiO2Knob.setProperty('valMax', o2Purity);
    fiO2Knob.setValue(degradedPurity);
  }
}
const fiO2KnobListener = function(knob, value) {
  desiredFiO2 = value;
  adjustFiO2Max();
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
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
  adjustFiO2Max();
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installPurityKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88' ;
  var containerDiv = document.getElementById('fio2Div');
  purityKnob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 21, 100);
  purityKnob.setValue(21);
  purityKnob.setChangeCallback(purityKnobListener);
}

function updateFiO2Calculation(vt, rr, fiO2, o2Purity) {
  f = lookupO2FlowRate(vt, rr, fiO2, o2Purity);
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = "<font size=6><b>" + parseFloat(f / 1000).toFixed(1) +
    " (litres/min)</b></font>";
}

