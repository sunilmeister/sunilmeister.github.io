// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function startKeypressTimeout() {
  //console.log("startKeypressTimeout");
  session.keypressTimeoutDelaySeconds = 600; // 10min
  session.keypressIdleAction = dashKeypressIdle;
  resetKeypressTimer(); // initialize the keypress checker
}

function dashKeypressIdle() {
}
  

