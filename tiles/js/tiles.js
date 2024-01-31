// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function updateTileImages(uidObj) {
	let tile = uidObj.tile;

  let stateImg = findChildNodeByClass(tile, 'StateImg');
	if (uidObj.state == 'ERROR') {
		stateImg.src = '../common/img/RedDot.png'
	} else if (uidObj.state == 'ACTIVE') {
		stateImg.src = '../common/img/GreenDot.png'
	} else if (uidObj.state == 'STANDBY') {
		stateImg.src = '../common/img/YellowDot.png'
	} else {
		stateImg.src = '../common/img/WhiteDot.png'
	}

  let alertImg = findChildNodeByClass(tile, 'AlertImg');
	if (uidObj.state == 'ERROR') {
		alertImg.src = '../common/img/Error.png'
	} else if (uidObj.attention) {
		alertImg.src = '../common/img/Warning.png'
	} else {
		alertImg.src = '../common/img/OK.png'
	}
}

function updateTileContents(uidObj) {
	let tile = uidObj.tile;
	let patient = uidObj.patient;
	let breaths = uidObj.breaths;
	let uid = uidObj.uid;

	let elem = null;
	elem = findChildNodeByClass(tile,'patientName');
	elem.innerHTML = patient;

	elem = findChildNodeByClass(tile,'breathNum');
	elem.innerHTML = breaths;

	elem = findChildNodeByClass(tile,'tileUid');
	elem.innerHTML = uid;

	updateTileImages(uidObj);
}

function updateTileStyles(uidObj) {
	let tile = uidObj.tile;
	let tileSize = tile.clientHeight;

	let uidFontSize = tileSize * 16 / 315;
	let uidPadding = tileSize * 10 / 315;
	changeFontSize(tile, 'tileUid', uidFontSize);
	changePadding(tile, 'tileUid', uidPadding);

	let captionFontSize = tileSize * 24 / 315;
	changeFontSize(tile, 'statusCaption', captionFontSize);
	changeFontSize(tile, 'breathCaption', captionFontSize);

	let patientNameFontSize = tileSize * 30 / 315;
	let patientNameMtop = tileSize * (-4) / 315;
	changeFontSize(tile, 'patientName', patientNameFontSize);
	changeMarginTop(tile, 'patientName', patientNameMtop);

	let breathNumFontSize = tileSize * 40 / 315;
	let breathNumMtop = tileSize * (-8) / 315;
	let breathNumMbot = tileSize * (-8) / 315;
	changeFontSize(tile, 'breathNum', breathNumFontSize);
	changeMarginTop(tile, 'breathNum', breathNumMtop);
	changeMarginBottom(tile, 'breathNum', breathNumMbot);

	let imageSize = tileSize * 76 / 315;
	let imageDivMtop = tileSize * (-32) / 315;
	let imageDivMleft = tileSize * 26 / 315;
	let imageDivMright = tileSize * 26 / 315;
	changeImageSize(tile, 'StateImg', imageSize);
	changeMarginTop(tile, 'State', imageDivMtop);
	changeMarginLeft(tile, 'State', imageDivMleft);
	changeImageSize(tile, 'AlertImg', imageSize);
	changeMarginTop(tile, 'Alert', imageDivMtop);
	changeMarginRight(tile, 'Alert', imageDivMright);
}

function addTile(uidObj) {
	let topDiv = document.getElementById('topDiv');
	let temp = document.getElementById('tileTemplate');
  let template = findChildNodeByClass(temp.content, 'tile');
 	let newTile = template.cloneNode(true);
	let tileColor = getNextTileColor();

	newTile.style.backgroundColor = tileColor;
	uidObj.tile = newTile;
	uidObj.tileColor = tileColor;

	topDiv.appendChild(newTile);
}

function deleteTile(uidObj) {
	let topDiv = document.getElementById('topDiv');
	let tile = uidObj.tile;
	topDiv.removeChild(tile);
}

var tileBlinkColor = false;
function blinkTiles() {
	if (!tileBlinkColor) tileBlinkColor = true;
	else tileBlinkColor = null;

  for (const uid in activeTiles) {
		let uidObj = activeTiles[uid];

		if (!uidObj.attention && !(uidObj.state == 'ERROR')) continue;
		let tileColor = uidObj.tileColor;

		if (uidObj.state == 'ERROR') {
			if (tileBlinkColor) {
				uidObj.tile.style.backgroundColor = "darkorange";
			} else {
				uidObj.tile.style.backgroundColor = uidObj.tileColor;
			}
		} else if (uidObj.attention) {
			if (tileBlinkColor) {
				uidObj.tile.style.backgroundColor = "gold";
			} else {
				uidObj.tile.style.backgroundColor = uidObj.tileColor;
			}
		}
	}
}

setInterval(() => {
	blinkTiles();
}, 1000)

function resizeAllTiles() {
  for (const uid in activeTiles) {
		let uidObj = activeTiles[uid];
		updateTileStyles(uidObj);
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

