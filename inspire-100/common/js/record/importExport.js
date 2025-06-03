// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var importJsonArray = [];
var exportRowDiv = null;

function initImportExport() {
  importJsonArray = [];
}

function selectedRowDbName(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row");
      return;
    }
  }
  return formRowDbName(row);
}

function exportDbRow(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }
  let fileName = document.getElementById("exportRecordingFileName").value;
  if (fileName) {
    exportDb(selectedRowDbName(row), fileName);
    document.getElementById("exportRecordingDiv").style.display = "none";
  }
}

function selectImportRecording() {
  document.getElementById("importSessionName").value = "Imported Recording";
	let importRecordingDiv = document.getElementById("importRecordingDiv");
	importRecordingDiv.style.display = "block";
}

function exportRecordingFile() {
  exportDbRow(exportRowDiv);
}

function cancelRecordingExport() {
  document.getElementById("exportRecordingDiv").style.display = "none";
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
        dbObjStore = db.createObjectStore(session.database.dbObjStoreName, 
					{ autoIncrement: true }
        );
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
      showAllDbs();
    }
  }
}

function cancelImport() {
  selectSession();
}

function importRecording() {
  let elm = document.getElementById("dbFileSelector");
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

	let dbName = null;
  do {
    dbName = inspireUid + '|' + sessionName + "|" + nameTagTime;
    if (checkDbExists(dbName)) {
      modalAlert("Recording name already exists\n" + sessionName, "Try again");
    } else break;
  } while (true);
  doImport(file, fileName, dbName);
  document.getElementById("importRecordingDiv").style.display = "none";
}
