// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all shape user-interface utilities
/////////////////////////////////////////////////////////////////

function shapeInsertOnTop() {
  allShapes = document.getElementById(ALL_SHAPES_ID);
  //console.log("shapeInsertOnTop ");
  newContainer = createNewShapeContainer();
  allShapes.insertBefore(newContainer, allShapes.firstChild);
  removeShapeEditMenu();
}

function shapeInsert(bnode) {
  containerNode = findAncestorShapeContainerNode(bnode);
  //console.log("shapeInsert " + containerNode.id);
  newContainer = createNewShapeContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  removeShapeEditMenu();
}

function shapeAppend(bnode) {
  containerNode = findAncestorShapeContainerNode(bnode);
  //console.log("shapeAppend " + containerNode.id);
  newContainer = createNewShapeContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  removeShapeEditMenu();
}

function shapeEdit(bnode) {
  removeShapeEditMenu();
  containerNode = findAncestorShapeContainerNode(bnode);
  //console.log("shapeEdit " + containerNode.id);
  temp = document.getElementById(SHAPE_EDIT_MENU_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content,SHAPE_EDIT_SHAPE_MENU_CLASS);
  node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  app.shapeCboxTree = new CheckboxTree(SHAPE_CBOX_TREE_ROOT_ID);
  box = app.allShapesContainerInfo[containerNode.id];
  box.updateMenu(SHAPE_EDIT_SHAPE_MENU_ID);
  app.shapeCboxTree.PropagateFromLeafCheckboxes();
}

function shapeDelete(bnode) {
  containerNode = findAncestorShapeContainerNode(bnode);
  //console.log("shapeDelete " + containerNode.id);
  removeShapeContainerId(containerNode.id);
  containerNode.remove();
  if (numberOfExistingShapes()==0) {
    modalWarning("SHAPE BOX", "No shape container left\nCreating new empty one");
    shapeInsertOnTop();
  }
  removeShapeEditMenu();
}

function removeShapeEditMenu() {
  if (app.shapeCboxTree) delete app.shapeCboxTree;
  menuDiv = document.getElementById(SHAPE_EDIT_SHAPE_MENU_ID);
  if (!menuDiv) return;
  menuDiv.remove();
}

function shapeMenuCancel(bnode) {
  containerNode = findAncestorShapeContainerNode(bnode);
  console.log("shapeMenuCancel " + containerNode.id);
  removeShapeEditMenu();
}

function shapeMenuSubmit(bnode) {
  containerNode = findAncestorShapeContainerNode(bnode);
  box = app.allShapesContainerInfo[containerNode.id];
  box.updateOptions(SHAPE_EDIT_SHAPE_MENU_ID);
  removeShapeEditMenu();
  box.render();
}

var currentShapeContainerNum = 0;
function createNewShapeContainer() {
  temp = document.getElementById(SHAPE_CONTAINER_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content,SHAPE_CONTAINER_CLASS);
  node = template.cloneNode(true);
  node.id = SHAPE_CONTAINER_ID_PREFIX + (currentShapeContainerNum++) ;
  body = findChildNodeByClass(node,SHAPE_BODY_CLASS);
  box = new ShapeBox(body);
  storeShapeContainerId(node.id,box);
  return node;
}

function numberOfExistingShapes() {
  return (Object.keys(app.allShapesContainerInfo).length);
}

function findShapeContainerId(id) {
  obj = app.allShapesContainerInfo[id];
  if (!obj || (typeof obj == 'undefined')) return null;
  return obj;
}

function storeShapeContainerId(id, shapeBox) {
  app.allShapesContainerInfo[id] = shapeBox;
}

function removeShapeContainerId(id) {
  delete app.allShapesContainerInfo[id];
}

function shapeTreeCheckboxClicked(cbox) {
  app.shapeCboxTree.CheckboxClicked(cbox);
}

function findAncestorShapeContainerNode(node) {
  return findAncestorNodeByClassName(node,SHAPE_CONTAINER_CLASS);
}

function findAncestorShapeBodyNode(node) {
  return findAncestorNodeByClassName(node,SHAPE_BODY_CLASS);
}

