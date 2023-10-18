// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include respimatic.uid.js prior to this file
// ////////////////////////////////////////////////////

function displayStepByStep() {
  window.open("Firmware-Update-Steps.html", "_blank");
}

function installLoader() {
  modalInfo("Install Freematics<br>Arduino Builder", 
  "Execute downloaded file on your Windows laptop.<br>" +
  "<br>This installation needs to be done only once." +
  "<br>It can be used to upload any Firmware release" +
  "<br>to any target Respimatic100 system.<br>" +
  "<br><b>Follow link for Step-by-step Instructions.</b>"
  );
}

function downloadRelease(btn) {
  let rowNode = btn.parentNode.parentNode.parentNode;
  let rel = rowNode.cells[0].innerHTML;
  //console.log(rel);
  modalInfo("Install Release " + rel, 
    "Unzip downloaded zip file '" + rel + ".zip'<br>" + 
    "<br>Use installed Freematics Arduino Builder to" +
    "<br>upload both files found in the unzipped folder" + 
    "<br>to the target Respimatic100 system<br>" +
    "<br>Dashboard.ino.nodemcu.bin" +
    "<br>&" +
    "<br>Respimatic100.ino.mega.hex<br>" +
    "<br><b>Follow link for Step-by-step Instructions.</b>"
    );
}

function populateReleaseTable() {
  let table = document.getElementById("knownReleasesTable");
  let rowCount = table.rows.length;
  for (let i = 1; i < rowCount; i++) {
    table.deleteRow(1);
  }
  for (const obj of knownRespimaticReleases) {
    appendReleaseRow(table, obj.rel, obj.created);
  }
}

function appendReleaseRow(table, rel, created) {
  let row = table.insertRow();
  row.style.cursor = "pointer";
  
  let cell = row.insertCell();
  cell.innerHTML = rel; 
  cell = row.insertCell();
  cell.innerHTML = created;
  cell = row.insertCell();
  cell.innerHTML = downloadButtonHTML(rel, "downloadRelease", 20, "Download");
  return row;
}

function downloadButtonHTML(rel, onClickFunction, size, title) {
  let className = "iconButton";
  let htmlStr = '<a href="releases/' + rel + '.zip" download>' +
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


