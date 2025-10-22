// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

const BUZZER_CHECK_TIMEOUT_INTERVAL_IN_MS = 30000;
  
setTimeout(function checkBuzzerStatus() {
  checkBuzzerDisabled();
  setTimeout(checkBuzzerStatus, BUZZER_CHECK_TIMEOUT_INTERVAL_IN_MS);
}, BUZZER_CHECK_TIMEOUT_INTERVAL_IN_MS)

function checkBuzzerDisabled() {
  if (!session.buzzerMuted) return;
  buzzerMuteUnmuteCallback(true);
}

function buzzerMuteUnmuteCallback(muted) {
  let caption, msg;
  if (muted) {
    caption = "Alarm Buzzer MUTED on Front Panel";
    msg = "BUZZER DISABLED";
  } else {
    caption = "Alarm Buzzer UNMUTED on Front Panel";
    msg = "BUZZER RE-ENABLED";
  }
  modalInfo(caption, msg);
}
