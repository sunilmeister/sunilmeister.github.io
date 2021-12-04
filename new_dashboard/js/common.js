
// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

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
var allDbKeys = {};

var logStartTime = new Date();
var logEndTime = new Date();
var analysisStartTime = new Date();
var analysisEndTime = new Date();

// /////////////////////////////////////////////
// milliseconds to dates
// /////////////////////////////////////////////
function msToDateStr(ms) {
  d = new Date();
  d.setTime(ms);
  return dateToStr(d);
}

function dateStrToMs(dStr) {
  d = strToDate(dStr);
  return d.getTime();
}

// /////////////////////////////////////////////
// Misc functions
// /////////////////////////////////////////////

function validDecimalInteger(num) {
  str = String(num);
  if (str.match(/^-?\d+$/)) return true;
  return false;
}

function validFloatNumber(num) {
  str = String(num);
  if (str.match(/^-?\d+\.?\d+$/)) return true;
  return false;
}

function createNewInstance(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function keyMoreThanAnalysisRangeMax(key) {
  d = new Date(key);
  if (d>analysisEndTime) return true;
  return false;
}

function keyLessThanAnalysisRangeMin(key) {
  d = new Date(key);
  //console.log("d=" + d + " analysisStart=" + analysisStartTime);
  if (d<analysisStartTime) return true;
  return false;
}

function keyWithinAnalysisRange(key) {
  d = new Date(key);
  if (d<analysisStartTime) return false;
  if (d>analysisEndTime) return false;
  return true;
}

function convertMS( milliseconds ) {
    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return {
        day: day,
        hour: hour,
        minute: minute,
        seconds: seconds
    };
}

function dateToStr(d) {
  if (!d) return null;
  date = new Date(d);

  var dd = String(date. getDate()). padStart(2, '0');
  var mm = String(date. getMonth() + 1). padStart(2, '0'); //January is 0!
  var yyyy = date. getFullYear();

  var hrs = String(date. getHours()). padStart(2, '0');
  var min = String(date. getMinutes()). padStart(2, '0');
  var sec = String(date. getSeconds()). padStart(2, '0');

  dmy = dd + "-" + mm + "-" + yyyy;
  dtStr = '[' + dmy + ']' + hrs + ":" + min + ":" + sec;

  return dtStr;
}

function dateToDateStr(d) {
  if (!d) return null;
  date = new Date(d);

  var dd = String(date. getDate()). padStart(2, '0');
  var mm = String(date. getMonth() + 1). padStart(2, '0'); //January is 0!
  var yyyy = date. getFullYear();

  dtStr = dd + "-" + mm + "-" + yyyy;

  return dtStr;
}

function dateToTimeStr(d) {
  if (!d) return null;
  date = new Date(d);

  var hrs = String(date. getHours()). padStart(2, '0');
  var min = String(date. getMinutes()). padStart(2, '0');
  var sec = String(date. getSeconds()). padStart(2, '0');

  tmStr = hrs + ":" + min + ":" + sec;

  return tmStr;
}

function msToTimeStr(milliseconds) {
  var d = convertMS(milliseconds);

  days = d.day;
  hours = d.hour;
  minutes = d.minute;
  seconds = d.seconds;

  hours = days*24 + hours;
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function strToDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  const dateArr = dateStr.split("-");
  //console.log("date " + dateArr);
  if (dateArr.length!=3) return null;
  dd = dateArr[0];
  mm = dateArr[1];
  yyyy = dateArr[2];

  const timeArr = timeStr.split(":");
  //console.log("time " + timeArr);
  if (timeArr.length!=3) return null;
  hh = timeArr[0];
  mn = timeArr[1];
  ss = timeArr[2];

  isoString = yyyy + '/' + mm + '/' + dd;
  isoString = isoString + ' ' + hh + ':' + mn + ':' + ss;
  valid = Date.parse(isoString);
  if (isNaN(valid)) {
    return null;
  }

  date = new Date(isoString);
  date.setMilliseconds(0);
  //console.log("isoString=" + isoString);
  //console.log("Date=" + date);
  return date;
}

// /////////////////////////////////////////////
// Valid Parameter Check functions
// /////////////////////////////////////////////
const modeOptions = ["CMV","ACV","SIMV","PSV"];
function modeValid(str) {
  return modeOptions.indexOf(str) != -1 ;
}

const vtOptions = [200,250,300,350,400,450,500,550,600];
function vtValid(str) {
  return vtOptions.indexOf(str) != -1 ;
}

const rrOptions = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
function rrValid(str) {
  return rrOptions.indexOf(str) != -1 ;
}

const ieOptions = ["1:1","1:2","1:3"];
function ieValid(str) {
  return ieOptions.indexOf(str) != -1 ;
}

const peepOptions = [3,4,5,6,7,8,9,10,11,12,13];
function peepValid(str) {
  return peepOptions.indexOf(str) != -1 ;
}

const pmaxOptions = [20,25,30,35,40,45,50,55,60,65,70];
function pmaxValid(str) {
  return pmaxOptions.indexOf(str) != -1 ;
}

const psOptions = [10,15,20,25,30,35,40];
function psValid(str) {
  return psOptions.indexOf(str) != -1 ;
}

const tpsOptions = ["\u21A110\uFE6A","\u21A120\uFE6A","\u21A130\uFE6A","\u23F11.0","\u23F11.5","\u23F12.0","\u23F12.5","\u23F13.0"];
function tpsValid(str) {
  return tpsOptions.indexOf(str) != -1 ;
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

function isValidDatabaseName(dname) { 
  var format = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;

  if(format.test(dname)){
    return false;
  } else {
    return true;
  }
}

function createOrOpenDb(name, timeStamp) {
  var dbReq = indexedDB.open(name, dbVersion);

  // Fires when the version of the database goes up, or the database is created
  // for the first time
  dbReq.onupgradeneeded = function(event) {
    db = event.target.result;

    // Object stores in databases are where data are stored.
    var dbObjStore;
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
    registerDbName(dbName);

 
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

function exportDb(dbName) {
  var getAll = [];

  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);

    store.openCursor().onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        getAll.push(cursor.value);
        cursor.continue();
      } else {
	download(JSON.stringify(getAll,null,1), "respimatic.session.txt", "text/plain");
      }
    }
  }
}

function registerDbName(dbName) {
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

const PURITY_DEGRADATION_PERCENT=92;

function DegradedPurity(p) {
  var maxPurity = (PURITY_DEGRADATION_PERCENT*p)/100;
  if (maxPurity<21) return 21;
  return maxPurity;
}

function lookupO2FlowRate(vt, rr, fiO2, purity) {
  if (fiO2<21) fiO2 = 21;
  degradedPurity = DegradedPurity(purity);

  mv = vt * rr;

  if (fiO2 > degradedPurity) fiO2 = degradedPurity ;
  f = (mv * (fiO2 - 21)) / (degradedPurity - 21);
  
  return f;
}

