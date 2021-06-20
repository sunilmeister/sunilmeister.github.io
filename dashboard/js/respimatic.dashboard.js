var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

//alert("Session for RESPIMATIC 100 SYSUID = " + respimatic_uid);
uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;

var normal_background = "#0d3e51";
var error_background = "#ad1309";
var uncommitted_background = "#a3450f";
var prev_background = normal_background;
var gsw_elements = [];

function set_error_background(errorState) {
  var clr;
  if (errorState) {
    if (prev_background!=error_background) {
      clr = error_background;
    } else {
      clr = normal_background;
    }
  } else clr = normal_background;
  prev_background = clr;

  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }

  if (gsw_elements.length==0) return;
  if (gsw_elements[0].style.backgroundColor == clr) return;

  for (var i = 0; i < gsw_elements.length; i++) {
    gsw_elements[i].style.backgroundColor=clr;
  }
}

function set_committed_background(committed) {
  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }

  for (var i = 0; i < gsw_elements.length; i++) {
    if (committed) {
      gsw_elements[i].style.backgroundColor=normal_background;
    } else {
      gsw_elements[i].style.backgroundColor=uncommitted_background;
    }
  }

  if (committed) {
    prev_background = normal_background;
  } else {
    prev_background = uncommitted_background;
  }
}

