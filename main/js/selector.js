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

function setSelectedSystem(uid, tag) {
  respimaticUid = uid;
  respimaticTag = tag;
  setCookie(uidCookieName, respimaticUid);
  setCookie(tagCookieName, respimaticTag);
  sessionStorage.setItem("respimaticUid", respimaticUid);
  sessionStorage.setItem("respimaticTag", respimaticTag);

  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  ddList.selectedIndex = findRespimaticTagIndex(respimaticTag);
}

function setSelectedRespimaticTagFromDD() {
  var ddList = document.getElementById("SYSTEM_NAME");
  var tag = ddList.value;
  if (!tag) {
    alert("No RESPIMATIC-100 System selected");
    return false;
  }
  uid = findSystemUid(tag);
  setSelectedSystem(uid, tag);
  return true;
}

function selectSystemInfo(row) {
  if ((typeof row == 'undefined') || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      alert("No selected item\n\nSelect by clicking on a table row\nTry again!");
      return;
    }
  }

  tag = row.children[0].firstChild.data;
  uid = row.children[1].firstChild.data;
  setSelectedSystem(uid, tag);

  elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  var elm = document.getElementById("mainDiv");
  elm.style.display = "block";

}

function removeSystem(uid, tag, noconfirm) {
  if (typeof noconfirm == 'undefined') noconfirm = false;
  if (!noconfirm && !confirm("OK to remove system info?\n" 
    + "\nSystem TAG ; " + tag
    + "\nSystem UID: " + uid)) return;

  removedTag = removeSystemUidTagInfo(uid, tag);
  var ddList = document.getElementById("SYSTEM_NAME");

  if (knownRespimaticSystems.length) {
    if (removedTag == respimaticTag) {
      setSelectedSystem(knownRespimaticSystems[0].uid, knownRespimaticSystems[0].tag);
    }
  } else {
    respimaticTag = "";
    respimaticUid = "";
    ddList.selectedIndex = -1;
  }
  createDropdownSelect(ddList, knownRespimaticSystems);

  populateSystemUidTagHtmlTable("knownSystemsTable");
  initSelectRowTable("knownSystemsTable", selectSystemInfo);
}

function removeSystemInfo(tag) {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  removeSystem(respimaticUid,respimaticTag);
}

function removeKnownSystemInfo(row) {
  if (typeof row == 'undefined') {
    row = getSelectedTableRow();
    if (!row) {
      alert("No selected item\n\nSelect by clicking on a table row\nTry again!");
      return;
    }
  }

  tag = row.children[0].firstChild.data;
  uid = row.children[1].firstChild.data;
  removeSystem(uid,tag);
}

function exitSystemInfo() {
  elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  var elm = document.getElementById("mainDiv");
  elm.style.display = "block";
}


function addSystemInfo() {
  var table = document.getElementById("knownSystemsTable");
  tag = prompt("New System TAG");
  if (!tag) {
    alert("Must enter System TAG\nTry again!");
    return;
  }
  tag = tag.toUpperCase();
  uid = prompt("New System UID");
  if (!uid) {
    alert("Must enter System UID\nTry again!");
    return;
  }
  uid = uid.toUpperCase();
  checkAndAddNewSystemInfo(uid, tag);
  populateSystemUidTagHtmlTable("knownSystemsTable");
  initSelectRowTable("knownSystemsTable", selectSystemInfo);
}

function selectUidRow(btn) {
  selectSystemInfo(btn.parentNode.parentNode);
}

function removeUidRow(btn) {
  removeSystemInfo(btn.parentNode.parentNode);
}

function removeAllUidRows(btn) {
  if (!confirm("OK to remove ALL system info?")) return; 

  for (i=0; i<knownRespimaticSystems.length;) {
    sys = knownRespimaticSystems[i];
    removeSystem(sys.uid, sys.tag, true);
  }
}

function knownSystemInfo() {
  if (knownRespimaticSystems.length==0) {
    alert("No known RESPIMATIC-100 Systems\nAdd new System info");
    return;
  }

  var elm = document.getElementById("mainDiv");
  elm.style.display = "none";
  elm = document.getElementById("knownSystems");
  elm.style.display = "block";

  populateSystemUidTagHtmlTable("knownSystemsTable");
  initSelectRowTable("knownSystemsTable", selectSystemInfo);
}

function checkAndAddNewSystemInfo(newSysUid, newSysTag) {
  //alert("uid=" + newSysUid + " tag=" + newSysTag);
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
  setSelectedSystem(newSysUid, newSysTag);

  alert("Stored new RESPIMATIC-100 System Info\n" + 
    "\nSystem TAG: " + newSysTag +
    "\nSystem UID: " + newSysUid);
}

function rememberNewSystem() {
  var elm = document.getElementById('newSysName');
  newSysTag = elm.value;
  if (!newSysTag) {
    alert("Must enter System TAG\nTry again!");
    return;
  }
  newSysTag = newSysTag.toUpperCase();

  elm = document.getElementById('newSysUid');
  newSysUid = elm.value;
  if (!newSysTag) {
    alert("Must enter System UID\nTry again!");
    return;
  }
  newSysUid = newSysUid.toUpperCase();

  checkAndAddNewSystemInfo(newSysUid, newSysTag);
}

function launchDashboard() {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  //window.location.assign("dashboard/respimatic.dashboard.html");
  window.open("../dashboard/dashboard.html");
}

function launchAnalyzer() {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  //window.location.assign("analyzer/respimatic.analyzer.html");
  window.open("../analyzer/analyzer.html");
}

function launchFiO2() {
  // window.location.assign("fio2/respimatic.fio2Calc.html");
  window.open("../fio2/fio2Calc.html");
}

window.onload = function() {

  var elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  elm = document.getElementById("knownSystems");
  elm.style.display = "none";

  initKnownRespimaticSystems();

  // create dropdown list
  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  uid = getCookie(uidCookieName);
  tag = getCookie(tagCookieName);
  //alert("Retrieved tag=" + tag);

  if (uid && tag) {
    setSelectedSystem(uid, tag);
  } else {
    respimaticTag = "";
    respimaticUid = "";
    ddList.selectedIndex = -1;
  }
};

alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
);
