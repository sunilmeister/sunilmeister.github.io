// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function displayJsonAlerts(prefix, scrollbox, jsonData) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_darkblue');
  var newElement = document.createElement('p');
  newElement.innerHTML = prefix + "Breath#" + jsonData.breathNum +
    " DateTime: " + dateToStr(jsonData.created);
  newElement.style.backgroundColor = bgd;
  newElement.style.color = "white";
  scrollbox.appendChild(newElement);
  if (jsonData.L1) {
    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L1;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L2) {
    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L2;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L3) {
    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L3;
    scrollbox.appendChild(newElement);
  }
  if (jsonData.L4) {
    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = jsonData.L4;
    scrollbox.appendChild(newElement);
  }
  var newElement = document.createElement('hr');
  newElement.style.color = "white";
  scrollbox.appendChild(newElement);
}

function initAlerts() {
  var scrollbox = document.getElementById('scrollErrorDiv');
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
  if (session.inProgress.alerts) return;
  session.inProgress.alerts = true;

  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.errorMsgs.length; i++) {
    if (session.errorMsgs[i].created >
      session.breathTimes[session.reportRange.maxBnum]) continue;
    if (session.errorMsgs[i].created <
      session.breathTimes[session.reportRange.minBnum]) continue;

    prefix = "ERROR #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.errorMsgs[i]);
  }
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.warningMsgs.length; i++) {
    if (session.warningMsgs[i].created >
      session.breathTimes[session.reportRange.maxBnum]) continue;
    if (session.warningMsgs[i].created <
      session.breathTimes[session.reportRange.minBnum]) continue;

    prefix = "WARNING #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.warningMsgs[i]);
  }
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.infoMsgs.length; i++) {
    if (session.infoMsgs[i].created >
      session.breathTimes[session.reportRange.maxBnum]) continue;
    if (session.infoMsgs[i].created <
      session.breathTimes[session.reportRange.minBnum]) continue;

    prefix = "INFO #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.infoMsgs[i]);
  }

  session.inProgress.alerts = false;
}

function numberOfExistingAlerts() {
  num =  session.infoMsgs.length +
    session.warningMsgs.length +
    session.errorMsgs.length ;
  return num;
}
