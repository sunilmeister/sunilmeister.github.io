// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// Param summary data gathered for the end of the range
function gatherParamSummary(range) {
  let summary = {};
  let params = session.params;

  // keep track of the summaryshot time
  summary.time = range.maxTime;
  if (summary.time === null) return summary;

  // Breath number closest to the time
  summary.breathNum = lookupBreathNum(summary.time);

  // input settings
  summary.mode        = params.mode.ValueAtTime(summary.time);
  summary.vt          = params.vt.ValueAtTime(summary.time);
  summary.mv          = params.mv.ValueAtTime(summary.time);
  summary.rr          = params.rr.ValueAtTime(summary.time);
  summary.ie          = params.ie.ValueAtTime(summary.time);
  summary.ipeep       = params.ipeep.ValueAtTime(summary.time);
  summary.pmax        = params.pmax.ValueAtTime(summary.time);
  summary.ps          = params.ps.ValueAtTime(summary.time);
  summary.tps         = params.tps.ValueAtTime(summary.time);
  summary.fiO2        = params.fiO2.ValueAtTime(summary.time);

  // measured parameters
  summary.state       = params.state.ValueAtTime(summary.time);
  summary.vtdel       = params.vtdel.ValueAtTime(summary.time);
  summary.mvdel       = params.mvdel.ValueAtTime(summary.time);
  summary.mmvdel      = params.mmvdel.ValueAtTime(summary.time);
  summary.smvdel      = params.smvdel.ValueAtTime(summary.time);
  summary.sbpm        = params.sbpm.ValueAtTime(summary.time);
  summary.mbpm        = params.mbpm.ValueAtTime(summary.time);
  summary.btype       = params.btype.ValueAtTime(summary.time);
  summary.bcontrol    = params.bcontrol.ValueAtTime(summary.time);
  summary.scomp       = params.scomp.ValueAtTime(summary.time);
  summary.dcomp       = params.dcomp.ValueAtTime(summary.time);
  summary.peak        = params.peak.ValueAtTime(summary.time);
  summary.plat        = params.plat.ValueAtTime(summary.time);
  summary.mpeep       = params.mpeep.ValueAtTime(summary.time);
  summary.o2FlowX10   = params.o2FlowX10.ValueAtTime(summary.time);

  return summary;
}

function changeAllParamSummaryId(paramSummaryNode, suffix) {
  let allNodes = getAllNodeDescendants(paramSummaryNode);
  for (let i=0; i<allNodes.length; i++) {
    let node = allNodes[i];
    let nodeId = node.id;
    if (nodeId) {
      node.id = nodeId + suffix;
    }
  }
}
