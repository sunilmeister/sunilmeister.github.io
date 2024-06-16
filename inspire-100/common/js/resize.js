// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var appResizeFunction = null; // callback function for app to resize stuff

// APP bounds
var rootWidthDiv = null;
var rootHeightDiv = null;
var appWidth = null;
var appHeight = null;

// Design Params
const laptopDevFontSize = 16;
const mobileDevFontSize = 16;

// Ensure that some margin is left on the sides
const fontScaleFactor = 0.95;

function setRootFontSize(rootWidthDivId, rootHeightDivId, extraWidthRem, extraHeightRem) {
	//console.log("ROOT DIVs (W,H)", rootWidthDivId, rootHeightDivId);
	let devFontSize = 0;
	if (isMobileBrowser()) {
		devFontSize = mobileDevFontSize;
	} else {
		devFontSize = laptopDevFontSize;
	}

	let extraWidthPx = 0;
	let extraHeightPx = 0;
	if (!isUndefined(extraWidthRem)) {
		extraWidthPx = extraWidthRem * devFontSize;
	}
	if (!isUndefined(extraHeightRem)) {
		extraHeightPx = extraHeightRem * devFontSize;
	}

	rootWidthDiv = document.getElementById(rootWidthDivId);
	rootHeightDiv = document.getElementById(rootHeightDivId);
	appWidth = rootWidthDiv.offsetWidth + extraWidthPx;
	appHeight = rootHeightDiv.offsetHeight + extraHeightPx;

	setRootFontSizeDevice(devFontSize);
}

// ///////////////////////////////////////////////////////
// Figure out the root font size for proper scaling etc.
// ///////////////////////////////////////////////////////
function setRootFontSizeDevice(devFontSize) {
	const minFontSize = 5;
	const maxFontSize = 18;
	let pxRatio = 1; // window.devicePixelRatio; 

	let windowWidth = document.documentElement.clientWidth * pxRatio;
	let windowHeight = document.documentElement.clientHeight * pxRatio;
	let wFontSize = (devFontSize * windowWidth) / appWidth;
	let hFontSize = (devFontSize * windowHeight) / appHeight;

	let fontSize = Math.min(wFontSize, hFontSize);
	fontSize *= fontScaleFactor;
	if (fontSize > maxFontSize) fontSize = maxFontSize;
	if (fontSize < minFontSize) fontSize = minFontSize;

	/*
	console.log("pixelRatio", window.devicePixelRatio);
	console.log("windowWidth", windowWidth, "windowHeight", windowHeight);
	console.log("appWidth", appWidth, "appHeight", appHeight );
	console.log("wFontSize", wFontSize, "hFontSize", hFontSize);
	console.log("newFontSize", fontSize);
	if (isMobileBrowser()) {
		alert("windowWidth=" + windowWidth + "  windowHeight=" + windowHeight);
		alert("appWidth=" + appWidth + "  appHeight=" + appHeight );
		alert("wFontSize=" + wFontSize + "  hFontSize=" + hFontSize);
		alert("newfontSize=" + fontSize);
	//} else {
		//alert("NON Mobile");
	}
	*/

	let root = document.documentElement;
 	root.style.fontSize = String(fontSize) + "px";
	if (appResizeFunction) appResizeFunction();
}

// Check if the browser is on a mobile
function isMobileBrowser() {
	if (/Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  	return true;
	} else {
  	return false;
	}
}

// Check whether true resize or simply zoom
var pxRatio = window.devicePixelRatio; 
function isZooming(){
	let newPxRatio = window.devicePixelRatio ;
  if(newPxRatio != pxRatio){
    pxRatio = newPxRatio;
    return true;
  } else {
    return false;
  }
}

// Add an event listener for the resize event.
var resizeTimeout;
window.addEventListener("resize", function() {
  // Clear the previous timeout.
  clearTimeout(resizeTimeout);

  // Set a new timeout to execute the function after 100 milliseconds.
  resizeTimeout = setTimeout(function() {
  	// Now resize if not zooming
		if (!isZooming()) {
			if (isMobileBrowser()) {
				setRootFontSizeDevice(mobileDevFontSize);
			} else {
				setRootFontSizeDevice(laptopDevFontSize);
			}
		}
  }, 100);
});

