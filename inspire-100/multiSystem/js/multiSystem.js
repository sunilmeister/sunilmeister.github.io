// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// ////////////////////////////////////////////////////
//  allSystems object is like below
//  {uid : 
//    {
//      active: true,
//      tile: DOMelement, 
//      systemTag: ,
//      updated: Date, 
//      content: {
//        state: ,
//        patientFName: ,
//        patientLName: ,
//        attention: ,
//        breaths: ,
//        duration: ,
//        firmware: ,
//      }
//    }
//  },
//  ...
// ////////////////////////////////////////////////////
var allSystems = {};

function formTileTitle(uid) {
  if (isUndefined(allSystems[uid])) return "";

  let fName = allSystems[uid].content.patientFName;
  let lName = allSystems[uid].content.patientLName;

  if ((fName == "") && (lName == "")) return allSystems[uid].systemTag;

  let title = "";
  if (fName != "") title = fName;
  if (lName != "") {
    if (title != "") title += " ";
    title += lName;
  }
  return title;
}

function updateTileContents(uid) {
  //updateTileParams(uid); Do it only when the tile view changes
  updateTileState(uid);
  updateTileImages(uid);
  updateAudioAlerts();
}

function updateTileParams(uid) {
  if (isUndefined(allSystems[uid])) return;

  let tile = allSystems[uid].tile;
  let content = allSystems[uid].content;

  let modeText = "--";
  if (content.mode != "--") {
    modeText = MODE_DECODER[content.mode];
    let elem = findChildNodeByClass(tile,"MODEvalue");
    elem.classList.remove("ParamValue");  
    elem.classList.remove("PsvModeValue");  
    if (content.mode == 3) { // PSV
      elem.classList.add("PsvModeValue"); 
      modeText = modeText + " (BiPAP)";
    } else {
      elem.classList.add("ParamValue"); 
    }
  }
  changeParamValue(tile, "MODEvalue", modeText);
  changeParamValue(tile, "VTvalue",content.vt);
  changeParamValue(tile, "RRvalue",content.rr);
  changeParamValue(tile, "IEvalue",content.ie);
  changeParamValue(tile, "FiO2value",content.fiO2);
  changeParamValue(tile, "PSvalue",content.ps);
  changeParamValue(tile, "MVvalue",content.mv);
}

function updateTileState(uid) {
  if (isUndefined(allSystems[uid])) return;

  let tile = allSystems[uid].tile;
  let content = allSystems[uid].content;

  let title = formTileTitle(uid);
  let breaths = content.breaths;
  let duration = content.duration;

  let elem = null;
  elem = findChildNodeByClass(tile,'tileName');
  elem.innerHTML = title;
  if (allSystems[uid].active) {
    elem.style.color = getActiveTileColorFG();
  } else {
    elem.style.color = getInactiveTileColorFG();
  }

  elem = findChildNodeByClass(tile,'breathNum');
  if (isValidValue(breaths)) elem.innerHTML = breaths;
  else elem.innerHTML = "--"

  elem = findChildNodeByClass(tile,'duration');
  if (isValidValue(duration)) {
    let hh = Math.floor(duration / 60);
    let mm = duration % 60;
    let hhStr = hh.toString().padStart(2, 0);
    let mmStr = mm.toString().padStart(2, 0);
    let str = hhStr + ":" + mmStr;
    elem.innerHTML = str;
  } else elem.innerHTML = "--"

  if (allSystems[uid].active) {
    elem.style.color = getActiveTileColorFG();
  } else {
    elem.style.color = getInactiveTileColorFG();
  }

  if (allSystems[uid].active) {
    elem = findChildNodeByClass(tile,'active');
    elem.style.display = "block";
    elem = findChildNodeByClass(tile,'inactive');
    elem.style.display = "none";
  } else {
    elem = findChildNodeByClass(tile,'active');
    elem.style.display = "none";
    elem = findChildNodeByClass(tile,'inactive');
    elem.style.color = getInactiveTileColorFG();
    elem.style.display = "block";
  }

  elem = findChildNodeByClass(tile,'tileUid');
  if (!elem.innerHTML) {
    elem.innerHTML = uid;
  }

  elem = findChildNodeByClass(tile,'statusCaption');
  if (allSystems[uid].active) {
    elem.style.backgroundColor = getActiveCaptionColorBG();
    elem.style.color = getActiveTileColorFG();
  } else {
    elem.style.backgroundColor = getInactiveCaptionColorBG();
    elem.style.color = getInactiveTileColorFG();
  }

  elem = findChildNodeByClass(tile,'breathCaption');
  if (allSystems[uid].active) {
    elem.style.backgroundColor = getActiveCaptionColorBG();
    elem.style.color = getActiveTileColorFG();
  } else {
    elem.style.backgroundColor = getInactiveCaptionColorBG();
    elem.style.color = getInactiveTileColorFG();
  }

  elem = findChildNodeByClass(tile,'durationCaption');
  if (allSystems[uid].active) {
    elem.style.backgroundColor = getActiveCaptionColorBG();
    elem.style.color = getActiveTileColorFG();
  } else {
    elem.style.backgroundColor = getInactiveCaptionColorBG();
    elem.style.color = getInactiveTileColorFG();
  }
}

