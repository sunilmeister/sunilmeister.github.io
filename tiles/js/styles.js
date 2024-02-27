// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function changeParamValue(className, value) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.innerHTML = value;
	}
}

function changeMargin(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.margin = String(Math.floor(size)) + "px";
	}
}

function changeMarginTop(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.marginTop = String(Math.floor(size)) + "px";
	}
}

function changeMarginBottom(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.marginBottom = String(Math.floor(size)) + "px";
	}
}

function changeMarginLeft(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.marginLeft = String(Math.floor(size)) + "px";
	}
}

function changeMarginRight(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.marginRight = String(Math.floor(size)) + "px";
	}
}

function changePadding(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.padding = String(Math.floor(size)) + "px";
	}
}

function changeFontSize(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.fontSize = String(Math.floor(size)) + "px";
	}
}

function changeImageSize(className, size) {
	let elems = document.getElementsByClassName(className);
	for (let i=0; i<elems.length; i++) {
  	let elem = elems[i];
		elem.style.width = String(Math.floor(size)) + "px";
		elem.style.height = String(Math.floor(size)) + "px";
	}
}
