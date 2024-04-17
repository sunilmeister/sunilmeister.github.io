// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordingActiveImg").src = "../common/img/BlankLED.png";
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordingActiveImg").src = "../common/img/YellowDot.png";
    document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
  } else {
    document.getElementById("RecordingActiveImg").src = "../common/img/RedDot.png";
    document.getElementById("RecordIndicator").src = "../common/img/RedDot.png";
  }
}

var blankRecordingImg = false;
function blinkRecordingIndicator() {
  if (session.recorder.off) return;
	if (blankRecordingImg) {
  	if (session.recorder.paused) {
    	document.getElementById("RecordingActiveImg").src = "../common/img/YellowDot.png";
    	document.getElementById("RecordIndicator").src = "../common/img/YellowDot.png";
		} else {
    	document.getElementById("RecordingActiveImg").src = "../common/img/RedDot.png";
    	document.getElementById("RecordIndicator").src = "../common/img/RedDot.png";
		}
		blankRecordingImg = false;
	} else {
		blankRecordingImg = true;
    document.getElementById("RecordingActiveImg").src = "../common/img/BlankLED.png";
    document.getElementById("RecordIndicator").src = "../common/img/BlankLED.png";
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

