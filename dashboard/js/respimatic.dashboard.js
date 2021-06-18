var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

//alert("Session for RESPIMATIC 100 SYSUID = " + respimatic_uid);
uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;

function bgColorDependingOnState(clr) {
  elements = document.getElementsByClassName("gs_w");
  //alert("I am here #" + elements.length);

  if (elements.length==0) return;
  if (elements[0].style.backgroundColor == clr) return;

  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor=clr;
  }
}
