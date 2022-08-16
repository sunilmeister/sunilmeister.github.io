// returns the Y-axis number for possible reuse
// or null if no graph created
// yAxisInfo = {primary:true, reuse:false, yName:"", yMin:1, yMax:null, reuseAxisNum:2}
// flags = {warning:true, error:false}
// paramInfo = {name:"", transitions:[], color:""}
function addGraph(chart, yAxisInfo, breathTimes, flags, paramInfo) {
  var paramTransitions = paramInfo.transitions;
  var paramName = paramInfo.name;
  var paramColor = paramInfo.color;

  var xyPoints = chart.createXYPoints(breathTimes, paramTransitions, null, null, 
    flags.error, flags.warning);
  if (!xyPoints.dataPoints || (xyPoints.dataPoints.length==0)) return null;

  var yAxis = null;
  if (!yAxisInfo.reuse) {
    yAxis = chart.createYaxis(yAxisInfo.yName, paramColor, yAxisInfo.yMin, yAxisInfo.yMax);
    if (yAxisInfo.primary) {
      return chart.addXYPointsPrimaryYNew(yAxis, paramName, paramColor,  xyPoints);
    } else {
      chart.addXYPointsSecondaryYNew(yAxis, paramName, paramColor,  xyPoints);
      return null;
    }
  } else {
    if (yAxisInfo.primary) {
      return chart.addXYPointsPrimaryYReuse(
	  yAxisInfo.reuseAxisNum, paramName, paramColor,  xyPoints);
    } else {
      chart.addXYPointsSecondaryYReuse(paramName, paramColor,  xyPoints);
      return null;
    }
  }
  return null;
}
