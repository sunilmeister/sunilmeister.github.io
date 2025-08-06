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

function updateParamSummaryNodeValue(nodeId, nodeIdSuffix, value) {
  let node = document.getElementById(nodeId + nodeIdSuffix);
  updateDivValue(node, value);
}

function updateParamSummaryNodeText(nodeId, nodeIdSuffix, value) {
  let node = document.getElementById(nodeId + nodeIdSuffix);
  updateDivText(node, value);
}

function updateParamSummary(nodeIdSuffix, range) {
  updateParamSummarySystem(nodeIdSuffix);

  let summary = gatherParamSummary(range);

  let sectionText = "Parameter Settings";
  if (summary.breathNum) sectionText += " @ Breath #" + summary.breathNum;
  updateParamSummaryNodeText("paramSummarySettingsSection", nodeIdSuffix, sectionText);

  sectionText = "Measured Parameters";
  if (summary.breathNum) sectionText += " @ Breath #" + summary.breathNum;
  updateParamSummaryNodeText("paramSummaryMeasureSection", nodeIdSuffix, sectionText);

  // Update mode
	if (isValidValue(summary.mode)) {
		let modeText =  MODE_DECODER[summary.mode];
		if (summary.mode == 3) { // PSV
			modeText = modeText + " (BiPAP)";
		}
    updateParamSummaryNodeText("paramSummaryMode", nodeIdSuffix, modeText);
	}

  // Switch between PSV and other modes
  if (MODE_DECODER[summary.mode] == "PSV") {
    updateParamSummaryNodeText("paramSummaryVtMvHeading", nodeIdSuffix, "MV");
    updateParamSummaryNodeText("paramSummaryVtMvUnits", nodeIdSuffix, "(ltr/min)");
    updateParamSummaryNodeValue("paramSummaryRr", nodeIdSuffix, null);
    updateParamSummaryNodeValue("paramSummaryIe", nodeIdSuffix, null);
		if (summary.mv) {
      updateParamSummaryNodeValue("paramSummaryVtMv", nodeIdSuffix, summary.mv);
		} else {
      updateParamSummaryNodeValue("paramSummaryVtMv", nodeIdSuffix, null);
		}
  } else {
    updateParamSummaryNodeText("paramSummaryVtMvHeading", nodeIdSuffix, "VT");
    updateParamSummaryNodeText("paramSummaryVtMvUnits", nodeIdSuffix, "(ml)");
    updateParamSummaryNodeValue("paramSummaryRr", nodeIdSuffix, summary.rr);
    updateParamSummaryNodeValue("paramSummaryIe", nodeIdSuffix, summary.ie);
    updateParamSummaryNodeValue("paramSummaryVtMv", nodeIdSuffix, summary.vt);
  }

  updateParamSummaryNodeValue("paramSummaryIPeep", nodeIdSuffix, summary.ipeep);
  updateParamSummaryNodeValue("paramSummaryPs", nodeIdSuffix, summary.ps);
  updateParamSummaryNodeValue("paramSummaryTps", nodeIdSuffix, summary.tps);
  updateParamSummaryNodeValue("paramSummaryFiO2", nodeIdSuffix, summary.fiO2);

  updateParamSummaryNodeValue("paramSummaryMvdel", nodeIdSuffix, summary.mvdel);
  updateParamSummaryNodeValue("paramSummaryVtdel", nodeIdSuffix, summary.vtdel);
  updateParamSummaryNodeValue("paramSummaryPeak", nodeIdSuffix, summary.peak);
  updateParamSummaryNodeValue("paramSummaryPlat", nodeIdSuffix, summary.plat);
  updateParamSummaryNodeValue("paramSummaryMPeep", nodeIdSuffix, summary.mpeep);

  let bpm = 0;
  if (isValidValue(summary.sbpm)) {
    bpm += summary.sbpm;
  }
  if (isValidValue(summary.mbpm)) {
    bpm += summary.mbpm;
  }
  if (bpm == 0) bpm = null;

  updateParamSummaryNodeValue("paramSummaryBpm", nodeIdSuffix, bpm);
}

function updateParamSummarySystem(nodeIdSuffix) {
  let imgDiv = document.getElementById("paramSummarySystemImg" + nodeIdSuffix);
  if (!imgDiv) return;

  let captionDiv = document.getElementById("paramSummarySystemSection" + nodeIdSuffix);

  let state = session.params.state.LastChangeValue();
  let attention = session.params.attention.LastChangeValue();
  let errorTag = session.params.errorTag.LastChangeValue();
  
  if (session.appId == PLAYBACK_APP_ID) {
    captionDiv.innerHTML = "Playback";
    captionDiv.style.color = palette.darkblue;
    imgDiv.src = "../common/img/playbackIcon.png";
    return;
  }


  if ((state == ERROR_STATE) || (errorTag == true)) {
    captionDiv.style.color = palette.darkred;
    captionDiv.innerHTML = "ERROR";
    imgDiv.src = "../common/img/Error.png";
  } else if (attention) {
    captionDiv.style.color = palette.darkorange;
    captionDiv.innerHTML = "WARNING";
    imgDiv.src = "../common/img/Warning.png";
  } else if (state == STANDBY_STATE) {
    captionDiv.style.color = palette.darkorange;
    captionDiv.innerHTML = "STANDBY";
    imgDiv.src = "../common/img/StandbyLED.png";
  } else {
    captionDiv.style.color = palette.green;
    captionDiv.innerHTML = "ACTIVE";
    imgDiv.src = "../common/img/ActiveLED.png";
  }
}

