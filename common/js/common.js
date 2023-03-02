// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
const dbVersion = 1;
const dbPrimaryKey = 'created';
var respimaticUid = "";
var respimaticTag = "";
var dbNamePrefix = "";
var dbObjStoreName = "";
var db = null;
var dbReady = false;
var dbName = "";
var allDbKeys = {};
var logStartTime = new Date();
var logEndTime = new Date();
var analysisStartTime = new Date();
var analysisEndTime = new Date();
var analysisStartBreath = 0;
var analysisEndBreath = 0;

function initDbNames() {
  respimaticUid = getCookie(uidCookieName);
  respimaticTag = getCookie(tagCookieName);
  if (!respimaticUid) {
    respimaticUid = sessionStorage.getItem("respimaticUid");
    respimaticTag = sessionStorage.getItem("respimaticTag");
  }
  dbNamePrefix = respimaticUid;
  dbObjStoreName = respimaticUid;
}
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

function addMsToDate(date, ms) {
  var mill = date.valueOf(); // Get millisecond value from date
  mill += ms;
  return new Date(mill);
}
// /////////////////////////////////////////////
// Misc functions
// /////////////////////////////////////////////
function trim(str) {
  str = String(str);
  return str.trim();
}

function validDecimalInteger(num) {
  str = String(num);
  if (str.match(/^-?\d+$/)) return true;
  return false;
}

function validFloatNumber(num) {
  if (validDecimalInteger(num)) return true;
  str = String(num);
  if (str.match(/^-?\d+\.?\d*$/)) return true;
  return false;
}

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function parseJSONSafely(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("JSON parsing failed due to syntax error");
    // Return a default object, or null based on use case.
    return null;
  }
}

// The return value is an object with following boolean fields
// {isMaintenance,isAbnormal,isError,isVC,isMandatory}
function parseBreathInfo(num) {
  num = Number(num);
  var obj = {};
  //console.log("num = 0x" + num.toString(16));

  for (i = 0; i < 5; i++) {
    bit = num & 0x1;
    num = num >> 1;

    switch (i) {
      case 0:
        obj.isMandatory = bit ? true : false;
        break;
      case 1:
        obj.isVC = bit ? true : false;
        break;
      case 2:
        obj.isAbnormal = bit ? true : false;
        break;
      case 3:
        obj.isError = bit ? true : false;
        break;
      case 4:
        obj.isMaintenance = bit ? true : false;
        break;
      default:
        break;
    }
  }

  return obj;
}

function convertMS(milliseconds) {
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
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();
  var hrs = String(date.getHours()).padStart(2, '0');
  var min = String(date.getMinutes()).padStart(2, '0');
  var sec = String(date.getSeconds()).padStart(2, '0');
  dmy = dd + "-" + mm + "-" + yyyy;
  dtStr = '[' + dmy + ']' + hrs + ":" + min + ":" + sec;
  return dtStr;
}

function dateToDateStr(d) {
  if (!d) return null;
  date = new Date(d);
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();
  dtStr = dd + "-" + mm + "-" + yyyy;
  return dtStr;
}

function dateToTimeStr(d) {
  if (!d) return null;
  date = new Date(d);
  var hrs = String(date.getHours()).padStart(2, '0');
  var min = String(date.getMinutes()).padStart(2, '0');
  var sec = String(date.getSeconds()).padStart(2, '0');
  tmStr = hrs + ":" + min + ":" + sec;
  return tmStr;
}

function msToTimeStr(milliseconds) {
  var d = convertMS(milliseconds);
  days = d.day;
  hours = d.hour;
  minutes = d.minute;
  seconds = d.seconds;
  hours = days * 24 + hours;
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return hours + ":" + minutes + ":" + seconds;
}

function strToDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const dateArr = dateStr.split("-");
  if (dateArr.length != 3) return null;
  dd = dateArr[0];
  mm = dateArr[1];
  yyyy = dateArr[2];
  const timeArr = timeStr.split(":");
  if (timeArr.length != 3) return null;
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
  return date;
}

function closestNonNullEntryIndex(arr, index) {
  if (arr[index]) return index;
  // search up
  for (i = index; i < arr.length; i++) {
    if (arr[i]) return i;
  }
  // search down
  for (i = index; i >= 0; i--) {
    if (arr[i]) return i;
  }

  //console.log("closestNonNullEntryIndex: No non-null entry in the array");
  return null;
}

