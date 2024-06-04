// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// ////////////////////////////////////////////////////
// Positions of various fields in pixels for some zoom factor
// Measured from the actual front panel drawing
// ////////////////////////////////////////////////////
const fpPositionRootFontSize = 18;

const fpPanel = 
	{name:'frontPanelDiv', X:0, Y:0, W:571.1875, H:787.125};

const fpLeds = [
	{name:'fpInitialDiv', 	X:94, 	Y:115, W:20, H:20},
	{name:'fpStandbyDiv', 	X:94, 	Y:192, W:20, H:20},
	{name:'fpActiveDiv', 		X:94, 	Y:269, W:20, H:20},
	{name:'fpCmvDiv', 			X:94, 	Y:366, W:20, H:20},
	{name:'fpAcvDiv', 			X:94, 	Y:417, W:20, H:20},
	{name:'fpErrorDiv', 		X:463, 	Y:115, W:20, H:20},
	{name:'fpMbreathDiv', 	X:463, 	Y:192, W:20, H:20},
	{name:'fpSbreathDiv', 	X:463, 	Y:269, W:20, H:20},
	{name:'fpSimvDiv', 			X:463, 	Y:366, W:20, H:20},
	{name:'fpPsvDiv', 			X:463, 	Y:417, W:20, H:20},
];

const fpLcd = 
	{name:'fpLcdDiv', 			X:194, Y:133, W:187, H:70};

const fpNums = [
	{name:'fpPeakDiv', 			X:161, Y:253, W:68, H:50, D:2},
	{name:'fpPlatDiv', 			X:250, Y:253, W:68, H:50, D:2},
	{name:'fpMpeepDiv', 		X:341, Y:253, W:68, H:50, D:2},
	{name:'fpVtDiv', 				X:161, Y:369, W:100, H:50, D:3},
	{name:'fpEiDiv', 				X:284, Y:369, W:35, H:50, D:1},
	{name:'fpRrDiv', 				X:341, Y:369, W:68, H:50, D:2},
	{name:'fpIpeepDiv', 		X:97,  Y:460, W:68, H:50, D:2},
	{name:'fpPmaxDiv', 			X:199, Y:460, W:68, H:50, D:2},
	{name:'fpPsDiv', 				X:305, Y:460, W:68, H:50, D:2},
	{name:'fpTpsDiv', 			X:407, Y:460, W:68, H:50, D:2},
];

function createFpDivs() {
	let panelDiv = document.getElementById('frontPanelDiv');

	// create LED elements
	for (let i=0; i<fpLeds.length; i++) {
		let led = fpLeds[i];
		let ledDivId = led.name;
		let ledImgDivId = "img_" + led.name;
		let ledClassName = "fpLedCls";
		let ledImgClassName = "fpLedImgCls";

		let remX = (led.X - fpPositionRootFontSize) / fpPositionRootFontSize;
		let remY = (led.Y - fpPositionRootFontSize) / fpPositionRootFontSize;
		let remW = led.W / fpPositionRootFontSize;
		let remH = led.H / fpPositionRootFontSize;

		// create a LED div
		let ledDiv = document.createElement("div");
		ledDiv.id = ledDivId;
  	ledDiv.classList.add(ledClassName);
		panelDiv.appendChild(ledDiv);

		// position the LED div
		ledDiv.style.left = String(remX) + "rem";
		ledDiv.style.top = String(remY) + "rem";
		ledDiv.style.width = String(remW) + "rem";
		ledDiv.style.height = String(remH) + "rem";

		// create a LED img
		let ledImg = document.createElement("img");
		ledImg.id = ledImgDivId;
  	ledImg.classList.add(ledImgClassName);
		ledImg.src = "../common/img/BlankLED.png";
		ledDiv.appendChild(ledImg);
	}

	// create NUM elements
	for (let i=0; i<fpNums.length; i++) {
		let num = fpNums[i];
		let numDivId = num.name;
		let pElemId = "p_" + num.name;
		let numClassName = "fpNumCls";
		let pClassName = "fpTextCls";

		let remX = (num.X - fpPositionRootFontSize) / fpPositionRootFontSize;
		let remY = (num.Y - fpPositionRootFontSize) / fpPositionRootFontSize;
		let remW = num.W / fpPositionRootFontSize;
		let remH = num.H / fpPositionRootFontSize;

		// create a NUM div
		let numDiv = document.createElement("div");
		numDiv.id = numDivId;
  	numDiv.classList.add(numClassName);
		panelDiv.appendChild(numDiv);

		// position the NUM div
		numDiv.style.left = String(remX) + "rem";
		numDiv.style.top = String(remY) + "rem";
		numDiv.style.width = String(remW) + "rem";
		numDiv.style.height = String(remH) + "rem";

		// create a text element
		let pElem = document.createElement("p");
		pElem.id = pElemId;
  	pElem.classList.add(pClassName);
		numDiv.appendChild(pElem);

		// add dashes
		let str = "";
		for (let j=0; j<num.D; j++) {
			str += "-";
		}
		pElem.innerHTML = str;
	}

	// position LCD element
	let lcdDivId = fpLcd.name;
	let lcdDiv = document.getElementById(lcdDivId);

	let remX = (fpLcd.X - fpPositionRootFontSize) / fpPositionRootFontSize;
	let remY = (fpLcd.Y - fpPositionRootFontSize) / fpPositionRootFontSize;
	let remW = fpLcd.W / fpPositionRootFontSize;
	let remH = fpLcd.H / fpPositionRootFontSize;

	lcdDiv.style.left = String(remX) + "rem";
	lcdDiv.style.top = String(remY) + "rem";
	lcdDiv.style.width = String(remW) + "rem";
	lcdDiv.style.height = String(remH) + "rem";
}

