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
	{name:'fpLcdDiv', 			X:187, Y:123, W:194, H:67};

const fpNums = [
	{name:'fpPeakDiv', 			X:155, Y:250, W:66, H:50},
	{name:'fpPlatDiv', 			X:248, Y:250, W:66, H:50},
	{name:'fpMpeepDiv', 		X:343, Y:250, W:66, H:50},
	{name:'fpVtDiv', 				X:155, Y:372, W:99, H:50},
	{name:'fpEiDiv', 				X:283, Y:372, W:33, H:50},
	{name:'fpRrDiv', 				X:344, Y:372, W:66, H:50},
	{name:'fpIpeepDiv', 		X:88,  Y:468, W:66, H:50},
	{name:'fpPmaxDiv', 			X:193, Y:468, W:66, H:50},
	{name:'fpPsDiv', 				X:305, Y:468, W:66, H:50},
	{name:'fpTpsDiv', 			X:413, Y:468, W:66, H:50},
];

function createFpDivs() {
	let panelDiv = document.getElementById('frontPanelDiv');

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

		let str = "<div class=fpLedCls>";
		str += "</div>"

		// create a div
		let ledDiv = document.createElement("div");
		ledDiv.id = ledDivId;
  	ledDiv.classList.add(ledClassName);
		panelDiv.appendChild(ledDiv);

		// position the div
		ledDiv.style.left = String(remX) + "rem";
		ledDiv.style.top = String(remY) + "rem";
		ledDiv.style.width = String(remW) + "rem";
		ledDiv.style.height = String(remH) + "rem";

		// create a img
		let ledImg = document.createElement("img");
		ledImg.id = ledDivId;
  	ledImg.classList.add(ledImgClassName);
		ledImg.src = "../common/img/BlankLED.png";
		ledDiv.appendChild(ledImg);

	}
}

function updateFrontPanel() {
}
