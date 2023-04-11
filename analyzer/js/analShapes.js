// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createAnalysisShapes() {
  createAllShapes();
}

function displayShapes() {
  //console.log("displayShapes");
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }
  if (numberOfExistingShapeBoxes() == 0) {
    shapeInsertOnTop(); // always have shape box for user to start with
  }
  createAnalysisShapes();
}

function initShapes() {
  allShapeDivs = [];
  for (id in session.shapes.allShapesContainerInfo) {
    allShapeDivs.push(id);
  }
  session.shapes.allShapesContainerInfo = {};
  for (i=0; i<allShapeDivs.length; i++) {
    id = allShapeDivs[i];
    node = document.getElementById(id);
    node.remove();
  }
}
