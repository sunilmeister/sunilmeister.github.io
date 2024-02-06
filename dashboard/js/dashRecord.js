// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordingActiveImg").src = "../common/img/WhiteDot.png";
    document.getElementById("RecordIndicator").src = "../common/img/WhiteDot.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordingActiveImg").src = "../common/img/YellowDot.png";
    document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("RecordingActiveImg").src = "../common/img/RedDot.png";
    document.getElementById("RecordIndicator").src = "../common/img/RedDot.png";
  }
}

function exportRecording() {
  if (session.recorder.off) {
    modalAlert("EXPORT Failed", "No Active Recording");
    return;
  }
  document.getElementById("exportDiv").style.display = "block";
  document.getElementById("exportFileName").value = "Exported Recording";
}

function exportFile() {
  let fileName = document.getElementById("exportFileName").value;
  if (fileName) {
    exportDb(session.database.dbName, fileName);
    document.getElementById("exportDiv").style.display = "none";
  }
}

function cancelExport() {
  document.getElementById("exportDiv").style.display = "none";
}

