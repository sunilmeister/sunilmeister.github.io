var datasource_name = "RESPIMATIC100";
var cookie_name = "respimatic_uid";
var respimatic_uid =  sessionStorage.getItem(cookie_name);

//alert("Session for RESPIMATIC 100 SYSUID = " + respimatic_uid);
uiJson.datasources.length=0;
uiJson.datasources.push(dataSources["DUMMY"]);
uiJson.datasources[0].settings.thing_id=respimatic_uid;
