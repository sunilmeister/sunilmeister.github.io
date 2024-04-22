// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

async function updateUidContent(uid) {
	let jsonContent = {};
  if (USE_DWEET_FOR_MESSAGES) {
		dweetio.get_latest_dweet_for(uid, function(err, dweet){
			if (!dweet) return;
			let jsonContent = dweet[0];
			if (!jsonContent) return;
  		let timestamp = new Date(jsonContent.created);
			let prevTMS = allSystems[uid].updated.getTime();
			let currTMS = timestamp.getTime();
			if (prevTMS < currTMS) {
				disassembleAndProcessChirp(uid, jsonContent);
  		} else {
				// Check for dormancy
				let now = new Date();
				if ((now.getTime() - prevTMS) > MAX_DORMANT_TIME_IN_MS) {
					if (allSystems[uid].active) {
						moveTileToDormant(uid);
					}
					updateTileContents(uid);
				}
			}
		});
		
	} else {
		let jsonContent = await inspireGetone(uid);
		if (jsonContent.status != 'ok') return;
  	let payload = jsonContent.response.content;
  	if (payload === null) return;
  	if (typeof payload !== 'object') return;
  	if (Object.keys(payload).length == 0) return;

  	let timestamp = new Date(jsonContent.response.updatedAt);
		let prevTMS = allSystems[uid].updated.getTime();
		let currTMS = timestamp.getTime();
		if (prevTMS < currTMS) {
  		// change the response to be in chirp format
  		// so that the rest of the code does not have to change
  		// when switching from dweet to inspireListenFor
  		let chirpObj = chirpFormat(uid, timestamp, jsonContent.response.content);
			disassembleAndProcessChirp(uid, chirpObj);
 		} else {
			// Check for dormancy
			let now = new Date();
			if ((now.getTime() - prevTMS) > MAX_DORMANT_TIME_IN_MS) {
				if (allSystems[uid].active) {
					moveTileToDormant(uid);
				}
				updateTileContents(uid);
			}
  	}
	}
}

function disassembleAndProcessChirp(uid, d) {
  if (isUndefined(d.content)) return;
  let fragmentIndex = 0;
  while (1) {
    let key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    fragment = d.content[key];
		fragment.created = new Date(d.created);
    parseAndUpdateUidContents(uid, cloneObject(fragment));
  }
}

function parseAndUpdateUidContents(uid, jsonData) {
  let curTime = new Date(jsonData.created);
	let content = allSystems[uid].content;
	allSystems[uid].updated = curTime;
	if (!allSystems[uid].active) {
		// initialize
		allSystems[uid].content = cloneObject(initialTileContent());
		moveTileToActive(uid);
	}

  for (let key in jsonData) {
    if (key == 'content') {
      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];
        if (ckey == "BNUM") {
  				let arr = parseJSONSafely(value);
  				if (arr && (arr.length == 2)) {
						content.breaths = arr[0];
  				}
        } else if (ckey == "FWVER") {
					content.firmware = value;
        } else if (ckey == "PARAM") {
        	let obj = parseParamData(value);
					if (!obj) continue;
					content.mode = obj.mode;
					content.vt = obj.vt;
					if (obj.mv) {
						content.mv = obj.mv;
					} else {
						content.mv = "--";
					}
					content.rr = obj.rr;
					content.ie = obj.ie;
					content.ps = obj.ps;
					content.tps = obj.tps;
					content.ipeep = obj.ipeep;
					content.pmax = obj.pmax;
        } else if (ckey == "FIO2") {
        	let obj = parseFiO2Data(value);
					if (!obj) continue;
					content.fiO2 = obj.fiO2;
				} else if (ckey == "STATE") {
  				switch (value) {
    				case 2 : 
							content.state = "STANDBY";
      				break;
    				case 3 : 
							content.state = "ACTIVE";
      				break;
    				case 4 : 
							content.state = "ERROR";
      				break;
    				default : 
							content.state = "INITIAL";
      				break;
  				}
        } else if (ckey == "FNAME") {
					content.patientFName = value;
        } else if (ckey == "LNAME") {
					content.patientLName = value;
        } else if (ckey == "ATT") {
      		if (value==1) {
						content.attention = true;
					} else {
						content.attention = false;
					}
				}
      }
    }
  }

	updateTileContents(uid);
}

const MAX_DORMANT_TIME_IN_MS = 20000;
function updatePage() {
	// update the data in all tiles
  for (const uid in allSystems) {
		updateUidContent(uid);
	}
}

function initialTileContent() {
	let content = {};
	content.patientFName = "";
	content.patientLName = "";
	content.state = "";
	content.breaths = 0;
	content.attention = false;

	content.mode = "--";
	content.vt = "--";
	content.mv = "--";
	content.rr = "--";
	content.ie = "--";
	content.ps = "--";
	content.tps = "--";
	content.ipeep = "--";
	content.pmax = "--";
	content.fiO2 = "--";

	return content;
}

function AddRemoveTiles() {
	initKnownInspireSystems();

	// Add systems if required
	for (let i=0; i<myInspireSystems.length; i++) {
		let obj = myInspireSystems[i];
		let uid = obj.uid;
		let tag = obj.tag;
		if (isUndefined(allSystems[uid])) {
			addTile(uid, tag, initialTileContent());
			updateTileContents(uid);
		}
	}

	// Remove systems if required
  for (const uid in allSystems) {
		let found = false;
		for (let i=0; i<myInspireSystems.length; i++) {
			let obj = myInspireSystems[i];
			if (obj.uid == uid) {
				found = true;
				break;
			}
		}

		if (!found) {
			deleteTile(uid);
		}
	}
}

var activeViewIsState = true;
function toggleActiveView() {
  for (const uid in allSystems) {
		if (!allSystems[uid].active) continue;
		let tile = allSystems[uid].tile;
		let content = allSystems[uid].content;

		let stateDiv = findChildNodeByClass(tile,'StateContent');
		let paramDivNonPSV = findChildNodeByClass(tile,'ParamContentNonPSV');
		let paramDivPSV = findChildNodeByClass(tile,'ParamContentPSV');

		if (activeViewIsState) {
			activeViewIsState = false;
			stateDiv.style.display = "none";
			if (content.mode == "PSV") {
				paramDivPSV.style.display = "block";
			} else {
				paramDivNonPSV.style.display = "block";
			}
		} else {
			activeViewIsState = true;
			stateDiv.style.display = "block";
			paramDivPSV.style.display = "none";
			paramDivNonPSV.style.display = "none";
		}
	}
}

setInterval(() => {
	AddRemoveTiles();
	updatePage();
}, 2000)

setInterval(() => {
	toggleActiveView();
}, 6000)

function tileClick(tile) {
	let uidDiv = findChildNodeByClass(tile,'tileUid');
	let uid = uidDiv.innerText;
	let tag = findSystemTag(uid);
	//console.log(uid, tag);

	/*
	// first check if system is active and transmitting
	if (!allSystems[uid].active) {
    modalAlert("System either inactive or not transmitting", uid + '[' + tag + ']');
		return;
	}
	*/

	// now check if system dashboard is already open in the browser
	if (isDashboardActive(uid)) {
    modalAlert("System Dashboard already open", uid + '[' + tag + ']');
		return;
	} else {
  	setCookie(uidCookieName, uid);
  	setCookie(tagCookieName, tag);
  	sessionStorage.setItem("inspireUid", uid);
  	sessionStorage.setItem("inspireTag", tag);
  	window.open("../dashboard/dashboard.html");
	}
}

window.onload = function () {
	AddRemoveTiles();
	disableAllBeeps();
	openAudioControl();
}
