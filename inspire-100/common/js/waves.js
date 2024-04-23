// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all waveform user-interface utilities
/////////////////////////////////////////////////////////////////

var currentWaveContainerNum = 0;

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
  removeWaveEditMenu();
  let containerNode = findAncestorWaveContainerNode(bnode);
  let temp = document.getElementById(WAVE_EDIT_MENU_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, WAVE_EDIT_WAVE_MENU_CLASS);
  let node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  session.waves.boxTree = new CheckboxTree(WAVE_CBOX_TREE_ROOT_ID);
  let box = session.waves.allWavesContainerInfo[containerNode.id];
  box.updateMenu(WAVE_EDIT_WAVE_MENU_ID);
  session.waves.boxTree.PropagateFromLeafCheckboxes();
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
  } else {
    removeWaveEditMenu();
  }
}

function removeWaveEditMenu() {
  if (session.waves.boxTree) delete session.waves.boxTree;
  let menuDiv = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);
  if (!menuDiv) return;
  let titleNode = document.getElementById("WaveTitleId");
  titleNode.addEventListener("keypress", waveTitleKeypressListener);
  menuDiv.remove();
}

function waveMenuCancel(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  removeWaveEditMenu();
}

function waveMenuSubmit(bnode) {
  let containerNode = findAncestorWaveContainerNode(bnode);
  let box = session.waves.allWavesContainerInfo[containerNode.id];
  box.updateOptions(WAVE_EDIT_WAVE_MENU_ID);
  //removeWaveEditMenu();
  box.render();
}

function createNewWaveContainer() {
  let temp = document.getElementById(WAVE_CONTAINER_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, WAVE_CONTAINER_CLASS);
  let node = template.cloneNode(true);
  node.id = WAVE_CONTAINER_ID_PREFIX + (currentWaveContainerNum++);
  let body = findChildNodeByClass(node, WAVE_BODY_CLASS);
  let box = new WaveBox(body);
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

	renderAllWaves();
}

function renderAllWaves() {
  for (let id in session.waves.allWavesContainerInfo) {
    session.waves.allWavesContainerInfo[id].render();
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
