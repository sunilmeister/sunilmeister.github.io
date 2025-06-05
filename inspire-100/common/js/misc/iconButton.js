// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function openButtonHTML(onClickFunction, size, title) {
  let pngFileName = "open";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function selectButtonHTML(onClickFunction, size, title) {
  let pngFileName = "check";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function connectButtonHTML(onClickFunction, size, title) {
  let pngFileName = "connect";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function submitButtonHTML(onClickFunction, size, title) {
  let pngFileName = "submit";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function checkButtonHTML(onClickFunction, size, title) {
  let pngFileName = "check";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function trashButtonHTML(onClickFunction, size, title) {
  let pngFileName = "trash-bin";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function exportButtonHTML(onClickFunction, size, title) {
  let pngFileName = "export";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function plusButtonHTML(onClickFunction, size, title) {
  let pngFileName = "plus";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function activeButtonHTML(onClickFunction, size, title) {
  let pngFileName = "BlankDot";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function iconButtonHTML(pngFileName, size, onClickFunction, title) {
  let className = "iconButton";
  let clickFn = "";
  if (onClickFunction) {
    clickFn = ' onClick="' + onClickFunction + '(this)"' +
      ' onmouseover="overIconBtn(this)" onmouseout="outIconBtn(this)"';
  }
  let htmlStr = '<img  src="../common/img/' + pngFileName + '.png"' +
		' class="' + className + '" title="' + title + '"' + clickFn +
    ' style="width:' + size + 'rem; height:' + size + 'rem;"></button>'
  return htmlStr;
}

function iconImageHTML(pngFileName, size, title) {
  let htmlStr = '<img  src="../common/img/' + pngFileName + '.png"' +
		'" title="' + title + '"' +
    ' style="width:' + size + 'rem; height:' + size + 'rem;">'
  return htmlStr;
}

var saveBackgroundColor = null;

function outIconBtn(btn) {
  btn.style.backgroundColor = "transparent";
  btn.style.borderColor = "transparent";

  if (btn.parentNode.parentNode.tagName == "TR") {
    btn.parentNode.parentNode.style.backgroundColor = saveBackgroundColor;
  }
}

function overIconBtn(btn) {
  let bgd = palette.brightgreen;
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;

  if (btn.parentNode.parentNode.tagName == "TR") {
    saveBackgroundColor = btn.parentNode.parentNode.style.backgroundColor;
    bgd = palette.blue;
    btn.parentNode.parentNode.style.backgroundColor = bgd;
  }
}
