  var respimaticListenForIntervalId = null;

  // This function does the actual listening
  function realRespimaticListenFor(uid, callbackFn) {
    $.ajax({
      url: 'display_json_response',
      method: 'POST',
      data: {
        uid: uid
      },
      success: function (response) {
        var timestamp = response.timestamp;
        var jsonData = response.jsonData;

        if (response.data === 'success') {
          callbackFn(null, timestamp, jsonData); // Pass the response to the callbackFn
        } 
      },
      error: function (error) {
        console.log("AJAX request failed");
        callbackFn(error, null); // Pass the error to the callbackFn
      }
    });

  }

  function respimaticListenFor(uid, callbackFn) {
    // Call the real work function immediately
    realRespimaticListenFor(uid, callbackFn);

    // After that call the real work function every 10ms
    respimaticListenForIntervalId =
      setInterval(realRespimaticListenFor(uid, callbackFn), 10);
  }

