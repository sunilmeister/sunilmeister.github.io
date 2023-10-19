// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include respimatic.uid.js prior to this file
// ////////////////////////////////////////////////////

function createDropdownSelect(sysList, values) {
  sysList.innerHTML = "";
  for (const obj of values) {
    let option = document.createElement("option");
    let tag = obj.tag;
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

  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  ddList.selectedIndex = findRespimaticTagIndex(respimaticTag);
}

function setSelectedRespimaticTagFromDD() {
  let ddList = document.getElementById("SYSTEM_NAME");
  let tag = ddList.value;
  if (!tag) {
    modalAlert("No RESPIMATIC-100 System selected", "");
    return false;
  }
  let uid = findSystemUid(tag);
  setSelectedSystem(uid, tag);
  return true;
}

var fileReader = new FileReader();
fileReader.addEventListener('load', (e) => {
  const data = e.target.result;
  let systems = parseJSONSafely(data);
  if ((systems == null) || (systems.length == 0)) {
    modalAlert("File does not have valid data", "");
    cancelImport();
    return;
  }

  //console.log(systems);
  for (let i = 0; i < systems.length; i++) {
    let uid = systems[i].uid;
    let tag = systems[i].tag;
    let fw = systems[i].fw;
    if (typeof fw == "Object") fw = cloneObject(fw);
    if (!silentAddSystemTagUidInfo(uid, tag, fw)) {
      modalAlert("Failed to add (UID='" + uid + "', TAG='" + tag + "')",
        "Either the UID is invalid\n" +
        "Or the TAG already exists");
    }
  }
  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  cancelImport();
});

function importFile() {
  let elm = document.getElementById("fileSelector");
  let fileName = elm.value;
  let file = elm.files[0];
  if (file) {
    fileReader.readAsText(file, "UTF-8");
  } else {
    modalAlert('File not found', 'Import Cancelled');
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
  let fileName = document.getElementById("exportFileName").value;
  if (fileName) download(JSON.stringify(knownRespimaticSystems, null, 1),
    fileName, "text/xml");
}

function deleteHistoryBtn() {
  let msg = "";
  if (document.getElementById("cookiesDelete").checked) {
    deleteAllCookies();
    msg += "\nDeleted ALL Cookies" ;
  }
  if (document.getElementById("recordingsDelete").checked) {
    deleteAllRecordings();
    msg += "\nDeleted ALL Recordings" ;
  }
  if (document.getElementById("systemsDelete").checked) {
    deleteAllSystemUIDs();
    let ddList = document.getElementById("SYSTEM_NAME");
    createDropdownSelect(ddList, knownRespimaticSystems);
    ddList.selectedIndex = findRespimaticTagIndex(respimaticTag);
    msg += "\nDeleted ALL System UID History" ;
  }
  if (msg) modalInfo("", msg);
  document.getElementById("deleteHistoryDiv").style.display = "none";
}

function cancelDeleteHistoryBtn() {
  document.getElementById("deleteHistoryDiv").style.display = "none";
}

function deleteSelectedHistory() {
  document.getElementById("deleteHistoryDiv").style.display = "block";
}

function exportSystemInfo() {
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value = "Respimatic Systems Table";
}

function selectSystemInfo(row) {
  if (isUndefined(row) || (row.tagName != "TR")) {
    let row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item", "Select by clicking on a table row\nTry again!");
      return;
    }
  }

  let tag = row.children[0].firstChild.data;
  let uid = row.children[1].firstChild.data;
  setSelectedSystem(uid, tag);

  let elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  elm = document.getElementById("mainDiv");
  elm.style.display = "block";

  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
}

function doRemove(args) {
  let uid = args.uid;
  let tag = args.tag;

  let removedTag = removeSystemUidTagInfo(uid, tag);
  let ddList = document.getElementById("SYSTEM_NAME");

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
  let confirmMsg =
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
    let row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item", "Select by clicking on a table row\nTry again!");
      return;
    }
  }

  let tag = row.children[0].firstChild.data;
  let uid = row.children[1].firstChild.data;
  removeSystem(uid, tag);
}

function exitSystemInfo() {
  let elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
}


function silentAddSystemTagUidInfo(uid, tag, fw) {
  uid = uid.toUpperCase();
  if (!validSystemUid(uid)) {
    return false;
  }
  if (findSystemTagObj(tag)) { // tag already exists
    return false;
  }

  saveNewRespimaticSystemId(uid, tag, fw);
  populateSystemUidTagHtmlTable("knownSystemsTable");
  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  return true;
}

function cancelNewSystemBtn() {
  document.getElementById("addSystemDiv").style.display = "none";
}

function addNewSystemBtn() {
  let tag = document.getElementById("newSysTAG").value;
  tag = tag.toUpperCase();
  let uid = document.getElementById("newSysUID").value;
  uid = uid.toUpperCase();

  let table = document.getElementById("knownSystemsTable");
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
  for (let i = 0; i < knownRespimaticSystems.length;) {
    let sys = knownRespimaticSystems[i];
    removeSystem(sys.uid, sys.tag, true);
  }
}