// /////////////////////////////////////////////
// Valid Parameter Check functions
// /////////////////////////////////////////////
const modeOptions = ["CMV", "ACV", "SIMV", "PSV"];

function modeValid(str) {
  return modeOptions.indexOf(str) != -1;
}
const vtOptions = [200, 250, 300, 350, 400, 450, 500, 550, 600];

function vtValid(str) {
  return vtOptions.indexOf(str) != -1;
}
const rrOptions = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

function rrValid(str) {
  return rrOptions.indexOf(str) != -1;
}
const ieOptions = ["1:1", "1:2", "1:3"];

function ieValid(str) {
  return ieOptions.indexOf(str) != -1;
}
const peepOptions = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function peepValid(str) {
  return peepOptions.indexOf(str) != -1;
}
const pmaxOptions = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];

function pmaxValid(str) {
  return pmaxOptions.indexOf(str) != -1;
}
const psOptions = [10, 15, 20, 25, 30, 35, 40];

function psValid(str) {
  return psOptions.indexOf(str) != -1;
}
const tpsOptions = ["F10%", "F20%", "F30%", "1.0", "1.5", "2.0", "2.5", "3.0"];

function tpsValid(str) {
  return tpsOptions.indexOf(str) != -1;
}
// /////////////////////////////////////////////
// Cookie functions
// /////////////////////////////////////////////
function setCookie(cname, cvalue) {
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  var expiry = d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; expires=" + expiry +
    ";path=/; SameSite=None;Secure";
}

