// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var knownRespimaticSystems = [];
var templateSystemId = {
  uid: "",
  tag: "",
  sw: null
};

function createSystemUidTagObj(uid, tag, sw) {
  obj = cloneObject(templateSystemId);
  obj.uid = uid;
  obj.tag = tag;
  obj.sw = sw;
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

function saveNewRespimaticSystemId(uid, tag, sw) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  obj = createSystemUidTagObj(uid, tag, sw);
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

function appendSwVersionToUid() {
  if (isUndefined(session)) return;
  if (knownRespimaticSystems.length == 0) {
    initKnownRespimaticSystems();
  }

  obj = findSystemUidObj(respimaticUid);
  if (!obj) return;

  obj.sw = [session.embeddedSwVersion.major,
            session.embeddedSwVersion.minor,
            session.embeddedSwVersion.board];

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

function convertSwVersionToStr(sw) {
  if ((sw===null) || isUndefined(sw)) return "unknown";
  return String(sw[0]) + "." + sw[1] + "." +sw[2];
}

function appendSystemUidTagHtmlRow(table, uid, tag, sw) {
  row = table.insertRow();
  row.style.cursor = "pointer";
  cell = row.insertCell();
  cell.innerHTML = tag;
  cell = row.insertCell();
  cell.innerHTML = uid;
  cell = row.insertCell();
  cell.innerHTML = convertSwVersionToStr(sw);
  cell = row.insertCell();
  cell.innerHTML = checkButtonHTML("selectUidRow", 15, "Select");
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
    appendSystemUidTagHtmlRow(table, obj.uid, obj.tag, obj.sw);
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
