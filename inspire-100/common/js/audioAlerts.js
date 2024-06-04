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
  let warningBeep = document.getElementById("warningBeep"); 
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
  let imgMenu = document.getElementById("btnWarningImg"); 
  let imgStatus = document.getElementById("WarningActiveImg"); 
  if (warningBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOff.png";
    disableWarningBeep();
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOn.png";
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
  let errorBeep = document.getElementById("errorBeep"); 
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
  let imgMenu = document.getElementById("btnErrorImg"); 
  let imgStatus = document.getElementById("ErrorActiveImg"); 
  if (errorBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOff.png";
    disableErrorBeep();
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOn.png";
    enableErrorBeep();
  }
}

function changeErrorVolume() {
  let vol = document.getElementById("errorVolume");
  errorBeepVolume = vol.value / 100;
  let elm = document.getElementById("errorBeep");
  elm.volume = errorBeepVolume;
  if (errorBeepVolume && !errorBeepEnabled) {
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
  warningBeepSample = false;
  errorBeepSample = false;

  let imgMenu = document.getElementById("btnErrorImg"); 
  if (errorBeepEnabled) {
    imgMenu.src = "../common/img/audioOn.png";
	} else {
    imgMenu.src = "../common/img/audioOff.png";
	}

  imgMenu = document.getElementById("btnWarningImg"); 
  if (warningBeepEnabled) {
    imgMenu.src = "../common/img/audioOn.png";
	} else {
    imgMenu.src = "../common/img/audioOff.png";
	}

  document.getElementById("audioControlDiv").style.display = "block"; 
  stopAllBeeps();
}

function dismissAudioControl() {
  warningBeepSample = false;
  errorBeepSample = false;
  document.getElementById("audioControlDiv").style.display = "none"; 
}
