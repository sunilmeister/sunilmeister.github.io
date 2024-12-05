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

window.addEventListener("load", function() {
	fetch("../firmware/fwReleases/fwReleases.json")
    .then((response) => response.json())
    .then((json) => setFwReleases(json))
  	.catch(error => setFwReleases(null));
})

