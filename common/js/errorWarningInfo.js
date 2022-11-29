// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function displayJsonErrorWarningInfo(prefix, scrollbox, jsonData) {
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

function initErrorWarningInfo() {
  //console.log("initErrorWarnings");
  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
}

function displayErrorWarningInfo() {
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < errorMsgs.length; i++) {
    cDate = Date(errorMsgs[i].created);
    if (!reportsXrange.doFull) {
      var minDate = Date(breathTimes[this.xRange.minBnum]);
      var maxDate = Date(breathTimes[this.xRange.maxBnum]);
      if (cDate > maxDate) continue;
      if (cDate < minDate) continue;
    }

    prefix = "ERROR #" + (i + 1) + " ";
    displayJsonErrorWarningInfo(prefix, scrollbox, errorMsgs[i]);
  }
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < warningMsgs.length; i++) {
    cDate = Date(warningMsgs[i].created);
    if (!reportsXrange.doFull) {
      var minDate = Date(breathTimes[this.xRange.minBnum]);
      var maxDate = Date(breathTimes[this.xRange.maxBnum]);
      if (cDate > maxDate) continue;
      if (cDate < minDate) continue;
    }

    prefix = "WARNING #" + (i + 1) + " ";
    displayJsonErrorWarningInfo(prefix, scrollbox, warningMsgs[i]);
  }
  scrollbox = document.getElementById('scrollInfoDiv');
  scrollbox.innerHTML = "";
  for (i = 0; i < notificationMsgs.length; i++) {
    cDate = Date(notificationMsgs[i].created);
    if (!reportsXrange.doFull) {
      var minDate = Date(breathTimes[this.xRange.minBnum]);
      var maxDate = Date(breathTimes[this.xRange.maxBnum]);
      if (cDate > maxDate) continue;
      if (cDate < minDate) continue;
    }

    prefix = "INFO #" + (i + 1) + " ";
    displayJsonErrorWarningInfo(prefix, scrollbox, notificationMsgs[i]);
  }
}

