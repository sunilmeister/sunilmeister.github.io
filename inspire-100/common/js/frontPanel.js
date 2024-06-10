// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// ////////////////////////////////////////////////////
// Positions of various fields in pixels for some zoom factor
// Measured from the actual front panel drawing
// ////////////////////////////////////////////////////
const fpRemToPxScale = 16;

const fpPanel = 
	{name:'frontPanelDiv', X:0, Y:0, W:571.1875, H:787.125};

const fpLeds = [
	{name:'fpInitialDiv', 	X:92, 	Y:114, W:20, H:20},
	{name:'fpStandbyDiv', 	X:92, 	Y:191, W:20, H:20},
	{name:'fpActiveDiv', 		X:92, 	Y:269, W:20, H:20},
	{name:'fpCmvDiv', 			X:92, 	Y:366, W:20, H:20},
	{name:'fpAcvDiv', 			X:92, 	Y:418, W:20, H:20},
	{name:'fpErrorDiv', 		X:463, 	Y:114, W:20, H:20},
	{name:'fpMbreathDiv', 	X:463, 	Y:191, W:20, H:20},
	{name:'fpSbreathDiv', 	X:463, 	Y:269, W:20, H:20},
	{name:'fpSimvDiv', 			X:463, 	Y:366, W:20, H:20},
	{name:'fpPsvDiv', 			X:463, 	Y:418, W:20, H:20},
];

const fpLcd = 
	{name:'fpLcdDiv', 			X:194, Y:133, W:187, H:72};

const fpNums = [
	{name:'fpPeakDiv', 			X:161, Y:253, W:68, H:50, D:2},
	{name:'fpPlatDiv', 			X:250, Y:253, W:68, H:50, D:2},
	{name:'fpMpeepDiv', 		X:341, Y:253, W:68, H:50, D:2},
	{name:'fpVtDiv', 				X:161, Y:369, W:100, H:50, D:3},
	{name:'fpEiDiv', 				X:284, Y:369, W:35, H:50, D:1},
	{name:'fpRrDiv', 				X:341, Y:369, W:68, H:50, D:2},
	{name:'fpIpeepDiv', 		X:97,  Y:461, W:68, H:50, D:2},
	{name:'fpPmaxDiv', 			X:199, Y:461, W:68, H:50, D:2},
	{name:'fpPsDiv', 				X:305, Y:461, W:68, H:50, D:2},
	{name:'fpTpsDiv', 			X:407, Y:461, W:68, H:50, D:2},
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

		let remX = (led.X - fpRemToPxScale) / fpRemToPxScale;
		let remY = (led.Y - fpRemToPxScale) / fpRemToPxScale;
		let remW = led.W / fpRemToPxScale;
		let remH = led.H / fpRemToPxScale;

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

		let remX = (num.X - fpRemToPxScale) / fpRemToPxScale;
		let remY = (num.Y - fpRemToPxScale) / fpRemToPxScale;
		let remW = num.W / fpRemToPxScale;
		let remH = num.H / fpRemToPxScale;

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

	let remX = (fpLcd.X - fpRemToPxScale) / fpRemToPxScale;
	let remY = (fpLcd.Y - fpRemToPxScale) / fpRemToPxScale;
	let remW = fpLcd.W / fpRemToPxScale;
	let remH = fpLcd.H / fpRemToPxScale;

	lcdDiv.style.left = String(remX) + "rem";
	lcdDiv.style.top = String(remY) + "rem";
	lcdDiv.style.width = String(remW) + "rem";
	lcdDiv.style.height = String(remH) + "rem";
}

function fpFormMessageLine(str) {
	if (str === null) return "";
	if (isUndefined(str)) return "";

	const spanBegin = "<span class=fpUniMono>";
	const spanEnd = "</span>";

	let mstr = "";
	for (let i = 0; i < str.length; i++) {
		let code = str.charCodeAt(i);
		let isASCII = (code >= 0) && (code <= 127);
		let cstr = String.fromCodePoint(code);
		if (isASCII) {
	  	if (cstr == ' ') cstr = '&nbsp';
	  	mstr += cstr;
		} else {
			mstr += spanBegin + cstr + spanEnd;
		}
	}
	if (mstr == "") mstr = "&nbsp" ;
	return mstr;
}

