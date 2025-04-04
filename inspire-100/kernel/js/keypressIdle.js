// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

let keypressTimeoutId = null; // Variable to hold the timeout ID
const idleTime = 5000; // Time in milliseconds to consider inactivity (e.g., 5 seconds)

// Function to reset the inactivity timer
function resetKeypressTimer() {
  if (!session.keypressTimeoutDelaySeconds) return;
  let delay = session.keypressTimeoutDelaySeconds * 1000;

  if (keypressTimeoutId) clearTimeout(keypressTimeoutId); // Clear the previous timer
  keypressTimeoutId = setTimeout(keypressIdleAction, delay); // Start a new timer
}

// Function to execute when the user is idle
function keypressIdleAction() {
  //console.log("No keys pressed for some time. User is idle.");
  if (session.keypressIdleAction) session.keypressIdleAction();
  resetKeypressTimer();
}

// Attach event listeners for keypress events
document.addEventListener('keydown', resetKeypressTimer);
document.addEventListener('keyup', resetKeypressTimer);
document.addEventListener('keypress', resetKeypressTimer);
document.addEventListener('click', resetKeypressTimer);

