// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initWaves() {
  allWaveDivs = [];
  for (id in session.waves.allWavesContainerInfo) {
    allWaveDivs.push(id);
  }
  session.waves.allWavesContainerInfo = {};
  for (i=0; i<allWaveDivs.length; i++) {
    id = allWaveDivs[i];
    node = document.getElementById(id);
    node.remove();
  }
}
