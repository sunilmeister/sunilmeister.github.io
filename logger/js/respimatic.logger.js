var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);
document.title = respimatic_uid + " (LOGGER)"

function stringify_dweet(d) {
  var dweetBox = document.getElementById('dweetBox');
  dweetBox.innerText = dweetBox.textContent = JSON.stringify(d,null,". ") ;
}

function process_dweet_content(d) {
  // extract all info from the dweet
  // and then shove it into a database

  created = d.created ;
  sysUid = d.thing ;

  for (let key in d.content) {
    // get key value pairs
    value = d.content[key];
  }

  return d;
}

function wait_for_dweets() {
  window.setInterval(function() {
    var elem = document.getElementById('dweetBox');
    elem.scrollTop = elem.scrollHeight;
  }, 3000);

  dweetio.listen_for(respimatic_uid, function(d) {
    //process_dweet_content(d);
    stringify_dweet(d);
  });
}
