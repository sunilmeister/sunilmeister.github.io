// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var knownInspireSystems = [];
var templateSystemId = {
  uid: "",
  tag: "",
  fw: null
};

function deleteAllSystemUIDs() {
  let knownInspireSystems = [];
  localStorage.setItem(
    inspireSystemsLocalStorage, JSON.stringify(knownInspireSystems));
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
    knownInspireSystems = JSON.parse(str);
    knownInspireSystems.sort(compareSystemUidTagObj);
  } else {
    knownInspireSystems = [];
  }
}

function saveNewInspireSystemId(uid, tag, fw) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  let obj = createSystemUidTagObj(uid, tag, fw);
  knownInspireSystems.push(obj);
  knownInspireSystems.sort(compareSystemUidTagObj);
  localStorage.setItem(
    inspireSystemsLocalStorage, JSON.stringify(knownInspireSystems));
}

function findInspireTagIndex(tag) {
  tag = tag.toUpperCase();
  let i = 0;
  for (const obj of knownInspireSystems) {
    if (obj.tag == tag) return i;
    i++;
  }
  return -1;
}

function findSystemUidObj(uid) {
  uid = uid.toUpperCase();
  for (const obj of knownInspireSystems) {
    if (obj.uid == uid) return obj;
  }
  return null;
}

function findSystemTagObj(tag) {
  tag = tag.toUpperCase();
  for (const obj of knownInspireSystems) {
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
  if (knownInspireSystems.length == 0) {
    initKnownInspireSystems();
  }

  let obj = findSystemUidObj(inspireUid);
  if (!obj) return;

  let fw = [session.firmwareVersion.major,
            session.firmwareVersion.minor,
            session.firmwareVersion.board];

  if (obj.fw) { // already has a firmware version
    // check if the new one is the latest
    let lvStr = knownInspireReleases[0].rel;
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
    inspireSystemsLocalStorage, JSON.stringify(knownInspireSystems));

}

function removeSystemUidTagInfo(uid, tag) {
  for (let i = 0; i < knownInspireSystems.length; i++) {
    let obj = knownInspireSystems[i];
    if (obj.tag != tag) continue;
    if (obj.uid != uid) continue;
    knownInspireSystems.splice(i, 1);
    localStorage.setItem(
      inspireSystemsLocalStorage, JSON.stringify(knownInspireSystems));
    return tag;
  }
  return "";
}

function convertSwVersionToStr(fw) {
  if ((fw===null) || isUndefined(fw)) return "unknown";
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
  cell.innerHTML = convertSwVersionToStr(fw);
  cell = row.insertCell();
  cell.innerHTML = selectButtonHTML("selectUidRow", 15, "Select");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("removeUidRow", 15, "Remove");
  return row;
}

function populateSystemUidTagHtmlTable(tableId) {
  initKnownInspireSystems();
  let table = document.getElementById(tableId);
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  for (const obj of knownInspireSystems) {
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
