// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// returns an object {L1: , L2:, L3:, L4}
// four lines that make up the alert message
function lookupWarningMessage(alertTime) {
	let l1 = session.params.lcdWLine1.ValueAtTime(alertTime);
	let l2 = session.params.lcdWLine2.ValueAtTime(alertTime);
	let l3 = session.params.lcdWLine3.ValueAtTime(alertTime);
	let l4 = session.params.lcdWLine4.ValueAtTime(alertTime);

	return {L1:l1, L2:l2, L3:l3, L4:l4};
}

function lookupErrorMessage(alertTime) {
	let l1 = session.params.lcdELine1.ValueAtTime(alertTime);
	let l2 = session.params.lcdELine2.ValueAtTime(alertTime);
	let l3 = session.params.lcdELine3.ValueAtTime(alertTime);
	let l4 = session.params.lcdELine4.ValueAtTime(alertTime);

	return {L1:l1, L2:l2, L3:l3, L4:l4};
}

function formAlertMessageStr(json) {
	let str = "";
	if (!isUndefined(json.L1) && (json.L1 !== null)) str += json.L1;
	if (!isUndefined(json.L2) && (json.L2 !== null)) str += "\n" + json.L2;
	if (!isUndefined(json.L3) && (json.L3 !== null)) str += "\n" + json.L3;
	if (!isUndefined(json.L4) && (json.L4 !== null)) str += "\n" + json.L4;
	return str;
}

function displayJsonAlerts(prefix, scrollbox, jsonData, time) {
  bgd = palette.darkblue;
	let breathNum = lookupBreathNum(time);

  let newElement = document.createElement('p');
  newElement.innerHTML = prefix + "Breath#" + breathNum +
    " " + dateToDateStr(time) + " " + dateToTimeStr(time);
  newElement.style.backgroundColor = bgd;
  newElement.style.color = "white";
  scrollbox.appendChild(newElement);
  if (jsonData.L1) {
    newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L1;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L2) {
    newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L2;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L3) {
    newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L3;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L4) {
    newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L4;
    scrollbox.appendChild(newElement);
  }
  newElement = document.createElement('hr');
  newElement.style.color = "white";
  scrollbox.appendChild(newElement);
}

function initAlerts() {
  let scrollbox = document.getElementById('errorDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('warningDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('infoDiv');
  scrollbox.innerHTML = "";
}

function alertWithinRange(alertTime) {
  if (!session.alerts.range.moving) {
    if (alertTime.getTime() > session.alerts.range.maxTime.getTime()) return false;
  }
  if (session.maxBreathNum != 0) {
    if (alertTime.getTime() < session.alerts.range.minTime.getTime()) return false;
  }
  return true;
}

function createAllAlerts() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  let scrollbox = document.getElementById('errorDiv');
  scrollbox.innerHTML = "";
	let errorChanges = session.params.errors.Changes();
  for (let i = 1; i < errorChanges.length; i++) {
    if (!alertWithinRange(errorChanges[i].time)) continue;
		let msg = lookupErrorMessage(errorChanges[i].time);
    let prefix = "ERROR#" + i + " ";
    displayJsonAlerts(prefix, scrollbox, msg, errorChanges[i].time);
  }

  scrollbox = document.getElementById('warningDiv');
  scrollbox.innerHTML = "";
	let warningChanges = session.params.warnings.Changes();
  for (let i = 1; i < warningChanges.length; i++) {
    if (!alertWithinRange(warningChanges[i].time)) continue;
		let msg = lookupWarningMessage(warningChanges[i].time);
    let prefix = "WARNING#" + i + " ";
    displayJsonAlerts(prefix, scrollbox, msg, warningChanges[i].time);
  }

  scrollbox = document.getElementById('infoDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.infoMsgs.length; i++) {
    if (!alertWithinRange(session.infoMsgs[i].time)) continue;
    let prefix = "INFO#" + (i+1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.infoMsgs[i], session.infoMsgs[i].time);
  }

}


