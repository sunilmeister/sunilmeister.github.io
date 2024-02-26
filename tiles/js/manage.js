// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// ////////////////////////////////////////////////////
//	activeTiles object is like below
//  {uid : 
//  	{
//  		tile: DOMelement, 
//  		tileColor: , 
//  		systemTag: ,
//  		updated: Date, 
//  		content: {
	//  		state: ,
//  			patientFName: ,
//  			patientLName: ,
//  			activeState: ,
//  			attention: ,
//  			breaths: ,
//  			firmware: ,
//  		}
//  	}
//  },
//  ...
// ////////////////////////////////////////////////////
var activeTiles = {};

async function getUidRecentMessage(uid) {
	return {};
}

async function updateUidContents(uid) {
	let msg = await getUidRecentMessage(uid);
  parseAndUpdateUidContents(uid, msg);
}

function parseAndUpdateUidContents(uid, jsonData) {
  let curTime = new Date(jsonData.created);
	let content = activeTiles[uid].content;
	activeTiles[uid].updated = curTime;
	activeTiles[uid].activeState = true;

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
	resizeAllTiles();
}

function updatePage() {
	// update the data in all tiles
  for (const uid in activeTiles) {
		updateUidContents(uid);
	}
}

function AddRemoveTiles() {
	initKnownInspireSystems();

	// Add systems if required
	for (let i=0; i<myInspireSystems.length; i++) {
		let obj = myInspireSystems[i];
		let uid = obj.uid;
		let tag = obj.tag;
		if (isUndefined(activeTiles[uid])) {
			let content = {};
			content.patientFName = "";
			content.patientLName = "";
			content.state = "";
			content.breaths = 0;
			content.activeState = false;
			content.attention = false;
			addTile(uid, tag, content);
			updateTileContents(uid);
		}
	}

	// Remove systems if required
  for (const uid in activeTiles) {
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
			console.log('Removing tile');
		}
	}

	// then resize
	resizeAllTiles();
}

setInterval(() => {
	AddRemoveTiles();
	updatePage();
}, 2000)

