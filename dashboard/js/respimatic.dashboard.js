var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;
document.title = respimatic_uid + " (" + datasource_name + ")"

var normal_background = "#0d3e51";
var initial_background = "#0d3e51";
var standby_background = "#0d3e51";
var error_background = "#ad1309";
var running_background = "#0b5e2b";
var attention_background = "#c45a1b";
var current_background = normal_background;
var background_before_error = initial_background;
var gsw_elements = [];

var initial_state = false;
var standby_state = false;
var running_state = false;
var error_state = false;
var attention_state = false;

function set_current_background(color) {
  current_background = color;
  if (gsw_elements.length == 0) {
    gsw_elements = document.getElementsByClassName("gs_w");
  }
  if (gsw_elements[0].style.backgroundColor == color) return;

  for (var i = 0; i < gsw_elements.length; i++) {
    gsw_elements[i].style.backgroundColor=color;
  }
}

function set_normal_background() {
  set_current_background(normal_background);
}

function set_initial_background() {
  set_current_background(initial_background);
}

function set_standby_background() {
  set_current_background(standby_background);
}

function set_running_background() {
  set_current_background(running_background);
}

function set_attention_background() {
  var color = current_background;

  if (current_background==attention_background) {
    if (initial_state) color = initial_background;
    else if (standby_state) color = standby_background;
    else if (running_state) color = running_background;
    else if (error_state) color = error_background;
  } else {
    color = attention_background;
  }

  set_current_background(color);
}

function set_error_background() {
  var color = current_background;

  if (current_background==error_background) {
    color = background_before_error;
  } else {
    color = error_background;
  }

  set_current_background(color);
}

function enter_initial_state() {
  initial_state = true;
  standby_state = false;
  running_state = false;
  error_state = false;
  background_before_error = initial_background;

  set_initial_background();
}

function enter_standby_state() {
  initial_state = false;
  standby_state = true;
  running_state = false;
  error_state = false;
  background_before_error = standby_background;

  if (attention_state) set_current_background(attention_background);
  else set_standby_background();
}

function enter_running_state() {
  initial_state = false;
  standby_state = false;
  running_state = true;
  error_state = false;
  background_before_error = running_background;

  if (attention_state) set_attention_background();
  else set_running_background();
}

function enter_error_state() {
  attention_state = false;

  initial_state = false;
  standby_state = false;
  running_state = false;
  error_state = true;

  set_error_background();
}

function exit_error_state() {
}

function enter_attention_state() {
  if (error_state) {
    attention_state = false;
    set_error_background();
  } else {
    attention_state = true;
    set_attention_background();
  }
}

function exit_attention_state() {
  attention_state = false;
  var color = normal_background;

  if (initial_state) color = initial_background;
  else if (standby_state) color = standby_background;
  else if (running_state) color = running_background;
  else if (error_state) color = error_background;

  set_current_background(color);
}

