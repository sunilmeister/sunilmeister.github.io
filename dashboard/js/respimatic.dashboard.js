var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

//alert("Session for RESPIMATIC 100 SYSUID = " + respimatic_uid);
uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;

var error_background = "#ad1309";
var normal_background = "#0d3e51";
var prev_background = normal_background;

function set_error_background(errorState) {
  var clr;
  if (errorState) {
    if (prev_background==normal_background) {
      clr = error_background;
    } else {
      clr = normal_background;
    }
  } else clr = normal_background;
  prev_background = clr;

  elements = document.getElementsByClassName("gs_w");

  if (elements.length==0) return;
  if (elements[0].style.backgroundColor == clr) return;

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor=clr;
  }
}

function set_committed_background() {
}

function set_uncommitted_background() {
}
