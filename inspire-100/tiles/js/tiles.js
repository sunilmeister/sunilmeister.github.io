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

const REF_TILE_SIZE = 315;
function scaleSize(tileSize, s) {
	return tileSize * s / REF_TILE_SIZE;
}

function updateTileSizes(uid) {
	updateTileSizesParams(uid);
	updateTileSizesState(uid);
}

var currentTileSize = 0;
function updateAudioControlSizes() {
	if (!currentTileSize) return;
	let tileSize = currentTileSize;

	changeWidth('AudioControl', scaleSize(305, tileSize));
	changeMargin('AudioControl', scaleSize(5, tileSize));
	changeFontSize('AudioControl', scaleSize(tileSize, 26));
	changeImageSize('AudioControlImg', scaleSize(tileSize, 28));
}

function updateTileSizesParams(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	let tileSize = tile.clientHeight;
	currentTileSize = tileSize;

	changeMarginTop('ParamContentNonPSV', scaleSize(tileSize, -10));
	changeMarginTop('ParamContentPSV', scaleSize(tileSize, 50));
	changeMargin('ParamFloatLeft', scaleSize(tileSize, 5));
	changeMargin('ParamFloatRight', scaleSize(tileSize, 5));

	changeFontSize('ParamName', scaleSize(tileSize, 15));
	changeMargin('ParamName', scaleSize(tileSize, 5));

	changeFontSize('ParamValue', scaleSize(tileSize, 20));
	changeMargin('ParamValue', scaleSize(tileSize, 5));
}


function updateTileSizesState(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	let tileSize = tile.clientHeight;

	let uidFontSize = scaleSize(tileSize, 16);
	let uidPadding = scaleSize(tileSize, 10);
	changeFontSize('tileUid', uidFontSize);
	changePadding('tileUid', uidPadding);

	let captionFontSize = scaleSize(tileSize, 24);
	changeFontSize('statusCaption', captionFontSize);
	changeFontSize('breathCaption', captionFontSize);

	let tileNameFontSize = scaleSize(tileSize, 30);
	let tileNameMtop = scaleSize(tileSize, -4);
	changeFontSize('tileName', tileNameFontSize);
	changeMarginTop('tileName', tileNameMtop);

	let breathNumFontSize = scaleSize(tileSize, 32);
	let breathNumMtop = scaleSize(tileSize, -12);
	let breathNumMbot = scaleSize(tileSize,8);
	changeFontSize('breathNum', breathNumFontSize);
	changeMarginTop('breathNum', breathNumMtop);
	changeMarginBottom('breathNum', breathNumMbot);

	let activeFontSize = scaleSize(tileSize, 28);
	let activeMtop = scaleSize(tileSize, -12);
	let activeMbot = scaleSize(tileSize, -6);
	changeFontSize('active', activeFontSize);
	changeMarginTop('active', activeMtop);
	changeMarginBottom('active', activeMbot);

	let imageSize = scaleSize(tileSize, 60);
	let imageDivMtop = scaleSize(tileSize, -40);
	let imageDivMbot = scaleSize(tileSize, 10);
	let imageDivMleft = scaleSize(tileSize, 54);
	let imageDivMright = scaleSize(tileSize, 54);
	changeImageSize('StateImg', imageSize);
	changeMarginTop('State', imageDivMtop);
	changeMarginBottom('State', imageDivMbot);
	changeMarginLeft('State', imageDivMleft);
	changeImageSize('AlertImg', imageSize);
	changeMarginTop('Alert', imageDivMtop);
	changeMarginBottom('Alert', imageDivMbot);
	changeMarginRight('Alert', imageDivMright);
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

function resizeAllTiles() {
  for (const uid in activeTiles) {
		updateTileSizes(uid);
	}
	updateAudioControlSizes();
}

window.onresize = function() {
	resizeAllTiles();
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

