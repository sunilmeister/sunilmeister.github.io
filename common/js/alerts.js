// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function displayJsonAlerts(prefix, scrollbox, jsonData) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_darkblue');
  var newElement = document.createElement('p');
  newElement.innerHTML = prefix + "DateTime: " + dateToStr(jsonData.created);
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

function displayAlerts() {
  if (!app.sessionDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.errorMsgs.length; i++) {
    if (!app.reportRange.rolling) {
      if (session.errorMsgs[i].created > 
	session.breathTimes[app.reportRange.maxBnum].time) continue;
      if (session.errorMsgs[i].created < 
	session.breathTimes[app.reportRange.minBnum].time) continue;
    }

    prefix = "ERROR #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.errorMsgs[i]);
  }
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.warningMsgs.length; i++) {
    if (!app.reportRange.rolling) {
      if (session.warningMsgs[i].created > 
	session.breathTimes[app.reportRange.maxBnum].time) continue;
      if (session.warningMsgs[i].created < 
	session.breathTimes[app.reportRange.minBnum].time) continue;
    }

    prefix = "WARNING #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.warningMsgs[i]);
  }
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < session.notificationMsgs.length; i++) {
    if (!app.reportRange.rolling) {
      if (session.notificationMsgs[i].created > 
	session.breathTimes[app.reportRange.maxBnum].time) continue;
      if (session.notificationMsgs[i].created < 
	session.breathTimes[app.reportRange.minBnum].time) continue;
    }
    prefix = "INFO #" + (i + 1) + " ";
    displayJsonAlerts(prefix, scrollbox, session.notificationMsgs[i]);
  }
}

