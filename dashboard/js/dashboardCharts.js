// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var prevMinBreathNum = 0;
var prevMaxBreathNum = 0;

var chartCreationInProgress = false;
function createDashboardCharts() {
  if (chartCreationInProgress) return;
  chartCreationInProgress = true;

  if (numberOfExistingCharts()==0) {
    chartInsertOnTop(); // always have chart box for user to start with
  }  
  chartsXrange = {
    doFull: false,
    initBnum:0, 
    minBnum:minChartBreathNum , 
    maxBnum:maxChartBreathNum ,
    missingBnum:cloneObject(missingBreathWindows),
    initTime:startDate, 
    minTime:breathTimes[minChartBreathNum].time, 
    maxTime:breathTimes[maxChartBreathNum].time,
    missingTime:cloneObject(missingTimeWindows)
  };
  
  for (id in allChartContainerInfo) {
    initGraphColor();
    allChartContainerInfo[id].render();
  }


  prevMinBreathNum = chartsXrange.minBnum;
  prevMaxBreathNum = chartsXrange.maxBnum;
  chartCreationInProgress = false;
}

////////////////////////////////////////////////////////

function createChartRangeSlider(div) {
  chartSliderPresent = true;
  chartRangeSlider = new IntRangeSlider(
    div,
    0,
    MAX_CHART_DATAPOINTS,
    0,
    0,
    1
  );
  chartRangeSlider.setChangeCallback(chartRangeSliderCallback);
}

function chartRangeSliderCallback() {
  //console.log("chartRangeSliderCallback");
  values = chartRangeSlider.getSlider();
  selectChartRange(chartRangeSlider, values[0], values[1]);
  createDashboardCharts();
}

function selectChartRange(slider, minB, maxB) {
  l = Number(minB);
  r = Number(maxB);
  if (dashboardBreathNum) {
    if (r>dashboardBreathNum) r = dashboardBreathNum;
    if (l<1) l = 1;
  } else {
    r = l = 0;
  }

  minChartBreathNum = l;
  maxChartBreathNum = r;
  //console.log("Select min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  slider.setSlider([l, r]);
}

function updateChartRangeOnNewBreath(num) {
  chartRangeLimit = dashboardBreathNum;
  if (chartRangeLimit==1) chartRangeLimit=2; // max must be > min
  chartRangeSlider.setRange([1, chartRangeLimit]);

  // If update is paused
  if (updatePaused) return;

  //console.log("Before min=" + minChartBreathNum + " max=" + maxChartBreathNum);

  maxChartBreathNum = dashboardBreathNum;
  minChartBreathNum = maxChartBreathNum - MAX_CHART_DATAPOINTS + 1;
  if (minChartBreathNum <= 0) {
    minChartBreathNum = 1;
  }
  //console.log("After min=" + minChartBreathNum + " max=" + maxChartBreathNum);
  chartRangeSlider.setSlider([minChartBreathNum, maxChartBreathNum]);
}

