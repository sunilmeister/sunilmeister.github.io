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
function respimaticListenFor(uidString, callbackFn) {
  // Call the real work function immediately
  executeRespimaticListenFor(uidString, callbackFn);

  // After that call the real work function every 10ms
  intervalId = setInterval(executeRespimaticListenFor(uidString, callbackFn), 10);
}

// This function does the actual listening
function executeRespimaticListenFor(uidString, callbackFn) {
 $.ajax({
      url: 'https://respimaticlisten.atmanirbhar.org/display_json_response',
      method: 'POST',
      data: {uid: uidString}
  })
  .done(function (response) {
    var timestamp = response.timestamp;
    var jsonObject = response.jsonData;

    if (response.data === 'success') {
      // change the response to be in dweet format
      // so that the rest of the code does not have to change
      // when switching from dweet to respimaticListenFor
      dweetFormat = imitateDweetFormat(jsonObject);
      callbackFn(dweetFormat); // Pass the response to the callbackFn
    } 
  })
  .fail(function (error) {
    callbackFn(null); // Signal error to callbackFn
  });
}

function imitateDweetFormat(uidString, timeStamp, jsonObject) {
  var dweetFormat = {
    "thing": uidString,
    "created": new Date(timeStamp),
    "content" : jsonObject.content,
  };
  return dweetFormat;
}
