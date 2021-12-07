// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function displayJsonErrorWarning(prefix, scrollbox, jsonData) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_mediumblue');

  var newElement = document.createElement('p');
  newElement.innerHTML = prefix + "DateTime: " + dateToStr(jsonData.created);
  newElement.style.backgroundColor = bgd;
  newElement.style.color = "white" ;
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
  scrollbox.appendChild(newElement);
}

var errorWarningDisplayed = false;
function initErrorWarnings() {
  console.log("initErrorWarnings");
  errorWarningDisplayed = false;
  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "" ;
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "" ;
}

function displayErrorWarnings() {
  console.log("displayErrorWarnings");
  if (!globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }

  if (errorWarningDisplayed) return;

  var scrollbox = document.getElementById('scrollErrorDiv');
  for (i=0; i<errorMsgs.length; i++) {
    prefix = "ERROR #" + (i+1) + " ";
    displayJsonErrorWarning(prefix, scrollbox, errorMsgs[i]);
  }

  var scrollbox = document.getElementById('scrollWarningDiv');
  for (i=0; i<warningMsgs.length; i++) {
    prefix = "WARNING #" + (i+1) + " ";
    displayJsonErrorWarning(prefix, scrollbox, warningMsgs[i]);
  }

  errorWarningDisplayed = true;
}


