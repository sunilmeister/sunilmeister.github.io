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
//  			patientFName: ,
//  			patientLName: ,
//  			activeState: ,
//  			attention: ,
//  			breaths: ,
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

  for (let key in jsonData) {
    if (key == 'content') {
      for (let ckey in jsonData.content) {
        let value = jsonData.content[ckey];
        if (ckey == "BNUM") {
        } else if (ckey == "FWVER") {
        } else if (ckey == "STATE") {
        } else if (ckey == "FNAME") {
        } else if (ckey == "LNAME") {
        } else if (ckey == "ATT") {
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

