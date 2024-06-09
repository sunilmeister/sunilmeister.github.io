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