var prevResetStatus = RESET_NONE;
var resetRequestTime = null;

function deduceSystemReset() {
	if (prevResetStatus != RESET_PENDING) return;
	if (resetRequestTime === null) return;

	let now = new Date();
 	let title = "RESET Activity Breath# " + session.maxBreathNum;

	// If it has not been declined or timed-out for a while after request
	// assume system has been reset
	let pendingTime = now.getTime() - resetRequestTime.getTime();
	//console.log("pendingTime",pendingTime,"prevResetStatus",prevResetStatus);
	if (pendingTime > RESET_CONFIRMATION_TIMEOUT_IN_MS) {
		let info1 = "RESET Request Confirmed";
		let info2 = "SYSTEM RESET";
		msg = info1 + "\n" + info2;
   	modalAlert(title, msg);
		startErrorBeep();
		resetRequestTime = null;
	}
}

setInterval(() => {
  deduceSystemReset();
}, 1000)

function createAlarmModals(chirp) {
	// Prioritized
	let resetStatus =  session.params.resetStatus.LastChangeValue();
	let resetChangeTime = session.params.resetStatus.LastChangeTime();
	let resetStatusChange = true;
	if (resetStatus !== null) {
		resetStatusChange = (prevResetStatus != resetStatus);
	}
	prevResetStatus = resetStatus;

 	let title = "RESET Activity Breath# " + session.maxBreathNum;
	let resetInfo1 = "";
	let resetInfo2 = "";
	if (resetStatusChange) {
		if (resetStatus == RESET_PENDING) {
			resetInfo1 = "RESET requested";
			resetInfo2 = "Waiting for Confirmation";
			resetRequestTime = chirp.created;
		} else if (resetStatus == RESET_TIMEOUT) {
			resetInfo1 = "RESET Confirmation Timed out";
			resetInfo2 = "RESET Request Cancelled";
			resetRequestTime = null;
		} else if (resetStatus == RESET_DECLINED) {
			resetInfo1 = "RESET Confirmation Declined";
			resetInfo2 = "RESET Request Cancelled";
			resetRequestTime = null;
		} else if (resetStatus == RESET_CONFIRMED) {
			resetInfo1 = "RESET Request Confirmed";
			resetInfo2 = "System Reset";
			resetRequestTime = null;
		}
	}

	if (resetInfo1 != "") {
		let msg = resetInfo1 + "\n" + resetInfo2;
		if ((resetStatus !== null) && (resetStatus != RESET_NONE)) {
			if (resetStatus == RESET_PENDING) {
    		modalWarning(title, msg);
				startErrorBeep();
				return;
			} else if (resetStatus == RESET_TIMEOUT) {
	    	modalInfo(title, msg);
				stopErrorBeep();
			} else if (resetStatus == RESET_DECLINED) {
	    	modalInfo(title, msg);
				stopErrorBeep();
			}
		}
	}

	let errorTag =  session.params.errorTag.LastChangeValue();
	if (errorTag) { // must report the error
		let errorTime =  session.params.errorTag.LastChangeTime();
		let msgJson = lookupErrorMessage(errorTime);
		let msg = formAlertMessageStr(msgJson);
    let title = "Error Breath# " + session.maxBreathNum;
    modalAlert(title, msg);
		startErrorBeep();
		return;
  } else {
		stopErrorBeep();
	}

	let warningTag =  session.params.warningTag.LastChangeValue();
	if (warningTag) { // must report the warning
		let warningTime =  session.params.warningTag.LastChangeTime();
		let msgJson = lookupWarningMessage(warningTime);
		let msg = formAlertMessageStr(msgJson);
    let title = "Warning Breath# " + session.maxBreathNum;
    modalWarning(title, msg);
		startWarningBeep();
		return;
  } else {
		stopWarningBeep();
	}
}


