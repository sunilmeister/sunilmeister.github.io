var cookie_name = "selectedUid";

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
  document.cookie = cname + "=" + cvalue + "; expires=" + expiry
                    + ";path=/; SameSite=None;Secure";
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

