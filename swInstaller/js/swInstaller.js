// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include respimatic.uid.js prior to this file
// ////////////////////////////////////////////////////

var knownRespimaticReleases = [
  {rel:"1.0.1", created:"16-May-2023"}
];

function installLoader() {
  modalInfo("Install Release Loader", "Execute the downloaded file on your laptop");
}

function downloadRelease(btn) {
  rowNode = btn.parentNode.parentNode.parentNode;
  rel = rowNode.cells[0].innerHTML;
  //console.log(rel);
  modalInfo("Install Release " + rel, 
    "Unzip the downloaded zip file '" + rel + ".zip'<br>" + 
    "Use installed Loader to install both the files<br>" +
    "found in the unzipped folder");
}

function populateReleaseTable() {
  var table = document.getElementById("knownReleasesTable");
  var rowCount = table.rows.length;
  for (var i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  for (const obj of knownRespimaticReleases) {
    appendReleaseRow(table, obj.rel, obj.created);
  }
}

function appendReleaseRow(table, rel, created) {
  row = table.insertRow();
  cell = row.insertCell();
  cell.innerHTML = rel; 
  cell = row.insertCell();
  cell.innerHTML = created;
  cell = row.insertCell();
  cell.innerHTML = downloadButtonHTML(rel, "downloadRelease", 15, "Download");
  //console.log(cell.innerHTML);
  return row;
}

function downloadButtonHTML(rel, onClickFunction, size, title) {
  className = "iconButton";
  htmlStr = '<a href="../swReleases/' + rel + '.zip" download>' +
    '<button class="' + className + '" title="' + title + '"' +
    ' onClick="' + onClickFunction + '(this)"' +
    ' onmouseover="overIconBtn(this)" onmouseout="outIconBtn(this)">' +
    ' <img  src="../common/img/export.png"' +
    ' width=' + size + 'px height=' + size + 'px></button>'
    htmlStr += "</a>";
  return htmlStr;
}

window.onload = function () {
  setModalWidth(600);
  showZoomReminder();
  populateReleaseTable();
}


