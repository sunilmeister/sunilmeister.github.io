// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// List all releases that you want to provide access to
// The list must be ordered according to creation dates
// The list is populated from ../firmware/appReleases/appReleases.json
// ////////////////////////////////////////////////////

const APP_FOLDER_NAME = "../firmware/appReleases/";
var fwAppReleases = null;

function setFwAppReleases(json) {
	fwAppReleases = json;
}

function findMostRecentFwAppRelease() {
  if (!fwAppReleases) return null;
  let maxDate = new Date(null);
  let maxIx = 0;
  for (let i=0; i<fwAppReleases.length; i++) {
    let release = fwAppReleases[i];
    let relDate = new Date(release.created);
    if (relDate.getTime() > maxDate.getTime()) {
      maxDate = relDate;
      maxIx = i;
    }
  }
  return fwAppReleases[maxIx];
}

window.addEventListener("load", function() {
	fetch(APP_FOLDER_NAME + "appReleases.json")
    .then((response) => response.json())
    .then((json) => setFwAppReleases(json))
  	.catch(error => setFwAppReleases(null));
})

