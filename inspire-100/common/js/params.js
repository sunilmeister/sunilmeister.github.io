const paramsType = {
	NATURAL_NUMBER : 	"NATURAL_NUMBER",
	FIXED_POINT : 		"FIXED_POINT",
	PERCENT : 				"PERCENT",
	BOOLEAN :					["FALSE", "TRUE"],
	STATE : 					["INITIAL", "STANDBY", "ACTIVE", "ERROR"],
	IE : 							["1:1", "1:2", "1:3"],
	BREATH_TYPE : 		["SPONTANEOUS", "MANDATORY", "MAINTENANCE"],
	BREATH_CONTROL : 	["VOLUME", "PRESSURE"],
	MODE : 						["CMV", "ACV", "SIMV", "PSV"],
	TPS : 						[
											 "10% of Peak Flow",
											 "20% of Peak Flow",
											 "30% of Peak Flow",
											 "40% of Peak Flow",
											 "50% of Peak Flow",
											 "60% of Peak Flow",
											 "1.0 secs",
											 "1.5 secs",
											 "2.0 secs",
											 "2.5 secs",
										],
};

function initSessionParams() {
	let type = paramsType;
	session.params.state = 			new Param("STATE", type.STATE, "");
	session.params.vtdel = 			new Param("TIDAL_VOLUME", type.NATURAL_NUMBER, "ml");
	session.params.mvdel = 			new Param("MINUTE_VOLUME", type.FIXED_POINT, "l/min");
	session.params.mmvdel = 		new Param("MANDATORY_MINUTE_VOLUME", type.FIXED_POINT, "l/min");
	session.params.smvdel = 		new Param("SPONTANEOUS_MINUTE_VOLUME", type.FIXED_POINT, "l/min");
	session.params.sbpm = 			new Param("SPONTANEOUS_BPM", type.NATURAL_NUMBER, "bpm");
	session.params.mbpm = 			new Param("MANDATORY_BPM", type.NATURAL_NUMBER, "bpm");
	session.params.btype = 			new Param("BREATH_TYPE", type.BREATH_TYPE, "");
	session.params.bcontrol = 	new Param("BREATH_CONTROL", type.BREATH_CONTROL, "");
	session.params.scomp = 			new Param("STATIC_COMPLIANCE", type.NATURAL_NUMBER, "ml/cmH2O");
	session.params.dcomp = 			new Param("DYNAMIC_COMPLIANCE", type.NATURAL_NUMBER, "ml/cmH2O");
	session.params.peak = 			new Param("PEAK_PRESSURE", type.NATURAL_NUMBER, "cmH2O");
	session.params.mpeep = 			new Param("PEEP_PRESSURE", type.NATURAL_NUMBER, "cmH2O");
	session.params.plat = 			new Param("PLATEAU_PRESSURE", type.NATURAL_NUMBER, "cmH2O");
	session.params.temp = 			new Param("SYSTEM_TEMPERATURE", type.NATURAL_NUMBER, "degC");
	session.params.cmvSpont = 	new Param("CMV_SPONTANEOUS_BREATHS", type.NATURAL_NUMBER, "");
	session.params.o2FlowX10 = 	new Param("OXYGEN_SOURCE_FLOW", type.FIXED_POINT, "l/min");
	session.params.errors = 		new Param("ERRORS", type.NATURAL_NUMBER, "");
	session.params.warnings = 	new Param("WARNINGS", type.NATURAL_NUMBER, "");
	session.params.info = 			new Param("NOTIFICATIONS", type.NATURAL_NUMBER, "");

	session.params.mode = 			new Param("MODE_SETTING", type.MODE, "");
	session.params.vt = 				new Param("VT_SETTING", type.NATURAL_NUMBER, "ml");
	session.params.mv = 				new Param("MV_SETTING", type.FIXED_POINT, "l/min");
	session.params.rr = 				new Param("RR_SETTING", type.NATURAL_NUMBER, "bpm");
	session.params.ie = 				new Param("IE_SETTING", type.IE, "");
	session.params.ipeep = 			new Param("PEEP_SETTING", type.NATURAL_NUMBER, "cmH2O");
	session.params.pmax = 			new Param("PMAX_SETTING", type.NATURAL_NUMBER, "cmH2O");
	session.params.ps = 				new Param("PS_SETTING", type.NATURAL_NUMBER, "cmH2O");
	session.params.tps = 				new Param("TPS_SETTING", type.TPS, "");
	session.params.fiO2 = 			new Param("FIO2_SETTING", type.NATURAL_NUMBER, "%");
	session.params.o2Purity = 	new Param("OXYGEN_SOURCE_PURITY_SETTING", type.NATURAL_NUMBER, "%");
}

