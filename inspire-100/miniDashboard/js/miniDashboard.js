// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateFrontPanelRange() {
	let range = createRangeBnum(true, 0, session.maxBreathNum);
	session.snapshot.range = cloneObject(range);
}

function updateWavePanelRange() {
	let range = createRangeBnum(true, 0, session.maxBreathNum);
	session.waves.range = cloneObject(range);
}

function updateRangeOnNewBreath() {
  if (session.snapshot.visible) updateFrontPanelRange();
  if (session.waves.visible) updateWavePanelRange();
}

function switchToFrontPanel() {
	if (session.snapshot.visible) return;
	undisplayAllViews();

	session.snapshot.visible = true;
	resumeSnapshotsTimer();
  document.getElementById("frontPanelDiv").style.display = "block";
  document.getElementById("waves-pane").style.display = "none";

  updateFrontPanelRange();
	gatherSnapshotData();
	updateEntireFrontPanel();
  fpRefresh();
}

function switchToWaves() {
	if (session.waves.visible) return;
	undisplayAllViews();

	session.waves.visible = true;
  document.getElementById("frontPanelDiv").style.display = "none";
  document.getElementById("waves-pane").style.display = "block";
}

function appResize() {
	resizeWaves();
}

function resizeWaves() {
  let style = getComputedStyle(document.body);
	
  session.waves.labelFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveLabelFontSize'));
  session.waves.legendFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveLegendFontSize'));
  session.waves.titleFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveTitleFontSize'));
  session.waves.stripLineFontSize = 
		convertRemToPixelsInt(style.getPropertyValue('--waveStripLineFontSize'));
  session.waves.stripLineThickness = 
		convertRemToPixelsInt(style.getPropertyValue('--waveStripLineThickness'));

	resizeAllWaves();
  if (session.waves.visible) renderAllWaves();
}

var maxMILLIS = null;
function disassembleAndQueueChirp(d) {
  let fragmentIndex = 0;
  while (1) {
    let key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    fragment = d.content[key];
    let millisStr = fragment.MILLIS;
    let millis = parseChecksumString(millisStr);

		// ERROR detection
    if (millis == null) {
			console.error("*** MILLIS checksum error");
			continue // ignore this malformed chirp
		} else if (maxMILLIS && (millis < maxMILLIS)) {
			// MILLIS should be monotonically increasing
			// unless the chirps arrive out of order because of network buffering and latency
			console.log("*** Chirp out of order: Last MILLIS",maxMILLIS, " > New MILLIS",millis);
			//console.log("Last CHIRP",lastChirpQueued);
			//console.log("New CHIRP",d);
		}

		// Reach here if all is good - no ERRORs
    if (!startMillis) startMillis = Number(millis);
    fragment.MILLIS = Number(millis);
		let date = session.firstChirpDate;
		if (date === null) date = new Date(d.created);
    fragment.created = new Date(addMsToDate(date, (fragment.MILLIS - startMillis)));
    chirpQ.push(cloneObject(fragment));

		// For error checking the next round
		if (!maxMILLIS || (maxMILLIS < fragment.MILLIS)) maxMILLIS = fragment.MILLIS;
  }
}

function getCurrentSimulatedMillis() {
  let curDate = new Date();
  let deltaTimeInMs = curDate - startSystemDate;
  return startSimulatedMillis + deltaTimeInMs;
}

var dashboardChirpCount = 0;
function waitForChirps() {
  waitForHwPosts(inspireUid, function (d) {
    dormantTimeInSec = 0;
    autoCloseDormantPopup();

		// ignore old chirps
		dashboardChirpCount++;
		if ((dashboardChirpCount == 1) && (d.created < dashboardLaunchTime)) return;

    if (awaitingFirstChirp) {
      let millisStr = d.content["0"].MILLIS
      let millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed chirp

      simulatedMillis = Number(millis);
      startSimulatedMillis = simulatedMillis;
      startSystemDate = new Date();
    }
    awaitingFirstChirp = false;
    lastChirpInMs = simulatedMillis;
    disassembleAndQueueChirp(d);
  })
}

function HandlePeriodicTasks() {
  let invokeTimeInMs = (new Date()).getTime();
  if (awaitingFirstChirp) {
    let timeAwaitingFirstChirp = new Date() - dashboardLaunchTime ;
    if (dormantPopupManualCloseTime) {
      if ((new Date() - dormantPopupManualCloseTime) >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) {
          showDormantPopup();
        }
      }
    } else if ((new Date() - session.launchDate) >= MAX_CHIRP_INTERVAL_IN_MS) {
      if (!dormantPopupDisplayed) showDormantPopup();
    }
  } else if ((chirpQ.size() == 0) &&
    ((simulatedMillis - lastChirpInMs) >= MAX_CHIRP_INTERVAL_IN_MS)) {
    if (dormantPopupManualCloseTime) {
      if ((new Date() - dormantPopupManualCloseTime) >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) showDormantPopup();
      }
    } else if (!dormantPopupDisplayed) showDormantPopup();
  }
}

