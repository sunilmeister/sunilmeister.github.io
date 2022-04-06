var selectRowTable;

function initSelectRowTable(tableId) {
  selectRowTable = document.getElementById(tableId);
  selectRowTable.onclick = highlightSelectedRow;
}
    
function highlightSelectedRow(e) {
  var selected = selectRowTable.getElementsByClassName('selectedTableRow');
  if (selected[0]) selected[0].className = '';
  e.target.parentNode.className = 'selectedTableRow';
}
    
function getSelectedTableRow(){
  var element = document.querySelectorAll('.selectedTableRow');
  if(element[0]!== undefined){ //it must be selected
    return element[0];
  }
  return null;
}

