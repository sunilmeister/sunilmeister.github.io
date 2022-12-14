// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var breathShapeGraph = null;

function displayShapes() {
  //console.log("displayShapes");
  if (!app.sessionDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
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
    if (!confirm("Too many (" + n + ") Breath Shape graphs\n" +
      "It may take time to display all\n" +
      "Consider changing the Range Slider to select a smaller breath range\n" +
      "Recommended is 8 at a time\n\n" +
      "OK to display anyway\n" +
      "CANCEL to NOT display\n")) return;
  }

  div = document.getElementById("shapeGraphBody");
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

