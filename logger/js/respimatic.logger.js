var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);
document.title = respimatic_uid + " (LOGGER)"

function process_dweet_content(d) {
  var dweetBox = document.getElementById("dweetBox");
  var newElement = document.createElement("div");
  newElement.innerHTML = '<p style="text-align: left">' + d.created + ' {' ;
  dweetBox.appendChild(newElement);

  var i = 0;
  var keyValue = "";

  for (let k in d.content) {
    if (i!=0) keyValue = keyValue + ', ' ;
    keyValue = keyValue +  '"' + k +'" : "' + d.content[k] + '"' ;
    i++;
  }

  newElement = document.createElement("div");
  newElement.innerHTML = '<p style="text-align: left">' + keyValue + ' <br>';
  newElement.innerHTML = newElement.innerHTML + 
                         '<p style="text-align: left">' + '}' + ' <br>';
  dweetBox.appendChild(newElement);
  return d;
}

function wait_for_dweets() {
  window.setInterval(function() {
    var elem = document.getElementById('dweetBox');
    elem.scrollTop = elem.scrollHeight;
  }, 3000);

  dweetio.listen_for(respimatic_uid, function(d) {
    process_dweet_content(d);
  });
}
