/* ****************************************************
  The only communication with the server is 
  via HTTP POST and HTTP GET methods

  The Hardware will use HTTP POST method
  The Browser frontend will use HTTP GET method

  No callback functions etc.
**************************************************** */

// uidTable is a Global json object 
// Format as below
/* ****************************************************
{
  "UID_ABCDEF0123456789" : {"timestamp": Date, "content" : {}},
  "UID_AAAABBBBCCCCDDDD" : {"timestamp": Date, "content" : {}},
  ...
}
**************************************************** */

var uidTable = {};

function respimaticListen() {
  // Check for HTTP POST
  if (httpPostReceived()) { // check for received POST
    let timestamp = new Date();
    let httpPostData = getHttpPostData(); // you already have code to do this
    let uid = httpPostData.UID;
    let content = httpPostData.content;

    if (typeof uidTable[uid] == "undefined") {
      // New UID
      uidTable[uid] = {};
      uidTable[uid]["timestamp"] = timestamp;;
      uidTable[uid]["content"] = content;;
    } else {
      // Simply replace existing entry
      uidTable[uid]["timestamp"] = timestamp;;
      uidTable[uid]["content"] = content;;
    }
  }

  // Check for HTTP GET
  if (httpGetReceived()) { // check for received GET
    let httpGetData = getHttpGetData(); // will be similar to getHttpPostData above
    let uid = httpGetData.UID;
    let jsonObj = {};

    if (typeof uidTable[uid] == "undefined") {
      // No data for given UID
      sendHttpGetResponse(jsonObj);
    } else {
      // Simply send existing entry
      jsonObj["timestamp"] = uidTable[uid]["timestamp"];
      jsonObj["content"] = uidTable[uid]["content"];
      sendHttpGetResponse(jsonObj);
    }
  }
}

// Make respimaticListen run every X ms
setInterval(respimaticListen,10);
