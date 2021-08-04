// check for browser capability
document.title = respimaticUid + " (ANALYZER)" ;
if (!window.indexedDB) {
    alert("IndexedDB not available in your browser.\nSwitch browsers");
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
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
  cell = row.insertCell();
  cell.innerHTML = '<button class="tableButton" onclick="selectDbRow(this)">SELECT</button>' ;

}

function deleteDbRow(row) {
  var p=row.parentNode.parentNode;

  // reconstruct the dbName
  // grab the creation field from the first cell in the same row
  var dName = respimaticUid + '#' + p.cells[0].innerHTML;

  if (!confirm("Delete Database named\n" + p.cells[0].innerHTML)) {
    return;
  }

  // Delete the actual database
  deleteDb(dName);

  // remove from HTML table
  p.parentNode.removeChild(p);
}

// ///////////////////////////////////////////////////////
// MAIN function executed on window load
// ///////////////////////////////////////////////////////

window.onload = function() {
  var heading = document.getElementById("SysUid");
  heading.innerHTML = "ANALYSIS for " + respimaticUid;
  listAllDbs();
}

function listAllDbs() {
  //clear any existing table being shown
  var table = document.getElementById("dbTable");
  table.innerHTML = "";

  var retrieved_dbs = getAllDbs();
  if (retrieved_dbs) {
    retrieved_dbs.forEach(listDbTableRow);
  }
}

