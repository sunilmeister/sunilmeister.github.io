// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const APP_FOLDER_NAME = "../firmware/appReleases/";

function findAndDownloadLatestAppRelease(json) {
	// get latest release number
	if (!json || isUndefined(json[0]) || isUndefine(json[0].release)) {
		modalAlert("Bad JSON", "appReleases.json");
		return;
	}
	let version = json[0].release;
	let folderName = APP_FOLDER_NAME + version + "/";
	let fileName = ".zip" ;
	let os = detectOS();
	if (os == "Windows") {
		fileName = "AppWin" + fileName;
	} else if (os == "MacOS") {
		fileName = "AppMac" + fileName;
	} else {
		modalAlert("Operating System not supported", os);
		return;
	}

	console.log("OS", os);
	console.log("Latest Version", version);
	console.log("Downloading File", version);

	// CREATE A LINK ELEMENT IN DOM
	let elm = document.createElement('a');  
  elm.href = folderName + fileName;  
	// SET ELEMENT CREATED 'ATTRIBUTE' TO DOWNLOAD, FILENAME PARAM AUTOMATICALLY
  elm.setAttribute('download', fileName); 
  document.body.appendChild(elm);
	elm.click();
 	document.body.removeChild(elm);
}

function downloadAppZipFile() {
	let jsonFileName = APP_FOLDER_NAME + "appReleases.json" ;
	console.log("Reading File", jsonFileName);
	readJsonFile(jsonFileName, findAndDownloadLatestAppRelease);
}
