// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all waveform user-interface utilities
/////////////////////////////////////////////////////////////////

function waveInsertOnTop() {
  allWaves = document.getElementById(ALL_WAVES_ID);
  //console.log("waveInsertOnTop ");
  newContainer = createNewWaveContainer();
  allWaves.insertBefore(newContainer, allWaves.firstChild);
  // Open edit menu for the new wave box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveInsert(bnode) {
  containerNode = findAncestorWaveContainerNode(bnode);
  //console.log("waveInsert " + containerNode.id);
  newContainer = createNewWaveContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  // Open edit menu for the new wave box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveAppend(bnode) {
  containerNode = findAncestorWaveContainerNode(bnode);
  //console.log("waveAppend " + containerNode.id);
  newContainer = createNewWaveContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  // Open edit menu for the new wave box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  waveEdit(enode);
}

function waveEdit(bnode) {
  removeWaveEditMenu();
  containerNode = findAncestorWaveContainerNode(bnode);
  //console.log("waveEdit " + containerNode.id);
  temp = document.getElementById(WAVE_EDIT_MENU_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content, WAVE_EDIT_WAVE_MENU_CLASS);
  node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  session.waves.boxTree = new CheckboxTree(WAVE_CBOX_TREE_ROOT_ID);
  box = session.waves.allWavesContainerInfo[containerNode.id];
  box.updateMenu(WAVE_EDIT_WAVE_MENU_ID);
  session.waves.boxTree.PropagateFromLeafCheckboxes();
}

function waveDelete(bnode) {
  containerNode = findAncestorWaveContainerNode(bnode);
  //console.log("waveDelete " + containerNode.id);
  removeWaveContainerId(containerNode.id);
  containerNode.remove();
  if (numberOfExistingWaves() == 0) {
    modalWarning("WAVEFORM BOX", "No Waveform container left\nCreating new empty one");
    waveInsertOnTop();
  } else {
    removeWaveEditMenu();
  }
}

function removeWaveEditMenu() {
  if (session.waves.boxTree) delete session.waves.boxTree;
  menuDiv = document.getElementById(WAVE_EDIT_WAVE_MENU_ID);
  if (!menuDiv) return;
  menuDiv.remove();
}

function waveMenuCancel(bnode) {
  containerNode = findAncestorWaveContainerNode(bnode);
  console.log("waveMenuCancel " + containerNode.id);
  removeWaveEditMenu();
}

function waveMenuSubmit(bnode) {
  containerNode = findAncestorWaveContainerNode(bnode);
  box = session.waves.allWavesContainerInfo[containerNode.id];
  box.updateOptions(WAVE_EDIT_WAVE_MENU_ID);
  //removeWaveEditMenu();
  box.render();
}

var currentWaveContainerNum = 0;

function createNewWaveContainer() {
  temp = document.getElementById(WAVE_CONTAINER_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content, WAVE_CONTAINER_CLASS);
  node = template.cloneNode(true);
  node.id = WAVE_CONTAINER_ID_PREFIX + (currentWaveContainerNum++);
  body = findChildNodeByClass(node, WAVE_BODY_CLASS);
  box = new WaveBox(body);
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
  obj = session.waves.allWavesContainerInfo[id];
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

function createAllWaves() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  if (numberOfExistingWaveBoxes() == 0) {
    waveInsertOnTop(); // always have wave box for user to start with
  }

  if (session.waves.firstTimeWavesEntry) {
    //showEditIconReminder();
    session.waves.firstTimeWavesEntry = false;
  }

  for (id in session.waves.allWavesContainerInfo) {
    session.waves.allWavesContainerInfo[id].render();
  }

}


