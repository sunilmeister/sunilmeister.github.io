// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var initVt = 500;
var initRr = 20;
var mvol = 10.0;
var changeVtQueitly = false;
var changeRrQueitly = false;

var vtKnob = null;
var rrKnob = null;

window.onload = function () {
  installVtKnob();
  installRrKnob();
}

function mVolChanged() {
  var elm = document.getElementById('mVol');
  mvol = elm.value;
  updatePsvCalculationMvolChange(mvol);
}

const vtKnobListener = function (knob, value) {
  if (changeVtQueitly) return;
  updatePsvCalculationVtChange(200 + value * 50);
};

function installVtKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('vtDiv');
  vtKnob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 0, 8);
  setVtValue(initVt);
  vtKnob.setChangeCallback(vtKnobListener);

  vtKnob.setProperty('fnStringToValue', function (string) {
    return (parseInt(string) - 200) / 50;
  });
  vtKnob.setProperty('fnValueToString', function (value) {
    return ((value * 50) + 200).toString();
  });
}

function setVtValue(vt) {
  changeVtQueitly = true;
  vtKnob.setValue((vt - 200) / 50);
  changeVtQueitly = false;
}

const rrKnobListener = function (knob, value) {
  if (changeRrQueitly) return;
  updatePsvCalculationRrChange(value);
};

function installRrKnob() {
  var bgColor = 'black';
  var fgColor = '#88ff88';
  var containerDiv = document.getElementById('rrDiv');
  rrKnob = new CircularGauge(containerDiv, 150, fgColor, bgColor, 10, 30);
  setRrValue(initRr);
  rrKnob.setChangeCallback(rrKnobListener);
}

function setRrValue(rr) {
  changeRrQueitly = true;
  rrKnob.setValue(rr);
  changeRrQueitly = false;
}

function updatePsvCalculationMvolChange(mvol) {
  splitMvIntoVtRr(mvol);
}

function updatePsvCalculationVtChange(vt) {
  let rr = mvol * 1000 / vt;
  if ((rr < 10) || (rr > 30))  {
    modalAlert("Inconsistent", "Resulting Respiration rate is not within" + 
      "\nthe RR range (10 - 30) bpm" +
      "\nSetting VT/RR to consistent values");
    splitMvIntoVtRr(mvol);
    return;
  }
  setRrValue(rr);
}

function updatePsvCalculationRrChange(rr) {
  let vt = mvol * 1000 / rr;
  if ((vt < 200) || (vt > 600)) {
    modalAlert("Inconsistent", "Resulting Tidal volume is not within" + 
      "\nthe VT range (200 - 600) ml" +
      "\nSetting VT/RR to consistent values");
    splitMvIntoVtRr(mvol);
    return;
  }
  setVtValue(vt);
}

function splitMvIntoVtRr(mvol) {
  let rrMin = null;
  let rrMax = null;
  for (let rr = 10; rr <= 30; rr++) {
    vt = mvol * 1000 / rr ;
    if ((vt >= 200) && (vt <= 600)) {
      if (rrMin) rrMax = rr;
      else rrMin = rr;
    }
  }
  if (!rrMax) rrMax = rrMin;
  rr = Math.floor((rrMax + rrMin) / 2);
  vt = mvol * 1000 / rr ;
  for (let v = 200; v <= 600; v += 100) {
    if (vt <= v) {
      vt = v;
      break;
    }
  }
  rr = Math.floor(mvol * 1000 / vt);
  setRrValue(rr);
  setVtValue(vt);
}
