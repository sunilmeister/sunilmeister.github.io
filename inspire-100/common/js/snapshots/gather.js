// ///////////////////////////////////////////////////////////////
// Author: Sunil Nanda
// ///////////////////////////////////////////////////////////////

function gatherSnapshotData() {
	session.snapshot.content = {};
	let snap = session.snapshot.content;
	let params = session.params;

	// keep track of the snapshot time
	if (session.snapshot.range.moving) {
		snap.time = session.lastChirpDate;
	} else {
		snap.time = session.snapshot.range.maxTime;
	}
	if (snap.time === null) return;

	// Patient info
	snap.patientName = "--" ;
	if (session.patientData.fname) snap.patientName = session.patientData.fname;
	if (session.patientData.lname) snap.patientName += " " + session.patientData.lname;
	snap.patientAge = "";
	if (session.patientData.gender) {
	  snap.patientAge = "Gender: " + session.patientData.gender;
	} else {
	  snap.patientAge = "Gender: ?";
	}
	if (session.patientData.age) {
	  snap.patientAge += "&nbsp&nbspAge: " + session.patientData.age + "yr";
	} else {
	  snap.patientAge += "&nbsp&nbspAge: ?";
	}
	snap.patientStats = "";
	if (session.patientData.weight) {
	  snap.patientStats = "Weight: " + session.patientData.weight + "kg";
	} else {
	  snap.patientStats = "Weight: ?";
	}
	if (session.patientData.height) {
	  snap.patientStats += "&nbsp&nbspHeight: " + session.patientData.height + "cm";
	} else {
	  snap.patientStats += "&nbsp&nbspHeight: ?";
	}

	// Breath number closest to the time
	snap.breathNum = lookupBreathNum(snap.time);

	// UP time
	snap.uptimeMins = params.upTimeMins.ValueAtTime(snap.time);

	// Total System Breaths
	snap.totalBreaths = session.startSystemBreathNum;
	if (snap.totalBreaths !== null) {
		snap.totalBreaths = session.startSystemBreathNum + session.maxBreathNum - 1;
	}

	// Buzzer Disabled
	snap.buzzerMuted = params.buzzerMuted.ValueAtTime(snap.time);

	// Message lines
	snap.lcdLine1 = params.lcdLine1.ValueAtTime(snap.time);
	snap.lcdLine2 = params.lcdLine2.ValueAtTime(snap.time);
	snap.lcdLine3 = params.lcdLine3.ValueAtTime(snap.time);
	snap.lcdLine4 = params.lcdLine4.ValueAtTime(snap.time);

	// state
	snap.state = params.state.ValueAtTime(snap.time);

	// input settings
	snap.mode 		= params.mode.ValueAtTime(snap.time);
	snap.vt 			= params.vt.ValueAtTime(snap.time);
	snap.mv 			= params.mv.ValueAtTime(snap.time);
	snap.rr 			= params.rr.ValueAtTime(snap.time);
	snap.ie 			= params.ie.ValueAtTime(snap.time);
	snap.ipeep 		= params.ipeep.ValueAtTime(snap.time);
	snap.pmax 		= params.pmax.ValueAtTime(snap.time);
	snap.ps 			= params.ps.ValueAtTime(snap.time);
	snap.tps 			= params.tps.ValueAtTime(snap.time);
	snap.psTrigger= params.psTrigger.ValueAtTime(snap.time);
	snap.fiO2 		= params.fiO2.ValueAtTime(snap.time);
	snap.o2Purity = params.o2Purity.ValueAtTime(snap.time);

	// pending input settings
	snap.pendingMode 		= params.pendingMode.ValueAtTime(snap.time);
	snap.pendingVt 			= params.pendingVt.ValueAtTime(snap.time);
	snap.pendingMv 			= params.pendingMv.ValueAtTime(snap.time);
	snap.pendingRr 			= params.pendingRr.ValueAtTime(snap.time);
	snap.pendingIe 			= params.pendingIe.ValueAtTime(snap.time);
	snap.pendingIpeep 	= params.pendingIpeep.ValueAtTime(snap.time);
	snap.pendingPmax 		= params.pendingPmax.ValueAtTime(snap.time);
	snap.pendingPs 			= params.pendingPs.ValueAtTime(snap.time);
	snap.pendingTps 		= params.pendingTps.ValueAtTime(snap.time);

	// measured parameters
	snap.vtdel 			= params.vtdel.ValueAtTime(snap.time);
	snap.mvdel 			= params.mvdel.ValueAtTime(snap.time);
	snap.mmvdel			= params.mmvdel.ValueAtTime(snap.time);
	snap.smvdel			= params.smvdel.ValueAtTime(snap.time);
	snap.sbpm 			= params.sbpm.ValueAtTime(snap.time);
	snap.mbpm 			= params.mbpm.ValueAtTime(snap.time);
	snap.btype 			= params.btype.ValueAtTime(snap.time);
	snap.bcontrol		= params.bcontrol.ValueAtTime(snap.time);
	snap.scomp 			= params.scomp.ValueAtTime(snap.time);
	snap.dcomp 			= params.dcomp.ValueAtTime(snap.time);
	snap.peak 			= params.peak.ValueAtTime(snap.time);
	snap.plat 			= params.plat.ValueAtTime(snap.time);
	snap.mpeep 			= params.mpeep.ValueAtTime(snap.time);
	snap.o2FlowX10	= params.o2FlowX10.ValueAtTime(snap.time);

	// errors and warnings
	snap.errorTag 	= params.errorTag.ValueAtTime(snap.time);
	snap.warningTag	= params.warningTag.ValueAtTime(snap.time);
	snap.attention	= params.attention.ValueAtTime(snap.time);
	snap.somePending= params.somePending.ValueAtTime(snap.time);
}

