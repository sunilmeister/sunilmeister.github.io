// Remove Chart & Shape edit menus if clicked outside
// Also hide any divs of popupClass
document.addEventListener('click', function (event) {
  // check if a button is clicked
  var buttonClicked = (event.target.nodeName == "BUTTON");
  if (!buttonClicked && event.target.parentNode) {
    // check parent for icon buttons
    buttonClicked = (event.target.parentNode.nodeName == "BUTTON");
  }

  // Let the button listener take care of stuff
  if (buttonClicked) return;

  var cMenu = document.getElementById(CHART_EDIT_CHART_MENU_ID);
  var sMenu = document.getElementById(SHAPE_EDIT_SHAPE_MENU_ID);

  if (cMenu && !cMenu.contains(event.target)) {
    removeChartEditMenu();
  }
  if (sMenu && !sMenu.contains(event.target)) {
    removeShapeEditMenu();
  }

  var popups = document.getElementsByClassName('popupClass');
  if (!popups) return;

  for (i = 0; i < popups.length; i++) {
    popup = popups[i];
    if (!popup.contains(event.target)) {
      popup.style.display = "none";
    }
  }

});
