function displayJsonErrorWarning(scrollbox, jsonData) {
  var newElement = document.createElement('p');
  newElement.innerHTML = "DateTime: " + dateToStr(jsonData.created);
  newElement.style.backgroundColor = "#1d85ad" ;
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
function initErrorWarning() {
  errorWarningDisplayed = false;
  var scrollbox = document.getElementById('scrollErrorDiv');
  scrollbox.innerHTML = "" ;
  scrollbox = document.getElementById('scrollWarningDiv');
  scrollbox.innerHTML = "" ;
}

function displayErrorWarning() {
  if (errorWarningDisplayed) return;
  if (!tablesConstructed) {
    alert("Must display Statistics first\nTo gather data from the Session");
    return;
  }

  var scrollbox = document.getElementById('scrollErrorDiv');
  for (i=0; i<errorMsgs.length; i++) {
    displayJsonErrorWarning(scrollbox, errorMsgs[i]);
  }

  var scrollbox = document.getElementById('scrollWarningDiv');
  for (i=0; i<warningMsgs.length; i++) {
    displayJsonErrorWarning(scrollbox, warningMsgs[i]);
  }

  errorWarningDisplayed = true;
}

