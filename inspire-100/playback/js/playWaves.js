// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initWaves() {
  removeAllWaveContainers();
  session.waves.allWavesContainerInfo = {};
  let node = document.getElementById(ALL_WAVES_ID);
  node.innerHTML = "";
}
