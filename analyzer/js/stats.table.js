/////////////////////////////////////////////////////////////////
// Construct the tables required for reporting statistics
/////////////////////////////////////////////////////////////////
function minMaxTableRow(table,field,units,minDiv,maxDiv) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + minDiv + '></div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + maxDiv + '></div>';
}

function constructStatMinMaxTable() {
  var table = document.getElementById("statsMinMaxTable");

  minMaxTableRow(table,"Peak Pressure","cmH20","peakMin","peakMax");
  minMaxTableRow(table,"Plateau Pressure","cmH20","platMin","platMax");
  minMaxTableRow(table,"PEEP Pressure","cmH20","peepMin","peepMax");
  minMaxTableRow(table,"","","","");

  minMaxTableRow(table,"Tidal Volume Delivered","ml","vtMin","vtMax");
  minMaxTableRow(table,"Minute Volume Delivered","litres / min","mvMin","mvMax");
  minMaxTableRow(table,"","","","");

  minMaxTableRow(table,"Instantaneous Static Compliance","ml / cmH20","scMin","scMax");
  minMaxTableRow(table,"Instantaneous Dynamic Compliance","ml / cmH20","dcMin","dcMax");
  minMaxTableRow(table,"","","","");

  minMaxTableRow(table,"System Temperature","deg C","tempMin","tempMax");
}
