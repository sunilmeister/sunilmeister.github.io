// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateFrontPanelRangeOnEntry() {
	let range = createRangeBnum(true, 0, session.maxBreathNum);
	session.snapshot.range = cloneObject(range);
}

function switchToFrontPanel() {
	if (session.snapshot.visible) return;
	undisplayAllViews();

	session.snapshot.visible = true;
  document.getElementById("frontPanelDiv").style.display = "block";

  updateFrontPanelRangeOnEntry();
  fpRefresh();
}

function switchToWaves() {
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
		//console.log("dashboardLaunchTime",dashboardLaunchTime);
		//console.log("chirpTime",d.created);
    dormantTimeInSec = 0;
    autoCloseDormantPopup();

		// ignore old chirps
		dashboardChirpCount++;
		if ((dashboardChirpCount == 1) && (d.created < dashboardLaunchTime)) return;

    if (simulatedMillis - lastChirpInMs > INIT_RECORDING_INTERVAL_IN_MS) {
      initRecordingPrevContent();
    }
    if (awaitingFirstChirp) {
      let millisStr = d.content["0"].MILLIS
      let millis = parseChecksumString(millisStr);
      if (millis == null) return; // ignore this malformed chirp

      simulatedMillis = Number(millis);
      startSimulatedMillis = simulatedMillis;
      startSystemDate = new Date();
      let elm = document.getElementById("logStartDate");
      elm.innerHTML = dateToDateStr(d.created);
      elm = document.getElementById("logStartTime");
      elm.innerHTML = dateToTimeStr(d.created);
    }
    awaitingFirstChirp = false;
    lastChirpInMs = simulatedMillis;
    disassembleAndQueueChirp(d);
		displaySelectiveButtons();
  })
}

function undisplayAllViews() {
  document.getElementById("frontPanelDiv").style.display = "none";
  document.getElementById("waves-pane").style.display = "none";

	session.snapshot.visible = false;
	session.waves.visible = false;

	hideAllPopups();
}

window.onload = function () {
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

