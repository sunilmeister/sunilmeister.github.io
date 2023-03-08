// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var firstTimeShapesEntry = true;

function createAnalysisShapes() {
  if (firstTimeShapesEntry) {
    showEditIconReminder();
    firstTimeShapesEntry = false;
  }

  for (id in session.shapes.allShapesContainerInfo) {
    session.shapes.allShapesContainerInfo[id].render();
  }
}

function displayShapes() {
  //console.log("displayShapes");
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }
  if (numberOfExistingShapes() == 0) {
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
