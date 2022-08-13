/*
// Author: Sunil Nanda
*/

class LineChart {
  static const maxTickMarksXaxis = 20;
  
  static timeBasedXaxis = false;
  static minX = null;
  static maxX = null;
  static XaxisTemplate = {
    title: "",
    fontSize: 50,
    interlacedColor: 'white',
    interval: 1,
    minimum: 1,
    scaleBreaks: {
      customBreaks: [],
    },
  };
  static Xaxis = null;

  static createNewInstance(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // if timeBased, init/min/max are Date else breath numbers
  static calculateXaxisInterval(timeBased, min, max) {
    if (timeBased) {
      numPoints = (Date(max) - Date(min))/1000;
    } else {
      numPoints = max - min + 1;
    }
    interval = Math.ceil(numPoints/LineCharts.maxTickMarksXaxis);
    return interval;
  }


  // if timeBased, init/min/max are Date else breath numbers
  static calculateXaxisMinimum(timeBased, init, min) {
    if (timeBased) {
      return (Date(min)-Date(init))/1000 ;
    } else {
      return min-init;
    }
  }

  // X axis is the same for all charts in our application
  // if timeBased, init/min/max are Date else breath numbers
  static createXaxis(timeBased, init, min, max, missingWindows) {
    LineChart.timeBasedXaxis = timeBased;
    LineChart.minX = min;
    LineChart.maxX = max;

    Xaxis = LineChart.createNewInstance(XaxisTemplate);
    if (timeBased) {
      Xaxis.title = "Elapsed Time (secs)";
    } else {
      Xaxis.title = "Breath Number";
    }
    Xaxis.interval = LineChart.calculateXaxisInterval(timeBased, min, max);
    Xaxis.minimum = LineChart.calculateXaxisMinimum(timeBased, init, min);
    if (missingWindows.length) {
      Xaxis.scaleBreaks.customBreaks = LineChart.createNewInstance(missingWindows);
    }

    return Xaxis;
  }

  static getCreatedXaxis() {
    if (Xaxis) return LineChart.createNewInstance(LineChart.Xaxis);
    return null;
  }

  static createYaxis() {
  }

  constructor(containerDiv, Xaxis) {
    this.containerDiv = containerDiv;
  }

  addDatapointsPrimaryY() {
  }

  addDatapointsSecondaryY() {
  }

  render() {
  }

};
