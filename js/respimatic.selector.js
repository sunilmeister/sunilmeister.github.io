// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////
var respimaticUid = "";

function createDropdownSelect(values) {
  var datalist = document.getElementById("SYSUIDS");
  for (const val of values) {
    var option = document.createElement("option");
    option.value = val;
    option.text = val.charAt(0).toUpperCase() + val.slice(1);
    datalist.appendChild(option);
  }
  return datalist;
}

function getRespimaticSysUID() {
  respimaticUid = document.querySelector('#SYSUIDS_input').value.toUpperCase();
  //confirm("SELECTED RESPIMATIC 100 SysUID:\t" + respimaticUid);
  if ((respimaticUid == "") || (respimaticUid == null)) {
    alert("\tEnter RESPIMATIC 100 SysUID" +
      "\nMust be RSP_ followed by 16-digit HEX number\n\t\t\t\tTry again!");
    return false;
  }
  if (!validUid()) {
    alert("\tInvalid RESPIMATIC 100 SysUID:\t" + respimaticUid +
      "\nMust be RSP_ followed by 16-digit HEX number\n\t\t\t\tTry again!");
    return false;
  }
  setCookie(cookieName, respimaticUid);
  var retrieved_uids = localStorage.getItem("respimatic_uids");
  var respimatic_uids = [];
  if (retrieved_uids) {
    respimatic_uids = JSON.parse(retrieved_uids);
  }
  var ix;
  if (respimatic_uids.length) {
    ix = respimatic_uids.indexOf(respimaticUid);
  } else {
    ix = -1;
  }
  if (ix == -1) {
    respimatic_uids.push(respimaticUid);
    localStorage.setItem("respimatic_uids", JSON.stringify(respimatic_uids));
  }
  sessionStorage.setItem(cookieName, respimaticUid);
  //alert(cookieName + ' ' + respimaticUid);
  return true;
}

function launchDashboard() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("dashboard/respimatic.dashboard.html");
  window.open("dashboard/respimatic.dashboard.html");
}

function launchRecorder() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("recorder/respimatic.recorder.html");
  window.open("recorder/respimatic.recorder.html");
}

function launchAnalyzer() {
  if (!getRespimaticSysUID()) {
    return;
  }
  //window.location.assign("analyzer/respimatic.analyzer.html");
  window.open("analyzer/respimatic.analyzer.html");
}

function launchFiO2() {
  // window.location.assign("fio2/respimatic.fio2Calc.html");
  window.open("fio2/respimatic.fio2Calc.html");
}

window.onload = function() {
  var retrieved_uids = localStorage.getItem("respimatic_uids");
  var respimatic_uids = [];
  respimatic_uids = JSON.parse(retrieved_uids);
  createDropdownSelect(respimatic_uids);
  respimaticUid = getCookie(cookieName);
  var datalist = document.getElementById('SYSUIDS_input');
  datalist.value = respimaticUid; // set default value instead of html attribute
  datalist.onfocus = function() {
    datalist.value = '';
  }; // on focus - clear input

  alert(
    "Use CTRL key and +/- keys to increase/decrease the page zoom level\n\n"
    + "Or hold down the CTRL key and use the mouse wheel to zoom in/out"
  );
};
