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
const laptopInitialFontSize = 16;
const mobileInitialFontSize = 16;

// Ensure that some margin is left on the sides
const fontScaleFactor = 0.9;

// ///////////////////////////////////////////////////////
// Figure out the root font size for proper scaling etc.
// ///////////////////////////////////////////////////////
function setRootFontSizeLaptop() {
	const minFontSize = 6;
	const maxFontSize = 18;
	let windowWidth = window.innerWidth;
	let windowHeight = window.innerHeight;
	let wFontSize = (laptopInitialFontSize * windowWidth) / appWidth;
	let hFontSize = (laptopInitialFontSize * windowHeight) / appHeight;

	//console.log("rootDivBoundingRect",rootDivBoundingRect);
	console.log("windowWidth", windowWidth, "windowHeight", windowHeight);
	console.log("appWidth", appWidth, "appHeight", appHeight );
	console.log("wFontSize", wFontSize, "hFontSize", hFontSize);

	let fontSize = Math.min(wFontSize, hFontSize);
	fontSize *= fontScaleFactor;
	//if (fontSize > maxFontSize) fontSize = maxFontSize;
	if (fontSize < minFontSize) fontSize = minFontSize;
	console.log("root fontSize", fontSize);

	let root = document.documentElement;
 	root.style.fontSize = String(fontSize) + "px";
	if (appResizeFunction) appResizeFunction();
}

function setRootFontSizeMobile(orient) {
	if (isUndefined(orient)) orient = "portrait";
	const minFontSize = 4;
	const maxFontSize = 17;
	//let width = 375;
	//let height = 812;
	let dpxRatio = window.devicePixelRatio;
	let width = window.innerWidth / dpxRatio;
	let height = window.innerHeight / dpxRatio;
	let wFontSize = (mobileParams.fontSize * width) / mobileParams.width;
	let hFontSize = (mobileParams.fontSize * height) / mobileParams.height;
	let fontSize = 0;
	if (orient == "portrait") {
		fontSize = wFontSize;
	} else {
		fontSize = hFontSize;
	}
	fontSize *= fontScaleFactor;

	//alert("height=" + height + "\nwidth=" + width + "\nfontScaleFactor=" + fontScaleFactor);

	if (fontSize > maxFontSize) fontSize = maxFontSize;
	if (fontSize < minFontSize) fontSize = minFontSize;
	//alert("root fontSize=" + fontSize);

	let root = document.documentElement;
 	root.style.fontSize = String(fontSize) + "px";
	if (appResizeFunction) appResizeFunction();
}

// Check for change in orientation
var portraitScreen = window.matchMedia("(orientation: portrait)");
var orientation = portraitScreen.matches ? "portrait" : "landscape";
portraitScreen.addEventListener("change", function(e) {
  if (e.matches) {
		orientation = "portrait";
  } else {
		orientation = "landscape";
  }
	setRootFontSizeMobile(orientation);
})


// Check if the browser is on a mobile
function isMobileBrowser() {
	if (/Android|webOS|iPhone|iPad|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  	return true;
	} else {
  	return false;
	}
}

function setRootFontSize(rootWidthDivId, rootHeightDivId) {
	console.log("ROOT DIVs (W,H)", rootWidthDivId, rootHeightDivId);
	rootWidthDiv = document.getElementById(rootWidthDivId);
	rootHeightDiv = document.getElementById(rootHeightDivId);
	appWidth = rootWidthDiv.offsetWidth;
	appHeight = rootHeightDiv.offsetHeight;

	if (isMobileBrowser()) {
		if (isUndefined(portraitScreen)) {
			portraitScreen = window.matchMedia("(orientation: portrait)");
			orientation = portraitScreen.matches ? "portrait" : "landscape";
		}
		setRootFontSizeMobile(orientation);
	} else {
		setRootFontSizeLaptop();
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
	if (isMobileBrowser()) {
		// Handled above in the orientation change listener
		return;
	}

  // Clear the previous timeout.
  clearTimeout(resizeTimeout);

  // Set a new timeout to execute the function after 100 milliseconds.
  resizeTimeout = setTimeout(function() {
  	// Now resize if not zooming
		if (!isZooming()) {
			setRootFontSizeLaptop();
		}
  }, 100);
});

