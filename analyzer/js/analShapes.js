// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

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
