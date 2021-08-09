function displayJsonRawData(jsonData) {
    var scrollbox = document.getElementById('scrollRawDataDiv');

    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = JSON.stringify(jsonData);

    scrollbox.appendChild(newElement);
}

function displayJsonRecord(key) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    dbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function(event) {
      jsonData = keyReq.result;
      displayJsonRawData(jsonData);
    }
  }
}

var dataDisplayed = false;
function initRawDump() {
  var scrollbox = document.getElementById('scrollRawDataDiv');
  scrollbox.innerHTML = "" ;
  dataDisplayed = false;
}

function displayRawData() {
  if (dataDisplayed) return;
  if (allDbKeys.length==0) {
    alert("Selected Session has no data");
    return;
  }

  for (i=0; i<allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (!keyWithinAnalysisRange(key)) continue;
    displayJsonRecord(key);
  }

  dataDisplayed = true;
}


