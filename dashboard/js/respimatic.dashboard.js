var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

//alert("Session for RESPIMATIC 100 SYSUID = " + respimatic_uid);
uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;

var normal_background = "#0d3e51";
var error_background = "#ad1309";
var attention_background = "#a3450f";
var prev_background = normal_background;
var gsw_elements = [];

var initial_state = false;
var standby_state = false;
var running_state = false;
var error_state = false;
var attention_state = false;

function set_normal_background() {
  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }
  if (gsw_elements[0].style.backgroundColor == normal_background) return;

  for (var i = 0; i < gsw_elements.length; i++) {
    gsw_elements[i].style.backgroundColor=normal_background;
  }
}

function set_attention_background() {
  var clr = normal_background;

  if (prev_background!=attention_background) {
    clr = attention_background;
  }

  prev_background = clr;

  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }
  if (gsw_elements[0].style.backgroundColor == clr) return;

  for (var i = 0; i < gsw_elements.length; i++) {
    gsw_elements[i].style.backgroundColor=clr;
  }
}

function enter_initial_state() {
  initial_state = true;
  standby_state = false;
  running_state = false;
  error_state = false;

  if (attention_state) set_attention_background();
  else set_normal_background();
}

function enter_standby_state() {
  initial_state = false;
  standby_state = true;
  running_state = false;
  error_state = false;

  //alert("enter_standby attention_state=" + attention_state);
  if (attention_state) set_attention_background();
  else set_normal_background();
}

function enter_running_state() {
  initial_state = false;
  standby_state = false;
  running_state = true;
  error_state = false;

  if (attention_state) set_attention_background();
  else set_normal_background();
}

function enter_error_state() {
  var clr = normal_background;
  //alert("enter_error attention_state=" + attention_state);
  attention_state = false;

  initial_state = false;
  standby_state = false;
  running_state = false;
  error_state = true;

  if (prev_background!=error_background) {
    clr = error_background;
  } else {
    clr = normal_background;
  }

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

function enter_attention_state(attention) {
  if (error_state) attention_state = false;
  else attention_state = attention;
  //alert("enter_attention attention_state=" + attention_state);

  if (error_state) set_error_background();
  else if (attention_state) set_attention_background();
  else set_normal_background();
}

