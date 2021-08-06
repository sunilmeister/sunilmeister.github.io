const cookieName = "selectedUid";
const localStorageDbName = "respimatic_dbs" ;

var respimaticUid =  getCookie(cookieName);
const dbNamePrefix = respimaticUid ;
const dbVersion = 1;
const dbObjStoreName = respimaticUid ;
const dbPrimaryKey = 'created' ;
var db = null;
var dbReady = false;
var dbName = "";

// /////////////////////////////////////////////
// Misc functions
// /////////////////////////////////////////////
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

// /////////////////////////////////////////////
// UID functions
// /////////////////////////////////////////////
function validUid() {
  var uid_length = respimaticUid.length;
  if (uid_length!=20) return false;

  var pos = respimaticUid.indexOf("RSP_");
  if (pos!=0) return false;

  var hex_str = respimaticUid.substr(4);
  //alert("hex_str = " + hex_str);
  var re = /[0-9A-Fa-f]{16}/g;

  if (re.test(hex_str)) return true;

  return false;
}

// /////////////////////////////////////////////
// Cookie functions
// /////////////////////////////////////////////
function setCookie(cname, cvalue) {
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  var expiry = d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; expires=" + expiry
                    + ";path=/; SameSite=None;Secure";
}

function deleteCookie(cname) {
  var d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  var expiry = d.toUTCString();
  document.cookie = cname + "=; expires=" + expiry;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// /////////////////////////////////////////////
// Database functions
// /////////////////////////////////////////////
function checkDbExists(dbName) {
  var retrieved_dbs = localStorage.getItem(localStorageDbName);
  var respimatic_dbs = [];
  if (retrieved_dbs) {
    respimatic_dbs = JSON.parse(retrieved_dbs);
  } else return false;

  var ix;
  if (respimatic_dbs.length) {
    ix = respimatic_dbs.indexOf(dbName);
  } else {
    ix = -1;
  }

  if (ix==-1) return false;

  return true;
}

function getAllDbs() {
  obj = localStorage.getItem(localStorageDbName);
  if (!obj) return null;

  // could be a JSON object or could be an array
  if (Array.isArray(obj)) return obj;

  retrieved_dbs = JSON.parse(obj);
  return retrieved_dbs;
}

function deleteDb(dbName) {
  // Keep track of databases currently existing
  var retrieved_dbs = getAllDbs();

  var ix;
  if (retrieved_dbs.length) {
    ix = retrieved_dbs.indexOf(dbName);
  } else {
    ix = -1;
  }

  if (ix!=-1) {
    retrieved_dbs.splice(ix, 1);
    localStorage.setItem(localStorageDbName, JSON.stringify(retrieved_dbs));
  }
 
  var request = indexedDB.deleteDatabase(dbName);
  return request;
}

function parseDbName(name) {
  // dbNames are of the form RSP_XXXXXXXXXXXX|name|Date
  arr = name.split('|');
  return arr;
}

// ///////////////////////////////////////////////////////
// Open/Create Database 
// ///////////////////////////////////////////////////////

function createOrOpenDb(name, timeStamp) {
  var dbReq = indexedDB.open(name, dbVersion);

  // Fires when the version of the database goes up, or the database is created
  // for the first time
  dbReq.onupgradeneeded = function(event) {
    db = event.target.result;

    // Object stores in databases are where data are stored.
    let dbObjStore;
    if (!db.objectStoreNames.contains(dbObjStoreName)) {
      dbObjStore = db.createObjectStore(dbObjStoreName, {keyPath: dbPrimaryKey});
    } else {
      dbObjStore = dbReq.transaction.objectStore(dbObjStoreName);
    }
  }

  // Fires once the database is opened (and onupgradeneeded completes, if
  // onupgradeneeded was called)
  dbReq.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    db = event.target.result;
    dbReady = true;

    // Keep track of databases currently existing
    var retrieved_dbs = localStorage.getItem(localStorageDbName);
    var respimatic_dbs = [];
    if (retrieved_dbs) {
      respimatic_dbs = JSON.parse(retrieved_dbs);
    }

    var ix;
    if (respimatic_dbs.length) {
      ix = respimatic_dbs.indexOf(dbName);
    } else {
      ix = -1;
    }

    if (ix==-1) {
      respimatic_dbs.push(dbName);
      localStorage.setItem(localStorageDbName, JSON.stringify(respimatic_dbs));
    }
 
  }

  // Fires when we can't open the database
  dbReq.onerror = function(event) {
    dbReady = false;
    alert('Error opening session ' + event.target.errorCode);
  }

  // Fires when there's another open connection to the same database
  dbReq.onblocked = function(event) {
    dbReady = false;
    db = event.target.result;
    db.close();
    alert("Database version updated, Close all LOGGER tabs, reload the page.");
  }
}


