var knownRespimaticSystems = [];

var templateSystemId = {
  uid : "",
  tag: ""
};

function createSystemUidTagObj(uid, tag) {
  obj = JSON.parse(JSON.stringify(templateSystemId));
  obj.uid = uid;
  obj.tag = tag;
  return obj;
}

function initKnownRespimaticSystems() {
  var str = localStorage.getItem(respimaticSystemsLocalStorage);
  if (str) {
    knownRespimaticSystems = JSON.parse(str);
  } else {
    knownRespimaticSystems = [];
  }
}

function saveNewRespimaticSystemId(uid, tag) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  obj = createSystemUidTagObj(uid, tag);
  knownRespimaticSystems.push(obj);
  localStorage.setItem(
    respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
}

function findRespimaticTagIndex(tag) {
  tag = tag.toUpperCase();
  i=0;
  for (const obj of knownRespimaticSystems) {
    if (obj.tag==tag) return i;
    i++;
  }
  return -1;
}

function findSystemUidObj(uid) {
  uid = uid.toUpperCase();
  for (const obj of knownRespimaticSystems) {
    if (obj.uid==uid) return obj;
  }
  return null;
}

function findSystemTagObj(tag) {
  tag = tag.toUpperCase();
  for (const obj of knownRespimaticSystems) {
    if (obj.tag==tag) return obj;
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

function appendSystemUidTagHtmlRow(table, uid, tag) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = uid;
  cell = row.insertCell();
  cell.innerHTML = tag;
}

function populateSystemUidTagHtmlTable(tableId) {
  initKnownRespimaticSystems();
  var table = document.getElementById(tableId);
  for (const obj of knownRespimaticSystems) {
   appendSystemUidTagHtmlRow(table, obj.uid, obj.tag);
  }
}

function validSystemUid(uid) {
  var uid_length = uid.length;
  if (uid_length != 20) return false;
  var pos = uid.indexOf("RSP_");
  if (pos != 0) return false;
  var hex_str = uid.substr(4);
  var re = /[0-9A-Fa-f]{16}/g;
  if (re.test(hex_str)) return true;
  return false;
}

