var desiredFiO2 = 21;
var desiredVt = 400;
var desiredRr = 15;
var o2Purity = 100;

window.onload = function () {
  installVtKnob();
  installRrKnob();
  installPurityKnob();
  installFiO2Knob();
}

const vtKnobListener = function (knob, value) {
  desiredVt = 200+value*50;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installVtKnob() {
  // Create knob element, 150 x 150 px in size.
  const knob = pureknob.createKnob(150, 150);
  // Set properties.
  knob.setProperty('angleStart', -0.75 * Math.PI);
  knob.setProperty('angleEnd', 0.75 * Math.PI);
  knob.setProperty('colorFG', '#88ff88');
  knob.setProperty('trackWidth', 0.4);
  knob.setProperty('valMin', 0);
  knob.setProperty('valMax', 8);
  // custom numbers
  knob.setProperty('fnStringToValue', function(string) { 
    return (parseInt(string)-200)/50; 
  });
  knob.setProperty('fnValueToString', function(value) { 
    return ((value*50)+200).toString(); 
  });

  // Set initial value.
  knob.setValue(4);
  knob.addListener(vtKnobListener);
  // Create element node.
  const node = knob.node();
  // Add it to the DOM.
  const elem = document.getElementById('vtRrDiv');
  elem.appendChild(node);
}

const rrKnobListener = function (knob, value) {
  desiredRr = value;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installRrKnob() {
  // Create knob element, 150 x 150 px in size.
  const knob = pureknob.createKnob(150, 150);
  // Set properties.
  knob.setProperty('angleStart', -0.75 * Math.PI);
  knob.setProperty('angleEnd', 0.75 * Math.PI);
  knob.setProperty('colorFG', '#88ff88');
  knob.setProperty('trackWidth', 0.4);
  knob.setProperty('valMin', 10);
  knob.setProperty('valMax', 30);
  // Set initial value.
  knob.setValue(15);
  knob.addListener(rrKnobListener);
  // Create element node.
  const node = knob.node();
  // Add it to the DOM.
  const elem = document.getElementById('vtRrDiv');
  elem.appendChild(node);
}

var fiO2Knob = null;
function adjustFiO2Max() {
  degradedPurity = DegradedPurity(o2Purity);
  if (degradedPurity<desiredFiO2) {
    desiredFiO2 = degradedPurity;
    //fiO2Knob.setProperty('valMax', o2Purity);
    fiO2Knob.setValue(degradedPurity);
  }
}

const fiO2KnobListener = function (knob, value) {
  desiredFiO2 = value;
  adjustFiO2Max();
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installFiO2Knob() {
  // Create knob element, 150 x 150 px in size.
  fiO2Knob = pureknob.createKnob(150, 150);
  // Set properties.
  fiO2Knob.setProperty('angleStart', -0.75 * Math.PI);
  fiO2Knob.setProperty('angleEnd', 0.75 * Math.PI);
  fiO2Knob.setProperty('colorFG', '#88ff88');
  fiO2Knob.setProperty('trackWidth', 0.4);
  fiO2Knob.setProperty('valMin', 21);
  fiO2Knob.setProperty('valMax', 100);
  // Set initial value.
  fiO2Knob.setValue(21);
  fiO2Knob.addListener(fiO2KnobListener);
  // Create element node.
  const node = fiO2Knob.node();
  // Add it to the DOM.
  const elem = document.getElementById('fio2Div');
  elem.appendChild(node);
}

const purityKnobListener = function (knob, value) {
  o2Purity = value;
  adjustFiO2Max();
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2, o2Purity);
};

function installPurityKnob() {
  // Create knob element, 150 x 150 px in size.
  const knob = pureknob.createKnob(150, 150);
  // Set properties.
  knob.setProperty('angleStart', -0.75 * Math.PI);
  knob.setProperty('angleEnd', 0.75 * Math.PI);
  knob.setProperty('colorFG', '#88ff88');
  knob.setProperty('trackWidth', 0.4);
  knob.setProperty('valMin', 21);
  knob.setProperty('valMax', 100);
  // Set initial value.
  knob.setValue(100);
  knob.addListener(purityKnobListener);
  // Create element node.
  const node = knob.node();
  // Add it to the DOM.
  const elem = document.getElementById('fio2Div');
  elem.appendChild(node);
}

function updateFiO2Calculation(vt, rr, fiO2, o2Purity) {
  f = lookupO2FlowRate(vt,rr,fiO2,o2Purity);

  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = "<font size=6><b>" + parseFloat(f/1000).toFixed(1) 
    + " (litres/min)</b></font>" ;
}

