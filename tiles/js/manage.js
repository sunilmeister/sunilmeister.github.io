// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var activeTiles = {};

function isTileObj(name) {
  const ix = name.indexOf(ACTIVE_UID_PREFIX);
	return (ix == 0);
}

function updateActiveTileUidObj(uid, newObj) {
	let uidObj = activeTiles[uid];
	uidObj.tileTitle = newObj.tileTitle;
	uidObj.state = newObj.state;
	uidObj.breaths = newObj.breaths;
	uidObj.attention = newObj.attention;
}

function getAllActiveUidObjs() {
	let uidObjs = [];
	let allKeys = Object.keys(localStorage);
	for (let i=0; i< allKeys.length; i++) {
		let key = allKeys[i];
		if (isTileObj(key)) {
			let uidObj = JSON.parse(localStorage.getItem(key));
			// check if it is inactive and remove
			let updatedAt = new Date(uidObj.updatedAt);
			let now = new Date();
			if ((now.getTime() - updatedAt.getTime()) > 10*TILE_UPDATE_INTERVAL_IN_MS) {
				//console.log("Removing", key);
				localStorage.removeItem(key);
			} else {
			  uidObjs.push(cloneObject(uidObj));
			}
		}
	}
	return uidObjs;
}

function updatePage() {
	let uidObjs = getAllActiveUidObjs();
	//console.log("# uidObjs in session storage", uidObjs.length);

	// first remove tiles that were active and now are not
	// and update those that survive
	let uidsToDelete = [];
  for (const uid in activeTiles) {
		let uidObj = activeTiles[uid];
		let found = false;
		for (let i=0; i<uidObjs.length; i++) {
			if (uidObjs[i].uid == uid) {
				found = true;
				updateActiveTileUidObj(uid, uidObjs[i]);
				break;
			}
		}
		if (!found) {
			uidsToDelete.push(uid);
		}
	}
	for (let i=0; i<uidsToDelete.length; i++) {
		let uid = uidsToDelete[i];
		let uidObj = activeTiles[uid];
		deleteTile(uidObj);
		//console.log("Deleting", uid);
		delete activeTiles[uid];
		//console.log("After Deleting", activeTiles);
	}

	// then add new tiles
	for (let i=0; i<uidObjs.length; i++) {
		let uid = uidObjs[i].uid;
		let uidObj = activeTiles[uid];
		if (isUndefined(uidObj)) {
			//console.log("Adding", uid);
			activeTiles[uid] = cloneObject(uidObjs[i]);
			addTile(activeTiles[uid]);
		}
	}

	// then update all tiles
  for (const uid in activeTiles) {
		let uidObj = activeTiles[uid];
		updateTileContents(uidObj);
	}

	// then resize
	resizeAllTiles();
}

setInterval(() => {
	updatePage();
}, 2000)

