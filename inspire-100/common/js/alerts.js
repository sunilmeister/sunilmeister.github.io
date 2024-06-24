// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// returns an object {L1: , L2:, L3:, L4}
// four lines that make up the alert message
function lookupAlertMessage(alertTime) {
	let l1 = session.params.lcdLine1.ChangeValueGEQ(alertTime);
	let l2 = session.params.lcdLine2.ChangeValueGEQ(alertTime);
	let l3 = session.params.lcdLine3.ChangeValueGEQ(alertTime);
	let l4 = session.params.lcdLine4.ChangeValueGEQ(alertTime);

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

function displayJsonAlerts(prefix, scrollbox, jsonData) {
  bgd = palette.darkblue;
  let newElement = document.createElement('p');
  newElement.innerHTML = prefix + "Breath#" + jsonData.breathNum +
    " " + dateToStr(jsonData.created);
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
  let scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
}

function createAllAlerts() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  let scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.errorMsgs.length; i++) {
    if (session.errorMsgs[i].breathNum > session.alerts.range.maxBnum) continue;
    if (session.errorMsgs[i].breathNum < session.alerts.range.minBnum) continue;

    let prefix = "ERROR #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.errorMsgs[i]);
  }
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.warningMsgs.length; i++) {
    if (session.warningMsgs[i].breathNum > session.alerts.range.maxBnum) continue;
    if (session.warningMsgs[i].breathNum < session.alerts.range.minBnum) continue;

    let prefix= "WARNING #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.warningMsgs[i]);
  }
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.infoMsgs.length; i++) {
    if (session.infoMsgs[i].breathNum > session.alerts.range.maxBnum) continue;
    if (session.infoMsgs[i].breathNum < session.alerts.range.minBnum) continue;

    let prefix = "INFO #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.infoMsgs[i]);
  }

}

function numberOfExistingAlerts() {
  let num =  session.infoMsgs.length +
    session.warningMsgs.length +
    session.errorMsgs.length ;
  return num;
}
