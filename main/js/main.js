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
    modalAlert("No RESPIMATIC-100 System selected", "");
    return false;
  }
  uid = findSystemUid(tag);
  setSelectedSystem(uid, tag);
  return true;
}

var fileReader = new FileReader();
fileReader.addEventListener('load', (e) => {
  const data = e.target.result;
  systems = parseJSONSafely(data);
  if ((systems == null) || (systems.length == 0)) {
    modalAlert("File does not have valid data", "");
    cancelImport();
    return;
  }

  //console.log(systems);
  for (i = 0; i < systems.length; i++) {
    uid = systems[i].uid;
    tag = systems[i].tag;
    sw = systems[i].sw;
    if (typeof sw == "Object") sw = cloneObject(sw);
    if (!silentAddSystemTagUidInfo(uid, tag, sw)) {
      modalAlert("Failed to add (UID='" + uid + "', TAG='" + tag + "')",
        "Either the UID is invalid\n" +
        "Or the TAG already exists");
    }
  }
  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  cancelImport();
});

function importFile() {
  elm = document.getElementById("fileSelector");
  var fileName = elm.value;
  var file = elm.files[0];
  if (file) {
    fileReader.readAsText(file, "UTF-8");
  } else {
    modalAlert('File not found', 'Import cancelled');
  }
}

function cancelImport() {
  document.getElementById("importDiv").style.display = "none";
}

function importSystemInfo() {
  document.getElementById("importDiv").style.display = "block";
}

function cancelExport() {
  document.getElementById("exportDiv").style.display = "none";
}

function exportFile() {
  document.getElementById("exportDiv").style.display = "none";

  if ((knownRespimaticSystems == null) || (knownRespimaticSystems.length == 0)) {
    modalAlert("Systems Table is empty", "");
    return;
  }
  //console.log(JSON.stringify(knownRespimaticSystems));
  fileName = document.getElementById("exportFileName").value;
  if (fileName) download(JSON.stringify(knownRespimaticSystems, null, 1),
    fileName, "text/xml");
}

function exportSystemInfo() {
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value = "Respimatic Systems Table";
}

function selectSystemInfo(row) {
  if (isUndefined(row) || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item", "Select by clicking on a table row\nTry again!");
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

  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
}

function doRemove(args) {
  uid = args.uid;
  tag = args.tag;

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

function removeSystem(uid, tag, noconfirm) {
  if (isUndefined(noconfirm)) noconfirm = false;
  confirmMsg =
    "System TAG: " + tag +
    "\nSystem UID: " + uid;
  if (!noconfirm) {
    modalConfirm("Remove System", confirmMsg, doRemove, null, {
        uid: uid,
        tag: tag
      },
      "REMOVE", "DO NOT REMOVE");
  } else {
    doRemove({
      uid: uid,
      tag: tag
    });
  }
}

function removeSystemInfo(tag) {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  removeSystem(respimaticUid, respimaticTag);
}

function removeSystemInfoRow(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item", "Select by clicking on a table row\nTry again!");
      return;
    }
  }

  tag = row.children[0].firstChild.data;
  uid = row.children[1].firstChild.data;
  removeSystem(uid, tag);
}

function exitSystemInfo() {
  elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  var elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
}


function silentAddSystemTagUidInfo(uid, tag, sw) {
  uid = uid.toUpperCase();
  if (!validSystemUid(uid)) {
    return false;
  }
  if (findSystemTagObj(tag)) { // tag already exists
    return false;
  }

  saveNewRespimaticSystemId(uid, tag, sw);
  populateSystemUidTagHtmlTable("knownSystemsTable");
  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  return true;
}

function cancelNewSystemBtn() {
  document.getElementById("addSystemDiv").style.display = "none";
}

