// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formatRangeDateTooltip(num) {
	if (session.rangeSelector.timeBased) {
		let d = new Date(num);
		let mm = d.getMonth();
		let dd = d.getDate();
		let yyyy = d.getFullYear();
		let ddStr = String(dd).padStart(2, "0");
		let dateStr = ddStr+'-'+months[mm]+'-'+yyyy;
		let hour = d.getHours();
		let minute = d.getMinutes();
		let second = d.getSeconds();
		let hourStr = hour.toString().padStart(2, "0");
		let minuteStr = minute.toString().padStart(2, "0");
		let secondStr = second.toString().padStart(2, "0");
		let timeStr = `${hourStr}:${minuteStr}:${secondStr}`;
		return dateStr + "\n" + timeStr;
	} else {
    return String(parseInt(num));
	}
}

class IntRangeSlider {
  constructor(containerDiv, rangeMin, rangeMax, sliderMin, sliderMax, sliderStep) {
    if (rangeMin == rangeMax) rangeMax++;
    this.containerDiv = containerDiv;
    this.rangeMin = rangeMin;
    this.rangeMax = rangeMax;
    this.sliderMin = sliderMin;
    this.sliderMax = sliderMax;
    this.callback = null;
    this.rangeSlider = noUiSlider.create(containerDiv, {
      range: {
        min: rangeMin,
        max: rangeMax
      },
      step: sliderStep,
      start: [
        sliderMin,
        sliderMax
      ],
      connect: [false, true, false],
  		behaviour: 'drag',    
			// handle labels
      tooltips: [{
          to: function (n) {
            return formatRangeDateTooltip(parseInt(n));
          },
          from: function (str) {
            return Number(str);
          }
        },
        {
          to: function (n) {
            return formatRangeDateTooltip(parseInt(n));
          },
          from: function (str) {
            return Number(str);
          }
        }
      ],
    });
  }

  setRange(values) { // values is a 2 element array [min, max]
    this.rangeMin = values[0];
    this.rangeMax = values[1];
    if (this.rangeMin == this.rangeMax) this.rangeMax++;
    this.rangeSlider.updateOptions({
      range: {
        min: this.rangeMin,
        max: this.rangeMax
      }
    });
  }

  getRange() {
    return [this.rangeMin, this.rangeMax];
  }

  setSlider(values) { // values is a 2 element array [min, max]
    this.sliderMin = values[0];
    this.sliderMax = values[1];
    this.rangeSlider.set([this.sliderMin, this.sliderMax]);
  }

  getSlider() {
    [this.sliderMin, this.sliderMax] = this.rangeSlider.get();
    return [this.sliderMin, this.sliderMax];
  }

  setChangeCallback(callback) {
    this.callback = callback;
    this.rangeSlider.on('change', this.callback);
  }

};
