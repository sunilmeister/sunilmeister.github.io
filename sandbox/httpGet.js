////////////////////////////////////////////////////////////////////////////////
// The dashboard should ONLY use waitForInspireMessages(uidString, callbackFn)
// Switching between dweet.io and  is done in this file ONLY
// Rest of the dashboard code does not have to know that it is switched
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Switch between using dweetio.listen_for and inspireListenFor
// by changing the constant USE_DWEET_FOR_MESSAGES
//
// callbackFn format is callbackFn(jsonObject)
// If jsonObject is null it signifies an error
////////////////////////////////////////////////////////////////////////////////
const USE_DWEET_FOR_MESSAGES = false;
const LISTEN_INTERVAL_IN_MS = 250;

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
var prevResponseTimestamp = Date();
var inspireListenIntervalId = null;

function inspireListenFor(uidString, callbackFn) {
  executeInspireListenFor(uidString, callbackFn);

  // After that call the real work function every LISTEN_INTERVAL_IN_MS
  inspireListenIntervalId = setInterval(
        () => executeInspireListenFor(uidString, callbackFn),
        LISTEN_INTERVAL_IN_MS);
}

function executeInspireListenFor(uidString, callbackFn) {
	let response = fetchMessage(uidString);
  if (!response) return;
  if (typeof response !== 'object') return;
  if (Object.keys(response).length == 0) return;

  let timestamp = response.timestamp;
  if (!timestamp) return;
  if (typeof timestamp !== 'object') return;

  let jsonObject = response.jsonData;
  if (!jsonObject) return;
  if (typeof jsonObject !== 'object') return;
  if (Object.keys(jsonObject).length == 0) return;

  if (prevResponseTimestamp == timestamp) {
    // This is a repeat - do not call the callbackFn
    // console.log("### Repeat message");
    return;
  }

  prevResponseTimestamp = timestamp;
  console.log(timestamp,jsonObject);
  // change the response to be in dweet format
  // so that the rest of the code does not have to change
  // when switching from dweet to inspireListenFor
  var dweetObj = dweetFormat(uidString, timestamp, jsonObject.content);
  callbackFn(dweetObj); // Pass the response to the callbackFn
}

function fetchMessage(uid) {
	let str = "???" ;
	let response = await fetch(str);
  let json = await response.json();
  return json;
}

async function fetch_api_getone(uid) {
    let option = {
        method: 'POST',
        headers:{
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            UID: uid
        }),
    }

    const getoneAPI = "https://inter-ventilator.onrender.com/message/getone";

    const api = await fetch(getoneAPI,option)
        .then((res) => res.json())
        .then((json) => console.log(json))
        .catch((err) => console.log(err))

}

function dweetFormat(uidString, timeStamp, jsonContent) {
  var dweetObj = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : jsonContent,
  };
  return dweetObj;
}
