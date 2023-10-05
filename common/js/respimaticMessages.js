////////////////////////////////////////////////////////////////////////////////
// The dashboard should ONLY use waitForRespimaticMessages(uidString, callbackFn)
// Switching between dweet.io and  is done in this file ONLY
// Rest of the dashboard code does not have to know that it is switched
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Switch between using dweetio.listen_for and respimaticListenFor
// by changing the constant USE_DWEET_FOR_MESSAGES
//
// callbackFn format is callbackFn(jsonObject)
// If jsonObject is null it signifies an error
////////////////////////////////////////////////////////////////////////////////
const USE_DWEET_FOR_MESSAGES = true;
const LISTEN_INTERVAL_IN_MS = 250;

function waitForRespimaticMessages(uidString, callbackFn) {
  if (USE_DWEET_FOR_MESSAGES) {
    dweetio.listen_for(uidString, callbackFn);
  } else {
    respimaticListenFor(uidString, callbackFn);
  }
}

////////////////////////////////////////////////////////////////////////////////
// None of the below functions should be called by the Dashboard
// These are private functions
////////////////////////////////////////////////////////////////////////////////
var prevResponseTimestamp = Date();
var respimaticListenIntervalId = null;

function executeRespimaticListenFor(uidString, callbackFn) {
  $.ajax({
    url: 'http://respimaticlisten.atmanirbhar.org/display_json_response',
    method: 'POST',
    data: {uid: uidString},
    success: function (response) {
      var timestamp = response.timestamp;
      if (!timestamp || $.isEmptyObject(timestamp) ) return;

      var jsonObject = response.jsonData;
      if (jsonObject === null) return;
      if (typeof jsonObject !== 'object') return;
      if (Object.keys(jsonObject).length == 0) return;

      if (prevResponseTimestamp == timestamp) {
        // This is a repeat - do not call the callbackFn
        return;
      }

      if (response.data == 'success') {
        prevResponseTimestamp = timestamp;
        console.log(timestamp,jsonObject);
        // change the response to be in dweet format
        // so that the rest of the code does not have to change
        // when switching from dweet to respimaticListenFor
        var dweetObj = dweetFormat(uidString, timestamp, jsonObject.response.content);
        callbackFn(dweetObj); // Pass the response to the callbackFn
      }
    }
  });
}

function respimaticListenFor(uidString, callbackFn) {
  executeRespimaticListenFor(uidString, callbackFn);

  // After that call the real work function every LISTEN_INTERVAL_IN_MS
  respimaticListenIntervalId = setInterval(
        () => executeRespimaticListenFor(uidString, callbackFn),
        LISTEN_INTERVAL_IN_MS);
}

function dweetFormat(uidString, timeStamp, jsonContent) {
  var dweetObj = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : jsonContent,
  };
  return cloneObject(dweetObj);
}
