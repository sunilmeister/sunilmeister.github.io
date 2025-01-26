// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// Must include inspire.uid.js prior to this file
// ////////////////////////////////////////////////////

function launchMiniDashboard() {
  if (!setSelectedInspireTagFromDD()) {
    return;
  }
  window.open("../miniDashboard/miniDashboard.html");
}

