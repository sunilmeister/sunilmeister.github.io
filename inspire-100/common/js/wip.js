	var paramsType = {
		"NATURAL_NUMBER" : null,
		"FIXED_POINT" : null,
		"BOOLEAN" :	["FALSE", "TRUE"],
		"BREATH_ENUM" : ["SPONTANEOUS", "MANDATORY"],
		"MODE_ENUM" : ["CMV", "ACV", "SIMV", "PSV"],
		"TPS_ENUM" : [
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

  var paramsInfo = {
		// measured params
		"STATE LOGGED": 									{key:"state", 			type: "XXX"},
		"DELIVERED VT LOGGED": 						{key:"vtdel", 			type: "XXX"},
		"MANDATORY MV LOGGED": 						{key:"mmvdel", 			type: "XXX"},
		"SPONTANEOUS MV LOGGED": 					{key:"smvdel", 			type: "XXX"},
		"TOTAL MV LOGGED": 								{key:"mvdel", 			type: "XXX"},
		"SPONTANEOUS BPM LOGGED": 				{key:"sbpm", 				type: "XXX"},
		"MANDATORY BPM LOGGED": 					{key:"mbpm", 				type: "XXX"},
		"BREATH TYPE LOGGED": 						{key:"breathType", 	type: "XXX"},
		"STATIC COMPLIANCE LOGGED": 			{key:"scomp", 			type: "XXX"},
		"DYNAMIC COMPLIANCE LOGGED": 			{key:"dcomp", 			type: "XXX"},
		"PEAK PRESSURE LOGGED": 					{key:"peak", 				type: "XXX"},
		"PLATEAU PRESSURE LOGGED": 				{key:"plat", 				type: "XXX"},
		"PEEP PRESSURE LOGGED": 					{key:"mpeep", 			type: "XXX"},
		"SYSTEM TEMPERATURE LOGGED": 			{key:"temp", 				type: "XXX"},
		"CMV SPONTANEOUS BREATHS LOGGED": {key:"cmvSpont", 		type: "XXX"},
		"NOTIFICATION LOGGED": 						{key:"info", 				type: "XXX"},
		"WARNING LOGGED": 								{key:"warning", 		type: "XXX"},
		"ERROR LOGGED": 									{key:"error", 			type: "XXX"},
		"O2FLOW LOGGED": 									{key:"o2FlowX10", 	type: "XXX"},

		// settings,
		"MODE SETTING": 									{key:"mode", 				type: "XXX"},
		"VT SETTING": 										{key:"vt", 					type: "XXX"},
		"MV SETTING": 										{key:"mv", 					type: "XXX"},
		"RR SETTING": 										{key:"rr", 					type: "XXX"},
		"EI SETTING": 										{key:"ie", 					type: "XXX"},
		"PEEP SETTING": 									{key:"ipeep", 			type: "XXX"},
		"PMAX SETTING": 									{key:"pmax", 				type: "XXX"},
		"PS SETTING": 										{key:"ps", 					type: "XXX"},
		"TPS SETTING": 										{key:"tps", 				type: "XXX"},
		"FIO2 SETTING": 									{key:"fiO2", 				type: "XXX"},
		"O2PURITY SETTING": 							{key:"o2Purity", 		type: "XXX"},
	};

  var paramChangeTemplate = {
		time: null;
		value: null;
	};

	class Param {
		constructor(name, type) {
			this.name = name;
			this.type = type;
			let initChange = cloneObject(paramChangeTemplate);
			initChange.time = 0;
			initChange.value = null;
			// changes is a sorted array - monotonically increasing in time
			// first entry is a null entry
			this.changes = [initChange];
		}

		name() { return this.name; }
		type() { return this.type; }

		// in increasing values of time only
		// time is a Date object
		addValueChange(time, value) {
			let len = this.changes.length;
			if (len > 1) {
				if (this.changes[len-1].time.getTime() >= time.getTime()) {
					console.error("Bad addValueChange for " + this.name);
					return;
				}
			}
			let change = cloneObject(paramChangeTemplate);
			change.time = time;
			change.value = value;
			this.changes.push(change);
		}

		valueAtTime(time) {
			// first entry in changes is a null entry
			if (this.changes.length == 1) return null;
			let ix = findLastValueChangeIndex(time);
			return this.changes[ix].value;
		}

		valueAtBnum(bnum) {
			if (!bnum) return null;
			// first entry in breathTimes is a null entry
			return valueAtTime(session.breathTimes[bnum]);
		}

		// return all values for surrent selected breath range
		valuesForSelectedRange() {
			return valuesFromBnum(session.reportRange.minBnum, session.reportRange.maxBnum);
		}

		// return all values logged starting from startBnum till endBnum
		valuesFromBnum(startBnum, endBnum) {
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
					values.push(value); // previously computed value
					continue;
				}

				if (btime.getTime() >= this.changes[changeIx + 1].time.getTime()) {
					changeIx++;
					value = this.changes[changeIx].value; // new value
				}

				values.push(value);
			}

			return values;
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

	var paramsValueTemplate = {
		breathNum: 0,

  	// measured params
  	state:          [{value:null, changeIndex:null}],
    vtdel:          [{value:null, changeIndex:null}],
    mmvdel:         [{value:null, changeIndex:null}],
    smvdel:         [{value:null, changeIndex:null}],
    mvdel:          [{value:null, changeIndex:null}],
    sbpm:           [{value:null, changeIndex:null}],
    mbpm:           [{value:null, changeIndex:null}],
    breathType:     [{value:null, changeIndex:null}],
    scomp:          [{value:null, changeIndex:null}],
    dcomp:          [{value:null, changeIndex:null}],
    peak:           [{value:null, changeIndex:null}],
    plat:           [{value:null, changeIndex:null}],
    mpeep:          [{value:null, changeIndex:null}],
    temp:           [{value:null, changeIndex:null}],
    fiO2:           [{value:null, changeIndex:null}],
    o2Purity:       [{value:null, changeIndex:null}],
    o2FlowX10:      [{value:null, changeIndex:null}],
    cmvSpont:       [{value:null, changeIndex:null}],
    info:           [{value:null, changeIndex:null}],
    warning:        [{value:null, changeIndex:null}],
    error:          [{value:null, changeIndex:null}],
  
    // settings
    mode:						[{value:null, changeIndex:null}],
    vt:							[{value:null, changeIndex:null}],
    mv:							[{value:null, changeIndex:null}],
    rr:							[{value:null, changeIndex:null}],
    ie:							[{value:null, changeIndex:null}],
    ipeep:					[{value:null, changeIndex:null}],
    pmax:						[{value:null, changeIndex:null}],
    ps:							[{value:null, changeIndex:null}],
    tps:						[{value:null, changeIndex:null}],
    fiO2:						[{value:null, changeIndex:null}],
    o2Purity:				[{value:null, changeIndex:null}],
    o2FlowX10:			[{value:null, changeIndex:null}],
	};

	changes: {
  	// measured params
  	state:          [{time:0, value:null}],
    vtdel:          [{time:0, value:null}],
    mmvdel:         [{time:0, value:null}],
    smvdel:         [{time:0, value:null}],
    mvdel:          [{time:0, value:null}],
    sbpm:           [{time:0, value:null}],
    mbpm:           [{time:0, value:null}],
    breathType:     [{time:0, value:null}],
    scomp:          [{time:0, value:null}],
    dcomp:          [{time:0, value:null}],
    peak:           [{time:0, value:null}],
    plat:           [{time:0, value:null}],
    mpeep:          [{time:0, value:null}],
    temp:           [{time:0, value:null}],
    fiO2:           [{time:0, value:null}],
    o2Purity:       [{time:0, value:null}],
    o2FlowX10:      [{time:0, value:null}],
    cmvSpont:       [{time:0, value:null}],
    info:           [{time:0, value:null}],
    warning:        [{time:0, value:null}],
    error:          [{time:0, value:null}],
  
    // settings
    mode:						[{time:0, value:null}],
    vt:							[{time:0, value:null}],
    mv:							[{time:0, value:null}],
    rr:							[{time:0, value:null}],
    ie:							[{time:0, value:null}],
    ipeep:					[{time:0, value:null}],
    pmax:						[{time:0, value:null}],
    ps:							[{time:0, value:null}],
    tps:						[{time:0, value:null}],
    fiO2:						[{time:0, value:null}],
    o2Purity:				[{time:0, value:null}],
    o2FlowX10:			[{time:0, value:null}],
	},

class ParamsValueCache {
	// Cache some number of values for each param
	// consecutive starting from startBnum
	constructor() {
		this.startBnum = 0;
		this.cache = [];
	}

	paramValue(key, bnum) {
		if (!bnum) return null;
		let cacheSize = this.cache.length;
		if (bnum < startBnum) || (bnum >= (startBnum + cacheSize)) {
			updateCache(bnum);
		}

		// guaranteed to find it in the cache at this point
		let ix = bnum - startBnum;
		let table = this.cache[ix];
		if (isUndefined(table.key)) return null;
		return table.key.value;
	}

	updateCache(bnum) {
		let paramsValue = new paramsValueTemplate;
		paramsValue.breathNum = bnum;
	}
};
