// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateFrontPanelRange() {
	let range = createRangeBnum(true, 0, session.maxBreathNum);
	session.snapshot.range = cloneObject(range);
}

function updateWavePanelRange() {
  let minBnum = 0;
  // find starting wave number searching backwards
  // remember there may be missing waves
  let numWaves = 0;
  for (let i=session.maxBreathNum-1; i>0; i--) {
    if (session.waves.pwData[i]) numWaves++;
    if (numWaves == MINI_WAVE_NUM_ROLLING_BREATHS) {
      minBnum = i;
      break;
    }
  }
  if (minBnum === null) minBnum = 1;

	let range = createRangeBnum(true, minBnum, session.maxBreathNum);
	session.waves.range = range;
}

function updateRangeOnNewBreath() {
  if (session.snapshot.visible) updateFrontPanelRange();
  if (session.waves.visible) updateWavePanelRange();
}

function switchToFrontPanel() {
	if (session.snapshot.visible) return;
	undisplayAllViews();

  document.getElementById("frontPanelDiv").style.display = "block";
  document.getElementById("waves-pane").style.display = "none";

	session.snapshot.visible = true;

	resumeSnapshotsTimer();
  updateFrontPanelRange();
	gatherSnapshotData();
	updateEntireFrontPanel();
  fpRefresh();
}

function switchToWaves() {
	if (session.waves.visible) return;
	undisplayAllViews();

  document.getElementById("frontPanelDiv").style.display = "none";
  document.getElementById("waves-pane").style.display = "block";

	session.waves.visible = true;

	wavesRefresh();
}

function appResize() {
	resizeWaves();
	if (isMobileLandscape()) switchToWaves();
	else if (isMobileBrowser()) switchToFrontPanel();
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
      let diff = maxMILLIS - millis;
			// MILLIS should be monotonically increasing
			// unless the chirps arrive out of order because of network buffering and latency
      if (diff > 100) {
        // Up to 100ms can be caused by Arduino and NodeMcu crystal frequency drift
			  console.log("*** Chirp out of order: Last MILLIS",maxMILLIS, " > New MILLIS",millis);
      }
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

      startSystemDate = new Date();
    }
    awaitingFirstChirp = false;
    let now = new Date();
    let nowMs = now.getTime();
    lastChirpInMs = nowMs;
    disassembleAndQueueChirp(d);
  })
}

function HandlePeriodicTasks() {
  if (!finishedLoading) return;
  let now = new Date();
  let nowMs = now.getTime();
  if (awaitingFirstChirp) {
    let timeAwaitingChirp = nowMs - dashboardLaunchTime.getTime() ;
    if (dormantPopupManualCloseTime) {
      let timeAwaitingChirp = nowMs - dormantPopupManualCloseTime.getTime();
      if (timeAwaitingChirp >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
        if (!dormantPopupDisplayed) {
          showDormantPopup();
        }
      }
    } else if (timeAwaitingChirp >= MAX_AWAIT_FIRST_CHIRP_IN_MS) {
      if (!dormantPopupDisplayed) {
        showDormantPopup();
      }
    }
  } else {
    let timeAwaitingChirp = nowMs - lastChirpInMs ;
    if (timeAwaitingChirp >= MAX_CHIRP_INTERVAL_IN_MS) {
      if (dormantPopupManualCloseTime) {
        let elapsedTime = nowMs - dormantPopupManualCloseTime.getTime();
        if (elapsedTime >= MAX_DORMANT_CLOSE_DURATION_IN_MS) {
          if (!dormantPopupDisplayed) showDormantPopup();
        }
      } else if (!dormantPopupDisplayed) {
        showDormantPopup();
      }
    }
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
  HandlePeriodicTasks();
  // Main update loop executed every PERIODIC_INTERVAL_IN_MS
  if (chirpQ && chirpQ.size()) {
    FetchAndExecuteFromQueue();
  }
  setTimeout(periodicCheck, TIMEOUT_INTERVAL_IN_MS);
}, TIMEOUT_INTERVAL_IN_MS)

function FetchAndExecuteFromQueue() {
  let millis;
  while (1) {
    if (chirpQ.size() == 0) break;

    let d = chirpQ.pop();
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
      let bnumObj = parseBnumData(bnumContent);
			if (bnumObj) {
      	session.systemBreathNum = bnumObj.bnum;
      	if (session.startSystemBreathNum == null) {
        	session.startSystemBreathNum = session.systemBreathNum;
      	}
        let chirpBnum = bnumObj.bnum - session.startSystemBreathNum + 1;
        if (chirpBnum >	session.maxBreathNum) {
      	  session.systemBreathNum = bnumObj.bnum;
         	session.maxBreathNum = chirpBnum;
        }
			} else {
				console.error("BAD BNUM Parsing",bnumContent);
			}
    }
    processDashboardChirp(cloneObject(d));
  }

  return;
}

function processDashboardChirp(chirp) {
  let curDate = new Date(chirp.created);
	let date = session.firstChirpDate;
	if (date === null) date = new Date(chirp.created);
  session.sessionDurationInMs = Math.abs(curDate.getTime() - date.getTime());

  processJsonRecord(chirp);
  createDashboards(chirp);
	createAlarmModals();

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

function createMiniWaves() {
	let containerId = "miniWaves";
  let container = document.getElementById(containerId);
  let body = findChildNodeByClass(container, WAVE_BODY_CLASS);
  let box = new WaveBox(body);
	box.setMiniOptions();
  session.waves.allWavesContainerInfo[containerId] = box;
}

function wavesRefresh() {
	createAllWaves();
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
  finishedLoading = false;
	appResizeFunction = appResize;
	
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

	createMiniWaves();
	createFpDivs();
	switchToFrontPanel();
	setRootFontSize("miniDashboard", "miniDashboard", 15, 5);

	openAudioControl();


  // now wait for chirps and act accordingly
  chirpQ = new Queue();
  waitForChirps();

  finishedLoading = true;
}

function autoCloseDormantPopup() {
  if (dormantPopupDisplayed) {
    Swal.close();
    dormantPopupManualCloseTime = null;
  }
}

