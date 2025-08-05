// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all waveform user-interface utilities
/////////////////////////////////////////////////////////////////

function waveInsertInitial() {
  let allWaves = document.getElementById(ALL_WAVES_ID);
  let newContainer = createNewWaveContainer();
  allWaves.insertBefore(newContainer, null);
  // Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveInsert(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  let newContainer = createNewWaveContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  // Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveAppend(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  let newContainer = createNewWaveContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  // Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveEdit(bnode) {
  //console.log("bnode", bnode);
  document.getElementById(WAVE_EDIT_WAVE_MENU_ID).style.display = "block";
  let containerNode = findAncestorWaveContainerNode(bnode);
  session.waves.boxTree = new CheckboxTree(WAVE_CBOX_TREE_ROOT_ID, containerNode.id);
  let box = session.waves.allWavesContainerInfo[containerNode.id];
  box.updateMenu(WAVE_EDIT_WAVE_MENU_ID);
  session.waves.boxTree.PropagateFromLeafCheckboxes();
  // Treat <ENTER> as accept button for TITLE
  let titleNode = document.getElementById("WaveTitleId");
  titleNode.addEventListener("keypress", waveTitleKeypressListener);
}

function waveDelete(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  removeWaveContainerId(containerNode.id);
  containerNode.remove();
  if (numberOfExistingWaves() == 0) {
    modalWarning("WAVEFORM BOX", "No Waveform container left\nCreating new empty one");
    waveInsertInitial();
  }
  removeWaveEditMenu();
}

function removeWaveEditMenu() {
  let menuDiv = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);
  if (!menuDiv) return;
  if (session.waves.boxTree) {
    let containerNodeId = session.waves.boxTree.BoxContainerId();
    let cdiv = document.getElementById(containerNodeId);
    let bdiv = findChildNodeByClass(cdiv, WAVE_BANNER_CLASS);
    bdiv.style.backgroundColor = palette.darkblue;
    let menuDiv = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);
    menuDiv.style.display = "none";
    session.waves.boxTree = null;
  }
}

var waveMenuBlinkColor = false;
function blinkWaveMenu() {
  if (!session) return;
  if (!session.waves.boxTree) return;
  let menuDiv = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);
  if (!menuDiv) return;
  let containerNodeId = session.waves.boxTree.BoxContainerId();
  let cdiv = document.getElementById(containerNodeId);
  let mdiv = document.getElementById(WAVE_MENU_BANNER_ID);
  let bdiv = findChildNodeByClass(cdiv, WAVE_BANNER_CLASS);
  if (waveMenuBlinkColor) {
    bdiv.style.backgroundColor = palette.darkblue;
    mdiv.style.backgroundColor = palette.darkblue;
    waveMenuBlinkColor = false;
  } else {
    bdiv.style.backgroundColor = palette.orange;
    mdiv.style.backgroundColor = palette.orange;
    waveMenuBlinkColor = true;
  }
}

setInterval(() => {
  blinkWaveMenu();
}, 1000)

function waveMenuCancel(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  removeWaveEditMenu();
}

function waveMenuSubmit(bnode) {
  let containerNodeId = session.waves.boxTree.BoxContainerId();
  let box = session.waves.allWavesContainerInfo[containerNodeId];
  box.updateOptions(WAVE_EDIT_WAVE_MENU_ID);
  //removeWaveEditMenu();
  box.render();
}

function createNewWaveContainer() {
  let temp = document.getElementById(WAVE_CONTAINER_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, WAVE_CONTAINER_CLASS);
  let node = template.cloneNode(true);
  node.id = WAVE_CONTAINER_ID_PREFIX + (session.waves.currentWaveContainerNum++);
  let body = findChildNodeByClass(node, WAVE_BODY_CLASS);
  let box = new WaveBox(body);
  box.setMiniOptions();
  storeWaveContainerId(node.id, box);
  return node;
}

function numberOfExistingWaves() {
  return session.waves.pwData.length;
}

function numberOfExistingWaveBoxes() {
  return (Object.keys(session.waves.allWavesContainerInfo).length);
}

