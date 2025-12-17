// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class CircularGauge {
  constructor(containerDiv, sizeInPx, fgColor, bgColor, rangeMin, rangeMax, decimalPoint) {
    this.containerDiv = containerDiv;
    this.callback = null;
    if (!isUndefined(decimalPoint)) {
      this.decimalPoint = decimalPoint;
    } else {
      this.decimalPoint = false;
    }

    // create and set properties
    this.gauge = pureknob.createKnob(sizeInPx, sizeInPx);
    this.gauge.setProperty('angleStart', -0.75 * Math.PI);
    this.gauge.setProperty('angleEnd', 0.75 * Math.PI);
    this.gauge.setProperty('colorFG', fgColor);
    this.gauge.setProperty('colorBG', bgColor);
    this.gauge.setProperty('trackWidth', 0.4);
    this.gauge.setProperty('textScale', 1.4);

    if (this.decimalPoint) {
      this.gauge.setProperty('valMin', rangeMin*10);
      this.gauge.setProperty('valMax', rangeMax*10);
      this.gauge.setProperty('fnValueToString', function(value) {
        if (isNaN(value)) return value;
        const floatValue = value/10;
        return floatValue.toFixed(1);
      });

    this.gauge.setProperty('fnStringToValue', function(string) {
        const f = parseFloat(string) *10;
        return f;
      });    
    } else {
      this.gauge.setProperty('valMin', rangeMin);
      this.gauge.setProperty('valMax', rangeMax);
    }

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
