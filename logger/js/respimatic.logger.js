
const creationTimeStamp = new Date();
const cookieName = "respimatic_uid";
const respimaticUid =  getCookie(cookieName);
const dbNamePrefix = respimaticUid ;
const dbVersion = 1;
const dbObjStoreName = respimaticUid ;
const tableName = respimaticUid ;
const localStorageDbName = "respimatic_dbs" ;
var doLog = false;

// check for browser capability
document.title = respimaticUid + " (LOGGER)" ;
if (!window.indexedDB) {
    alert("IndexedDB not available in your browser.\nSwitch browsers");
}

// ///////////////////////////////////////////////////////
// Open/Create Database 
// ///////////////////////////////////////////////////////
var dbNameSuffix = creationTimeStamp;
//var dbName = dbNamePrefix + '#' + dbNameSuffix;
var dbName = getNewDbName();

var db;
var dbReq = indexedDB.open(dbName, dbVersion);
var dbReady = false;

// Fires when the version of the database goes up, or the database is created
// for the first time
dbReq.onupgradeneeded = function(event) {
  db = event.target.result;

  // Object stores in databases are where data are stored.
  let dbObjStore;
  if (!db.objectStoreNames.contains(dbObjStoreName)) {
    dbObjStore = db.createObjectStore(dbObjStoreName, {autoIncrement: true});
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
 
  ts = {"creationTimeStamp" : creationTimeStamp};
  insertJsonData(db,ts);

  //alert("Created " + dbName);
}

// Fires when we can't open the database
dbReq.onerror = function(event) {
  dbReady = false;
  alert('Error opening database ' + event.target.errorCode);
}

// Fires when there's another open connection to the same database
dbReq.onblocked = function(event) {
  dbReady = false;
  db = event.target.result;
  db.close();
  alert("Database is updated, Close all LOGGER tabs, reload the page.");
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
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

function getNewDbName() {
  var name = "";
  do {
    var dbNameSuffix = prompt("Name the new LOG database", creationTimeStamp);
    if (!dbNameSuffix) {
      dbNameSuffix = creationTimeStamp;
      alert("Using the following name for the new database\n" + dbNameSuffix);
    }
    name= dbNamePrefix + '#' + dbNameSuffix;
    if (checkDbExists(name)) {
      alert("Database already exists\n" + dbNameSuffix + "\nTry again");
    } else break;
  } while (true) ;

  return name;
}

function listDb(item, index) {
  nameTm = parseDbName(item);
  alert(index + " " + nameTm[0] + "\nCreated:" + nameTm[1]);
}

function getAllDbs() {
  var str = localStorage.getItem(localStorageDbName);
  var retrieved_dbs = JSON.parse(str);
  return retrieved_dbs;
}

function listDbTableRow(item, index) {
  // do not list current db
  if (item==dbName) return;

  nameTm = parseDbName(item);

  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return;

  var table = document.getElementById("dbTable");

  var row = table.insertRow();

  var cell = row.insertCell();
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = '<button class="tableButton" onclick="deleteDbRow(this)">DELETE</button>' ;

}

function listAllDbs() {
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  table.innerHTML = "";

  var retrieved_dbs = getAllDbs();
  retrieved_dbs.forEach(listDbTableRow);
}

function deleteDb(dbName) {
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

  if (ix!=-1) {
    respimatic_dbs.splice(ix, 1);
    localStorage.setItem(localStorageDbName, JSON.stringify(respimatic_dbs));
  }
 
  var request = indexedDB.deleteDatabase(dbName);
  return request;
}

function deleteDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dName = respimaticUid + '#' + p.cells[0].innerHTML;

  if (!confirm("Delete Database created on\n" + p.cells[0].innerHTML)) {
    return;
  }

  // Delete the actual database
  deleteDb(dName);

  // remove from HTML table
  p.parentNode.removeChild(p);
}

function insertJsonData(db,jsonData) {
  // Start a database transaction and get the notes object store
  let tx = db.transaction([dbObjStoreName], 'readwrite');
  let store = tx.objectStore(dbObjStoreName);  
  store.add(jsonData);  // Wait for the database transaction to complete
  tx.oncomplete = function() { }
  tx.onerror = function(event) {
    alert('error storing data! ' + event.target.errorCode);
  }
}

function parseDbName(name) {
  // dbNames are of the form RSP_XXXXXXXXXXXX:Date
  arr = name.split('#');
  return arr;
}

// ///////////////////////////////////////////////////////
// Dweet Functions 
// ///////////////////////////////////////////////////////

function displayTweet(d) {
  if (!doLog) return ;
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d,null,". ") ;
}

function processDweet(d) {
  if (!doLog) return ;
  insertJsonData(db,d);

  /*
  created = d.created ;
  sysUid = d.thing ;

  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
  }
  */

}

function waitForDweets() {
  dweetio.listen_for(respimaticUid, function(d) {
    processDweet(d);
    displayTweet(d);
  });
}

// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////

function manageDb() {
  var heading = document.getElementById("SysUid");
  heading.innerHTML = "LOG for " + respimaticUid;

  waitForDweets();
}

function startLog() {
  if (doLog) return;
  doLog = true;
  alert("Log started ...");
}

function pauseLog() {
  if (!doLog) return;
  doLog = false;
  alert("Log paused ...");
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

