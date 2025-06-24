// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var maxMILLIS = null;
var chirpQ = null;
var startMillis = null;

function disassembleAndQueueChirp(d) {
  let fragmentIndex = 0;
  while (1) {
    let key = String(fragmentIndex);
    fragmentIndex++;

    if (isUndefined(d.content[key])) break;
    let fragment = d.content[key];
    let millisStr = String(fragment.MILLIS);
    //console.log("millisStr",millisStr);
    let obj = parseMillis(millisStr);
    let millis = Number(obj.millis);

		// ERROR detection
    if (millis == null) {
			console.error("*** MILLIS checksum error");
			continue // ignore this malformed chirp
		} else if (maxMILLIS && (millis < maxMILLIS)) {
      let diff = maxMILLIS - millis;
			// MILLIS should be monotonically increasing
			// unless the chirps arrive out of order because of network buffering and latency
      if (diff > 100) {
        // Up to 100ms can be caused by Arduino and NodeMcu crystal frequency drift
			  console.log("*** Chirp out of order: Last MILLIS",maxMILLIS, " > New MILLIS",millis);
      }
		}

		// Reach here if all is good - no ERRORs
    if (!startMillis) startMillis = millis;
    let date = null;
		if (session.firstChirpDate === null) {
      session.firstChirpDate = new Date(d.created);
    }
    date = new Date(session.firstChirpDate);

    fragment.created = new Date(addMsToDate(date, (millis - startMillis)));
    fragment.MILLIS = String(millis);
    chirpQ.push(cloneObject(fragment));

		// For error checking the next round
		if (!maxMILLIS || (maxMILLIS < millis)) maxMILLIS = millis;
  }
}

function initChirpQ() {
  chirpQ = new Queue();
}
