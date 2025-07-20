// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var recordingBannerHTML = null;

if (!window.indexedDB) {
  modalAlert("IndexedDB not available in your browser", "Switch browsers");
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function showDbTableRow(dbName, index) {
  // only list databases for the currently selected system
  let nameTm = parseDbName(dbName);
  if (nameTm[0] != inspireUid) return false;

  let table = document.getElementById("dbTable");
  let row = table.insertRow();
  let cell;

  cell = row.insertCell();
  if (session.record.allowSelection) {
    cell.innerHTML = activeButtonHTML("selectRowBtn", 2, "Open");
  } else {
    cell.innerHTML = iconImageHTML("BlankDot", 2, "Active");
  }

  cell = row.insertCell();
  cell.style.paddingRight = "1.5rem";
  cell.style.paddingTop = "0.5rem";
  cell.style.paddingBottom = "0.5rem";
  cell.innerHTML = nameTm[1];
  cell = row.insertCell();
  cell.style.paddingTop = "0.5rem";
  cell.style.paddingBottom = "0.5rem";
  cell.style.textAlign = "center";
  cell.innerHTML = nameTm[2];

  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn", 2, "Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn", 2, "Delete");

  return true;
}

function formRowDbName(row) {
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  let dbName = inspireUid + '|' + row.cells[1].innerHTML + '|' + row.cells[2].innerHTML;
  return dbName;
}

function highlightDbRow(dbName) {
  let table = document.getElementById("dbTable");
  if (!table) return;
  let rowCount = table.rows.length;
  
  for (let i = 1; i < rowCount; i++) {
    let row = table.rows[i];
    let rowDbName = formRowDbName(row);
    if (dbName == rowDbName) {
      row.style.backgroundColor = palette.blue;
      row.cells[0].firstChild.src = "../common/img/GreenDot.png";
    } else {
      row.style.backgroundColor = "transparent";
      row.cells[0].firstChild.src = "../common/img/BlankDot.png";
    }
  }
}

function selectDbRow(row) {
  if (isUndefined(row) || (row.tagName != "TR")) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  let dbName = formRowDbName(row);
  session.database.dbName = dbName;
  highlightDbRow(dbName);
  let sessionInfo = document.getElementById("sliderCaption");

  sessionInfo.style.backgroundColor = palette.darkblue;
  sessionInfo.innerHTML = row.cells[1].innerHTML + ' [' + row.cells[2].innerHTML + ']';
  recordingBannerHTML = sessionInfo.innerHTML;

  return dbName;
}

function deleteDbRow(row) {
  if (isUndefined(row)) {
    row = getSelectedTableRow();
    if (!row) {
      modalAlert("No selected Recording", "Select by clicking on a table row\nTry again!");
      return;
    }
  }

  let dbName = formRowDbName(row);
  if (dbName == session.database.dbName) {
    modalAlert("Cannot Delete", "Recording currently in use\n" + recordingBannerHTML);
    return;
  }

  let msg = row.cells[1].innerHTML + " " + row.cells[2].innerHTML;
  modalConfirm("Delete Recording", msg, doDeleteDbRow, null, {
      row: row
    },
    "DELETE", "DO NOT DELETE");
}

function doDeleteDbRow(arg) {
  let row = arg.row;
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  let name = formRowDbName(row);
  // Delete the actual database
  deleteDb(name);
  // remove from HTML table
  row.parentNode.removeChild(row);
  showAllDbs();
  highlightDbRow(session.database.dbName);
}

function exportRowBtn(btn) {
  exportRowDiv = btn.parentNode.parentNode;
  let exportDiv = document.getElementById("exportRecordingDiv");
	exportDiv.style.display = "block";
  document.getElementById("exportRecordingFileName").value =
    exportRowDiv.cells[1].innerHTML + ' ' + exportRowDiv.cells[2].innerHTML;;
}

function deleteRowBtn(btn) {
  deleteDbRow(btn.parentNode.parentNode);
}

function showAllDbs() {
  //clear any existing table being shown
  let table = document.getElementById("dbTable");
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  let retrieved_dbs = getAllDbs();
  if (!retrieved_dbs) return 0;
  let count = 0;
  for (let i = retrieved_dbs.length - 1; i >= 0; i--) {
    if (showDbTableRow(retrieved_dbs[i], i)) count++;
  }
  return count;
}

function deleteAllDbs() {
  if (session.record.allowSelection && recordingBannerHTML) {
    modalAlert("Cannot Delete ALL", "Recording currently in use\n" + recordingBannerHTML);
    return;
  }
  modalConfirm("Delete All Saved Recordings", "", doDeleteAllDbs, null, null,
    "DELETE ALL", "DO NOT DELETE");
}

function doDeleteAllDbs() {
  //clear any existing table being shown
  let table = document.getElementById("dbTable");
  if (!table) return;
  let numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    let row = table.rows[1];
    let name = formRowDbName(row);
    deleteDb(name);
    table.deleteRow(1);
  }
  table = document.getElementById("dbExportTable");
  if (table) {
    numRows = table.rows.length;
    for (let i = 1; i < numRows; i++) {
      let row = table.rows[1];
      let name = formRowDbName(row);
      deleteDb(name);
      table.deleteRow(1);
    }
  }
  showAllDbs();
}

