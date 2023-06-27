// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var knownRespimaticSystems = [];
var templateSystemId = {
  uid: "",
  tag: "",
  fw: null
};

function deleteAllSystemUIDs() {
  knownRespimaticSystems = [];
  localStorage.setItem(
    respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
}

function createSystemUidTagObj(uid, tag, fw) {
  obj = cloneObject(templateSystemId);
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

function initKnownRespimaticSystems() {
  var str = localStorage.getItem(respimaticSystemsLocalStorage);
  if (str) {
    knownRespimaticSystems = JSON.parse(str);
    knownRespimaticSystems.sort(compareSystemUidTagObj);
  } else {
    knownRespimaticSystems = [];
  }
}

function saveNewRespimaticSystemId(uid, tag, fw) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  obj = createSystemUidTagObj(uid, tag, fw);
  knownRespimaticSystems.push(obj);
  knownRespimaticSystems.sort(compareSystemUidTagObj);
  localStorage.setItem(
    respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
}

function findRespimaticTagIndex(tag) {
  tag = tag.toUpperCase();
  i = 0;
  for (const obj of knownRespimaticSystems) {
    if (obj.tag == tag) return i;
    i++;
  }
  return -1;
}

function findSystemUidObj(uid) {
  uid = uid.toUpperCase();
  for (const obj of knownRespimaticSystems) {
    if (obj.uid == uid) return obj;
  }
  return null;
}

function findSystemTagObj(tag) {
  tag = tag.toUpperCase();
  for (const obj of knownRespimaticSystems) {
    if (obj.tag == tag) return obj;
  }
  return null;
}

function findSystemTag(uid) {
  obj = findSystemUidObj(uid);
  if (!obj) return "";
  return obj.tag;
}

function findSystemUid(tag) {
  obj = findSystemTagObj(tag);
  if (!obj) return "";
  return obj.uid;
}

function recordedDataCompatible(fromVersion, toVersion) {
  if (fromVersion == toVersion) return true;
  return false;
}

function appendSwVersionToUid() {
  if (isUndefined(session)) return;
  if (knownRespimaticSystems.length == 0) {
    initKnownRespimaticSystems();
  }

  obj = findSystemUidObj(respimaticUid);
  if (!obj) return;

  let fw = [session.firmwareVersion.major,
            session.firmwareVersion.minor,
            session.firmwareVersion.board];

  if (obj.fw) { // already has a firmware version
    // check if the new one is the latest
    lvStr = knownRespimaticReleases[0].rel;
    vStr = convertSwVersionToStr(fw);
    if (lvStr != vStr) {
      modalWarning("Respimatic System Firmware not the latest",
        "Latest Released Firmware Version is " + lvStr
        + "<br>Current System version is " + vStr
        + "<br><br>To update, click on 'Update System Firmware'"
        + "<br>on the respimatic.com main menu"
        + "<br><br>Update at any convenient time" );
    }
  }
  obj.fw = cloneObject(fw);

  localStorage.setItem(
    respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));

  //console.log("append SW");
  //console.log(knownRespimaticSystems);
}

function removeSystemUidTagInfo(uid, tag) {
  for (var i = 0; i < knownRespimaticSystems.length; i++) {
    obj = knownRespimaticSystems[i];
    if (obj.tag != tag) continue;
    if (obj.uid != uid) continue;
    knownRespimaticSystems.splice(i, 1);
    localStorage.setItem(
      respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
    return tag;
  }
  return "";
}

function convertSwVersionToStr(fw) {
  if ((fw===null) || isUndefined(fw)) return "unknown";
  return String(fw[0]) + "." + fw[1] + "." +fw[2];
}

function appendSystemUidTagHtmlRow(table, uid, tag, fw) {
  row = table.insertRow();
  row.style.cursor = "pointer";
  cell = row.insertCell();
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
  initKnownRespimaticSystems();
  var table = document.getElementById(tableId);
  var rowCount = table.rows.length;
  for (var i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  for (const obj of knownRespimaticSystems) {
    appendSystemUidTagHtmlRow(table, obj.uid, obj.tag, obj.fw);
  }
}

function validSystemUid(uid) {
  var uid_length = uid.length;
  if (uid_length != 20) return false;
  var pos = uid.indexOf(RESPIMATIC_UID_PREFIX);
  if (pos != 0) return false;
  var hex_str = uid.substr(4);
  var re = /[0-9A-Fa-f]{16}/g;
  if (re.test(hex_str)) return true;
  return false;
}
