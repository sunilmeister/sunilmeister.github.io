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

function compareSystemUidTagObj( a, b ) {
  if ( a.tag < b.tag ) {
    return -1;
  } else if ( a.tag > b.tag ) {
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

function saveNewRespimaticSystemId(uid, tag) {
  uid = uid.toUpperCase();
  tag = tag.toUpperCase();
  obj = createSystemUidTagObj(uid, tag);
  knownRespimaticSystems.push(obj);
  knownRespimaticSystems.sort(compareSystemUidTagObj);
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

function removeSystemUidTagInfo(uid, tag) {
  for( var i = 0; i < knownRespimaticSystems.length; i++){ 
    obj = knownRespimaticSystems[i];
    if (obj.tag != tag) continue;
    if (obj.uid != uid) continue;
    knownRespimaticSystems.splice(i,1);
    localStorage.setItem(
      respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
    return tag;
  }
  return "";
}

function appendSystemUidTagHtmlRow(table, uid, tag) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = tag;
  cell = row.insertCell();
  cell.innerHTML = uid;
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
   appendSystemUidTagHtmlRow(table, obj.uid, obj.tag);
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

