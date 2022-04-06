// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include respimatic.uid.js prior to this file
// ////////////////////////////////////////////////////

function createDropdownSelect(sysList, values) {
  sysList.innerHTML = "";
  for (const obj of values) {
    var option = document.createElement("option");
    tag = obj.tag;
    option.value = tag;
    option.text = tag.charAt(0).toUpperCase() + tag.slice(1);
    sysList.appendChild(option);
  }
}

function getRespimaticSysUID() {
  var ddList = document.getElementById("SYSTEM_NAME");
  var tag = ddList.value;
  if (!tag) {
    alert("No RESPIMATIC-100 System selected");
    return false;
  }
  respimaticTag = tag;
  respimaticUid = findSystemUid(tag);
  setCookie(uidCookieName, respimaticUid);
  setCookie(tagCookieName, respimaticTag);
  sessionStorage.setItem(uidCookieName, respimaticUid);
  sessionStorage.setItem(tagCookieName, respimaticTag);
  return true;
}

function knownSystemInfo() {
}

function newSystemInfo() {
  var div = document.getElementById('newSystemDiv');
  div.style.display = "block" ;
}

function rememberNewSystem() {
  var elm = document.getElementById('newSysName');
  newSysTag = elm.value;
  newSysTag = newSysTag.toUpperCase();
  elm = document.getElementById('newSysUid');
  newSysUid = elm.value;
  newSysUid = newSysUid.toUpperCase();
  if (!validSystemUid(newSysUid)) {
    alert("Invalid RESPIMATIC-100 UID: " + newSysUid +
      "\nMust be RSP_ followed by 16-digit HEX number\nTry again!");
    return;
  }
  if (findSystemTagObj(newSysTag)) { // tag already exists
    alert("Duplicate RESPIMATIC-100 System TAG: " + newSysTag +
      "\nTry again!");
    return;
  }

  saveNewRespimaticSystemId(newSysUid, newSysTag);
  respimaticUid = newSysUid;
  respimaticTag = newSysTag;
  setCookie(uidCookieName, respimaticUid);
  setCookie(tagCookieName, respimaticTag);
  sessionStorage.setItem(uidCookieName, respimaticUid);
  sessionStorage.setItem(tagCookieName, respimaticTag);

  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  ddList.selectedIndex = findRespimaticTagIndex(respimaticTag);

  alert("Stored new RESPIMATIC-100 System Info" + 
    "\nSystem TAG: " + newSysTag +
    "\nSystem UID: " + newSysUid);

  var div = document.getElementById('newSystemDiv');
  div.style.display = "none" ;
}

function launchDashboard() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("dashboard/respimatic.dashboard.html");
  window.open("dashboard/respimatic.dashboard.html");
}

function launchRecorder() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("recorder/respimatic.recorder.html");
  window.open("recorder/respimatic.recorder.html");
}

function launchAnalyzer() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("analyzer/respimatic.analyzer.html");
  window.open("analyzer/respimatic.analyzer.html");
}

function launchFiO2() {
  // window.location.assign("fio2/respimatic.fio2Calc.html");
  window.open("fio2/respimatic.fio2Calc.html");
}

window.onload = function() {
  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );


  initKnownRespimaticSystems();

  // create dropdown list
  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  respimaticUid = getCookie(uidCookieName);
  respimaticTag = getCookie(tagCookieName);
  if (respimaticUid && respimaticTag) {
    ddList.selectedIndex = findRespimaticTagIndex(respimaticTag);
  } else {
    respimaticTag = "";
    respimaticUid = "";
    ddList.selectedIndex = -1;
  }
};
