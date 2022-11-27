function createAnalysisCharts() {
  cleanupCharts();
  chartsXrange = {
    doFull: true,
    initBnum:0, 
    minBnum:1, 
    maxBnum:breathTimes.length,
    missingBnum:cloneObject(missingBreathWindows),
    initTime:logStartTime, 
    minTime:analysisStartTime, 
    maxTime:analysisEndTime,
    missingTime:cloneObject(missingTimeWindows)
  };

  for (id in allChartContainerInfo) {
    allChartContainerInfo[id].render();
  }
}

////////////////////////////////////////////////////////

function displayCharts() {
  //console.log("displayCharts");
  if (!globalDataValid) {
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

