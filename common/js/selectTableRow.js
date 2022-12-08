// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var selectRowTable;

function initSelectRowTable(tableId, doubleClickFn) {
  selectRowTable = document.getElementById(tableId);
  selectRowTable.onclick = highlightSelectedRow;
  if (doubleClickFn) selectRowTable.ondblclick = doubleClickFn;
}

function highlightSelectedRow(e) {
  var selected = selectRowTable.getElementsByClassName('selectedTableRow');
  if (selected[0]) selected[0].className = '';
  if (e.target.parentNode.getElementsByTagName('th').length == 0) {
    // not the header row
    e.target.parentNode.className = 'selectedTableRow';
  }
}

function getSelectedTableRow() {
  var element = document.querySelectorAll('.selectedTableRow');
  if (element[0] !== undefined) { //it must be selected
    return element[0];
  }
  return null;
}

