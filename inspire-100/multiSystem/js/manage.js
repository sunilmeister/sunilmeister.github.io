// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

async function updateUidContent(uid) {
	let jsonContent = {};
	jsonContent = await inspireGetone(uid);
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

function parseUptimeChirp(content, jsonData) {
	let matchStr = "(H:M:S)";
	let pos = jsonData.search(matchStr);
	if (pos >= 0) {
		let arr = jsonData.split(' ');
		let tstr = "";
		for (let i=0; i<arr.length; i++) {
			tstr = arr[i];
			if ((tstr != matchStr) && (tstr != "")) break;
		}

		if (!tstr) return;
		arr = tstr.split(':');
		let mins = Number(arr[0])*60 + Number(arr[1]);
		content.duration = mins;
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
			if (!isUndefined(jsonData.content["EL1"]) || !isUndefined(jsonData.content["EL2"])
				|| !isUndefined(jsonData.content["EL3"]) || !isUndefined(jsonData.content["EL4"]) ) {
					content.emsg = true;
			} else if (!isUndefined(jsonData.content["L1"]) || !isUndefined(jsonData.content["L2"])
				|| !isUndefined(jsonData.content["L3"]) || !isUndefined(jsonData.content["L4"]) ) {
					content.emsg = false;
			}

      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];
        if (ckey == "BNUM") {
  				let obj = parseBnumData(value);
  				if (obj) {
						content.breaths = obj.bnum;
  				}
        } else if (ckey == "FWVER") {
					content.firmware = value;
        } else if (ckey == "L3") {
					parseUptimeChirp(content, value);
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
	content.breaths = null;
	content.duration = null;
	content.attention = false;
	content.emsg = false;
	content.firmware = "";

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
			soundInfoBeep();
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
			soundInfoBeep();
		}
	}
}

var activeViewIsState = true;
function toggleActiveView() {
  for (const uid in allSystems) {
		let tile = allSystems[uid].tile;
		let content = allSystems[uid].content;
		let tag = findSystemTag(uid);
		let uidElem = findChildNodeByClass(tile,'tileUid');
	

		let stateDiv = findChildNodeByClass(tile,'StateContent');
		let paramDivNonPSV = findChildNodeByClass(tile,'ParamContentNonPSV');
		let paramDivPSV = findChildNodeByClass(tile,'ParamContentPSV');

		if (!allSystems[uid].active) {
			stateDiv.style.display = "block";
			paramDivPSV.style.display = "none";
			paramDivNonPSV.style.display = "none";
			continue;
		}

		if (activeViewIsState) {
			stateDiv.style.display = "none";
			if (content.mode == "PSV") {
				paramDivPSV.style.display = "block";
			} else {
				paramDivNonPSV.style.display = "block";
			}
			updateTileParams(uid);
			uidElem.innerHTML = uid;
		} else {
			stateDiv.style.display = "block";
			paramDivPSV.style.display = "none";
			paramDivNonPSV.style.display = "none";
			uidElem.innerHTML = tag;
		}
	}
	activeViewIsState = !activeViewIsState;
}

setInterval(() => {
	AddRemoveTiles();
	updatePage();
}, 2000)

setInterval(() => {
	toggleActiveView();
}, 6000)

function tileDashboardClick(btn) {
	let tile = btn.parentNode.parentNode.parentNode;
	let uidDiv = findChildNodeByClass(tile,'tileUid');
	let uid = uidDiv.innerText;
	let tag = findSystemTag(uid);

	// now check if system dashboard is already open in the browser
	if (isDashboardActive(uid)) {
    modalAlert("System Dashboard already open", uid + '[' + tag + ']');
		return;
	} else {
		let args = "?" + "uid=\"" + uid + "\"&tag=\"" + tag + "\"";
  	window.open("../dashboard/dashboard.html" + args);
	}
}

function tileRecordClick(btn) {
	let tile = btn.parentNode.parentNode.parentNode;
	let uidDiv = findChildNodeByClass(tile,'tileUid');
	let uid = uidDiv.innerText;
	let tag = findSystemTag(uid);

	let args = "?" + "uid=\"" + uid + "\"&tag=\"" + tag + "\"";
 	window.open("../recorder/recorder.html" + args);
}

function checkAllSystemsForAlerts() {
  for (const uid in allSystems) {
		let tile = allSystems[uid].tile;
		let content = allSystems[uid].content;
		if (content.state == "ERROR") return "ERROR";
		if (content.emsg) return "ERROR";
		if (content.attention) return "WARNING";
	}
	return "NONE";
}

