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

  div = document.getElementById("shapeGraphBody");
  breathShapeGraph = new BreathPressureGraph("Breath Pressure Shapes",800,app.reportRange);
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