var paramChangeTemplate = {
	time: 	null,
	value: 	null,
};

class Param {
	constructor(name, type, units) {
		this.name = name;
		this.type = type;
		this.units = units;
		let initChange = cloneObject(paramChangeTemplate);
		initChange.time = 0;
		initChange.value = null;
		// changes is a sorted array - monotonically increasing in time
		// first entry is a null entry
		this.changes = [initChange];
	}

	// some queries
	name() { return this.name; }
	type() { return this.type; }
	units() { return this.units; }
	changes() { return this.changes; }

	// each call must be monotonically increasing in time values
	// time is a Date object
	addTimeValue(time, value) {
		let len = this.changes.length;
		if (len > 1) {
			if (this.changes[len-1].time.getTime() >= time.getTime()) {
				console.error("Bad addValueChange for " + this.name);
				return;
			}
		}
		let v = this.lastValue();
		if (v = value) return; // record only changes
		let change = cloneObject(paramChangeTemplate);
		change.time = time;
		change.value = value;
		this.changes.push(change);
	}

	firstValue() {
		let len = this.changes.length;
		if (len <= 1) return null;
		// first entry is a null entry
		return changes[1].value;
	}

	lastValue() {
		let len = this.changes.length;
		if (len <= 1) return null;
		// first entry is a null entry
		return changes[len-1].value;
	}

	// time is a Date Object
	valueAtTime(time) {
		// first entry in changes is a null entry
		if (this.changes.length == 1) return null;
		let ix = findLastValueChangeIndex(time);
		return this.changes[ix].value;
	}

	// bnum must have been logged
	valueAtBnum(bnum) {
		if (!bnum) return null;
		// first entry in breathTimes is a null entry
		return valueAtTime(session.breathTimes[bnum]);
	}

	// helper function to compute min/max/avg
	updateStats(stats, value) {
		if (value === null) return stats;
		stats.sum += value;
		stats.num++;

		if (stats.min === null) stats.min = value;
		else if (stats.min > value) stats.min = value;

		if (stats.max === null) stats.max = value;
		else if (stats.max < value) stats.max = value;
	}

	// return all values logged starting from startBnum till endBnum in intervals of stepBnum
	values(startBnum, endBnum, stepBnum) {
		if (isUndefined(stepBnum)) stepBnum = 1;
		let values = [];
		let endChangeIndex = this.changes.length - 1;
		let changeIx = findLastValueChangeIndex(time);
		if (!changeIx) return values;
		let value = this.changes[changeIx].value;
		values.push(value);

		let endTime = session.breathTimes[endBnum];
		let nextBnumToStore = startBnum + stepBnum;
		for (let bnum=startBnum+1; bnum <= endBnum; bnum++) {
			let btime = session.breathTimes[bnum];
			if ((changeIx >= endChangeIndex) || (btime.getTime() >= endTime.getTime())) {
				if (bnum == nextBnumToStore) {
					values.push(value); // previously computed value
					nextBnumToStore += stepBnum;
				}
				continue;
			}

			if (btime.getTime() >= this.changes[changeIx + 1].time.getTime()) {
				changeIx++;
				value = this.changes[changeIx].value; // new value
			}

			if (bnum == nextBnumToStore) {
				values.push(value);
				nextBnumToStore += stepBnum;
			}
		}

		return values;
	}

