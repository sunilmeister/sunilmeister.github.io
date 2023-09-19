// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

//////////////////////////////////////////////
// Warning Beeps
//////////////////////////////////////////////
var warningBeepEnabled = false;
var warningBeepTimeout = null;

function startWarningBeep() { 
  if (warningBeepEnabled) {
    stopAllBeeps();
    var warningBeep = document.getElementById("warningBeep"); 
    warningBeep.play();
  }
  warningBeepTimeout = setTimeout(function () {startWarningBeep();}, 2000);
} 

function stopWarningBeep() { 
  if (warningBeepTimeout) clearInterval(warningBeepTimeout);
  warningBeepTimeout = null;
}

function enableWarningBeep() { 
  warningBeepEnabled = true;
}

function disableWarningBeep() { 
  warningBeepEnabled = false;
}

function toggleWarningBeep() { 
  var imgMenu = document.getElementById("btnWarningImg"); 
  var imgStatus = document.getElementById("WarningActiveImg"); 
  if (warningBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    imgStatus.src = "../common/img/audioOff.png";
    warningBeepEnabled = false;
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    imgStatus.src = "../common/img/audioOn.png";
    warningBeepEnabled = true;
  }
}

//////////////////////////////////////////////
// Error Beeps
//////////////////////////////////////////////
var errorBeepEnabled = false;
var errorBeepTimeout = null;

function startErrorBeep() { 
  if (errorBeepEnabled) {
    stopAllBeeps();
    var errorBeep = document.getElementById("errorBeep"); 
    errorBeep.play();
  }
  errorBeepTimeout = setTimeout(function () {startErrorBeep();}, 2000);
} 

function stopErrorBeep() { 
  if (errorBeepTimeout) clearInterval(errorBeepTimeout);
  errorBeepTimeout = null;
}

function enableErrorBeep() { 
  errorBeepEnabled = true;
}

function disableErrorBeep() { 
  errorBeepEnabled = false;
}

function toggleErrorBeep() { 
  var imgMenu = document.getElementById("btnErrorImg"); 
  var imgStatus = document.getElementById("ErrorActiveImg"); 
  if (errorBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    imgStatus.src = "../common/img/audioOff.png";
    errorBeepEnabled = false;
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    imgStatus.src = "../common/img/audioOn.png";
    errorBeepEnabled = true;
  }
}

//////////////////////////////////////////////
// All Beeps
//////////////////////////////////////////////
function stopAllBeeps() { 
  stopWarningBeep();
  stopErrorBeep();
} 

function enableAllBeeps() { 
  enableWarningBeep();
  enableErrorBeep();
}

function disableAllBeeps() { 
  disableWarningBeep();
  disableErrorBeep();
}

function openAudioControl() {
  document.getElementById("audioControlDiv").style.display = "block"; 
}

function dismissAudioControl() {
  document.getElementById("audioControlDiv").style.display = "none"; 
}


//////////////////////////////////////////////
// Beep buttons
//////////////////////////////////////////////
function toggleAudio() {
  var btnAudio = document.getElementById("btnAudio"); 
  if (errorBeepEnabled && warningBeepEnabled) {
    disableAllBeeps();
    btnAudio.textContent = "Enable Audio Alarms" ;
  } else {
    enableAllBeeps();
    btnAudio.textContent = "Mute Audio Alarms" ;
  }
}

