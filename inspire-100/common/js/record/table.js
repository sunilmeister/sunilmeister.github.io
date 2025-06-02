// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var exportRowDiv = null;

if (!window.indexedDB) {
  modalAlert("IndexedDB not available in your browser", "Switch browsers");
}

// ///////////////////////////////////////////////////////
// Database Functions 
// ///////////////////////////////////////////////////////
function listDbTableRow(item, index, allowSelection) {
  let nameTm = parseDbName(item);
  // only list databases for the currently selected system
  if (nameTm[0] != inspireUid) return false;
  let table = document.getElementById("dbTable");
  let row = table.insertRow();
  row.style.cursor = "pointer";
  let cell;
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

  if (allowSelection) {
    cell = row.insertCell();
    cell.innerHTML = selectButtonHTML("selectRowBtn", 2, "Select");
    // Highlight selected database
    banner = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
    if (sessionBannerHTML == banner) {
      row.style.backgroundColor = palette.blue;
    }
  }
  cell = row.insertCell();
  cell.innerHTML = exportButtonHTML("exportRowBtn", 2, "Export");
  cell = row.insertCell();
  cell.innerHTML = trashButtonHTML("deleteRowBtn", 2, "Delete");

  return true;
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
  let dbName = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  session.database.dbName = dbName;
  let sessionInfo = document.getElementById("sliderCaption");

  sessionInfo.style.backgroundColor = palette.darkblue;
  sessionInfo.innerHTML = row.cells[0].innerHTML + ' [' + row.cells[1].innerHTML + ']';
  sessionBannerHTML = sessionInfo.innerHTML;

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

  let dbName = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  if (dbName == session.database.dbName) {
    modalAlert("Cannot Delete", "Recording currently in use\n" + sessionBannerHTML);
    return;
  }

  let msg = row.cells[0].innerHTML + " " + row.cells[1].innerHTML;
  modalConfirm("Delete Recording", msg, doDeleteDbRow, null, {
      row: row
    },
    "DELETE", "DO NOT DELETE");
}

function doDeleteDbRow(arg) {
  let row = arg.row;
  // reconstruct the dbName
  // grab the tag field from the first cell in the same row
  let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
  // Delete the actual database
  deleteDb(name);
  // remove from HTML table
  row.parentNode.removeChild(row);
  selectSession();
}

function selectRowBtn(btn) {
  selectDbRow(btn.parentNode.parentNode);
}

function exportRowBtn(btn) {
  exportRowDiv = btn.parentNode.parentNode;
  let exportDiv = document.getElementById("exportRecordingDiv");
	exportDiv.style.display = "block";
  document.getElementById("exportRecordingFileName").value =
    exportRowDiv.cells[0].innerHTML + ' ' + exportRowDiv.cells[1].innerHTML;;
}

function deleteRowBtn(btn) {
  deleteDbRow(btn.parentNode.parentNode);
}

function showAllDbs(allowSelection) {
  initSelectRowTable("dbTable", selectDbRow);
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
    if (listDbTableRow(retrieved_dbs[i], i, allowSelection)) count++;
  }
  return count;
}

function deleteAllDbs(allowSelection) {
  if (allowSelection && sessionBannerHTML) {
    modalAlert("Cannot Delete ALL", "Recording currently in use\n" + sessionBannerHTML);
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
    let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
  table = document.getElementById("dbExportTable");
  if (!table) return;
  numRows = table.rows.length;
  for (let i = 1; i < numRows; i++) {
    let row = table.rows[1];
    let name = inspireUid + '|' + row.cells[0].innerHTML + '|' + row.cells[1].innerHTML;
    deleteDb(name);
    table.deleteRow(1);
  }
}