	// returns an array of distinct values over the range
	distinctValues(startBnum, endBnum) {
		let values = [];
		let endChangeIndex = this.changes.length - 1;
		let changeIx = findLastValueChangeIndex(time);
		if (!changeIx) return values;
		let value = this.changes[changeIx].value;
		values.push(value);

		let endTime = session.breathTimes[endBnum];
		for (let bnum=startBnum+1; bnum <= endBnum; bnum++) {
			let btime = session.breathTimes[bnum];
			if ((changeIx >= endChangeIndex) || (btime.getTime() >= endTime.getTime())) {
				break;
			}

			if (btime.getTime() >= this.changes[changeIx + 1].time.getTime()) {
				changeIx++;
				value = this.changes[changeIx].value; // new value
			}

			if (values.indexOf(value) == -1) values.push(value);
		}

		return values;
	}

	// returns {min: , max:, avg: }
	countValueEqual(targetValue, startBnum, endBnum) {
		let count = 0;
		let endChangeIndex = this.changes.length - 1;
		let changeIx = findLastValueChangeIndex(time);
		if (!changeIx) return values;
		let value = this.changes[changeIx].value;
		if (value == targetValue) count++;

		let endTime = session.breathTimes[endBnum];
		for (let bnum=startBnum+1; bnum <= endBnum; bnum++) {
			let btime = session.breathTimes[bnum];
			if ((changeIx >= endChangeIndex) || (btime.getTime() >= endTime.getTime())) {
				if (value == targetValue) count++;
				continue;
			}

			if (btime.getTime() >= this.changes[changeIx + 1].time.getTime()) {
				changeIx++;
				value = this.changes[changeIx].value; // new value
			}

			if (value == targetValue) count++;
		}

		return count;
	}

	// returns {min: , max:, avg: }
	minMaxAvg(startBnum, endBnum) {
		let stats = {min: null, max: null, avg:null, sum:0, num:0};
		let endChangeIndex = this.changes.length - 1;
		let changeIx = findLastValueChangeIndex(time);
		if (!changeIx) return values;
		let value = this.changes[changeIx].value;
		stats = updateStats(stats, value);

		let endTime = session.breathTimes[endBnum];
		for (let bnum=startBnum+1; bnum <= endBnum; bnum++) {
			let btime = session.breathTimes[bnum];
			if ((changeIx >= endChangeIndex) || (btime.getTime() >= endTime.getTime())) {
				stats = updateStats(stats, value);
				continue;
			}

			if (btime.getTime() >= this.changes[changeIx + 1].time.getTime()) {
				changeIx++;
				value = this.changes[changeIx].value; // new value
			}

			stats = updateStats(stats, value);
		}

		let rval = {min: stats.min, max: stats.max, avg: stats.sum/stats.num};
		return rval;
	}

  // Recursive Binary search for change at or immediately before given time
	// start and end are indices
  findLastValueChangeIndex(time, start, end) {
  	if (isUndefined(start)) start = 1;
  	if (isUndefined(end)) end = this.changes.length - 1;
  	if (end < start) return 0;
  	if (start < 1) return 0;
  	if (end >= this.changes.length) return 0;
  
    // find the middle index
    let mid = Math.floor((start + end) / 2);
  	if (mid <= 1) return 0;
  
    if (this.changes[mid].time.getTime() == time.getTime()) return mid;
  
    if (this.changes[mid].time.getTime() > time.getTime()) {
  		// check to see if the one before is less than given time
  		// if so, that is the one
  		let midM1 = mid - 1;
  		if (midM1 && this.changes[midM1].time.getTime() <= time.getTime()) return midM1;
  		else {
     		// If the element in the middle is greater than the time, look in the left half
  			return this.findLastValueChangeIndex(time, start, mid - 1);
  		}
   	} else {
     	// If the element in the middle is smaller than the time, look in the right half
  		 return this.findLastValueChangeIndex(time, mid + 1, end);
  	}
  }

};

