// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

//////////////////////////////////////////////
// Warning Beeps
//////////////////////////////////////////////
var warningBeepEnabled = true;
var warningBeepVolume = 0.5;
var warningBeepTimeout = null;
var warningBeepSample = false;

function toggleWarningSample() { 
  warningBeepSample = !warningBeepSample;
  if (warningBeepSample) {
    errorBeepSample = false;
    startWarningBeep();
  }
}

function startWarningBeep() { 
  var warningBeep = document.getElementById("warningBeep"); 
  if (document.getElementById("audioControlDiv").style.display == "block") {
    if (warningBeepSample) {
      stopAllBeeps();
      warningBeep.play();
      setTimeout(function () {startWarningBeep();}, 2000);
    } else return;
  }

  if (warningBeepEnabled) {
    stopAllBeeps();
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
  let vol = document.getElementById("warningVolume");
  if (warningBeepVolume == 0) warningBeepVolume = 0.5;
  vol.value = warningBeepVolume*100;
}

function disableWarningBeep() { 
  warningBeepEnabled = false;
  let vol = document.getElementById("warningVolume");
  vol.value = 0;
  warningBeepSample = false;
}

function toggleWarningBeep() { 
  var imgMenu = document.getElementById("btnWarningImg"); 
  var imgStatus = document.getElementById("WarningActiveImg"); 
  if (warningBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    imgStatus.src = "../common/img/audioOff.png";
    disableWarningBeep();
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    imgStatus.src = "../common/img/audioOn.png";
    enableWarningBeep();
  }
}

function changeWarningVolume() {
  let vol = document.getElementById("warningVolume");
  warningBeepVolume = vol.value / 100;
  let elm = document.getElementById("warningBeep");
  elm.volume = warningBeepVolume;
  if (warningBeepVolume && !warningBeepEnabled) {
    toggleWarningBeep();
  }
  //console.log("warning volume = " + vol.value);
}

//////////////////////////////////////////////
// Error Beeps
//////////////////////////////////////////////
var errorBeepEnabled = true;
var errorBeepVolume = 0.5;
var errorBeepTimeout = null;
var errorBeepSample = false;

function toggleErrorSample() { 
  errorBeepSample = !errorBeepSample;
  if (errorBeepSample) {
    warningBeepSample = false;
    startErrorBeep();
  }
}

function startErrorBeep() { 
  var errorBeep = document.getElementById("errorBeep"); 
  if (document.getElementById("audioControlDiv").style.display == "block") {
    if (errorBeepSample) {
      stopAllBeeps();
      errorBeep.play();
      setTimeout(function () {startErrorBeep();}, 2000);
    } else return;
  }

  if (errorBeepEnabled) {
    stopAllBeeps();
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
  let vol = document.getElementById("errorVolume");
  if (errorBeepVolume == 0) errorBeepVolume = 0.5;
  vol.value = errorBeepVolume * 100;
}

function disableErrorBeep() { 
  errorBeepEnabled = false;
  let vol = document.getElementById("errorVolume");
  vol.value = 0;
  errorBeepSample = false;
}

function toggleErrorBeep() { 
  var imgMenu = document.getElementById("btnErrorImg"); 
  var imgStatus = document.getElementById("ErrorActiveImg"); 
  if (errorBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    imgStatus.src = "../common/img/audioOff.png";
    disableErrorBeep();
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    imgStatus.src = "../common/img/audioOn.png";
    enableErrorBeep();
  }
}

function changeErrorVolume() {
  let vol = document.getElementById("errorVolume");
  errorBeepVolume = vol.value / 100;
  let elm = document.getElementById("errorBeep");
  elm.volume = errorBeepVolume;
  if (errorBeepValue && !errorBeepEnabled) {
    toggleErrorBeep();
  }
  //console.log("error volume = " + vol.value);
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
  stopAllBeeps();
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

