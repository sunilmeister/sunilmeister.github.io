// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function checkButtonHTML(onClickFunction,size) {
  pngFileName = "check";
  return iconButtonHTML(pngFileName, size, onClickFunction);
}

function trashButtonHTML(onClickFunction,size) {
  pngFileName = "trash-bin";
  return iconButtonHTML(pngFileName, size, onClickFunction);
}

function exportButtonHTML(onClickFunction,size) {
  pngFileName = "export";
  return iconButtonHTML(pngFileName, size, onClickFunction);
}

function plusButtonHTML(onClickFunction,size) {
  pngFileName = "plus";
  return iconButtonHTML(pngFileName, size, onClickFunction);
}

function iconButtonHTML(pngFileName, size, onClickFunction) {
  className = "iconButton";
  htmlStr = '<button class="' + className +'"' +
            ' onClick="' + onClickFunction + '(this)"' +
            ' onmouseover="overIconBtn(this)" onmouseout="outIconBtn(this)">' +
            ' <img  src="../common/img/' + pngFileName + '.png"' + 
            ' width=' + size + 'px height=' + size + 'px></button>'
  return htmlStr;
}

function outIconBtn(btn) {
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";

  if (btn.parentNode.parentNode.tagName == "TR") {
    var style = getComputedStyle(document.body)
    bgd = style.getPropertyValue('--rsp_darkblue');
    btn.parentNode.parentNode.style.backgroundColor = bgd;
  }
}

function overIconBtn(btn) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;

  if (btn.parentNode.parentNode.tagName == "TR") {
    bgd = style.getPropertyValue('--rsp_blue');
    btn.parentNode.parentNode.style.backgroundColor = bgd;
  }
}


