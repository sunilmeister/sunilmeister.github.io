// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var breathShapeGraph = null;

function displayShapes() {
  //console.log("displayShapes");
  if (!app.sessionDataValid) {
    modalAlert("Data Gathering in process\nGive us a second and try again");
    return;
  }

  if (breathShapeGraph) {
    breathShapeGraph.destroy();
    delete breathShapeGraph;
  }

  breathShapeGraph = 
    new BreathPressureGraph("Breath Pressure Shapes",800,app.reportRange);
  let n = breathShapeGraph.numShapesInRange();
  if (n > SHAPE_MAX_CHARTS) {
    modalConfirm("Many Breath Shape graphs",
      "It may take time to display all (" + n + ")\n\n" +
      "Consider changing the Range Slider to select a smaller breath range\n",
      doDisplayShapes, null, null, "DISPLAY", "DO NOT DISPLAY");
  } else doDisplayShapes();
}

function doDisplayShapes() {
  div = document.getElementById("shapeGraphBody");
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}