function findWaveContainerId(id) {
  let obj = session.waves.allWavesContainerInfo[id];
  if (!obj || isUndefined(obj)) return null;
  return obj;
}

function storeWaveContainerId(id, waveBox) {
  session.waves.allWavesContainerInfo[id] = waveBox;
}

function removeWaveContainerId(id) {
  delete session.waves.allWavesContainerInfo[id];
}

function removeAllWaveContainers(id) {
  for (let id in session.waves.allWavesContainerInfo) {
    removeWaveContainerId(id);
  }
  removeWaveEditMenu();
}

function waveTreeCheckboxClicked(cbox) {
  session.waves.boxTree.CheckboxClicked(cbox);
  waveMenuSubmit(cbox);
}

function findAncestorWaveContainerNode(node) {
  return findAncestorNodeByClassName(node, WAVE_CONTAINER_CLASS);
}

function findAncestorWaveBodyNode(node) {
  return findAncestorNodeByClassName(node, WAVE_BODY_CLASS);
}

function resizeAllWaves() {
  for (let id in session.waves.allWavesContainerInfo) {
    let box = session.waves.allWavesContainerInfo[id];
    box.resizeFonts();
  }
}

var tooManyWavesWarningIssued = false;
function renderAllWaves() {
  for (let id in session.waves.allWavesContainerInfo) {
    let box = session.waves.allWavesContainerInfo[id];
    box.render();
  }
}

function createAllWaves() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  if (numberOfExistingWaveBoxes() == 0) {
    waveInsertInitial(); // always have wave box for user to start with
  }

  renderAllWaves();
}

function waveTitleKeypressListener(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    let titleNode = document.getElementById("WaveTitleId");
    waveMenuSubmit(titleNode);
  }
}

function breathSelectedInMenu(breathInfo, selectOptions) {
  let bInfo = parseBreathInfo(breathInfo);
  // Order below is important
  if (selectOptions.ErrorB) {
    if (bInfo.isError) return true;
  }
  if (selectOptions.AbnormalB) {
    if (bInfo.Abnormal) return true;
  }
  if (selectOptions.MaintenanceB) {
    if (bInfo.isMaintenance) return true;
  }

  // Exceptional Breaths taken care of above
  let isExceptional = bInfo.isError || bInfo.Abnormal || bInfo.isMaintenance;

  if (selectOptions.MandatoryVC) {
    if (bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
  }
  if (selectOptions.SpontaneousVC) {
    if (!bInfo.isMandatory && bInfo.isVC && !isExceptional) return true;
  }
  if (selectOptions.SpontaneousPS) {
    if (!bInfo.isMandatory && !bInfo.isVC && !isExceptional) return true;
  }
  return false;
}

function numWavesInRange() {
  let minBnum = session.waves.range.minBnum;
  if (!minBnum) minBnum = 1;
  let maxBnum = session.waves.range.maxBnum;
  if (!maxBnum) maxBnum = 1;
  let n = 0;
  for (let i = minBnum; i <= maxBnum; i++) {
    if (session.waves.pwData[i] === null) continue;
    if (isUndefined(session.waves.pwData[i])) continue;
    n++;
  }
  return n;
}

function  numSelectedWavesInRange(selectOptions) {
  let minBnum = session.waves.range.minBnum;
  if (!minBnum) minBnum = 1;
  let maxBnum = session.waves.range.maxBnum;
  if (!maxBnum) maxBnum = 1;

  let n = 0;
  for (let i = minBnum; i <= maxBnum; i++) {
    if (session.waves.pwData[i] === null) continue;
    if (isUndefined(session.waves.pwData[i])) continue;
    let breathInfo = session.waves.pwData[i].breathInfo;
    if (!breathSelectedInMenu(breathInfo, selectOptions)) continue;
    n++;
  }
  return n;
}

function installWavesParamSummary() {
  let temp = document.getElementById(PARAM_SUMMARY_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, PARAM_SUMMARY_CLASS);
  let node = template.cloneNode(true);
  let allWaves = document.getElementById("wavesDiv");
  allWaves.insertBefore(node, allWaves.firstElementChild);
  changeAllParamSummaryId(node, "Wave");
}
