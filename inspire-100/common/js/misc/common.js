/* ********************************************************
                   Author : Sunil Nanda
   ******************************************************** */

var inspireUid = "";
var inspireTag = "";

///////////////////////////////////////////////////////
//// Useful conversion from REM to PX
///////////////////////////////////////////////////////
function convertPixelsToRem(px) {    
  return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function convertRemToPixels(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function convertRemToPixelsInt(rem) {    
	let val = convertRemToPixels(rem);
	val = Math.floor(val);
	if (val <=0) val = 1;
  return val;
}

///////////////////////////////////////////////////////
// For modal warnings errors, confirmations etc.
///////////////////////////////////////////////////////
var modalWidth = "45rem"; // default modal width

///////////////////////////////////////////////////////
// must be done before accessing any indexedDb database
///////////////////////////////////////////////////////
function getUidTagParams() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	inspireUid =	urlParams.get('uid');
	if (inspireUid) {
		inspireUid =	inspireUid.replace(/"/g, '');
	}
	//console.log('param uid', inspireUid);

	inspireTag =	urlParams.get('tag');
	if (inspireTag) {
		inspireTag =	inspireTag.replace(/"/g, '');
	}
	//console.log('param tag', inspireTag);

	if (!inspireUid || !inspireTag) {
  	inspireUid = getCookie(uidCookieName);
  	inspireTag = getCookie(tagCookieName);
		if (!inspireUid || !inspireTag) {
    	inspireUid = sessionStorage.getItem("inspireUid");
    	inspireTag = sessionStorage.getItem("inspireTag");
  	}
	}

	if (!inspireUid) {
		console.error("Cannot find System UID");
	}
	if (!inspireTag) {
		console.error("Cannot find System TAG");
	}
}

function initDbNames() {
	getUidTagParams();
  session.database.dbNamePrefix = inspireUid;
  session.database.dbObjStoreName = inspireUid;
}

function deleteAllRecordings() {
  let retrieved_dbs = getAllDbs();
  for (i = 0; i < retrieved_dbs.length; i++) {
    deleteDb(retrieved_dbs[i]);
  }  
  localStorage.setItem(localStorageDbName, "[]");
}

// /////////////////////////////////////////////
// milliseconds to dates
// /////////////////////////////////////////////
function msToDateStr(ms) {
  d = new Date();
  d.setTime(ms);
  return dateToStr(d);
}

function msToHHMMSS(ms) {
	let secs = ms/1000;
  let hh = Math.floor(secs/3600);
	secs = secs % 3600;
  let mm = Math.floor(secs/60);
	let ss = Math.floor(secs % 60);

	let hhStr = hh.toString().padStart(2, 0);
	let mmStr = mm.toString().padStart(2, 0);
	let ssStr = ss.toString().padStart(2, 0);

  let timeStr = `${hhStr}:${mmStr}:${ssStr}`;
	return timeStr;

}

function dateStrToMs(dStr) {
  d = strToDate(dStr);
  return d.getTime();
}

function addMsToDate(date, ms) {
  let mill = date.getTime(); // Get millisecond value from date
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

function isValidValue(val) {
	if (val === null) return false;
	if (isUndefined(val)) return false;
	if (isNaN(val)) return false;
	return true;
}

function isUndefined(v) {
  if (typeof v == 'undefined') return true;
  return false;
}

function isObject(object) {
  return object != null && typeof object === 'object';
}  

function parseJSONSafely(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("JSON parsing failed due to syntax error\n" + str);
    // Return a default object, or null based on use case.
    return null;
  }
}

function cloneObject(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  if (obj instanceof Date) {
    let copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  if (obj instanceof Array) {
    let copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = cloneObject(obj[i]);
    }
    return copy;
  }
  if (obj instanceof Object) {
    let copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = cloneObject(obj[attr]);
    }
    return copy;
  }
  throw new Error("Unable to copy obj this object.");
}

function equalObjects(object1, object2) {
	if ((object1 === null) && (object2 !== null)) return false;
	if ((object1 !== null) && (object2 === null)) return false;

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !equalObjects(val1, val2)) ||
      (!areObjects && (val1 !== val2))
    ) {
      return false;
    }
  }
  return true;
}

