var cookie_name = "respimatic_uid";
var respimatic_uid =  "";

function validUid() {
  var uid_length = respimatic_uid.length;
  if (uid_length!=20) return false;

  var pos = respimatic_uid.indexOf("RSP_");
  if (pos!=0) return false;

  var hex_str = respimatic_uid.substr(4);
  //alert("hex_str = " + hex_str);
  var re = /[0-9A-Fa-f]{16}/g;

  if (re.test(hex_str)) return true;

  return false;
}

function setCookie(cname, cvalue) {
  var d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  var expiry = d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; expires=" + expiry;
                   + ";path=/; SameSite=None; Secure";

}

function deleteCookie(cname) {
  var d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  var expiry = d.toUTCString();
  document.cookie = cname + "=; expires=" + expiry;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

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

function getRespimaticSysUID(){
  respimatic_uid = document.querySelector('#SYSUIDS_input').value.toUpperCase();

  //confirm("SELECTED RESPIMATIC 100 SysUID:\t" + respimatic_uid);

  if ((respimatic_uid=="") || (respimatic_uid==null)) {
    alert("Not connected to RESPIMATIC 100!\n\t\tTry Again");
    return; 
  }

  if (!validUid()) {
    alert("\tInvalid RESPIMATIC 100 SysUID:\t" + respimatic_uid + 
      "\nMust be RSP_ followed by 16-digit HEX number\n\t\t\t\tTry again!");
    return;
  }

  setCookie(cookie_name,respimatic_uid);

  var retrieved_uids = localStorage.getItem("respimatic_uids");
  var respimatic_uids = [];
  if (retrieved_uids) {
    respimatic_uids = JSON.parse(retrieved_uids);
  }

  var ix;
  if (respimatic_uids.length) {
    ix = respimatic_uids.indexOf(respimatic_uid);
  } else {
    ix = -1;
  }

  if (ix==-1) {
    respimatic_uids.push(respimatic_uid);
    localStorage.setItem("respimatic_uids", JSON.stringify(respimatic_uids));
  }

  sessionStorage.setItem(cookie_name, respimatic_uid);
  window.location.assign("respimatic.dashboard.html");
}

window.onload = function() {
  var retrieved_uids = localStorage.getItem("respimatic_uids");
  var respimatic_uids = [];

  respimatic_uids = JSON.parse(retrieved_uids);
  createDropdownSelect(respimatic_uids);

  var respimatic_uid = getCookie(cookie_name);

  var datalist = document.getElementById('SYSUIDS_input'); 
  datalist.value = respimatic_uid; // set default value instead of html attribute
  datalist.onfocus = function() { datalist.value =''; }; // on focus - clear input
};
