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
  minBnum = app.reportsXrange.minBnum;
  maxBnum = app.reportsXrange.maxBnum;
  if ((!minBnum) || (!maxBnum)) return;
  app.reportsXrange.initTime = app.startDate;
  app.reportsXrange.minTime = session.breathTimes[minBnum].time;
  app.reportsXrange.maxTime = session.breathTimes[maxBnum].time;

  if (breathShapeGraph) {
    breathShapeGraph.destroy();
    delete breathShapeGraph;
  }

  div = document.getElementById("shapeGraphBody");
  breathShapeGraph = new BreathPressureGraph("Breath Pressure Shapes",800,app.reportsXrange);
  breathShapeGraph.addGraph();
  breathShapeGraph.render(div);
}

