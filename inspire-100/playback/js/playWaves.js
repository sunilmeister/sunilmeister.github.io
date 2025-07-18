// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initWaves() {
  removeAllWaveContainers();
  session.waves.allWavesContainerInfo = {};
  let node = document.getElementById("wavesDiv");
  let allChildNodes = node.childNodes;
  for (let i=0; i<allChildNodes.length; i++) {
    let child = allChildNodes[i];
    let classes = child.classList;
    if (!isUndefined(classes) && (classes !== null) && classes.length) {
      if (classes[0] == "waveContainer") node.removeChild(child);
    }
  }
}
