// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class CircularGauge {
  constructor(containerDiv, sizeInPx, fgColor, bgColor, rangeMin, rangeMax) {
    this.containerDiv = containerDiv;
    this.callback = null;

    // create and set properties
    this.gauge = pureknob.createKnob(sizeInPx, sizeInPx);
    this.gauge.setProperty('angleStart', -0.75 * Math.PI);
    this.gauge.setProperty('angleEnd', 0.75 * Math.PI);
    this.gauge.setProperty('colorFG', fgColor);
    this.gauge.setProperty('colorBG', bgColor);
    this.gauge.setProperty('trackWidth', 0.4);
    this.gauge.setProperty('valMin', rangeMin);
    this.gauge.setProperty('valMax', rangeMax);
    this.gauge.setProperty('textScale', 1.0);
    this.gauge.setValue();

    // append node to DOM
    const node = this.gauge.node();
    containerDiv.appendChild(node);
  }

  setValue(value) {
    if (value !== null) {
      this.gauge.setValue(value);
    } else {
      this.gauge.setValue(); // NaN
    }
  }

  getValue() {
    return this.value;
  }

  setProperty(property, value) {
    this.gauge.setProperty(property, value);
  }

  getProperty(property) {
    return this.gauge.getProperty(property);
  }

  setChangeCallback(callback) {
    this.callback = callback;
    this.gauge.addListener(this.callback);
  }

};
