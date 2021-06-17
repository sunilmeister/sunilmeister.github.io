To enable editing of dashboard layout edit respimatic.dashboard.html and change 
freeboard.setEditing(false) 	to 	freeboard.setEditing(true)


To enable editing of the admin-pane edit DashboardJson.js and change 
"allow_edit": false    to     "allow_edit": true,


After changing the dashboard layout do the following
1. Export dashboard.json from the admin-pane
2. Deserialize dashboard.json to create DashboardJson.js
3. Edit DashboardJson.js to do the following
	The first line, change "{" to "var uiJson = {"
	Append the file AddPostfixToDashboardJs.txt to bottom of DashboardJson.js
	Copy DashboardJson.js to freeboard-master/js