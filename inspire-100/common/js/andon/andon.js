/* ********************************************************
                   Author : Sunil Nanda
   ******************************************************** */

const ANDON_BLANK = 0;
const ANDON_RED = 1;
const ANDON_GREEN = 2;
const ANDON_BLUE = 4;
const ANDON_YELLOW = 8;
const ANDON_CYAN = 16;
const ANDON_WHITE = 32;

function updateAndon() {    
  let backColor, shadowColor, fontColor, caption;
  switch (session.andonState) {
    case ANDON_BLANK:
      backColor = "white";
      shadowColor = "grey";
      fontColor = palette.mediumblue;
      caption = "----";
      break;
    case ANDON_WHITE:
      backColor = "white";
      shadowColor = "grey";
      fontColor = palette.mediumblue;
      caption = "INITIALIZING";
      break;
    case ANDON_CYAN:
      backColor = "cyan";
      shadowColor = palette.blue;
      fontColor = palette.darkblue;
      caption = "STANDBY";
      break;
    case ANDON_GREEN:
      backColor = palette.mediumgreen;
      shadowColor = palette.lightgreen;
      fontColor = palette.darkgreen;
      caption = "ACTIVE";
      break;
    case ANDON_YELLOW:
      backColor = palette.darkyellow;
      shadowColor = "yellow";
      fontColor = palette.darkred;
      caption = "WARNING";
      break;
    case ANDON_RED:
      backColor = palette.darkred;
      shadowColor = "red";
      fontColor = "white";
      caption = "ERROR";
      break;
    default:
      backColor = "white";
      shadowColor = "grey";
      fontColor = palette.mediumblue;
      caption = "----";
      break;
  }
  let andonDiv = document.getElementById("andonDiv");
  andonDiv.style.backgroundColor = backColor;
  andonDiv.style.color = fontColor;
  andonDiv.style.boxShadow = "0 0 15px 5px " + shadowColor;
  document.getElementById("andonCaption").innerHTML = caption;
}

