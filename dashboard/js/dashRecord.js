// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateRecordingIndicator() {
  if (session.recorder.off) {
    document.getElementById("RecordingActiveImg").src = "img/WhiteDot.png";
  } else if (session.recorder.paused) {
    document.getElementById("RecordingActiveImg").src = "img/YellowDot.png";
  } else {
    document.getElementById("RecordingActiveImg").src = "img/RedDot.png";
  }
}


