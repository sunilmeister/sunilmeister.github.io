var desiredFiO2 = 21;
var desiredVt = 400;
var desiredRr = 15;

window.onload = function () {
  installVtKnob();
  installRrKnob();
  installFiO2Knob();
}

const vtKnobListener = function (knob, value) {
  desiredVt = 200+value*50;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2);
};

function installVtKnob() {
  // Create knob element, 125 x 125 px in size.
  const knob = pureknob.createKnob(125, 125);
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
  const elem = document.getElementById('vtDiv');
  elem.appendChild(node);
}

const rrKnobListener = function (knob, value) {
  desiredRr = value;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2);
};

function installRrKnob() {
  // Create knob element, 125 x 125 px in size.
  const knob = pureknob.createKnob(125, 125);
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
  const elem = document.getElementById('rrDiv');
  elem.appendChild(node);
}

const fiO2KnobListener = function (knob, value) {
  desiredFiO2 = value;
  updateFiO2Calculation(desiredVt, desiredRr, desiredFiO2);
};

function installFiO2Knob() {
  // Create knob element, 125 x 125 px in size.
  const knob = pureknob.createKnob(125, 125);
  // Set properties.
  knob.setProperty('angleStart', -0.75 * Math.PI);
  knob.setProperty('angleEnd', 0.75 * Math.PI);
  knob.setProperty('colorFG', '#88ff88');
  knob.setProperty('trackWidth', 0.4);
  knob.setProperty('valMin', 21);
  knob.setProperty('valMax', 100);
  // Set initial value.
  knob.setValue(21);
  knob.addListener(fiO2KnobListener);
  // Create element node.
  const node = knob.node();
  // Add it to the DOM.
  const elem = document.getElementById('fio2Div');
  elem.appendChild(node);
}

function updateFiO2Calculation(vt, rr, fiO2) {
  if (fiO2<21) fiO2 = 21;

  mv = vt * rr;
  f = (mv * (fiO2 - 21)) / (100 - 21);
  elm = document.getElementById("o2FlowRate");
  elm.innerHTML = "<font size=6><b>" + parseFloat(f/1000).toFixed(1) 
    + " (litres/min)</b></font>" ;

  //console.log("desiredVt=" + desiredVt);
  //console.log("desiredRr=" + desiredRr);
  //console.log("desiredFiO2=" + desiredFiO2);
}

