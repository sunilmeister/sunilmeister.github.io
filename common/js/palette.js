// ////////////////////////////////////////////////////
// Author
// ////////////////////////////////////////////////////

var palette = {
  darkblue:	    null,
  mediumblue:	null,
  blue:	        null,
  lightblue:	null,
  paleblue:	    null,
  brightblue:	null,
  darkgreen:	null,
  green:	    null,
  mediumgreen:	null,
  lightgreen:	null,
  brightgreen:	null,
  yellow:	    null,
  orange:	    null,
  darkred:	    null,
  modal:	    null,

  MandatoryVC:	        null,
  SpontaneousVC:	    null,
  SpontaneousPS:	    null,
  MandatoryVCMaint:	    null,
  SpontaneousVCMaint:	null,
  SpontaneousPSMaint:	null,
  Abnormal:	            null,
  Error:	            null,

};

window.addEventListener("load", function() {
  var style = getComputedStyle(document.body);
  
  palette.darkblue = style.getPropertyValue('--rsp_darkblue');
  palette.mediumblue = style.getPropertyValue('--rsp_mediumblue');
  palette.blue = style.getPropertyValue('--rsp_blue');
  palette.lightblue = style.getPropertyValue('--rsp_lightblue');
  palette.paleblue = style.getPropertyValue('--rsp_paleblue');
  palette.brightblue = style.getPropertyValue('--rsp_brightblue');
  palette.darkgreen = style.getPropertyValue('--rsp_darkgreen');
  palette.green = style.getPropertyValue('--rsp_green');
  palette.mediumgreen = style.getPropertyValue('--rsp_mediumgreen');
  palette.lightgreen = style.getPropertyValue('--rsp_lightgreen');
  palette.brightgreen = style.getPropertyValue('--rsp_brightgreen');
  palette.yellow = style.getPropertyValue('--rsp_yellow');
  palette.orange = style.getPropertyValue('--rsp_orange');
  palette.darkred = style.getPropertyValue('--rsp_darkred');
  palette.modal = style.getPropertyValue('--rsp_modal');

  palette.MandatoryVC = style.getPropertyValue('--colorMandatoryVC');
  palette.SpontaneousVC = style.getPropertyValue('--colorSpontaneousVC');
  palette.SpontaneousPS = style.getPropertyValue('--colorSpontaneousPS');
  palette.MandatoryVCMaint = style.getPropertyValue('--colorMandatoryVCMaint');
  palette.SpontaneousVCMaint = style.getPropertyValue('--colorSpontaneousVCMaint');
  palette.SpontaneousPSMaint = style.getPropertyValue('--colorSpontaneousPSMaint');
  palette.Abnormal = style.getPropertyValue('--colorAbnormal');
  palette.Error = style.getPropertyValue('--colorError');
})
