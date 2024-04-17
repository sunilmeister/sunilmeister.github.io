// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function initWaves() {
  let allWaveDivs = [];
  for (let id in session.waves.allWavesContainerInfo) {
    allWaveDivs.push(id);
  }
  session.waves.allWavesContainerInfo = {};
  for (let i=0; i<allWaveDivs.length; i++) {
    let id = allWaveDivs[i];
    let node = document.getElementById(id);
    node.remove();
  }
}
