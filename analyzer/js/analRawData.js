// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
function displayJsonRawData(jsonData) {
  var scrollbox = document.getElementById('scrollRawDataDiv');
  var newElement = document.createElement('p');
  newElement.innerText = newElement.textContent = JSON.stringify(jsonData);
  scrollbox.appendChild(newElement);
}

function displayJsonRecord(key) {
  var req = indexedDB.open(dbName, session.database.dbVersion);
  req.onsuccess = function (event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    session.database.db = db;
    session.database.dbReady = true;
    var tx = db.transaction(session.database.dbObjStoreName, 'readonly');
    var store = tx.objectStore(session.database.dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function (event) {
      jsonData = keyReq.result;
      displayJsonRawData(jsonData);
    }
  }
}
var dataDisplayed = false;

function initRawDump() {
  //console.log("initRawData");
  var scrollbox = document.getElementById('scrollRawDataDiv');
  scrollbox.innerHTML = "";
  dataDisplayed = false;
}

function displayRawData() {
  //console.log("displayRawData");
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
