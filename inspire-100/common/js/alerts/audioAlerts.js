// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

//////////////////////////////////////////////
// Info Beeps
//////////////////////////////////////////////
var infoBeepEnabled = true;
var infoBeepVolume = 0.3;

function playInfoSample() { 
  let infoBeep = document.getElementById("infoBeep"); 
  infoBeep.play();
}

function soundInfoBeep() { 
  let infoBeep = document.getElementById("infoBeep"); 
  if (infoBeepEnabled) {
    infoBeep.play();
  }
} 

function enableInfoBeep() { 
  infoBeepEnabled = true;
  let vol = document.getElementById("infoVolume");
  if (infoBeepVolume == 0) infoBeepVolume = 0.3;
  vol.value = infoBeepVolume * 100;
}

function disableInfoBeep() { 
  infoBeepEnabled = false;
  let vol = document.getElementById("infoVolume");
  vol.value = 0;
}

function toggleInfoBeep() { 
  let imgMenu = document.getElementById("btnInfoImg"); 
  let imgStatus = document.getElementById("InfoActiveImg"); 
  if (infoBeepEnabled) {
    imgMenu.src = "../common/img/audioOff.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOff.png";
    disableInfoBeep();
  } else {
    imgMenu.src = "../common/img/audioOn.png";
    if (imgStatus) imgStatus.src = "../common/img/audioOn.png";
    enableInfoBeep();
  }
}

function changeInfoVolume() {
  let vol = document.getElementById("infoVolume");
  infoBeepVolume = vol.value / 100;
  let elm = document.getElementById("infoBeep");
  elm.volume = infoBeepVolume;
  if (infoBeepVolume && !infoBeepEnabled) {
    toggleInfoBeep();
  }
}

//////////////////////////////////////////////
// Warning Beeps
//////////////////////////////////////////////
var warningBeepEnabled = true;
var warningBeepVolume = 0.5;
var warningBeepTimeout = null;

function playWarningSample() { 
  let warningBeep = document.getElementById("warningBeep"); 
  warningBeep.play();
}

function startWarningBeep() { 
  let warningBeep = document.getElementById("warningBeep"); 
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

function playErrorSample() { 
  let errorBeep = document.getElementById("errorBeep"); 
  errorBeep.play();
}

function startErrorBeep() { 
  let errorBeep = document.getElementById("errorBeep"); 
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
  enableInfoBeep();
  enableWarningBeep();
  enableErrorBeep();
}

function disableAllBeeps() { 
  disableInfoBeep();
  disableWarningBeep();
  disableErrorBeep();
}

function openAudioControl() {
  let imgMenu = document.getElementById("btnInfoImg"); 
  if (infoBeepEnabled) {
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

  imgMenu = document.getElementById("btnErrorImg"); 
  if (errorBeepEnabled) {
    imgMenu.src = "../common/img/audioOn.png";
	} else {
    imgMenu.src = "../common/img/audioOff.png";
	}

  document.getElementById("audioControlDiv").style.display = "block"; 
  stopAllBeeps();
}

function dismissAudioControl() {
  document.getElementById("audioControlDiv").style.display = "none"; 
}