// The return value is an object with following boolean fields
// {isMaintenance,isAbnormal,isError,isVC,isMandatory}
function parseBreathInfo(num) {
  num = Number(num);
  let obj = {};

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

function breathTimeXaxisFormatter(e) {
  iPart = Math.floor(e.value);
  if (Number(iPart) != Number(e.value)) return ""
  return convertSECtoHHMMSS(iPart);
}

function convertSECtoHHMMSS(seconds) {
  let days, hours, minutes;
  minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  days = Math.floor(hours / 24);
  hours = hours % 24;
	
  let hrs = String(days*24 + hours);
  let min = String(minutes).padStart(2, '0');
  let sec = String(seconds).padStart(2, '0');
  tmStr = hrs + ":" + min + ":" + sec;
  return tmStr;
}

function convertMStoHHMMSS(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
	return convertSECtoHHMMSS(seconds);
}

function dateToStr(d) {
  if (!d) return null;
  date = new Date(d);
  let str = '[' + dateToDateStr(date) + ']' + dateToTimeStr(date);
  return str;
}

function dateToDateStr(d) {
  if (!d) return null;
  date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = months[date.getMonth()];
  let yyyy = date.getFullYear();
  dtStr = dd + "-" + mm + "-" + yyyy;
  return dtStr;
}

function dateToTimeStr(d) {
  if (!d) return null;
  date = new Date(d);
  let hrs = String(date.getHours()).padStart(2, '0');
  let min = String(date.getMinutes()).padStart(2, '0');
  let sec = String(date.getSeconds()).padStart(2, '0');
  tmStr = hrs + ":" + min + ":" + sec;
  return tmStr;
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
  let d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  let expiry = d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; expires=" + expiry +
    ";path=/; SameSite=None;Secure";
}

function deleteAllCookies() {
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

function deleteCookie(cname) {
  let d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  let expiry = d.toUTCString();
  document.cookie = cname + "=; expires=" + expiry;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
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
  let retrieved_dbs = localStorage.getItem(localStorageDbName);
  let inspire_dbs = [];
  if (retrieved_dbs) {
    inspire_dbs = JSON.parse(retrieved_dbs);
  } else return false;
  let ix;
  if (inspire_dbs.length) {
    ix = inspire_dbs.indexOf(dbName);
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
  let retrieved_dbs = getAllDbs();
  let ix;
  if (retrieved_dbs.length) {
    ix = retrieved_dbs.indexOf(dbName);
  } else {
    ix = -1;
  }
  if (ix != -1) {
    retrieved_dbs.splice(ix, 1);
    localStorage.setItem(localStorageDbName, JSON.stringify(retrieved_dbs));
  }
  let request = indexedDB.deleteDatabase(dbName);
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
  let format = /[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]+/;
  if (format.test(dname)) {
    return false;
  } else {
    return true;
  }
}

function createOrOpenDb(name, timeStamp) {
  session.database.dbName = name;
  let dbReq = indexedDB.open(name, session.database.dbVersion);
  // Fires when the version of the database goes up, or the database is created
  // for the first time
  dbReq.onupgradeneeded = function (event) {
    session.database.db = event.target.result;
    // Object stores in databases are where data are stored.
    let dbObjStore;
    if (!session.database.db.objectStoreNames.contains(session.database.dbObjStoreName)) {
      dbObjStore = session.database.db.createObjectStore(session.database.dbObjStoreName, 
				{ autoIncrement: true }
			);
    } else {
      dbObjStore = dbReq.transaction.objectStore(session.database.dbObjStoreName);
    }
  }
  // Fires once the database is opened (and onupgradeneeded completes, if
  // onupgradeneeded was called)
  dbReq.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    session.database.db = event.target.result;
    session.database.dbReady = true;
    registerDbName(session.database.dbName);
  }
  // Fires when we can't open the database
  dbReq.onerror = function (event) {
    session.database.dbReady = false;
    modalAlert('Error opening session ' + event.target.errorCode,"Database Error");
  }
  // Fires when there's another open connection to the same database
  dbReq.onblocked = function (event) {
    session.database.dbReady = false;
    session.database.db = event.target.result;
    session.database.db.close();
    modalAlert("Database version updated, Close all LOGGER tabs, reload the page.","Database Error");
  }
}

function exportDb(dbName, fileName) {
	fileName += ".session.json" ;
  let getAll = [];
  let req = indexedDB.open(dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    let db = event.target.result;
    let tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    let store = tx.objectStore(session.database.dbObjStoreName);
    store.openCursor().onsuccess = function (evt) {
      let cursor = evt.target.result;
      if (cursor) {
        getAll.push(cursor.value);
        cursor.continue();
      } else {
        download(JSON.stringify(getAll, null, 1), fileName, "text/xml");
      }
    }
  }
}

function registerDashboardPing(uid) {
  // Keep track of dashboards currently active
  let retrieved = localStorage.getItem(inspireDashboardsLocalStorage);
  let obj = {};
  if (retrieved) {
    obj = JSON.parse(retrieved);
  }
	obj[uid] = new Date();
  localStorage.setItem(inspireDashboardsLocalStorage, JSON.stringify(obj));
}

function isDashboardActive(uid) {
  // Keep track of dashboards currently active
  let retrieved = localStorage.getItem(inspireDashboardsLocalStorage);
  if (!retrieved) return false;

  obj = JSON.parse(retrieved);
	if (isUndefined(obj[uid])) return false;

	let lastPing = new Date(obj[uid]);
	let now = new Date();
	let ms = now.getTime() - lastPing.getTime();
	if (ms > MAX_DASHBOARD_PING_DELAY_IN_MS) return false;
	return true;
}

function registerDbName(dbName) {
  // Keep track of databases currently existing
  let retrieved_dbs = localStorage.getItem(localStorageDbName);
  let inspire_dbs = [];
  if (retrieved_dbs) {
    inspire_dbs = JSON.parse(retrieved_dbs);
  }
  let ix;
  if (inspire_dbs.length) {
    ix = inspire_dbs.indexOf(dbName);
  } else {
    ix = -1;
  }
  if (ix == -1) {
    inspire_dbs.push(dbName);
    localStorage.setItem(localStorageDbName, JSON.stringify(inspire_dbs));
  }
}

const O2FLOW_SAFETY_BOOST_PERCENT = 107;

// return Date object or null
function lookupBreathTime(bnum) {
	let btimes = session.loggedBreaths;
	if (!btimes) return null;
	if (bnum >= btimes.length) return null;
	return new Date(btimes[bnum].time);
}

function lookupBreathNum(time) {
	let bnum = session.params.breathNum.ValueAtTime(time);
	if (isUndefined(bnum)) return 0;
	if (bnum === null) return 0;
	// Now the problem is that there may be missing breaths
	// that are not in the params datastructure
	// Investigate loggedBreaths starting from this bnum
	// to see if there is a better match for the given time
	for (; bnum < session.loggedBreaths.length-2;) {
		if (!session.loggedBreaths[bnum+1].missed) break;
		if (session.loggedBreaths[bnum+1].time < time) bnum++;
	}
	return bnum;
}

function lookupO2FlowRate(vt, rr, fiO2, purity, atmPurity) {
  if (fiO2 == atmPurity) return 0;
  if (fiO2 < atmPurity) fiO2 = atmPurity;
  let mv = vt * rr;
  if (fiO2 > purity) fiO2 = purity;
  f = (mv * (fiO2 - atmPurity)) / (purity - atmPurity);
  return (f * O2FLOW_SAFETY_BOOST_PERCENT) / 100;
}

function movingAvgFilter(samples, windowSize) {
	let arr = [];
  let ws = windowSize;

  for (let i = 0; i < samples.length; i++) {
    if ((i + 1) < windowSize) {
        ws = i+1;
    } else {
        ws = windowSize;
    }
    let sum = 0;
    for (let j = 0; j < ws; j++) {
        sum += samples[(i-j)];
    }
    arr.push(sum / ws);
  }

	return cloneObject(arr);
}

// calculate checksum of a 32-bit number
// returns a byte checksum
function checksum(num) {
  let sum = 0;
  for (i = 0; i < 4; i++) {
    let b = num >> (i * 8);
    b = b & 0xFF;
    sum += b;
    sum = sum & 0xFF;
  }
  let cs = ~sum + 1;
  return cs & 0xFF;
}
// returns num after checking checksum
// from a pattern like "[0xHEX_NUMBER,checksum]"
// returns null if badly formed
function parseChecksumString(tstr) {
  let str = String(tstr);
	let numStr = "";

	if (str[0] != '[') return null;
	let i = 1;
	for (; i<str.length; i++) {
		if (str[i] == ',') break;
		numStr += str[i];
	}
  let num = Number(numStr);
	//console.log("numStr", numStr, "num", num);

	let csStr = "";
	for (i++; i<str.length; i++) {
		if (str[i] == ']') break;
		csStr += str[i];
	}
  let cs = Number(csStr);
  let ccs = checksum(num);
  if (cs != ccs) {
    console.error("Bad ChecksumString =" + num + " checksum=" + cs +
      "\nComputed checksum=" + ccs);
    return null;
  }
  return num;
}

function parseFwVersionStr(str) {
  // return [major,minor,board]
  return str.split('.');
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

// ///////////////////////////////////////////////
// modals for warnings, errors etc.
// ///////////////////////////////////////////////
function modalWarning(title, msg) {
  Swal.fire({
    icon: 'warning',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
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

function modalInfo(title, msg) {
  let modalColor = palette.modal;

  Swal.fire({
    icon: 'info',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: modalColor,
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
  })
}

function modalAlert(title, msg) {
  Swal.fire({
    icon: 'error',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
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

  let modalColor = palette.modal;
  
  Swal.fire({
    icon: 'question',
    title: title,
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: modalColor,
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
    } else if (result.isDismissed || result.isDenied) {
      if (cancelFn) cancelFn(callbackArgs);
      else Swal.fire({
        icon: 'info',
        title: 'Cancelled!',
        text: 'No action taken',
        width: modalWidth,
        color: 'white',
        background: modalColor,
        showConfirmButton: false,
      })
    }
  })
}

function findChildNodeByClass(node, className) {
  let res = null;
  let children = node.childNodes;
  if (!children) return null;

  for (let i = 0; i < children.length; i++) {
    // a node can have multiple class names
    let cString = children[i].className;
    if (cString) {
      let cNames = cString.split(' ');
      for (let c = 0; c < cNames.length; c++) {
        if (cNames[c] == className) {
          return children[i];
        }
      }
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
  let cString = node.className;
  if (cString) {
    let cNames = cString.split(' ');
    for (let c = 0; c < cNames.length; c++) {
      if (cNames[c] == className) {
        return node;
      }
    }
  }

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

function animateNumberValue(obj, start, end, duration) {
	/* Sexy but slowing things down
  start = Number(start);
  end = Number(end);
  if (isNaN(start) || isNaN(end)) {
    obj.innerText = end;
    return;
  }
  if (start === end) return;
  let range = end - start;
  let current = start;
  let increment = end > start? 1 : -1;
  let stepTime = Math.abs(Math.floor(duration / range));
  let timer = setInterval(function() {
      current += increment;
      obj.innerText = current;
      if (current == end) {
          clearInterval(timer);
      }
  }, stepTime);
	*/

	obj.innerText = end;
}

function animateNumberValueTo(obj, end) {
	/* Sexy but slowing things down
  start = Number(obj.innerText);
  animateNumberValue(obj, start, end, ANIMATE_NUMBER_DURATION);
	*/

	obj.innerText = end;
}

function updateDocumentTitle() {
  let title = "" ;
  if (session.patientData.fname) title = session.patientData.fname;
  if (session.patientData.lname) title += " " + session.patientData.lname;

  if (inspireTag) {
    title += "[" + inspireTag + "]" ;
  } else {
    title += "[??]" ;
  }

  title += " " +  session.appId;

  document.title = title;
  return title;
}

function detectOS() {
	let os = "UNKNOWN"; 
	if (navigator.appVersion.indexOf("Win") != -1) os =  "Windows"; 
	else if (navigator.appVersion.indexOf("Mac") != -1) os =  "MacOS"; 
	else if (navigator.appVersion.indexOf("X11") != -1) os =  "Unix"; 
	else if (navigator.appVersion.indexOf("Linux") != -1) os =  "Linux"; 
	return os;
}

function readJsonFile(fileName, callbackFn) {
	fetch(fileName)
    .then((response) => response.json())
    .then((json) => callbackFn(json))
  	.catch(error => console.error(fileName, 'Error reading JSON:', error));
}

function downloadFileFromURL(dstFileName, srcURL) {
	// CREATE A LINK ELEMENT IN DOM
	let elm = document.createElement('a');  
  elm.href = srcURL;  
	// SET ELEMENT CREATED 'ATTRIBUTE' TO DOWNLOAD, FILENAME PARAM AUTOMATICALLY
  elm.setAttribute('download', dstFileName); 
  document.body.appendChild(elm);
	elm.click();
 	document.body.removeChild(elm);
}
