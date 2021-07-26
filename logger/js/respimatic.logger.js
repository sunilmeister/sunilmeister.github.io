var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);
document.title = respimatic_uid + " (LOGGER)"

function process_dweet_content(d) {
  /*
  alert(d.created);
  for (let k in d.content) {
    alert(k + ' is ' + '"' + d.content[k] + '"');
  }
  */
  return d;
}

