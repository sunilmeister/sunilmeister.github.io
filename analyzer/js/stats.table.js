/////////////////////////////////////////////////////////////////
// Construct the tables required for reporting statistics
/////////////////////////////////////////////////////////////////
function paramTableRow(table,field,units,value) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function minMaxTableRow(table,field,units,minDiv,maxDiv) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + minDiv + '>----</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + maxDiv + '>----</div>';
}

function constructStatMinMaxTable() {
  var table = document.getElementById("statsMinMaxTable");

  minMaxTableRow(table,"Peak Pressure","cmH20","peakMin","peakMax");
  minMaxTableRow(table,"Plateau Pressure","cmH20","platMin","platMax");
  minMaxTableRow(table,"PEEP Pressure","cmH20","peepMin","peepMax");

  minMaxTableRow(table,"Tidal Volume Delivered","ml","vtMin","vtMax");
  minMaxTableRow(table,"Minute Volume Delivered","litres / min","mvMin","mvMax");

  minMaxTableRow(table,"Mandatory BPM","bpm","mbpmMin","mbpmMax");
  minMaxTableRow(table,"Spontaneous BPM","bpm","sbpmMin","sbpmMax");

  minMaxTableRow(table,"Instantaneous Static Compliance","ml / cmH20","scMin","scMax");
  minMaxTableRow(table,"Instantaneous Dynamic Compliance","ml / cmH20","dcMin","dcMax");

  minMaxTableRow(table,"System Temperature","deg C","tempMin","tempMax");
}

function constructStatParamTable() {
  var table = document.getElementById("statsParamTable");

  minMaxTableRow(table,"Ventilation Mode","","mode");
  minMaxTableRow(table,"Breaths Per Minute","bpm","bpm");
  minMaxTableRow(table,"I:E Ratio","","ie");
  minMaxTableRow(table,"PEEP Pressure","cm H20","peep");
  minMaxTableRow(table,"Maximum Pressure","cm H20","pmax");
  minMaxTableRow(table,"Support Pressure","cm H20","ps");
  minMaxTableRow(table,"Support Pressure Termination","secs","stps");
  minMaxTableRow(table,"Support Pressure Termination","%Flow","ftps");

}

function initStats() {
}

function collectStats() {
  constructStatMinMaxTable();
  constructStatParamTable();
}
