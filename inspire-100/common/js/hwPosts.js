////////////////////////////////////////////////////////////////////////////////
// The dashboard should ONLY use waitForHwPosts(uidString, callbackFn)
// Switching between dweet.io and  our own API is done in this file ONLY
// Rest of the dashboard code does not have to know that it is switched
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// callbackFn format is callbackFn(jsonPayload)
// If jsonPayload is null it signifies an error
////////////////////////////////////////////////////////////////////////////////
function waitForHwPosts(uidString, callbackFn) {
  if (USE_DWEET_FOR_MESSAGES) {
    chirpio.listen_for(uidString, callbackFn);
  } else {
    inspireListenFor(uidString, callbackFn);
  }
}

////////////////////////////////////////////////////////////////////////////////
// None of the below functions should be called by the Dashboard
// These are private functions
////////////////////////////////////////////////////////////////////////////////
var prevResponseTimestamp = null;
var inspireListenIntervalId = null;
var apiRepeatTime = null;

async function inspireGetone(uidString) {
	let payload = {};
  const getoneAPI = "https://tekmedika.com:3003/inspire100/getone";
  let option = {
      method: 'POST',
      headers:{
          "Content-type": "application/json"
      },
      body: JSON.stringify({ UID: uidString })
  }
  const api = await fetch(getoneAPI,option)
      .then((res) => res.json())
      .then((json) => payload = json)
      .catch((err) => payload = {})

  return payload;
}

async function executeInspireListenFor(uidString, callbackFn) {
	//console.log("Calling getone");
	let getoneContent = await inspireGetone(uidString);
	if (getoneContent.status != 'ok') return;

  let timestamp = new Date(getoneContent.response.updatedAt);

  let payload = getoneContent.response.content;
  if (payload === null) return;
  if (typeof payload !== 'object') return;
  if (Object.keys(payload).length == 0) return;
	//console.log("getone return payload", payload);

	if (prevResponseTimestamp) {
		let prevTMS = prevResponseTimestamp.getTime();
		let currTMS = timestamp.getTime();
		if (prevTMS == currTMS) {
    	// This is a repeat - do not call the callbackFn
			//console.log("Repeat prevTMS", prevTMS, "currTMS", currTMS);
    	return;
  	} else if (prevTMS > currTMS) {
    	// ERROR
			console.error("API getone New=", timestamp, "  < Prev=", prevResponseTimestamp); 
    	return;
		}
  }
  prevResponseTimestamp = new Date(timestamp);
	//console.log("timestamp", prevResponseTimestamp);

  // change the response to be in chirp format
  // so that the rest of the code does not have to change
  // when switching from chirp to inspireListenFor
  let chirpObj = chirpFormat(uidString, timestamp, payload);
  //console.log(timestamp,chirpObj);
  callbackFn(chirpObj); // Pass the response to the callbackFn
}

function inspireListenFor(uidString, callbackFn) {
  executeInspireListenFor(uidString, callbackFn);

  // call the real work function every MESSAGE_LISTEN_INTERVAL_IN_MS
  inspireListenIntervalId = setInterval(
        () => executeInspireListenFor(uidString, callbackFn),
        MESSAGE_LISTEN_INTERVAL_IN_MS);
}

function chirpFormat(uidString, timeStamp, payload) {
  var chirpObj = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : payload,
  };
  return cloneObject(chirpObj);
}
