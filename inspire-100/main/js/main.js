// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include inspire.uid.js prior to this file
// ////////////////////////////////////////////////////

function installFirmwareApp() {
	//downloadAppZipFile();
  let os = getOS();
  console.log("Operating System", os);
  if (os.os != "Windows") {
    modalAlert("Firmware Installer ERROR", "Must use a WINDOWS Platform");
    return;
  } else if (os.version < 10) {
    modalAlert("Firmware Installer ERROR", "WINDOWS Version must be 10 or higher");
    return;
  }

  let appVersion = findMostRecentFwAppRelease();
  console.log("App Version", appVersion);
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

function getOS() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  let os = "Unknown";
  let version = "Unknown";
  //console.log("OS", userAgent);

  if (userAgent.indexOf("Windows") !== -1) {
    os = "Windows";

    // Note Windows-11 useragent string is frozen at Windows NT 10.0
    if (userAgent.indexOf("Windows NT 10.0") !== -1) version = 10;
  }

  /*
  if (userAgent.indexOf("Windows NT 10.0") !== -1) os = "Windows 10";
  else if (userAgent.indexOf("Windows NT 6.3") !== -1) os = "Windows 8.1";
  else if (userAgent.indexOf("Windows NT 6.2") !== -1) os = "Windows 8";
  else if (userAgent.indexOf("Windows NT 6.1") !== -1) os = "Windows 7";
  else if (userAgent.indexOf("Windows NT 6.0") !== -1) os = "Windows Vista";
  else if (userAgent.indexOf("Windows NT 5.1") !== -1) os = "Windows XP";
  else if (userAgent.indexOf("Windows NT 5.0") !== -1) os = "Windows 2000";
  else if (userAgent.indexOf("Mac") !== -1) os = "Mac/iOS";
  else if (platform.indexOf("Linux") !== -1 || userAgent.indexOf("X11") !== -1) os = "Linux";
  else if (userAgent.indexOf("Android") !== -1) os = "Android";
  */

  return {"os":os, "version": version};
}
