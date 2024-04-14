// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const APP_FOLDER_NAME = "../firmware/appReleases/";

function findAndDownloadLatestAppRelease(json) {
	// get latest release number
	if (!json || isUndefined(json[0]) || isUndefined(json[0].release)) {
		modalAlert("Bad JSON", "appReleases.json");
		return;
	}
	let version = json[0].release;
	let folderName = APP_FOLDER_NAME + version + "/";
	let fileName = "INSPIRE-100-fwApp" ;
	let os = detectOS();
	if (os == "Windows") {
		fileName = fileName + "Win";
	} else if (os == "MacOS") {
		fileName = fileName + "Mac";
	} else {
		modalAlert("Operating System not supported", os);
		return;
	}

	fileName += ".zip";

	console.log("OS", os);
	console.log("Latest Version", version);
	console.log("Downloading File", fileName);

	downloadFileFromURL(fileName, folderName + fileName);
	modalInfo(fileName + " Downloaded", "Double-click on file to extract");
}

function downloadAppZipFile() {
	let jsonFileName = APP_FOLDER_NAME + "appReleases.json" ;
	console.log("Reading JSON File", jsonFileName);
	readJsonFile(jsonFileName, findAndDownloadLatestAppRelease);
}