function removeAllUidRows(btn) {
  modalConfirm("Remove ALL Systems?", "",
    doRemoveAllUidRows, null, null,
    "REMOVE", "DO NOT REMOVE");
}

function knownSystemInfo() {
  let elm = document.getElementById("mainDiv");
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
  let elm = document.getElementById('newSysName');
  let newSysTag = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System TAG", "Try again!");
    return;
  }
  newSysTag = newSysTag.toUpperCase();

  elm = document.getElementById('newSysUid');
  let newSysUid = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System UID", "Try again!");
    return;
  }
  newSysUid = newSysUid.toUpperCase();

  checkAndAddNewSystemInfo(newSysUid, newSysTag);
}

function launchSwInstaller() {
  window.open("../firmware/firmware.html");
}

function checkDocPassword(pwd) {
  const ACCESS_KEY = "Docs@Respimatic100";
  return (pwd == ACCESS_KEY);
}

function submitDocPassword() {
  document.getElementById("passwordDiv").style.display = "none";
  let pwd = document.getElementById("password").value;
  if (!checkDocPassword(pwd)) {
    modalAlert("Invalid Access Key", "Please contact Technical Support");
    return;
  }
  window.open("../doc/doc.html");
}

function cancelDocPassword() {
  document.getElementById("passwordDiv").style.display = "none";
}

function launchDocs() {
  document.getElementById("passwordDiv").style.display = "block";
}

function launchTest() {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  window.open("../dashboard/dashboard_test.html");
}

function launchRecorder() {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  window.open("../recorder/recorder.html");
}

function launchDashboard() {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
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

  let elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  elm = document.getElementById("knownSystems");
  elm.style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  initKnownRespimaticSystems();

  // create dropdown list
  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, knownRespimaticSystems);
  let uid = getCookie(uidCookieName);
  let tag = getCookie(tagCookieName);

  if (uid && tag) {
    setSelectedSystem(uid, tag);
  } else {
    respimaticTag = "";
    respimaticUid = "";
    ddList.selectedIndex = -1;
  }

  let exportFileNameInput = document.getElementById("exportFileName");
  exportFileNameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("exportFileBtn").click();
    }
  });

  let newSysUidInput = document.getElementById("newSysUID");
  newSysUidInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("addSystemBtn").click();
    }
  });

  let newSysTagInput = document.getElementById("newSysTAG");
  newSysTagInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("addSystemBtn").click();
    }
  });

  //console.log("Checking " + BROADCAST_UID);
  waitForRespimaticMessages(BROADCAST_UID, function (d) {
    let newUid = d.content.PRESENT;
    let loginOtp = d.content.OTP;
    let time = Date(d.created);
    detectedRespimaticSystemLogin(time, newUid, loginOtp);
    //console.log(d);
  })
  
};

function detectedRespimaticSystemLogin(time, newUid, otp) {
  //console.log("**** " + newUid + " online" + " at " + time);
  let obj = findSystemUidObj(newUid);
  let msg = "";
  if (obj) {
    msg += "UID: " + obj.uid + "\n TAG: " + obj.tag ;
    modalInfo("Login detected from a RECOGNIZED System", msg);
  } else {
    checkAndAddSystemInfo(newUid, otp) ;
    modalInfo("Login detected from an UNRECOGNIZED System", msg);
  }
}

function checkAndAddSystemInfo(newUid, otp) {
  let elm = document.getElementById("detectedSysUID");
  elm.innerHTML = newUid;
  if (!validSystemUid(newUid)) {
    return;
  }
  elm = document.getElementById("detectedSysOTP");
  elm.setAttribute("receivedVAL", otp);
  elm = document.getElementById("addDetectedSystemDiv");
  elm.style.display = "block";
}

function addDetectedSystemBtn() {
  let elm = document.getElementById("detectedSysTAG");
  let sysTAG = elm.value;
  elm = document.getElementById("detectedSysUID");
  let sysUID = elm.innerText;
  elm = document.getElementById("detectedSysOTP");
  let sysOTP = elm.getAttribute("receivedVAL");
  let otp = elm.value;
  //console.log("SysOTP=" + sysOTP + " UID=" + sysUID + " otp=" + otp);

  if (!sysTAG) {
    modalAlert("System TAG undefined", "Try again!");
    return;
  }

  if ((otp===null) || (otp=="") || (sysOTP==null)) {
    modalAlert("OTP Mismatch", "Try again!");
  } else if (Number(otp) != Number(sysOTP)) {
    modalAlert("OTP Mismatch", "Try again!");
  } else {
    let table = document.getElementById("knownSystemsTable");
    if (findSystemTagObj(sysTAG)) { // tag already exists
      modalAlert("TAG='" + sysTAG + "' already exists", "Try again!");
      return;
    }
    silentAddSystemTagUidInfo(sysUID, sysTAG);
    elm = document.getElementById("addDetectedSystemDiv");
    elm.style.display = "none";
  }
}

function cancelDetectedSystemBtn() {
  let elm = document.getElementById("addDetectedSystemDiv");
  elm.style.display = "none";
}
