// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function changeMarginTop(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.marginTop = String(Math.floor(size)) + "px";
}

function changeMarginBottom(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.marginBottom = String(Math.floor(size)) + "px";
}

function changeMarginLeft(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.marginLeft = String(Math.floor(size)) + "px";
}

function changeMarginRight(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.marginRight = String(Math.floor(size)) + "px";
}

function changePadding(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.padding = String(Math.floor(size)) + "px";
}

function changeFontSize(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.fontSize = String(Math.floor(size)) + "px";
}

function changeImageSize(tile, className, size) {
  let elem = findChildNodeByClass(tile, className);
	elem.style.width = String(Math.floor(size)) + "px";
	elem.style.height = String(Math.floor(size)) + "px";
}
