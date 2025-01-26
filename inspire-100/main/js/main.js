// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include inspire.uid.js prior to this file
// ////////////////////////////////////////////////////

function installFirmwareApp() {
	//downloadAppZipFile();
  modalAlert("Firmware App under construction", "Come back again soon!");
}

function launchDocs() {
  window.open("../docs/docs.html");
}

function launchVideo() {
  window.open("../videoTour/videoTour.html");
}

function multiSystemView() {
  window.open("../multiSystem/multiSystem.html");
}

function launchRecorder() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../recorder/recorder.html");
}

function launchMiniDashboard() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../miniDashboard/miniDashboard.html");
}

function launchFullDashboard() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../dashboard/dashboard.html");
}

function launchPlayback() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../playback/playback.html");
}

function findElevation() {
  window.open("https://www.freemaptools.com/elevation-finder.htm");
}

function launchFiO2() {
  window.open("../fio2Calc/fio2Calc.html");
}

function launchPsv() {
  window.open("../psvCalc/psvCalc.html");
}
