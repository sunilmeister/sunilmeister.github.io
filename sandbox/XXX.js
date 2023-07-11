 // This is the api implementation
 // callbackFn has 2 arguments (timeStamp, jsonData)
 function XXX(uid, callbackFn) {
   console.log("Received uid = " + uid);
   jsonData = {a:1, b:2, c:3};
   callbackFn(Date(), jsonData);
 }
