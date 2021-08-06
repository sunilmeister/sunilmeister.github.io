function addRawData(jsonData) {
    var scrollbox = document.getElementById('scrollRawDataDiv');

    var newElement = document.createElement('p');
    newElement.innerText = newElement.textContent = JSON.stringify(jsonData,null,". ") ;

    scrollbox.appendChild(newElement);
}

function dumpRawData(dbName) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    db = event.target.result;
    dbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.getAllKeys();

    keyReq.onsuccess = function(event) {
      keys = event.target.result;
      if (keys.length==0) {
        alert("Selected Session has no data");
      }

      for (i=0; i<keys.length; i++) {
	key = keys[i];
        tx = db.transaction(dbObjStoreName, 'readonly');
        store = tx.objectStore(dbObjStoreName);
        keyReq = store.get(key);
        keyReq.onsuccess = function(event) {
	  jsonData = keyReq.result;
          alert(typeof jsonData);
          addRawData(jsonData);
	}
      }
    }
  }
}

