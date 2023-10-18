// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var dataDisplayed = false;

function displayJsonRawData(jsonData) {
  let scrollbox = document.getElementById('scrollRawDataDiv');
  let newElement = document.createElement('p');
  newElement.innerText = newElement.textContent = JSON.stringify(jsonData);
  scrollbox.appendChild(newElement);
}

function displayJsonRecord(key) {
  let req = indexedDB.open(dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    let db = event.target.result;
    session.database.db = db;
    session.database.dbReady = true;
    let tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    let store = tx.objectStore(session.database.dbObjStoreName);
    let keyReq = store.get(key);
    keyReq.onsuccess = function (event) {
      jsonData = keyReq.result;
      displayJsonRawData(jsonData);
    }
  }
}

function initRawDump() {
  let scrollbox = document.getElementById('scrollRawDataDiv');
  scrollbox.innerHTML = "";
  dataDisplayed = false;
}

function displayRawData() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }
  if (dataDisplayed) return;
  if (allDbKeys.length == 0) {
    modalAlert("Selected Recording has no data", "");
    return;
  }
  for (i = 0; i < allDbKeys.length; i++) {
    key = allDbKeys[i];
    displayJsonRecord(key);
  }
  dataDisplayed = true;
}
