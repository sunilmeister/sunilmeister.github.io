////////////////////////////////////////////////////////////////////////////////
// The dashboard should ONLY use waitForInspireMessages(uidString, callbackFn)
// Switching between dweet.io and  is done in this file ONLY
// Rest of the dashboard code does not have to know that it is switched
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// callbackFn format is callbackFn(jsonPayload)
// If jsonPayload is null it signifies an error
////////////////////////////////////////////////////////////////////////////////
function waitForInspireMessages(uidString, callbackFn) {
  if (USE_DWEET_FOR_MESSAGES) {
    dweetio.listen_for(uidString, callbackFn);
  } else {
    inspireListenFor(uidString, callbackFn);
  }
}

////////////////////////////////////////////////////////////////////////////////
// None of the below functions should be called by the Dashboard
// These are private functions
////////////////////////////////////////////////////////////////////////////////
var prevResponseTimestamp = new Date();
var inspireListenIntervalId = null;

async function inspireGetone(uidString) {
	let payload = {};
  const getoneAPI = "https://inspire-100.com:3003/message/getone";
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
	let getoneContent = await inspireGetone(uidString);
	if (getoneContent.status != 'ok') return;

  let timestamp = new Date(getoneContent.response.updatedAt);

  let payload = getoneContent.response.content;
  if (payload === null) return;
  if (typeof payload !== 'object') return;
  if (Object.keys(payload).length == 0) return;

	let prevTMS = prevResponseTimestamp.getTime();
	let currTMS = timestamp.getTime();
	if (prevTMS == currTMS) {
    // This is a repeat - do not call the callbackFn
    return;
  }
  prevResponseTimestamp = new Date(timestamp);

  // change the response to be in dweet format
  // so that the rest of the code does not have to change
  // when switching from dweet to inspireListenFor
  let dweetObj = dweetFormat(uidString, timestamp, payload);
  //console.log(timestamp,dweetObj);
  callbackFn(dweetObj); // Pass the response to the callbackFn
}

function inspireListenFor(uidString, callbackFn) {
  executeInspireListenFor(uidString, callbackFn);

  // After that call the real work function every LISTEN_INTERVAL_IN_MS
  inspireListenIntervalId = setInterval(
        () => executeInspireListenFor(uidString, callbackFn),
        MESSAGE_LISTEN_INTERVAL_IN_MS);
}

function dweetFormat(uidString, timeStamp, payload) {
  var dweetObj = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : payload,
  };
  return cloneObject(dweetObj);
}
