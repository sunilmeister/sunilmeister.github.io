// ////////////////////////////////////////////////////
// Author
// ////////////////////////////////////////////////////

var palette = {
  darkblue
  mediumblue
  blue
  lightblue
  brightblue
  darkgreen
  green
  mediumgreen
  lightgreen
  brightgreen
  yellow
  orange
  darkred
};

window.onload = function () {
  var style = getComputedStyle(document.body)
  
  palette.darkblue = style.getPropertyValue('--rsp_darkblue');
  palette.mediumblue = style.getPropertyValue('--rsp_mediumblue');
  palette.blue = style.getPropertyValue('--rsp_blue');
  palette.lightblue = style.getPropertyValue('--rsp_lightblue');
  palette.brightblue = style.getPropertyValue('--rsp_brightblue');
  palette.darkgreen = style.getPropertyValue('--rsp_darkgreen');
  palette.green = style.getPropertyValue('--rsp_green');
  palette.mediumgreen = style.getPropertyValue('--rsp_mediumgreen');
  palette.lightgreen = style.getPropertyValue('--rsp_lightgreen');
  palette.brightgreen = style.getPropertyValue('--rsp_brightgreen');
  palette.yellow = style.getPropertyValue('--rsp_yellow');
  palette.orange = style.getPropertyValue('--rsp_orange');
  palette.darkred = style.getPropertyValue('--rsp_darkred');
}
