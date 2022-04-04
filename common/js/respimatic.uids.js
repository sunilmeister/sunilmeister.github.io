const respimaticSystemsLocalStorage = "KNOWN_RESPIMATIC_SYSTEMS" ;
var knownRespimaticSystems = [];
var templateSystemId = {
  uid : "";
  name: "";
};

function createSystemIdObj(uid, name) {
  id = JSON.parse(JSON.stringify(templateSystemId));
  id.uid = yid;
  id.name = name;
  return id;
}

function initKnownRespimaticSystems() {
  var str = localStorage.getItem(respimaticSystemsLocalStorage);
  if (str) {
    knownRespimaticSystems = JSON.parse(str);
  } else {
    knownRespimaticSystems = [];
  }
  return knownRespimaticSystems;
}

function saveNewRespimaticSystemId(uid, name) {
  id = createSystemIdObj(uid, name);
  knownRespimaticSystems.push(id);
  localStorage.setItem(
    respimaticSystemsLocalStorage, JSON.stringify(knownRespimaticSystems));
}

function findSystemUidObj(uid) {
  for (obj of knownRespimaticSystems) {
    if (obj.uid==uid) return obj;
  }
  return null;
}

function findSystemNameObj(name) {
  for (obj of knownRespimaticSystems) {
    if (obj.name==name) return obj;
  }
  return null;
}

function findSystemName(uid) {
  obj = findSystemUidObj(uid);
  if (!obj) return "";
  return obj.name;
}

function findSystemUid(name) {
  obj = findSystemNameObj(name);
  if (!obj) return "";
  return obj.uid;
}
