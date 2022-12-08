// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function iconButtonHTML() {
  className = "iconButton;
  onClickFunction = "foo";
  pngFileName = "export";
  size = 30;

  htmlStr = '<button class="' + className +'"' +
            ' onClick="' + onClickFunction + '(this)">' +
            ' <img  src="../common/img/' + pngFileName + '.png"' + 
            ' onmouseover="overIconBtn(this)" onmouseout="outIconBtn(this)"' +
            ' width=' + size + 'px height=' + size + 'px></button>'
  return htmlStr;
}

function outIconBtn(btn) {
  var isImg = (btn.nodeName.toLowerCase() === 'img');
  if (isImg) btn = btn.parentNode;
  
  btn.style.backgroundColor = "white";
  btn.style.borderColor = "white";
  //console.log("out");
  //console.log(btn);
}

function overIconBtn(btn) {
  var isImg = (btn.nodeName.toLowerCase() === 'img');
  if (isImg) btn = btn.parentNode;

  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  btn.style.backgroundColor = bgd;
  btn.style.borderColor = bgd;
  //console.log("hover");
  //console.log(btn);
}


