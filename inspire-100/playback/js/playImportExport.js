// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var importJsonArray = [];

function initImportExport() {
  importJsonArray = [];
}

function listDbExportTableRow(item, index) {
  nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != inspireUid) return;
  let table = document.getElementById("dbExportTable");
  let row = table.insertRow();
  let cell;
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
  let dbName = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
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
  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    importJsonArray = parseJSONSafely(evt.target.result);
    if (!importJsonArray) importJsonArray = [];
    let dbReq = window.indexedDB.open(dbName, session.database.dbVersion);
    dbReq.onupgradeneeded = function (event) {
      // Save the IDBDatabase interface
      let db = event.target.result;
      let dbObjStore;
      if (!db.objectStoreNames.contains(session.database.dbObjStoreName)) {
        dbObjStore = db.createObjectStore(session.database.dbObjStoreName, {
          keyPath: session.database.dbPrimaryKey
        });
      } else {
        dbObjStore = dbReq.transaction.objectStore(session.database.dbObjStoreName);
      }
    };
    dbReq.onsuccess = function (event) {
      let db = event.target.result;
      for (i = 0; i < importJsonArray.length; i++) {
        jsonData = importJsonArray[i];
        let tx = db.transaction([session.database.dbObjStoreName], 'readwrite');
        let store = tx.objectStore(session.database.dbObjStoreName);
        store.add(jsonData);
      }
      // free up memory ASAP
      importJsonArray = [];
      registerDbName(dbName);
      selectSession();
    }
  }
}

function cancelImport() {
  selectSession();
}

function importFile() {
  let elm = document.getElementById("fileSelector");
  let fileName = elm.value;
  if (!fileName) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }
  let file = elm.files[0];
  if (!file) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }
  elm = document.getElementById("importSessionName");
  let sessionName = elm.value;
  let name = "";
  let today = new Date();
  let creationTimeStamp = today;
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  let hrs = String(today.getHours()).padStart(2, '0');
  let min = String(today.getMinutes()).padStart(2, '0');
  let sec = String(today.getSeconds()).padStart(2, '0');
  let dmy = dd + "-" + mm + "-" + yyyy;
  let nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;
  do {
    let dbName = inspireUid + '|' + sessionName + "|" + nameTagTime;
    if (checkDbExists(dbName)) {
      modalAlert("Recording name already exists\n" + sessionName, "Try again");
    } else break;
  } while (true);
  doImport(file, fileName, dbName);
  document.getElementById("importDiv").style.display = "none";
}
