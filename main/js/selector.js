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

var fileReader = new FileReader();
fileReader.addEventListener('load', (e) => {
  const data = e.target.result;
  systems = parseJSONSafely(data);
  if ((systems==null) || (systems.length==0)) {
    alert("File does not have valid data");
    cancelImport();
    return;
  }

  console.log(systems);
  for (i=0; i<systems.length; i++) {
    uid = systems[i].uid;
    tag = systems[i].tag;
    if (!silentAddSystemTagUidInfo(uid, tag)) {
      alert("Failed to add (UID='" + uid + "', TAG='" + tag +"')\n\n" +
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
  document.getElementById("mainDiv").style.display = "none";
  document.getElementById("knownSystems").style.display = "block";
  document.getElementById("importDiv").style.display = "none";
}

function importSystemInfo() {
  document.getElementById("mainDiv").style.display = "none";
  document.getElementById("knownSystems").style.display = "none";
  document.getElementById("importDiv").style.display = "block";


}

function exportSystemInfo() {
  if ((knownRespimaticSystems==null) || (knownRespimaticSystems.length==0)) {
    alert("Systems Table is empty");
    return;
  }
  //console.log(JSON.stringify(knownRespimaticSystems));
  fileName = prompt("Enter file name", "Respimatic Systems");
  if (fileName) download(JSON.stringify(knownRespimaticSystems, null, 1), 
                         fileName, "text/xml");
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

function removeSystemInfoRow(row) {
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
    alert("System TAG='" + tag + "' already exists\nTry again!");
    return;
  }

  if (!validSystemUid(uid)) {
    alert("Invalid System UID='" + uid + "'\nTry again!");
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

function removeAllUidRows(btn) {
  if (!confirm("OK to remove ALL system info?")) return; 

  for (i=0; i<knownRespimaticSystems.length;) {
    sys = knownRespimaticSystems[i];
    removeSystem(sys.uid, sys.tag, true);
  }
}

function knownSystemInfo() {
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
  var zoomAlert = new ModalPopup('zoomAlertDiv','600px', '250px', '1.5rem', 5);
  zoomAlert.show();

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

