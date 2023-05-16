// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var importJsonArray = [];

function initImportExport() {
  //console.log("initImportExport");
  importJsonArray = [];
}

function listDbExportTableRow(item, index) {
  nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != respimaticUid) return;
  var table = document.getElementById("dbExportTable");
  var row = table.insertRow();
  var cell;
  cell = row.insertCell();
  cell.style.paddingRight = "25px";
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.innerHTML = nameTm[2];
}

function rowDbName(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row");
      return;
    }
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  var dbName = respimaticUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  return dbName;
}

function exportDbRow(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }
  fileName = document.getElementById("exportFileName").value;
  if (fileName) {
    exportDb(rowDbName(row), fileName);
    document.getElementById("exportDiv").style.display = "none";
  }
}

function exportFile() {
  exportDbRow(exportRowDiv);
}

function cancelExport() {
  document.getElementById("exportDiv").style.display = "none";
}

function doImport(file, fileName, dbName) {
  if (!file) return;
  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    importJsonArray = parseJSONSafely(evt.target.result);
    if (!importJsonArray) importJsonArray = [];
    var dbReq = window.indexedDB.open(dbName, session.database.dbVersion);
    dbReq.onupgradeneeded = function (event) {
      // Save the IDBDatabase interface
      var db = event.target.result;
      var dbObjStore;
      if (!db.objectStoreNames.contains(session.database.dbObjStoreName)) {
        dbObjStore = db.createObjectStore(session.database.dbObjStoreName, {
          keyPath: session.database.dbPrimaryKey
        });
      } else {
        dbObjStore = dbReq.transaction.objectStore(session.database.dbObjStoreName);
      }
    };
    dbReq.onsuccess = function (event) {
      var db = event.target.result;
      for (i = 0; i < importJsonArray.length; i++) {
        jsonData = importJsonArray[i];
        var tx = db.transaction([session.database.dbObjStoreName], 'readwrite');
        var store = tx.objectStore(session.database.dbObjStoreName);
        store.add(jsonData);
      }
      // free up memory ASAP
      importJsonArray = [];
      registerDbName(dbName);
      listAllDbs();
    }
  }
}

function cancelImport() {
  selectSession();
}

function importFile() {
  elm = document.getElementById("fileSelector");
  var fileName = elm.value;
  if (!fileName) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }
  var file = elm.files[0];
  if (!file) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }
  elm = document.getElementById("importSessionName");
  sessionName = elm.value;
  var name = "";
  today = new Date();
  creationTimeStamp = today;
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var hrs = String(today.getHours()).padStart(2, '0');
  var min = String(today.getMinutes()).padStart(2, '0');
  var sec = String(today.getSeconds()).padStart(2, '0');
  dmy = dd + "-" + mm + "-" + yyyy;
  nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;
  do {
    dbName = respimaticUid + '|' + sessionName + "|" + nameTagTime;
    if (checkDbExists(dbName)) {
      modalAlert("Recording name already exists\n" + sessionName, "Try again");
    } else break;
  } while (true);
  doImport(file, fileName, dbName);
  document.getElementById("importDiv").style.display = "none";
}
