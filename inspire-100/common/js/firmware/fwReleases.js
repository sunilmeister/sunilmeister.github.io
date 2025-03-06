// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// List all releases that you want to provide access to
// The list must be ordered according to creation dates
// The list is populated from ../firmware/fwReleases/fwReleases.json
// ////////////////////////////////////////////////////

var fwReleases = null;

function setFwReleases(json) {
	fwReleases = json;
}

// returns an array of relevant firmware releases for a board version
function findFwReleases(boardVersion) {
  if (!fwReleases) return null;
  for (let i=0; i<fwReleases.length; i++) {
    let boardFw = fwReleases[i];
    if (boardFw.boardVersion != boardVersion) continue;
    return boardFw.firmwareVersions;
  }
  return null;
}

function findMostRecentFwRelease(releases) {
  if (!releases) return null;
  let maxDate = new Date(null);
  let maxIx = 0;
  for (let i=0; i<releases.length; i++) {
    let release = releases[i];
    let relDate = new Date(release.created);
    if (relDate.getTime() > maxDate.getTime()) {
      maxDate = relDate;
      maxIx = i;
    }
  }
  return releases[maxIx];
}

function findMostRecentBoardFwRelease(boardVersion) {
  let rel = findFwReleases(boardVersion);
  if (!rel) return null;
  return findMostRecentFwRelease(rel);
}

window.addEventListener("load", function() {
	fetch("../firmware/fwReleases/fwReleases.json")
    .then((response) => response.json())
    .then((json) => setFwReleases(json))
  	.catch(error => setFwReleases(null));
})

