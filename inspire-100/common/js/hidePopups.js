// Remove Chart & Wave edit menus if clicked outside
// Also hide any divs of popupClass
document.addEventListener('click', function (event) {
  // check if a button is clicked
  let buttonClicked = (event.target.nodeName == "BUTTON");
  if (!buttonClicked && event.target.parentNode) {
    // check parent for icon buttons
    buttonClicked = (event.target.parentNode.nodeName == "BUTTON");
  }

  // Let the button listener take care of stuff
  if (buttonClicked) return;

  let spanClicked = (event.target.nodeName == "SPAN");
  if (!spanClicked && event.target.parentNode) {
    // check parent for ispan buttons
    spanClicked = (event.target.parentNode.nodeName == "SPAN");
  }

  // Let the span listener take care of stuff
  if (spanClicked) return;

  let cMenu = document.getElementById(CHART_EDIT_CHART_MENU_ID);
  let sMenu = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);

  if (cMenu && !cMenu.contains(event.target)) {
    removeChartEditMenu();
  }
  if (sMenu && !sMenu.contains(event.target)) {
    removeWaveEditMenu();
  }

  let popupsCenter = document.getElementsByClassName('popupClassCenter');
  if (popupsCenter) {
  	for (let i = 0; i < popupsCenter.length; i++) {
    	let popup = popupsCenter[i];
    	if (!popup.contains(event.target)) {
      	popup.style.display = "none";
    	}
		}
  }

  let popupsTopLeft = document.getElementsByClassName('popupClassTopLeft');
  if (popupsTopLeft) {
  	for (let i = 0; i < popupsTopLeft.length; i++) {
    	let popup = popupsTopLeft[i];
    	if (!popup.contains(event.target)) {
      	popup.style.display = "none";
    	}
		}
  }

});
