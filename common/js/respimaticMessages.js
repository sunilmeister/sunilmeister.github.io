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
var prevResponseTimestamp = null;
function respimaticListenFor(uidString, callbackFn) {
  // Call the real work function immediately
  executeRespimaticListenFor(uidString, callbackFn);

  // After that call the real work function every 10ms
  intervalId = setInterval(executeRespimaticListenFor(uidString, callbackFn), 10);
}

// This function does the actual listening
function executeRespimaticListenFor(uidString, callbackFn) {
 $.ajax({
      url: 'http://respimaticlisten.atmanirbhar.org/display_json_response',
      method: 'POST',
      data: {uid: uidString},
      success: function (response) {
        var timestamp = response.timestamp;
        if (prevResponseTimestamp === null) {
          prevResponseTimestamp = timestamp;
        } else if (prevResponseTimestamp == timestamp) {
          // This is a repeat - do not call the callbackFn
          return;
        } else {
          prevResponseTimestamp = timestamp;
        }

        console.log(response)
        var jsonObject = response.jsonData;
        if (response.data == 'success') {
          console.log(timestamp,jsonObject);
          // change the response to be in dweet format
          // so that the rest of the code does not have to change
          // when switching from dweet to respimaticListenFor
          var dweetObj = imitateDweetFormat(uidString, timeStamp, jsonObject);
          callbackFn(dweetObj); // Pass the response to the callbackFn
        }
      }
    });
}

function imitateDweetFormat(uidString, timeStamp, jsonObject) {
  var dweetObj = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : jsonObject.content,
  };
  return dweetObj;
}