function blankFrontPanelStateLeds() {
	document.getElementById('img_fpInitialDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpStandbyDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpActiveDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpErrorDiv').src = "../common/img/BlankLED.png";
}

function blankFrontPanelModeLeds() {
	document.getElementById('img_fpCmvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpAcvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpSimvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpPsvDiv').src = "../common/img/BlankLED.png";
}

function updateFrontPanelStateLeds() {
	// update state LEDs
	blankFrontPanelStateLeds();
  if (session.stateData.state) {
		if (session.stateData.initial) {
    	document.getElementById('img_fpStandbyDiv').src = "../common/img/WhiteDot.png";
		} else if (session.stateData.standby) {
    	document.getElementById('img_fpStandbyDiv').src = "../common/img/YellowDot.png";
  	} else if (session.stateData.active) {
    	document.getElementById('img_fpActiveDiv').src = "../common/img/GreenDot.png";
  	} else {
    	document.getElementById('img_fpErrorDiv').src = "../common/img/RedDot.png";
  	}
	}
}

function updateFrontPanelModeLeds() {
	// update mode LEDs
	blankFrontPanelModeLeds();
	let mode = MODE_DECODER[session.paramDataInUse.mode];
	if (mode == "CMV") {
		document.getElementById('img_fpCmvDiv').src = "../common/img/WhiteDot.png";
	} else if (mode == "ACV") {
		document.getElementById('img_fpAcvDiv').src = "../common/img/WhiteDot.png";
	} else if (mode == "SIMV") {
		document.getElementById('img_fpSimvDiv').src = "../common/img/WhiteDot.png";
	} else if (mode == "PSV") {
		document.getElementById('img_fpPsvDiv').src = "../common/img/WhiteDot.png";
	}
}

var fpLEDsBlank = true;
function blinkFrontPanelLEDs() {
	if (fpLEDsBlank) {
		updateFrontPanelStateLeds();
		fpLEDsBlank = false;
	} else {
		blankFrontPanelStateLeds();
		fpLEDsBlank = true;
	}
}

function isValidValue(val) {
	if (val === null) return false;
	if (isUndefined(val)) return false;
	return true;
}

function updateFrontPanelNumbers() {
	let val = session.paramDataInUse.ie;
	if (isValidValue(val)) document.getElementById('p_fpEiDiv').innerHTML = val;

	val = session.paramDataInUse.rr;
	if (isValidValue(val)) document.getElementById('p_fpRrDiv').innerHTML = val;

	val = session.paramDataInUse.vt;
	if (isValidValue(val)) document.getElementById('p_fpVtDiv').innerHTML = val;

	val = session.paramDataInUse.pmax;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPmaxDiv').innerHTML = val;

	val = session.paramDataInUse.ipeep;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpIpeepDiv').innerHTML = val;

	val = session.paramDataInUse.ps;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPsDiv').innerHTML = val;

	val = session.paramDataInUse.tps;
	if (isValidValue(val)) document.getElementById('p_fpTpsDiv').innerHTML = val;

	val = session.params.peak.LastValue();
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPeakDiv').innerHTML = val;

	val = session.params.plat.LastValue();
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPlatDiv').innerHTML = val;

	val = session.params.mpeep.LastValue();
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpMpeepDiv').innerHTML = val;

	// Also do the S/MBreath LEDs
	document.getElementById('img_fpMbreathDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpSbreathDiv').src = "../common/img/BlankLED.png";
	val = session.params.btype.LastValue();
	if ((isValidValue(val)) && (val == MANDATORY_BREATH)) {
		document.getElementById('img_fpMbreathDiv').src = "../common/img/YellowDot.png";
	} else if (val == SPONTANEOUS_BREATH) {
		document.getElementById('img_fpMbreathDiv').src = "../common/img/GreenDot.png";
	}
}


