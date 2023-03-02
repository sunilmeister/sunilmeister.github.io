// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// The constructor inputs are
// breathTimes array
// xRange is an object of the form
// {
//     rolling: true,
//     minBnum:null , 
//     maxBnum:null ,
//     missingBnum:[]
// };
// //////////////////////////////////////////////////////
class StatComputer {

  constructor(breathTimes, xRange) {
    this.breathTimes = breathTimes;
    this.xRange = xRange;
    this.initialize();
  }

  filterValues(transitions) {
    return this.filter(transitions, false);
  }

  filterTransitions(transitions) {
    return this.filter(transitions, true);
  }

  filter(transitions, keepOneBefore) {
    if (this.xRange.rolling) return transitions;
    var arr = [];
    var minDate = (this.breathTimes[this.xRange.minBnum]);
    var maxDate = (this.breathTimes[this.xRange.maxBnum]);

    var prevItem = null;
    for (let i = 1; i < transitions.length; i++) {
      var tDate = new Date(transitions[i].time);
      if (tDate > maxDate) {
        if (keepOneBefore && (arr.length == 0)) {
          if (prevItem) {
            arr.push(cloneObject(cloneObject(prevItem)));
            prevItem = null;
          }
        }
        break;
      }
      if (tDate < minDate) {
        prevItem = transitions[i];
        continue;
      } else if (tDate > minDate) {
        if (keepOneBefore && (arr.length == 0)) {
          if (prevItem) {
            arr.push(cloneObject(cloneObject(prevItem)));
            prevItem = null;
          }
        }
      }
      arr.push(cloneObject(transitions[i]));
    }

    if (keepOneBefore && (arr.length == 0)) {
      if (prevItem) {
        arr.push(cloneObject(cloneObject(prevItem)));
        prevItem = null;
      }
    }
    return arr;
  }

  rangeArray(transitions) {
    var arr = [];
    if (transitions.length <= 1) {
      // First one is always a dummy
      console.log("No transitions for statComputer");
      return transitions;
    }

    // Collect param datapoints per breath
    var curValue = 0;
    var curIx = 0;
    var curValue = transitions[0].value; // guaranteed to have at least one entry
    for (let i = 1; i < this.breathTimes.length; i++) {
      if (curIx == transitions.length - 1) {
        curValue = transitions[curIx].value;
      } else {
        if (this.breathTimes[i] >= transitions[curIx + 1].time) {
          curValue = transitions[++curIx].value;
        } else {
          curValue = transitions[curIx].value;
        }
      }
      if (this.xRange.rolling ||
        ((i <= this.xRange.maxBnum) && (i >= this.xRange.minBnum))) {
        arr.push({
          "time": new Date(this.breathTimes[i]),
          "value": curValue
        });
      }
    }
    return arr;
  }

  computeMinMaxAvg(transitions) {
    this.initialize();
    this.trimArray(transitions);

    var sum = null;
    var num = 0;
    for (let i = 0; i < this.computedValuesPerBreath.length; i++) {
      var val = this.computedValuesPerBreath[i];
      if (val == null) continue;
      num++;

      if (sum == null) sum = val;
      else sum += val;

      if (!this.computedMin) this.computedMin = val;
      else if (val < this.computedMin) this.computedMin = val;

      if (!this.computedMax) this.computedMax = val;
      else if (val > this.computedMax) this.computedMax = val;
    }

    if (sum != null) {
      var avg = sum / num;
      this.computedAvg = avg.toFixed(1);
    }
  }

  computedMin() {
    return this.computedMin;
  }

  computedMax() {
    return this.computedMax;
  }

  computedAvg() {
    return this.computedAvg;
  }

  computedValuesPerBreath() {
    return this.computedValuesPerBreath;
  }

  //////////////////////////////////////////////////////////////////////
  // Below are private methods
  //////////////////////////////////////////////////////////////////////

  // transitions is the transition array for a param
  trimArray(transitions) {
    if (transitions.length == 0) {
      console.log("No transitions for statComputer");
      return;
    }

    // Collect param datapoints per breath
    var curValue = 0;
    var curIx = 0;
    var curValue = transitions[0].value; // guaranteed to have at least one entry
    for (let i = 1; i < this.breathTimes.length; i++) {
      if (curIx == transitions.length - 1) {
        curValue = transitions[curIx].value;
      } else {
        if (this.breathTimes[i] >= transitions[curIx + 1].time) {
          curValue = transitions[++curIx].value;
        } else {
          curValue = transitions[curIx].value;
        }
      }
      if (this.xRange.rolling ||
        ((i <= this.xRange.maxBnum) && (i >= this.xRange.minBnum))) {
        this.computedValuesPerBreath.push(curValue);
      }
    }
  }

  initialize() {
    this.computedMin = null;
    this.computedMax = null;
    this.computedAvg = null;
    this.computedValuesPerBreath = [];
  }

};
