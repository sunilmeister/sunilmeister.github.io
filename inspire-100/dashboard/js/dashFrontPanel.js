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
		ledImg.id = ledDivId;
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

function updateFrontPanel() {
}