function updateTileImages(uid) {
  if (isUndefined(allSystems[uid])) return;

  let tile = allSystems[uid].tile;
  let content = allSystems[uid].content;

  let stateImg = findChildNodeByClass(tile, 'StateImg');
  if (!allSystems[uid].active) {
    stateImg.src = '../common/img/Sleep.png'
  } else if (content.state == 'ERROR') {
    stateImg.src = '../common/img/ErrorLED.png'
  } else if (content.state == 'ACTIVE') {
    stateImg.src = '../common/img/ActiveLED.png'
  } else if (content.state == 'STANDBY') {
    stateImg.src = '../common/img/StandbyLED.png'
  } else {
    stateImg.src = '../common/img/InitialLED.png'
  }

  let alertImg = findChildNodeByClass(tile, 'AlertImg');
  if (!allSystems[uid].active) {
    alertImg.src = '../common/img/Inactive.png'
  } else if (content.state == 'ERROR') {
    alertImg.src = '../common/img/Error.png'
  } else if (content.attention) {
    alertImg.src = '../common/img/Warning.png'
  } else {
    alertImg.src = '../common/img/OK.png'
  }

  if (allSystems[uid].active) {
    tile.style.backgroundColor = getActiveTileColorBG();
  } else {
    tile.style.backgroundColor = getInactiveTileColorBG();
  }

  let elem = findChildNodeByClass(tile, 'statusCaption');
  if (allSystems[uid].active) {
    elem.innerHTML = "Transmitting" ;
  } else {
    elem.innerHTML = "NOT Transmitting" ;
  }
}

function moveTileToDormant(uid) {
  if (!allSystems[uid].active) return;
  allSystems[uid].active = false;
  updateTileImages(uid);

  let activeTilesDiv = document.getElementById('activeTilesDiv');
  let dormantTilesDiv = document.getElementById('dormantTilesDiv');
  let dummyDormantTile = document.getElementById('dummyDormantTile');

  let tile = allSystems[uid].tile;
  
  dormantTilesDiv.insertBefore(tile, dummyDormantTile);
}

function moveTileToActive(uid) {
  if (allSystems[uid].active) return;
  allSystems[uid].active = true;
  updateTileImages(uid);

  let activeTilesDiv = document.getElementById('activeTilesDiv');
  let dormantTilesDiv = document.getElementById('dormantTilesDiv');
  let dummyActiveTile = document.getElementById('dummyActiveTile');

  let tile = allSystems[uid].tile;
  
  activeTilesDiv.insertBefore(tile, dummyActiveTile);
}

function addTile(uid, sysTag, content) {
  if (isDefined(allSystems[uid])) return;

  let dormantTilesDiv = document.getElementById('dormantTilesDiv');
  let temp = document.getElementById('tileTemplate');
  let template = findChildNodeByClass(temp.content, 'tile');
  let newTile = template.cloneNode(true);
  let tileColor = getInactiveTileColorBG();
  let fgColor = getInactiveTileColorFG();
  newTile.style.backgroundColor = tileColor;
  newTile.style.color = fgColor;

  allSystems[uid] = {};
  allSystems[uid].active = false;
  allSystems[uid].updated = new Date();
  allSystems[uid].systemTag = sysTag;
  allSystems[uid].tile = newTile;

  // initialize content
  allSystems[uid].content = cloneObject(initialTileContent());

  let dummyDormantTile = document.getElementById('dummyDormantTile');
  dormantTilesDiv.insertBefore(newTile, dummyDormantTile);
}

function deleteTile(uid) {
  if (isUndefined(allSystems[uid])) return;

  let tile = allSystems[uid].tile;

  if (allSystems[uid].active) {
    let activeTilesDiv = document.getElementById('activeTilesDiv');
    activeTilesDiv.removeChild(tile);
  } else {
    let dormantTilesDiv = document.getElementById('dormantTilesDiv');
    dormantTilesDiv.removeChild(tile);
  }

  delete allSystems[uid];
}

var tileBlinkColor = false;
function blinkTiles() {
  if (!tileBlinkColor) tileBlinkColor = true;
  else tileBlinkColor = null;

  for (const uid in allSystems) {
    let content = allSystems[uid].content;

    if (!content.attention && !(content.state == 'ERROR')) continue;
    let tileColor = getActiveTileColorBG();
    let tile = allSystems[uid].tile;

    if (content.state == 'ERROR') {
      if (tileBlinkColor) {
        tile.style.backgroundColor = "#EE4B2B";
      } else {
        tile.style.backgroundColor = tileColor;
      }
    } else if (content.attention) {
      if (tileBlinkColor) {
        tile.style.backgroundColor = "#F28C28";
      } else {
        tile.style.backgroundColor = tileColor;
      }
    }
  }
}

setInterval(() => {
  blinkTiles();
}, 1000)

function changeParamValue(tile, className, value) {
  let elem = findChildNodeByClass(tile,className);
  elem.innerHTML = value;
}

function updateAudioAlerts() {
  if (!errorBeepEnabled && !warningBeepEnabled) return;

  let alerts = checkAllSystemsForAlerts();

  let foundError = (alerts == "ERROR");
  let foundWarning = (alerts == "WARNING");

  if (foundError) {
    startErrorBeep();
    stopWarningBeep();
  } else if (foundWarning) {
    stopErrorBeep();
    startWarningBeep();
  } else {
    stopErrorBeep();
    stopWarningBeep();
  }
}

window.onload = function () {
  AddRemoveTiles();
  disableAllBeeps();
  openAudioControl();
  setRootFontSize("topTilesDiv", "topTilesDiv");

}
