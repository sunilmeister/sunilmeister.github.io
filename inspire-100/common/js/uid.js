// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var myInspireSystems = [];
var templateSystemId = {
  uid: "",
  tag: "",
  fw: null
};

function deleteAllSystemUIDs() {
  myInspireSystems = [];
  localStorage.setItem(
    inspireSystemsLocalStorage, JSON.stringify(myInspireSystems));
}

function createSystemUidTagObj(uid, tag, fw) {
  let obj = cloneObject(templateSystemId);
  obj.uid = uid;
  obj.tag = tag;
  obj.fw = fw;
  return obj;
}

function compareSystemUidTagObj(a, b) {
  if (a.tag < b.tag) {
    return -1;
  } else if (a.tag > b.tag) {
    return 1;
  } else return 0;
}

function initKnownInspireSystems() {
  let str = localStorage.getItem(inspireSystemsLocalStorage);
  if (str) {
    myInspireSystems = JSON.parse(str);
    myInspireSystems.sort(compareSystemUidTagObj);
  } else {
    myInspireSystems = [];
  }
}

function saveNewInspireSystemId(uid, tag, fw) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  let obj = createSystemUidTagObj(uid, tag, fw);
  myInspireSystems.push(obj);
  myInspireSystems.sort(compareSystemUidTagObj);
  localStorage.setItem(
    inspireSystemsLocalStorage, JSON.stringify(myInspireSystems));
}

function findInspireTagIndex(tag) {
  tag = tag.toUpperCase();
  let i = 0;
  for (const obj of myInspireSystems) {
    if (obj.tag == tag) return i;
    i++;
  }
  return -1;
}

function findSystemUidObj(uid) {
  uid = uid.toUpperCase();
  for (const obj of myInspireSystems) {
    if (obj.uid == uid) return obj;
  }
  return null;
}

function findSystemTagObj(tag) {
  tag = tag.toUpperCase();
  for (const obj of myInspireSystems) {
    if (obj.tag == tag) return obj;
  }
  return null;
}

function findSystemTag(uid) {
  let obj = findSystemUidObj(uid);
  if (!obj) return "";
  return obj.tag;
}

function findSystemUid(tag) {
  let obj = findSystemTagObj(tag);
  if (!obj) return "";
  return obj.uid;
}

function recordedDataCompatible(fromVersion, toVersion) {
  if (fromVersion == toVersion) return true;
  return false;
}

function appendSwVersionToUid() {
  if (isUndefined(session)) return;
  if (myInspireSystems.length == 0) {
    initKnownInspireSystems();
  }

  let obj = findSystemUidObj(inspireUid);
  if (!obj) return;

  let fw = [session.firmwareVersion.major,
            session.firmwareVersion.minor,
            session.firmwareVersion.board];

  if (obj.fw && fwReleases) { // already has a firmware version
    // check if the new one is the latest
    let lvStr = fwReleases[0].release;
    let vStr = convertSwVersionToStr(fw);
    if (lvStr != vStr) {
      modalWarning("Inspire System Firmware not the latest",
        "Latest Released Firmware Version is " + lvStr
        + "<br>Current System version is " + vStr
        + "<br><br>To update, click on 'Update System Firmware'"
        + "<br>on the inspire.com main menu"
        + "<br><br>Update at any convenient time" );
    }
  }
  obj.fw = cloneObject(fw);

  localStorage.setItem(
    inspireSystemsLocalStorage, JSON.stringify(myInspireSystems));

}

function removeSystemUidTagInfo(uid, tag) {
  for (let i = 0; i < myInspireSystems.length; i++) {
    let obj = myInspireSystems[i];
    if (obj.tag != tag) continue;
    if (obj.uid != uid) continue;
    myInspireSystems.splice(i, 1);
    localStorage.setItem(
      inspireSystemsLocalStorage, JSON.stringify(myInspireSystems));
    return tag;
  }
  return "";
}

function convertSwVersionToStr(fw) {
  if ((fw===null) || isUndefined(fw)) return "????";
  return String(fw[0]) + "." + fw[1] + "." +fw[2];
}

function appendSystemUidTagHtmlRow(table, uid, tag, fw) {
  let row = table.insertRow();
  row.style.cursor = "pointer";
  let cell = row.insertCell();
  cell.innerHTML = tag;
  cell = row.insertCell();
  cell.innerHTML = uid;
  cell = row.insertCell();
  cell.innerHTML = "<center>" + convertSwVersionToStr(fw) + "</center>";
  cell = row.insertCell();
  cell.innerHTML = selectButtonHTML("selectUidRow", 25, "Select");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("removeUidRow", 25, "Remove");
  return row;
}

function populateSystemUidTagHtmlTable(tableId) {
  initKnownInspireSystems();
  let table = document.getElementById(tableId);
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  for (const obj of myInspireSystems) {
    appendSystemUidTagHtmlRow(table, obj.uid, obj.tag, obj.fw);
  }
}

function validSystemUid(uid) {
  let uid_length = uid.length;
  if (uid_length != 20) return false;
  let pos = uid.indexOf(INSPIRE_UID_PREFIX);
  if (pos != 0) return false;
  let hex_str = uid.substr(4);
  let re = /[0-9A-Fa-f]{16}/g;
  if (re.test(hex_str)) return true;
  return false;
}
