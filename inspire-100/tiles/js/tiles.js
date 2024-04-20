// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function formTileTitle(uid) {
	if (isUndefined(activeTiles[uid])) return "";

	let fName = activeTiles[uid].content.patientFName;
	let lName = activeTiles[uid].content.patientLName;

	if ((fName == "") && (lName == "")) return activeTiles[uid].systemTag;

	let title = "";
	if (fName != "") title = fName;
	if (lName != "") {
		if (title != "") title += " ";
		title += lName;
	}
	return title;
}

function updateTileContents(uid) {
	updateTileParams(uid);
	updateTileState(uid);
	updateTileImages(uid);
	updateAudioAlerts();
}

function updateTileParams(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	changeParamValue("MODEvalue",content.mode);
	changeParamValue("VTvalue",content.vt);
	changeParamValue("RRvalue",content.rr);
	changeParamValue("IEvalue",content.ie);
	changeParamValue("FiO2value",content.fiO2);
	changeParamValue("PSvalue",content.ps);
	changeParamValue("MVvalue",content.mv);
}

function updateTileState(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	let title = formTileTitle(uid);
	let breaths = content.breaths;

	let elem = null;
	elem = findChildNodeByClass(tile,'tileName');
	elem.innerHTML = title;
	if (activeTiles[uid].active) {
		elem.style.color = getActiveTileColorFG();
	} else {
		elem.style.color = getInactiveTileColorFG();
	}

	elem = findChildNodeByClass(tile,'breathNum');
	elem.innerHTML = breaths;
	if (activeTiles[uid].active) {
		elem.style.color = getActiveTileColorFG();
	} else {
		elem.style.color = getInactiveTileColorFG();
	}

	elem = findChildNodeByClass(tile,'active');
	if (activeTiles[uid].active) {
		elem.innerHTML = "ACTIVE";
		elem.style.color = getActiveTileColorFG();
	} else {
		elem.innerHTML = "INACTIVE";
		elem.style.color = getInactiveTileColorFG();
	}

	elem = findChildNodeByClass(tile,'tileUid');
	elem.innerHTML = uid;

	elem = findChildNodeByClass(tile,'statusCaption');
	if (activeTiles[uid].active) {
		elem.style.backgroundColor = getActiveCaptionColorBG();
		elem.style.color = getActiveTileColorFG();
	} else {
		elem.style.backgroundColor = getInactiveCaptionColorBG();
		elem.style.color = getInactiveTileColorFG();
	}

	elem = findChildNodeByClass(tile,'breathCaption');
	if (activeTiles[uid].active) {
		elem.style.backgroundColor = getActiveCaptionColorBG();
		elem.style.color = getActiveTileColorFG();
	} else {
		elem.style.backgroundColor = getInactiveCaptionColorBG();
		elem.style.color = getInactiveTileColorFG();
	}
}

function updateTileImages(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

  let stateImg = findChildNodeByClass(tile, 'StateImg');
	if (!activeTiles[uid].active) {
		stateImg.src = '../common/img/Sleep.png'
	} else if (content.state == 'ERROR') {
		stateImg.src = '../common/img/ErrorLED.png'
	} else if (content.state == 'ACTIVE') {
		stateImg.src = '../common/img/ActiveLED.png'
	} else if (content.state == 'STANDBY') {
		stateImg.src = '../common/img/StandbyLED.png'
	} else {
		stateImg.src = '../common/img/InitialLED.png'
	}

  let alertImg = findChildNodeByClass(tile, 'AlertImg');
	if (!activeTiles[uid].active) {
		alertImg.src = '../common/img/Inactive.png'
	} else if (content.state == 'ERROR') {
		alertImg.src = '../common/img/Error.png'
	} else if (content.attention) {
		alertImg.src = '../common/img/Warning.png'
	} else {
		alertImg.src = '../common/img/OK.png'
	}

	if (activeTiles[uid].active) {
		tile.style.backgroundColor = getActiveTileColorBG();
	} else {
		tile.style.backgroundColor = getInactiveTileColorBG();
	}

  let elem = findChildNodeByClass(tile, 'statusCaption');
	if (activeTiles[uid].active) {
		elem.innerHTML = "Transmitting" ;
	} else {
		elem.innerHTML = "NOT Transmitting" ;
	}
}

function addTile(uid, sysTag, content) {
	if (!isUndefined(activeTiles[uid])) return;

	let topDiv = document.getElementById('topDiv');
	let temp = document.getElementById('tileTemplate');
  let template = findChildNodeByClass(temp.content, 'tile');
 	let newTile = template.cloneNode(true);
	let tileColor = getInactiveTileColorBG();
	let fgColor = getInactiveTileColorFG();
	newTile.style.backgroundColor = tileColor;
	newTile.style.color = fgColor;

	activeTiles[uid] = {};
	activeTiles[uid].active = false;
	activeTiles[uid].updated = new Date();
	activeTiles[uid].systemTag = sysTag;
	activeTiles[uid].tile = newTile;
	activeTiles[uid].content = cloneObject(content);

	topDiv.appendChild(newTile);
}

function deleteTile(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;

	let topDiv = document.getElementById('topDiv');
	topDiv.removeChild(tile);

	delete activeTiles[uid];
}

var tileBlinkColor = false;
function blinkTiles() {
	if (!tileBlinkColor) tileBlinkColor = true;
	else tileBlinkColor = null;

  for (const uid in activeTiles) {
		let content = activeTiles[uid].content;

		if (!content.attention && !(content.state == 'ERROR')) continue;
		let tileColor = getActiveTileColorBG();
		let tile = activeTiles[uid].tile;

		if (content.state == 'ERROR') {
			if (tileBlinkColor) {
				tile.style.backgroundColor = "#EE4B2B";
			} else {
				tile.style.backgroundColor = tileColor;
			}
		} else if (content.attention) {
			if (tileBlinkColor) {
				tile.style.backgroundColor = "#F28C28";
			} else {
				tile.style.backgroundColor = tileColor;
			}
		}
	}
}

setInterval(() => {
	blinkTiles();
}, 1000)

function changeParamValue(className, value) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.innerHTML = value;
	}
}

function updateAudioAlerts() {
	if (!errorBeepEnabled && !warningBeepEnabled) return;
	let foundError = false;
	let foundWarning = false;

  for (const uid in activeTiles) {
		if (activeTiles[uid].content.attention) foundWarning = true;
		if (activeTiles[uid].content.state == "ERROR") foundError = true;
	}

	if (foundError) {
		startErrorBeep();
		stopWarningBeep();
	} else if (foundWarning) {
		stopErrorBeep();
		startWarningBeep();
	} else {
		stopErrorBeep();
		stopWarningBeep();
	}
}

$(function(){
  // See if this is a touch device
  if ('ontouchstart' in window)
  {
    // Set the correct body class
    $('body').removeClass('no-touch').addClass('touch');
    
    // Add the touch toggle to show text
    $('div.tileContent').click(function(){
      $(this).closest('.tileContent').toggleClass('touchFocus');
    });
  }
});

