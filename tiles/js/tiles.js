// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

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
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	let title = formTileTitle(uid);
	let breaths = content.breaths;

	let elem = null;
	elem = findChildNodeByClass(tile,'tileName');
	elem.innerHTML = title;

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

	updateTileImages(uid);
}

function updateTileStyles(uid) {
	if (isUndefined(activeTiles[uid])) return;

	let tile = activeTiles[uid].tile;
	let content = activeTiles[uid].content;

	let tileSize = tile.clientHeight;

	let uidFontSize = tileSize * 16 / 315;
	let uidPadding = tileSize * 10 / 315;
	changeFontSize(tile, 'tileUid', uidFontSize);
	changePadding(tile, 'tileUid', uidPadding);

	let captionFontSize = tileSize * 24 / 315;
	changeFontSize(tile, 'statusCaption', captionFontSize);
	changeFontSize(tile, 'breathCaption', captionFontSize);

	let tileNameFontSize = tileSize * 30 / 315;
	let tileNameMtop = tileSize * (-4) / 315;
	changeFontSize(tile, 'tileName', tileNameFontSize);
	changeMarginTop(tile, 'tileName', tileNameMtop);

	let breathNumFontSize = tileSize * 32 / 315;
	let breathNumMtop = tileSize * (-12) / 315;
	let breathNumMbot = tileSize * (8) / 315;
	changeFontSize(tile, 'breathNum', breathNumFontSize);
	changeMarginTop(tile, 'breathNum', breathNumMtop);
	changeMarginBottom(tile, 'breathNum', breathNumMbot);

	let activeFontSize = tileSize * 28 / 315;
	let activeMtop = tileSize * (-12) / 315;
	let activeMbot = tileSize * (-6) / 315;
	changeFontSize(tile, 'active', activeFontSize);
	changeMarginTop(tile, 'active', activeMtop);
	changeMarginBottom(tile, 'active', activeMbot);

	let imageSize = tileSize * 60 / 315;
	let imageDivMtop = tileSize * (-32) / 315;
	let imageDivMbot = tileSize * (20) / 315;
	let imageDivMleft = tileSize * 54 / 315;
	let imageDivMright = tileSize * 54 / 315;
	changeImageSize(tile, 'StateImg', imageSize);
	changeMarginTop(tile, 'State', imageDivMtop);
	changeMarginBottom(tile, 'State', imageDivMbot);
	changeMarginLeft(tile, 'State', imageDivMleft);
	changeImageSize(tile, 'AlertImg', imageSize);
	changeMarginTop(tile, 'Alert', imageDivMtop);
	changeMarginBottom(tile, 'Alert', imageDivMbot);
	changeMarginRight(tile, 'Alert', imageDivMright);
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
	activeTiles[uid].tileColor = tileColor;
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
		let tileColor = activeTiles[uid].tileColor;
		let tile = activeTiles[uid].tile;

		if (content.state == 'ERROR') {
			if (tileBlinkColor) {
				tile.style.backgroundColor = "darkorange";
			} else {
				tile.style.backgroundColor = tileColor;
			}
		} else if (content.attention) {
			if (tileBlinkColor) {
				tile.style.backgroundColor = "gold";
			} else {
				tile.style.backgroundColor = tileColor;
			}
		}
	}
}

setInterval(() => {
	blinkTiles();
}, 1000)

function resizeAllTiles() {
  for (const uid in activeTiles) {
		updateTileStyles(uid);
	}
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