function fpDisplayMessageLine(lineTag, value) {
  let elm;
  elm = document.getElementById(lineTag);
  elm.style.color = palette.darkblue;
  let mvalue = fpFormMessageLine(value);
  elm.innerHTML = mvalue;
}

function fpRefresh() {
	fpRefreshMessageLines();
}

function fpRefreshMessageLines() {
	let snap = session.snapshot.content;
	fpDisplayMessageLine("lcdline1", snap.lcdLine1);
	fpDisplayMessageLine("lcdline2", snap.lcdLine2);
	fpDisplayMessageLine("lcdline3", snap.lcdLine3);
	fpDisplayMessageLine("lcdline4", snap.lcdLine4);
}

function blankFrontPanelStateLeds() {
	document.getElementById('img_fpErrorDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpInitialDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpStandbyDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpActiveDiv').src = "../common/img/BlankLED.png";
}

function updateFrontPanelStateLeds() {
	let snap = session.snapshot.content;
	// update state LEDs
	blankFrontPanelStateLeds();
  if (snap.state !== null) {
  	if ((snap.state == ERROR_STATE) || (snap.errorTag == true)) {
			document.getElementById('img_fpErrorDiv').src = "../common/img/RedDot.png";
		} else if (snap.state == INITIAL_STATE) {
    	document.getElementById('img_fpInitialDiv').src = "../common/img/WhiteDot.png";
		} else if (snap.state == STANDBY_STATE) {
    	document.getElementById('img_fpStandbyDiv').src = "../common/img/YellowDot.png";
  	} else if (snap.state == ACTIVE_STATE) {
    	document.getElementById('img_fpActiveDiv').src = "../common/img/GreenDot.png";
		}
	}
}

function blankFrontPanelModeLeds() {
	document.getElementById('img_fpCmvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpAcvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpSimvDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpPsvDiv').src = "../common/img/BlankLED.png";
}

