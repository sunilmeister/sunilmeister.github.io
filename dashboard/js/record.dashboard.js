var recordingOff = true;
var recordingPaused = false;
var recordingDbName = "";

function InitRecording() {
  var name = "";
  today = new Date();
  creationTimeStamp = today;
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var hrs = String(today.getHours()).padStart(2, '0');
  var min = String(today.getMinutes()).padStart(2, '0');
  var sec = String(today.getSeconds()).padStart(2, '0');
  dmy = dd + "-" + mm + "-" + yyyy;
  nameTagTime = dmy + " " + hrs + ":" + min + ":" + sec;
  do {
    var dbNameSuffix = prompt("Name the new Session", "New Session");
    if (!dbNameSuffix) return "";
    name = dbNamePrefix + '|' + dbNameSuffix + "|" + nameTagTime;
    if (!isValidDatabaseName(dbNameSuffix)) {
      alert("Invalid Session name\n" + dbNameSuffix + "\nTry again");
    } else if (checkDbExists(name)) {
      alert("Session name already exists\n" + dbNameSuffix + "\nTry again");
    } else break;
  } while (true);
  return name;
}

function toggleRecording() {
  var style = getComputedStyle(document.body)
  btn = document.getElementById("recordButton");
  msg = document.getElementById("recordMessage");
  if (recordingOff) {
    recordingDbName = InitRecording();
    msg.innerHTML = "RECORDING ON";
    btn.innerHTML = "Pause Recording" ;
    btn.style.backgroundColor = style.getPropertyValue('--rsp_orange');
    recordingOff = false;
    recordingPaused = false;
  } else if (recordingPaused) {
    msg.innerHTML = "RECORDING ON";
    btn.innerHTML = "Pause Recording" ;
    btn.style.backgroundColor = style.getPropertyValue('--rsp_orange');
    recordingOff = false;
    recordingPaused = false;
  } else if (!recordingPaused) {
    msg.innerHTML = "RECORDING PAUSED";
    btn.innerHTML = "Resume Recording" ;
    btn.style.backgroundColor = style.getPropertyValue('--rsp_green');
    recordingOff = false;
    recordingPaused = true;
  }
}