function addNewSystemBtn() {
  tag = document.getElementById("newSysTAG").value;
  tag = tag.toUpperCase();
  uid = document.getElementById("newSysUID").value;
  uid = uid.toUpperCase();

  var table = document.getElementById("knownSystemsTable");
  if (findSystemTagObj(tag)) { // tag already exists
    modalAlert("TAG='" + tag + "' already exists", "Try again!");
    return;
  }

  if (!validSystemUid(uid)) {
    modalAlert("Invalid System UID='" + uid + "'", "Try again!");
    return;
  }
  silentAddSystemTagUidInfo(uid, tag);
  document.getElementById("addSystemDiv").style.display = "none";
}

function addSystemInfo() {
  document.getElementById("addSystemDiv").style.display = "block";
  return true;
}

function selectUidRow(btn) {
  selectSystemInfo(btn.parentNode.parentNode);
}

function removeUidRow(btn) {
  removeSystemInfoRow(btn.parentNode.parentNode);
}

function doRemoveAllUidRows(btn) {
  for (i = 0; i < knownRespimaticSystems.length;) {
    sys = knownRespimaticSystems[i];
    removeSystem(sys.uid, sys.tag, true);
  }
}

function removeAllUidRows(btn) {
  modalConfirm("Remove ALL Systems?", "",
    doRemoveAllUidRows, null, null,
    "REMOVE", "DO NOT REMOVE");
}

function knownSystemInfo() {
  var elm = document.getElementById("mainDiv");
  elm.style.display = "none";
  elm = document.getElementById("knownSystems");
  elm.style.display = "block";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  populateSystemUidTagHtmlTable("knownSystemsTable");
  initSelectRowTable("knownSystemsTable", selectSystemInfo);
}

function checkAndAddNewSystemInfo(newSysUid, newSysTag) {
  if (!validSystemUid(newSysUid)) {
    modalAlert("Invalid RESPIMATIC-100 UID: " + newSysUid,
      "Must be RSP_ followed by 16-digit HEX number\nTry again!");
    return;
  }
  if (findSystemTagObj(newSysTag)) { // tag already exists
    modalAlert("Duplicate RESPIMATIC-100 System TAG: " + newSysTag,
      "Try again!");
    return;
  }

  saveNewRespimaticSystemId(newSysUid, newSysTag);
  setSelectedSystem(newSysUid, newSysTag);

  modalAlert("New RESPIMATIC-100 System Info",
    "System TAG: " + newSysTag +
    "\nSystem UID: " + newSysUid);
}

function rememberNewSystem() {
  var elm = document.getElementById('newSysName');
  newSysTag = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System TAG", "Try again!");
    return;
  }
  newSysTag = newSysTag.toUpperCase();

  elm = document.getElementById('newSysUid');
  newSysUid = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System UID", "Try again!");
    return;
  }
  newSysUid = newSysUid.toUpperCase();

  checkAndAddNewSystemInfo(newSysUid, newSysTag);
}

function launchDocs() {
  window.open("../doc/doc.html");
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
  window.open("../analyzer/analyzer.html");
}

function launchFiO2() {
  window.open("../fio2Calc/fio2Calc.html");
}

function launchPsv() {
  window.open("../psvCalc/psvCalc.html");
}

window.onload = function () {
  setModalWidth(600);
  showZoomReminder();

  var elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  initKnownRespimaticSystems();

  // create dropdown list
  var ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  uid = getCookie(uidCookieName);
  tag = getCookie(tagCookieName);

  if (uid && tag) {
    setSelectedSystem(uid, tag);
  } else {
    respimaticTag = "";
    respimaticUid = "";
    ddList.selectedIndex = -1;
  }

  var exportFileNameInput = document.getElementById("exportFileName");
  exportFileNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("exportFileBtn").click();
    }
  });

  var newSysUidInput = document.getElementById("newSysUID");
  newSysUidInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("addSystemBtn").click();
    }
  });

  var newSysTagInput = document.getElementById("newSysTAG");
  newSysTagInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("addSystemBtn").click();
    }
  });
};
