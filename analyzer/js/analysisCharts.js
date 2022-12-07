function createAnalysisCharts() {
  cleanupCharts();
  app.chartsXrange = {
    doFull: true,
    initBnum:1, 
    minBnum:app.analysisStartBreath, 
    maxBnum:app.analysisEndBreath,
    missingBnum:cloneObject(session.missingBreathWindows),
    initTime:app.logStartTime, 
    minTime:app.analysisStartTime, 
    maxTime:app.analysisEndTime,
    missingTime:cloneObject(session.missingTimeWindows)
  };

  for (id in app.allChartsContainerInfo) {
    app.allChartsContainerInfo[id].render();
  }
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!app.globalDataValid) {
    alert("Data Gathering in process\nGive us a second and try again");
    return;
  }
  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  
  createAnalysisCharts();
}

function cleanupCharts() {
}

function initCharts() {
}

