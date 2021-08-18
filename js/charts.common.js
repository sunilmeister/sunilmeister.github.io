// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const graphColors = [
  "Maroon",
  "Blue",
  "Green",
  "Indigo",
  "Purple",
  "Olive",
  "Fuchsia",
  "Aqua",
  "Navy",
  "Silver",
  "Crimson",
  "Slategrey",
  "Violet",
  "SteelBlue",
];
var nextChartColor = 0;

function getNextChartColor() {
  color = graphColors[nextChartColor++];
  if (nextChartColor==graphColors.length) nextChartColor = 0;
  return color;
}

var chartTemplate = {
  title:{ text: "" },
  axisX:{ title: "", },
  axisY:[],
  toolTip: { shared: true },
  legend: { 
    cursor: "pointer", 
    itemclick: toggleDataSeries
  },
  height: 500,
  data: []
};

function toggleDataSeries(e) {
  if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}