function deleteAllCookies() {
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
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
  for (var i = 0; i < ca.length; i++) {
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
  if (ix == -1) return false;
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
  if (ix != -1) {
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
  if (format.test(dname)) {
    return false;
  } else {
    return true;
  }
}

function createOrOpenDb(name, timeStamp) {
  var dbReq = indexedDB.open(name, dbVersion);
  // Fires when the version of the database goes up, or the database is created
  // for the first time
  dbReq.onupgradeneeded = function (event) {
    db = event.target.result;
    // Object stores in databases are where data are stored.
    var dbObjStore;
    if (!db.objectStoreNames.contains(dbObjStoreName)) {
      dbObjStore = db.createObjectStore(dbObjStoreName, {
        keyPath: dbPrimaryKey
      });
    } else {
      dbObjStore = dbReq.transaction.objectStore(dbObjStoreName);
    }
  }
  // Fires once the database is opened (and onupgradeneeded completes, if
  // onupgradeneeded was called)
  dbReq.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    db = event.target.result;
    dbReady = true;
    registerDbName(dbName);
  }
  // Fires when we can't open the database
  dbReq.onerror = function (event) {
    dbReady = false;
    modalAlert('Error opening session ' + event.target.errorCode);
  }
  // Fires when there's another open connection to the same database
  dbReq.onblocked = function (event) {
    dbReady = false;
    db = event.target.result;
    db.close();
    modalAlert("Database version updated, Close all LOGGER tabs, reload the page.");
  }
}

function exportDb(dbName, fileName) {
  var getAll = [];
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    store.openCursor().onsuccess = function (evt) {
      var cursor = evt.target.result;
      if (cursor) {
        getAll.push(cursor.value);
        cursor.continue();
      } else {
        download(JSON.stringify(getAll, null, 1), fileName, "text/xml");
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
  if (ix == -1) {
    respimatic_dbs.push(dbName);
    localStorage.setItem(localStorageDbName, JSON.stringify(respimatic_dbs));
  }
}

const O2FLOW_SAFETY_BOOST_PERCENT = 107;

function lookupO2FlowRate(vt, rr, fiO2, purity, atmPurity) {
  if (fiO2 == atmPurity) return 0;
  if (fiO2 < atmPurity) fiO2 = atmPurity;
  mv = vt * rr;
  if (fiO2 > purity) fiO2 = purity;
  f = (mv * (fiO2 - atmPurity)) / (purity - atmPurity);
  return (f * O2FLOW_SAFETY_BOOST_PERCENT) / 100;
}

// returns an array [gender, age, pid]
// from a pattern like "[ID] (M) Age"
// returns null if badly formed
function parsePatientInfo(str) {
  let re = /\[.*\]\s+\([MF]\)\s+.+/i;
  if (!str.match(re)) {
    return null;
  }
  tokens = str.split('[');
  tokens = tokens[1].split(']');
  pid = tokens[0].trim();
  tokens = tokens[1].split(' ');
  age = tokens[2];
  tokens = tokens[1].split('(');
  tokens = tokens[1].split(')');
  gender = tokens[0];
  return [gender, age, pid];
}
// calculate checksum of a 32-bit number
// returns a byte checksum
function checksum(num) {
  sum = 0;
  for (i = 0; i < 4; i++) {
    b = num >> (i * 8);
    b = b & 0xFF;
    sum += b;
    sum = sum & 0xFF;
  }
  cs = ~sum + 1;
  return cs & 0xFF;
}
// returns num after checking checksum
// from a pattern like "[num,checksum]"
// returns null if badly formed
function parseChecksumString(tstr) {
  str = String(tstr);
  arr = parseJSONSafely(str);
  if (!arr || arr.length != 2) return null;

  num = arr[0];
  ccs = checksum(num);
  if (arr[1] != ccs) {
    console.log("Bad ChecksumString =" + num + " checksum=" + tokens[0]);
    console.log("Computed checksum=" + ccs);
    return null;
  }
  return num;
}

function parseAltitude(str) {
  // return [ft,meters]
  return str.split(' ');
}

function o2PurityAtAltitudeFt(ft) {
  o2x = 206000 - 6 * ft;
  o2 = (o2x + 5000) / 10000;
  return Math.floor(o2);
}

function o2PurityAtAltitudeMtr(mtr) {
  return o2PurityAtAltitudeFt(mtr * 3.28);
}

// various modals
var modalWidth = 900; // default - overriden by showZoomReminder

function showZoomReminder(width) {
  modalWidth = width;
  if (getCookie(zoomReminderOffCookieName) == "OFF") return;
  Swal.fire({
    icon: 'info',
    position: 'bottom',
    title: ZOOM_TITLE_STR,
    html: ZOOM_MESSAGE_STR,
    //width: modalWidth,
    showConfirmButton: false,
    color: 'white',
    background: '#2C94BC',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showDenyButton: true,
    denyButtonColor: '#B22222',
    denyButtonText: "STOP Reminders!",
    showCloseButton: true,
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `
    },
    grow: 'row',
    timerProgressBar: true,
    timer: 5000
  }).then((result) => {
    if (result.isDenied) {
      setCookie(zoomReminderOffCookieName, "OFF");
    }
  })
}

function showEditIconReminder() {
  if (getCookie(editReminderOffCookieName) == "OFF") return;
  Swal.fire({
    icon: 'info',
    position: 'bottom-end',
    title: EDIT_ICON_TITLE_STR,
    html: EDIT_ICON_MESSAGE_STR,
    //width: modalWidth,
    showConfirmButton: true,
    color: 'white',
    background: '#2C94BC',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showDenyButton: true,
    denyButtonColor: '#B22222',
    denyButtonText: "STOP Reminders!",
    showCloseButton: true,
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `
    },
    grow: 'row',
    timerProgressBar: true,
    timer: 5000
  }).then((result) => {
    if (result.isDenied) {
      setCookie(editReminderOffCookieName, "OFF");
    }
  })
}

function modalWarning(title, msg) {
  Swal.fire({
    icon: 'warning',
    title: title,
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: '#4D5656',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
  })
}

function modalAlert(title, msg) {
  Swal.fire({
    icon: 'error',
    title: title,
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: '#D35400',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
  })
}

function modalConfirm(title, msg, confirmFn, cancelFn, callbackArgs, confirmText, cancelText) {
  if (typeof confirmText == 'undefined') {
    confirmText = "CONFIRM";
  }
  if (typeof cancelText == 'undefined') {
    cancelText = "CANCEL";
  }
  Swal.fire({
    icon: 'question',
    title: title,
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: '#2C94BC',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#0D3E51',
    cancelButtonColor: '#B22222',
    showCloseButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) confirmFn(callbackArgs);
    } else if (result.isDismissed) {
      if (cancelFn) cancelFn(callbackArgs);
    }
  })
}

function findChildNodeByClass(node, className) {
  var res = null;
  var children = node.childNodes;
  if (!children) return null;

  for (let i = 0; i < children.length; i++) {
    if (children[i].className == className) {
      return children[i];
    }
  }

  // Else check for next level
  for (let i = 0; i < children.length; i++) {
    res = findChildNodeByClass(children[i], className);
    if (res) return res;
  }

  return res;
}

function findAncestorNodeByClassName(node, className) {
  if (node.className == className) return node;
  if (node.parentNode) return findAncestorNodeByClassName(node.parentNode, className);
  return null;
}

// tooltips for canvasjs
function toggleDataSeries(e) {
  if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.shape.render();
}
