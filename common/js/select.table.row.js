function initSelectRowTable(tableId) {
  var table = document.getElementById(tableId);
  table.onclick = highlightSelectedRow;
}
    
function highlightSelectedRow(e) {
  var selected = table.getElementsByClassName('selectedTableRow');
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

