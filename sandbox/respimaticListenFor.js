document.addEventListener("DOMContentLoaded", function () {
  var intervalId; // Variable to store the interval ID

  function respimaticListenFor(uid, callbackFn) {
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
          console.log(timestamp, jsonData);
          callbackFn(null, timestamp, jsonData); // Pass the response to the callbackFn
        } else {
          console.log("UID does not match");
          callbackFn("UID does not match", null); // Pass an error message to the callbackFn
        }
      },
      error: function (error) {
        console.log("AJAX request failed");
        callbackFn(error, null); // Pass the error to the callbackFn
      }
    });
  }

  // Define the button click event handler
  function connectButtonClick() {
    var uid = $('#uid').val(); // Get the value of uid from the input field
    respimaticListenFor(uid, function (error, response) {
      if (error) {
        // Handle the error
        console.error(error);
      } else {
        // Use the response data
        console.log(response);
      }
    });
    // Start the interval after clicking the button
    intervalId = setInterval(function () {
      respimaticListenFor(uid, function (error, response) {
        if (error) {
          // Handle the error
          console.error(error);
        } else {
          // Use the response data
          console.log(response);
        }
      });
    }, 10);
  }

  // Add event listener to the button
  $('#connectButton').click(connectButtonClick);
});
