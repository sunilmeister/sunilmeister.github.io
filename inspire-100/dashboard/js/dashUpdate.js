// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

setInterval(function () {
	if (!session) return;
	blinkRecordingIndicator();
	blinkDashboardIndicator();
}, FAST_BLINK_INTERVAL_IN_MS)

function updateSidebar() {
  let tempC = session.params.tempC.LastValue();
	if (isValidValue(tempC)) {
  	tempGauge.setValue(tempC);
	}

	if (session.miscData.locationName !== null) {
  	locationDIV.innerHTML = session.miscData.locationName;
	} else {
  	locationDIV.innerHTML = "--";
	}

  let altF = "<small><small>ft</small></small>";
  let atmP = "<small><small>cmH2O</small></small>";

	if ((session.miscData.atmInCmH20 !== null) && (session.miscData.altInFt !== null)) {
		atmP = " (" + session.miscData.atmInCmH20 + atmP + ")";
  	altDIV.innerHTML = session.miscData.altInFt + altF + atmP;
	} else {
  	altDIV.innerHTML = "--";
	}

	if (session.miscData.atmO2Pct !== null) {
		let atm = "AtmOxygen " + session.miscData.atmO2Pct + "%";
  	atmDIV.innerHTML = atm;
	} else {
  	atmDIV.innerHTML = "--";
	}
}

function updateDashboardIndicator() {
  if (awaitingFirstChirp) {
    document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
  } else if (updatePaused) {
    document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  } else if (wifiDropped) {
    document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("DashboardActiveImg").src = "../common/img/GreenDot.png";
  }
}

var blankDashImg = false;
function blinkDashboardIndicator() {
	if (!session) return;
	if (blankDashImg) {
		blankDashImg = false;
  	if (awaitingFirstChirp) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
  	} else if (updatePaused) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  	} else if (wifiDropped) {
    	document.getElementById("DashboardActiveImg").src = "../common/img/YellowDot.png";
  	} else {
    	document.getElementById("DashboardActiveImg").src = "../common/img/GreenDot.png";
  	}
	} else {
		blankDashImg = true;
   	document.getElementById("DashboardActiveImg").src = "../common/img/BlankLED.png";
	}
}

function updateDashboardAndRecordingStatus() {
  updateDashboardIndicator();
  updateRecordingIndicator();
}

function displayNormalMessages() {
  wifiDropped = false;
  if (messagesBackground == "MEDIUMGREEN") return;
  let elm = document.getElementById("MessagesDiv");
  elm.style.backgroundColor = palette.mediumgreen;
  elm.style.color = palette.darkblue;
  messagesBackground = "MEDIUMGREEN";
  updateDashboardAndRecordingStatus();
}

function displayWifiDropped() {
  //if (app.initialState) return;
  wifiDropped = true;
  wifiDroppedBlink++;
  if (wifiDroppedBlink != 3) return;
  wifiDroppedBlink = 0;
  let elm;
  if (messagesBackground == "ORANGE") {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = palette.mediumgreen;
    elm.style.color = palette.darkblue;
    messagesBackground = "MEDIUMGREEN";
    elm = document.getElementById("Mline1");
    elm.innerHTML = savedL1;
    elm = document.getElementById("Mline2");
    elm.innerHTML = savedL2;
    elm = document.getElementById("Mline3");
    elm.innerHTML = savedL3;
    elm = document.getElementById("Mline4");
    elm.innerHTML = savedL4;
  } else {
    elm = document.getElementById("MessagesDiv");
    elm.style.backgroundColor = palette.orange;
    elm.style.color = "white";
    messagesBackground = "ORANGE";
    updateDashboardAndRecordingStatus();
    elm = document.getElementById("Mline1");
    savedL1 = elm.innerHTML;
    elm.innerHTML = "No Message from";
    elm = document.getElementById("Mline2");
    savedL2 = elm.innerHTML;
    elm.innerHTML = "Inspire-100 UID";
    elm = document.getElementById("Mline3");
    savedL3 = elm.innerHTML;
    elm.innerHTML = inspireUid;
    elm = document.getElementById("Mline4");
    savedL4 = elm.innerHTML;
    elm.innerHTML = "for " + dormantTimeInSec + " secs";
  }
}

