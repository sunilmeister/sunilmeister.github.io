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
    modalAlert("No RESPIMATIC-100 System selected");
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
  if ((systems==null) || (systems.length==0)) {
    modalAlert("File does not have valid data");
    cancelImport();
    return;
  }

  //console.log(systems);
  for (i=0; i<systems.length; i++) {
    uid = systems[i].uid;
    tag = systems[i].tag;
    if (!silentAddSystemTagUidInfo(uid, tag)) {
      modalAlert("Failed to add (UID='" + uid + "', TAG='" + tag +"')\n\n" +
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
  fileReader.readAsText(file, "UTF-8");
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
 
  if ((knownRespimaticSystems==null) || (knownRespimaticSystems.length==0)) {
    modalAlert("Systems Table is empty");
    return;
  }
  //console.log(JSON.stringify(knownRespimaticSystems));
  fileName =  document.getElementById("exportFileName").value;
  if (fileName) download(JSON.stringify(knownRespimaticSystems, null, 1), 
                         fileName, "text/xml");
}

function exportSystemInfo() {
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value = "Respimatic Systems Table";
}

function selectSystemInfo(row) {
  if ((typeof row == 'undefined') || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item\n\nSelect by clicking on a table row\nTry again!");
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
  if (typeof noconfirm == 'undefined') noconfirm = false;
  confirmMsg = 
      "System TAG: " + tag +
      "\nSystem UID: " + uid ;
  if (!noconfirm) {
    modalConfirm("Remove System", confirmMsg, doRemove, null, {uid:uid, tag:tag},
    "REMOVE", "DO NOT REMOVE");
  } else {
    doRemove({uid:uid, tag:tag});
  }
}

function removeSystemInfo(tag) {
  if (!setSelectedRespimaticTagFromDD()) {
    return;
  }
  removeSystem(respimaticUid,respimaticTag);
}

function removeSystemInfoRow(row) {
  if (typeof row == 'undefined') {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected item\n\nSelect by clicking on a table row\nTry again!");
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
  document.getElementById("exportDiv").style.display = "none";
  document.getElementById("importDiv").style.display = "none";
}


function silentAddSystemTagUidInfo(uid, tag) {
  uid = uid.toUpperCase();
  if (!validSystemUid(uid)) {
    return false;
  }
  if (findSystemTagObj(tag)) { // tag already exists
    return false;
  }

  saveNewRespimaticSystemId(uid, tag);
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
    modalAlert("TAG='" + tag + "' already exists\nTry again!");
    return;
  }

  if (!validSystemUid(uid)) {
    modalAlert("Invalid System UID='" + uid + "'\nTry again!");
    return;
  }
  silentAddSystemTagUidInfo(uid,tag);
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
  for (i=0; i<knownRespimaticSystems.length;) {
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
    modalAlert("Invalid RESPIMATIC-100 UID: " + newSysUid +
      "\nMust be RSP_ followed by 16-digit HEX number\nTry again!");
    return;
  }
  if (findSystemTagObj(newSysTag)) { // tag already exists
    modalAlert("Duplicate RESPIMATIC-100 System TAG: " + newSysTag +
      "\nTry again!");
    return;
  }

  saveNewRespimaticSystemId(newSysUid, newSysTag);
  setSelectedSystem(newSysUid, newSysTag);

  modalAlert("Stored new RESPIMATIC-100 System Info\n" + 
    "\nSystem TAG: " + newSysTag +
    "\nSystem UID: " + newSysUid);
}

function rememberNewSystem() {
  var elm = document.getElementById('newSysName');
  newSysTag = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System TAG\nTry again!");
    return;
  }
  newSysTag = newSysTag.toUpperCase();

  elm = document.getElementById('newSysUid');
  newSysUid = elm.value;
  if (!newSysTag) {
    modalAlert("Must enter System UID\nTry again!");
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
  Swal.fire({
    icon: 'info',
    title: ZOOM_TITLE_STR,
    text: ZOOM_MESSAGE_STR,
    width: 600,
    showConfirmButton: false,
    color: 'white',
    background: '#2C94BC',
    timer: 5000
  })

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
};