function updateFrontPanelModeLeds() {
	let snap = session.snapshot.content;

	// update mode LEDs
	blankFrontPanelModeLeds();
	let mode = MODE_DECODER[snap.mode];
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

function blankFrontPanelSettings() {
	blankFrontPanelModeLeds();
	document.getElementById('p_fpEiDiv').innerHTML = "";
	document.getElementById('p_fpRrDiv').innerHTML = "";
	document.getElementById('p_fpVtDiv').innerHTML = "";
	document.getElementById('p_fpPmaxDiv').innerHTML = "";
	document.getElementById('p_fpIpeepDiv').innerHTML = "";
	document.getElementById('p_fpPsDiv').innerHTML = "";
	document.getElementById('p_fpTpsDiv').innerHTML = "";
}

function updateFrontPanelSettings() {
	let snap = session.snapshot.content;
	updateFrontPanelModeLeds();

	let pval = snap.pendingIe;
	let val = snap.ie;
	if (isValidValue(pval)) document.getElementById('p_fpEiDiv').innerHTML = pval;
	else if (isValidValue(val)) document.getElementById('p_fpEiDiv').innerHTML = val;

	pval = snap.pendingRr;
	val = snap.rr;
	if (isValidValue(pval)) document.getElementById('p_fpRrDiv').innerHTML = pval;
	else if (isValidValue(val)) document.getElementById('p_fpRrDiv').innerHTML = val;

	pval = snap.pendingVt;
	val = snap.vt;
	if (isValidValue(pval)) document.getElementById('p_fpVtDiv').innerHTML = pval;
	else if (isValidValue(val)) document.getElementById('p_fpVtDiv').innerHTML = val;

	pval = snap.pendingPmax;
	val = snap.pmax;
	if (isValidValue(pval)) {
		pval = pval.toString().padStart(2, 0);
		document.getElementById('p_fpPmaxDiv').innerHTML = pval;
	} else if (isValidValue(val)) {
		val = val.toString().padStart(2, 0);
		document.getElementById('p_fpPmaxDiv').innerHTML = val;
	}

	pval = snap.pendingIpeep;
	val = snap.ipeep;
	if (isValidValue(pval)) {
		pval = pval.toString().padStart(2, 0);
		document.getElementById('p_fpIpeepDiv').innerHTML = pval;
	} else if (isValidValue(val)) {
		val = val.toString().padStart(2, 0);
		document.getElementById('p_fpIpeepDiv').innerHTML = val;
	}

	pval = snap.pendingPs;
	val = snap.ps;
	if (isValidValue(pval)) {
		pval = pval.toString().padStart(2, 0);
		document.getElementById('p_fpPsDiv').innerHTML = pval;
	} else if (isValidValue(val)) {
		val = val.toString().padStart(2, 0);
		document.getElementById('p_fpPsDiv').innerHTML = val;
	}

	pval = snap.pendingTps;
	val = snap.tps;
	if (isValidValue(pval)) document.getElementById('p_fpTpsDiv').innerHTML = pval;
	else if (isValidValue(val)) document.getElementById('p_fpTpsDiv').innerHTML = val;
}

function blankFrontPanelOutputs() {
	document.getElementById('p_fpPeakDiv').innerHTML = "";
	document.getElementById('p_fpPlatDiv').innerHTML = "";
	document.getElementById('p_fpMpeepDiv').innerHTML = "";
	blankBreathTypeLEDs();
}

function blankBreathTypeLEDs() {
	document.getElementById('img_fpMbreathDiv').src = "../common/img/BlankLED.png";
	document.getElementById('img_fpSbreathDiv').src = "../common/img/BlankLED.png";
}

function updateFrontPanelOutputs() {
	let snap = session.snapshot.content;

	let val = snap.peak;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPeakDiv').innerHTML = val;

	val = snap.plat;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpPlatDiv').innerHTML = val;

	val = snap.mpeep;
	if (isValidValue(val)) val = val.toString().padStart(2, 0);
	if (isValidValue(val)) document.getElementById('p_fpMpeepDiv').innerHTML = val;

	// Also do the S/MBreath LEDs
	val = snap.btype;
	blankBreathTypeLEDs();
	if ((isValidValue(val)) && (val == MANDATORY_BREATH)) {
		document.getElementById('img_fpMbreathDiv').src = "../common/img/YellowDot.png";
	} else if (val == SPONTANEOUS_BREATH) {
		document.getElementById('img_fpSbreathDiv').src = "../common/img/GreenDot.png";
	}
	setTimeout(blankBreathTypeLEDs, 1000)
}

function blankFrontPanelPendingSettings() {
	let snap = session.snapshot.content;

	if (snap.pendingMode) blankFrontPanelModeLeds();
	if (snap.pendingVt) document.getElementById('p_fpVtDiv').innerHTML = "";
	if (snap.pendingMv) document.getElementById('p_fpVtDiv').innerHTML = "";
	if (snap.pendingRr) document.getElementById('p_fpRrDiv').innerHTML = "";
	if (snap.pendingIe) document.getElementById('p_fpEiDiv').innerHTML = "";
	if (snap.pendingIpeep) document.getElementById('p_fpIpeepDiv').innerHTML = "";
	if (snap.pendingPmax) document.getElementById('p_fpPmaxDiv').innerHTML = "";
	if (snap.pendingPs) document.getElementById('p_fpPsDiv').innerHTML = "";
	if (snap.pendingTps) document.getElementById('p_fpTpsDiv').innerHTML = "";
}

var fpLEDsBlank = false;
function blinkFrontPanelLEDs() {
	if (fpLEDsBlank) {
		updateFrontPanelStateLeds();
		fpLEDsBlank = false;
	} else {
		blankFrontPanelStateLeds();
		fpLEDsBlank = true;
	}
}

var fpPendingBlank = true;
function blinkFrontPanelPendingSettings() {
	let snap = session.snapshot.content;

 	if ((snap.state != ERROR_STATE) || (snap.errorTag != true)) {
		if (fpPendingBlank) {
			updateFrontPanelSettings();
			fpPendingBlank = false;
		} else {
			blankFrontPanelPendingSettings();
			fpPendingBlank = true;
		}
	}
}

function blankEntireFrontPanel() {
	blankFrontPanelSettings();
	blankFrontPanelOutputs();
	blankFrontPanelModeLeds();
	blankFrontPanelStateLeds();
}

function updateEntireFrontPanel() {
	updateFrontPanelSettings();
	updateFrontPanelOutputs();
	updateFrontPanelModeLeds();
	updateFrontPanelStateLeds();
}

var fpErrorBlank = false;
function blinkEntireFrontPanel() {
	if (fpErrorBlank) {
		updateEntireFrontPanel();		
		fpErrorBlank = false;
	} else {
		blankEntireFrontPanel();		
		fpErrorBlank = true;
	}
}


