// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
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
    if (session.errorMsgs[i].breathNum > session.reportRange.maxBnum) continue;
    if (session.errorMsgs[i].breathNum < session.reportRange.minBnum) continue;

    let prefix = "ERROR #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.errorMsgs[i]);
  }
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.warningMsgs.length; i++) {
    if (session.warningMsgs[i].breathNum > session.reportRange.maxBnum) continue;
    if (session.warningMsgs[i].breathNum < session.reportRange.minBnum) continue;

    let prefix= "WARNING #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.warningMsgs[i]);
  }
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
  for (let i = 0; i < session.infoMsgs.length; i++) {
    if (session.infoMsgs[i].breathNum > session.reportRange.maxBnum) continue;
    if (session.infoMsgs[i].breathNum < session.reportRange.minBnum) continue;

    let prefix = "INFO #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.infoMsgs[i]);
  }

}

function numberOfExistingAlerts() {
  let =  session.infoMsgs.length +
    session.warningMsgs.length +
    session.errorMsgs.length ;
  return num;
}