var dashboardSessionClosed = false;
function closeCurrentSession() {
	// allow navigation and manipulation of current session views
	dashboardSessionClosed = true;

	// display and sound a warning
	modalWarning("SESSION CLOSED", SESSION_CLOSED_MSG);
	enableWarningBeep();
	startWarningBeep();
}

setTimeout(function periodicCheck() {
  if (!awaitingFirstChirp) {
    simulatedMillis = getCurrentSimulatedMillis();
  }
  HandlePeriodicTasks();
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (chirpQ && chirpQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

var queuePrevBreathNum = null;
function FetchAndExecuteFromQueue() {
  let millis;
  while (1) {
    if (chirpQ.size() == 0) break;
    let d = chirpQ.peek();
    let millis = Number(d.MILLIS);
    if (simulatedMillis < millis) break;

    d = chirpQ.pop();
		if (dashboardSessionClosed) {
			return; // do not process any more chirps
		}

		if (isUndefined(d["content"])) break; // empty chirp

		// check if a new session has started without current one being closed
    if (!isUndefined(d.content["HWORLD"])) {
			if (session.firstChirpDate) {
				// A session was in progress but a new session started
				// must close current session and inform user
				closeCurrentSession();
				return;
			}
		}

    if (!isUndefined(d.content["BNUM"])) {
      let bnumContent = d.content["BNUM"];
			//console.log("FetchAndExecute BNUM",bnumContent);
      let bnumObj = parseJSONSafely(bnumContent);
			if (bnumObj) {
      	session.systemBreathNum = bnumObj[0];
      	if (session.startSystemBreathNum == null) {
        	session.startSystemBreathNum = session.systemBreathNum;
      	}
      	session.maxBreathNum = 
        	session.systemBreathNum - session.startSystemBreathNum + 1;
				if (queuePrevBreathNum && (session.systemBreathNum != (queuePrevBreathNum + 1))) {
					console.error("queuePrevBreathNum",queuePrevBreathNum,"New BNUM",session.systemBreathNum);
				}
				queuePrevBreathNum = 	session.systemBreathNum;
			} else {
				console.error("BAD BNUM Parsing",bnumContent);
			}
    }
    processDashboardChirp(cloneObject(d));
  }

  if (millis - simulatedMillis > MAX_DIFF_CHIRP_SIMULATION_TIMES) {
    modalAlert("Dashboard out of Sync", "Something went wrong\nPlease relaunch the Dashboard");
    console.error("Chirps way ahead of simulated time " + millis +
      " v/s " + simulatedMillis);
  }
  return;
}

function processDashboardChirp(chirp) {
  let curDate = new Date(chirp.created);
	let date = session.firstChirpDate;
	if (date === null) date = new Date(chirp.created);
  session.sessionDurationInMs = Math.abs(curDate.getTime() - date.getTime());

	/*
    if (!isUndefined(chirp.content["BNUM"])) {
      let bnumContent = chirp.content["BNUM"];
			console.log("--processJsonRecord BNUM",bnumContent);
		}
	*/
  processJsonRecord(chirp);
  createDashboards(chirp);

  return chirp;
}

function createDashboards(chirp) {
  if (session.snapshot.visible) {
		gatherSnapshotData();
		updateEntireFrontPanel();
  	fpRefresh();
	}
  if (session.waves.visible) wavesRefresh();
}

function wavesRefresh() {
}

function undisplayAllViews() {
  document.getElementById("frontPanelDiv").style.display = "none";
  document.getElementById("waves-pane").style.display = "none";

	session.snapshot.visible = false;
	session.waves.visible = false;

	pauseSnapshotsTimer();
	hideAllPopups();
}

window.onload = function () {
	dashboardLaunchTime = new Date();
	
	disableAllBeeps();  

  createNewSession();
  session.appId = MINI_DASHBOARD_APP_ID;
  session.launchDate = new Date();

  initDbNames();
  let heading = document.getElementById("sysUidTitle");
  if (inspireTag) {
    heading.innerHTML = inspireUid + "<br>(" + inspireTag + ")";
  } else {
    heading.innerHTML = "NOT SPECIFIED"
  }
  updateDocumentTitle();  

	createFpDivs();
	switchToFrontPanel();

	openAudioControl();

	setRootFontSize("miniDashboard", "miniDashboard", 0, 5);
	appResize();
	appResizeFunction = appResize;

  // now wait for chirps and act accordingly
  chirpQ = new Queue();
  waitForChirps();

}

function autoCloseDormantPopup() {
  if (dormantPopupDisplayed) {
    Swal.close();
    dormantPopupManualCloseTime = null;
  }
}

