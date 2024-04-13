// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include inspire.uid.js prior to this file
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
  inspireUid = uid;
  inspireTag = tag;
  setCookie(uidCookieName, inspireUid);
  setCookie(tagCookieName, inspireTag);
  sessionStorage.setItem("inspireUid", inspireUid);
  sessionStorage.setItem("inspireTag", inspireTag);

  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, myInspireSystems);
  ddList.selectedIndex = findInspireTagIndex(inspireTag);
}

function setSelectedInspireTagFromDD() {
  let ddList = document.getElementById("SYSTEM_NAME");
  let tag = ddList.value;
  if (!tag) {
    modalAlert("No INSPIRE-100 System selected", "");
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
  createDropdownSelect(ddList, myInspireSystems);
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

  if ((myInspireSystems == null) || (myInspireSystems.length == 0)) {
    modalAlert("Systems Table is empty", "");
    return;
  }
  //console.log(JSON.stringify(myInspireSystems));
  let fileName = document.getElementById("exportFileName").value;
  if (fileName) download(JSON.stringify(myInspireSystems, null, 1),
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
    createDropdownSelect(ddList, myInspireSystems);
    ddList.selectedIndex = findInspireTagIndex(inspireTag);
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
  document.getElementById("exportFileName").value = "Inspire Systems Table";
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

  let elm = document.getElementById("mySystems");
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

  if (myInspireSystems.length) {
    if (removedTag == inspireTag) {
      setSelectedSystem(myInspireSystems[0].uid, myInspireSystems[0].tag);
    }
  } else {
    inspireTag = "";
    inspireUid = "";
    ddList.selectedIndex = -1;
  }
  createDropdownSelect(ddList, myInspireSystems);

  populateSystemUidTagHtmlTable("mySystemsTable");
  initSelectRowTable("mySystemsTable", selectSystemInfo);
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
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  removeSystem(inspireUid, inspireTag);
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
  let elm = document.getElementById("mySystems");
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

  saveNewInspireSystemId(uid, tag, fw);
  populateSystemUidTagHtmlTable("mySystemsTable");
  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, myInspireSystems);
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

  let table = document.getElementById("mySystemsTable");
  if (findSystemTagObj(tag)) { // tag already exists
    modalAlert("TAG='" + tag + "' already exists", "Try again!");
    return;
  }

  if (!validSystemUid(uid)) {
    modalAlert("Invalid System UID='" + uid + "'", "Try again!");
    return;
  }
  document.getElementById("newSysTAG").value = "";
  document.getElementById("newSysUID").value = "";
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
  for (let i = 0; i < myInspireSystems.length;) {
    let sys = myInspireSystems[i];
    removeSystem(sys.uid, sys.tag, true);
  }
}

function removeAllUidRows(btn) {
  modalConfirm("Remove ALL Systems?", "",
    doRemoveAllUidRows, null, null,
    "REMOVE", "DO NOT REMOVE");
}

function mySystemInfo() {
  let elm = document.getElementById("mainDiv");
  elm.style.display = "none";
  elm = document.getElementById("mySystems");
  elm.style.display = "block";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  populateSystemUidTagHtmlTable("mySystemsTable");
  initSelectRowTable("mySystemsTable", selectSystemInfo);
}

function checkAndAddNewSystemInfo(newSysUid, newSysTag) {
  if (!validSystemUid(newSysUid)) {
    modalAlert("Invalid INSPIRE-100 UID: " + newSysUid,
      "Must be RSP_ followed by 16-digit HEX number\nTry again!");
    return;
  }
  if (findSystemTagObj(newSysTag)) { // tag already exists
    modalAlert("Duplicate INSPIRE-100 System TAG: " + newSysTag,
      "Try again!");
    return;
  }

  saveNewInspireSystemId(newSysUid, newSysTag);
  setSelectedSystem(newSysUid, newSysTag);

  modalAlert("New INSPIRE-100 System Info",
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

function installFirmwareApp() {
	downloadAppZipFile();
}

function checkDocPassword(pwd) {
  const ACCESS_KEY = "Docs@Inspire-100";
  return (pwd == ACCESS_KEY);
}

function submitDocPassword() {
  document.getElementById("passwordDiv").style.display = "none";
  let pwd = document.getElementById("password").value;
  if (!checkDocPassword(pwd)) {
    modalAlert("Invalid Access Key", "Please contact Technical Support");
    return;
  }
  window.open("../docs/docs.html");
}

function cancelDocPassword() {
  document.getElementById("passwordDiv").style.display = "none";
}

function launchDocs() {
  document.getElementById("passwordDiv").style.display = "block";
}

function tilesView() {
  window.open("../tiles/tiles.html");
}

function launchRecorder() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../recorder/recorder.html");
}

function launchDashboard() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../dashboard/dashboard.html");
}

function launchAnalyzer() {
  if (!setSelectedInspireTagFromDD()) {
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

var portalStartDate = null;
window.onload = function () {
  portalStartDate = new Date();

	setModalWidth(600);
  showZoomReminder();

  let elm = document.getElementById("mainDiv");
  elm.style.display = "block";
  elm = document.getElementById("mySystems");
  elm.style.display = "none";
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";

  initKnownInspireSystems();

  // create dropdown list
  let ddList = document.getElementById("SYSTEM_NAME");
  createDropdownSelect(ddList, myInspireSystems);
  let uid = getCookie(uidCookieName);
  let tag = getCookie(tagCookieName);

  if (uid && tag) {
    setSelectedSystem(uid, tag);
  } else {
    inspireTag = "";
    inspireUid = "";
    ddList.selectedIndex = -1;
  }

  // Treat <ENTER> as accept button
  new KeypressEnterSubmit('exportFileName', 'exportFileBtn');
  new KeypressEnterSubmit('newSysUID', 'addSystemBtn');
  new KeypressEnterSubmit('newSysTAG', 'addSystemBtn');
  new KeypressEnterSubmit('detectedSysOTP', 'addDetectedSystemBtn');
  new KeypressEnterSubmit('password', 'passwordBtn');

  //console.log("Checking " + BROADCAST_UID);
  waitForHwPosts(BROADCAST_UID, function (d) {
    let newUid = d.content.PRESENT;
    let loginOtp = d.content.OTP;
    let time = new Date(d.created);

		// Discard old messages
	  if (time.getTime() > portalStartDate.getTime()) {
      detectedInspireSystemLogin(time, newUid, loginOtp);
		}
    //console.log(d);
  })
  
};

function detectedInspireSystemLogin(time, newUid, otp) {
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
  if (!validSystemUid(newUid)) {
    return;
  }
  elm = document.getElementById("detectedSysOTP");
  elm.setAttribute("receivedVAL", otp);
  elm.setAttribute("receivedUID", newUid);
  elm = document.getElementById("addDetectedSystemDiv");
  elm.style.display = "block";
}

function addDetectedSystemBtn() {
  let elm = document.getElementById("detectedSysOTP");
  let sysOTP = elm.getAttribute("receivedVAL");
  let sysUID = elm.getAttribute("receivedUID");
  let otp = elm.value;

  if ((otp===null) || (otp=="") || (sysOTP==null)) {
    modalAlert("OTP Mismatch", "Try again!");
  } else if (Number(otp) != Number(sysOTP)) {
    modalAlert("OTP Mismatch", "Try again!");
  } else {
    elm = document.getElementById("detectedSysOTP");
    elm.removeAttribute("receivedVAL");
    elm.removeAttribute("receivedUID");
    elm = document.getElementById("addDetectedSystemDiv");
    elm.style.display = "none";
    elm = document.getElementById("newSysUID");
    elm.value = sysUID;
    elm = document.getElementById("addSystemDiv");
    elm.style.display = "block";
  }
}

function cancelDetectedSystemBtn() {
  let elm = document.getElementById("addDetectedSystemDiv");
  elm.style.display = "none";
}
