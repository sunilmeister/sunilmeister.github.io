// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// //////////////////////////////////////////////////////
// The constructor inputs are
// breathTimes array
// xRange is an object of the form
// {
//     moving: true,
//     minBnum:null , 
//     maxBnum:null ,
//     missingBnum:[]
// };
// //////////////////////////////////////////////////////
class StatComputer {

  constructor(breathTimes, xRange) {
    this.breathTimes = breathTimes;
    this.xRange = xRange;
  }

  filterChanges(transitions) {
    return this.filter(transitions, false);
  }

  filterTransitions(transitions) {
    return this.filter(transitions, true);
  }

  filter(transitions, keepOneBefore) {
    let arr = [];
    let minDate = (this.breathTimes[this.xRange.minBnum]);
    let maxDate = (this.breathTimes[this.xRange.maxBnum]);

    let prevItem = null;
    for (let i = 0; i < transitions.length; i++) {
      if (transitions[i].time === null) continue;
      let tDate = new Date(transitions[i].time);
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
      } else if (transitions.length) {
        arr.push(cloneObject(transitions[0]));
      }
    }
    return arr;
  }

  //////////////////////////////////////////////////////////////////////
  // Below are private methods
  //////////////////////////////////////////////////////////////////////

  // transitions is the transition array for a param
  trimArray(transitions) {
    if (transitions.length == 0) {
      //console.log("No transitions for statComputer");
      return;
    }

    // Collect param datapoints per breath
    let curValue = 0;
    let curIx = 0;
		let dummyTansitionValue = null;
    curValue = transitions[0].value; // guaranteed to have at least one entry
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

      if (i <= this.xRange.minBnum) {
				dummyTansitionValue = curValue;
			} else {
				// make sure there is a transition at minBnum
				if (this.computedValuesPerBreath.length == 0) {
					if (dummyTansitionValue) {
						// put in the last transition before minBnum
     				this.computedValuesPerBreath.push(dummyTansitioniValue);
					}
				}
			}

      if ((i <= this.xRange.maxBnum) && (i >= this.xRange.minBnum)) {
        this.computedValuesPerBreath.push(curValue);
      }
    }
  }

};
