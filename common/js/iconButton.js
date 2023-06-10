// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function submitButtonHTML(onClickFunction, size, title) {
  pngFileName = "submit";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function checkButtonHTML(onClickFunction, size, title) {
  pngFileName = "check";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function trashButtonHTML(onClickFunction, size, title) {
  pngFileName = "trash-bin";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function exportButtonHTML(onClickFunction, size, title) {
  pngFileName = "export";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function plusButtonHTML(onClickFunction, size, title) {
  pngFileName = "plus";
  return iconButtonHTML(pngFileName, size, onClickFunction, title);
}

function iconButtonHTML(pngFileName, size, onClickFunction, title) {
  className = "iconButton";
  htmlStr = '<button class="' + className + '" title="' + title + '"' +
    ' onClick="' + onClickFunction + '(this)"' +
    ' onmouseover="overIconBtn(this)" onmouseout="outIconBtn(this)">' +
    ' <img  src="../common/img/' + pngFileName + '.png"' +
    ' width=' + size + 'px height=' + size + 'px></button>'
  return htmlStr;
}

var saveBackgroundColor = null;

function outIconBtn(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
  btn.firstElementChild.style.backgroundColor = "white";
  btn.firstElementChild.style.borderColor = "white";

  if (btn.parentNode.parentNode.tagName == "TR") {
    btn.parentNode.parentNode.style.backgroundColor = saveBackgroundColor;
  }
}

function overIconBtn(btn) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  btn.firstElementChild.style.backgroundColor = bgd;
  btn.firstElementChild.style.borderColor = bgd;

  if (btn.parentNode.parentNode.tagName == "TR") {
    saveBackgroundColor = btn.parentNode.parentNode.style.backgroundColor;
    bgd = style.getPropertyValue('--rsp_blue');
    btn.parentNode.parentNode.style.backgroundColor = bgd;
  }
}
