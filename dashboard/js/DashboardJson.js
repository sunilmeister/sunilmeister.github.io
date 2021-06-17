var uiJson = {
	"version": 1,
	"allow_edit": false,
	"plugins": [
		"https://sunilmeister.github.io/dashboard/js/respimatic.dashboard.js",
		"https://sunilmeister.github.io/dashboard/css/respimatic.dashboard.css"
	],
	"panes": [
		{
			"title": "Measured Pressures",
			"width": 1,
			"row": {
				"3": 1,
				"4": 1,
				"5": 11,
				"6": 11,
				"7": 11
			},
			"col": {
				"3": 1,
				"4": 1,
				"5": 1,
				"6": 1,
				"7": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "gauge",
					"settings": {
						"title": "Measured Peak (PIP)",
						"value": "datasources[\"RESPIMATIC100\"][\"PIP\"]",
						"units": "cm H2O",
						"min_value": 0,
						"max_value": "60"
					}
				},
				{
					"type": "gauge",
					"settings": {
						"title": "Measured Plateau (PLAT)",
						"value": "datasources[\"RESPIMATIC100\"][\"PLAT\"]",
						"units": "cm H2O",
						"min_value": 0,
						"max_value": "60"
					}
				},
				{
					"type": "gauge",
					"settings": {
						"title": "Measured PEEP (PEEP)",
						"value": "datasources[\"RESPIMATIC100\"][\"MPEEP\"]",
						"units": "cm H2O",
						"min_value": 0,
						"max_value": "60"
					}
				}
			]
		},
		{
			"title": "Messages",
			"width": 1,
			"row": {
				"3": 1,
				"4": 1,
				"5": 7
			},
			"col": {
				"3": 2,
				"4": 2,
				"5": 1
			},
			"col_width": 2,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"L1\"]",
						"sparkline": false,
						"animate": false
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"L2\"]",
						"sparkline": false,
						"animate": false
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"L3\"]",
						"animate": false
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"L4\"]",
						"animate": false
					}
				}
			]
		},
		{
			"title": "Volume Control Parameters",
			"width": 1,
			"row": {
				"3": 11,
				"4": 1,
				"6": 11,
				"7": 11
			},
			"col": {
				"3": 3,
				"4": 4,
				"6": 3,
				"7": 3
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "Ventilation Mode (MODE)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"MODE\"]",
						"animate": true
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Tidal Volume (VT)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"VT\"]",
						"animate": true,
						"units": "ml"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Respiration Rate (RR)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"RR\"]",
						"animate": true,
						"units": "bpm"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "I:E Ratio (EI)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"EI\"]",
						"animate": true
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "PEEP",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"IPEEP\"]",
						"animate": true,
						"units": "cm H2O"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Maximum Pressure (PMAX)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"PMAX\"]",
						"animate": true,
						"units": "cm H2O"
					}
				}
			]
		},
		{
			"title": "System State",
			"width": 1,
			"row": {
				"3": 29,
				"4": 11,
				"5": 1,
				"6": 1,
				"7": 1
			},
			"col": {
				"3": 3,
				"4": 3,
				"5": 1,
				"6": 1,
				"7": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "indicator",
					"settings": {
						"title": "Initial",
						"value": "datasources[\"RESPIMATIC100\"][\"INITIAL\"]",
						"on_text": "INITIAL State"
					}
				},
				{
					"type": "indicator",
					"settings": {
						"title": "Standby",
						"value": "datasources[\"RESPIMATIC100\"][\"STANDBY\"]",
						"on_text": "STANDBY State"
					}
				},
				{
					"type": "indicator",
					"settings": {
						"title": "Running",
						"value": "datasources[\"RESPIMATIC100\"][\"RUNNING\"]",
						"on_text": "RUNNING State"
					}
				},
				{
					"type": "indicator",
					"settings": {
						"title": "Error",
						"value": "datasources[\"RESPIMATIC100\"][\"ERROR\"]",
						"on_text": "ERROR State"
					}
				}
			]
		},
		{
			"title": "Breaths Detected Past Minute",
			"width": 1,
			"row": {
				"3": 29,
				"4": 15,
				"5": 25,
				"6": 25,
				"7": 25
			},
			"col": {
				"3": 2,
				"4": 2,
				"5": 1,
				"6": 1,
				"7": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "Mandatory Breaths",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"MBPM\"]",
						"animate": true,
						"units": ""
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Spontaneous Breaths",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"SBPM\"]",
						"animate": true,
						"units": ""
					}
				}
			]
		},
		{
			"title": "Estimated Lung Compliance",
			"width": 1,
			"row": {
				"3": 39,
				"4": 21,
				"6": 27,
				"7": 27
			},
			"col": {
				"3": 2,
				"4": 1,
				"6": 2,
				"7": 2
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "Estimated Static Lung Compliance",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"STATIC\"]",
						"animate": true,
						"units": "ml / cm H2O"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Estimated Dynamic Lung Compliance",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"DYNAMIC\"]",
						"animate": true,
						"units": "ml / cm H2O"
					}
				}
			]
		},
		{
			"title": "System Parameters",
			"width": 1,
			"row": {
				"3": 39,
				"4": 21,
				"6": 27,
				"7": 27
			},
			"col": {
				"3": 1,
				"4": 4,
				"6": 1,
				"7": 1
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "System Deployment Altitude",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"ALT\"]",
						"animate": true,
						"units": "ft (m)"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "System Temperature",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"TEMP\"]",
						"animate": true,
						"units": "deg C"
					}
				}
			]
		},
		{
			"title": "Previous Breath Type",
			"width": 1,
			"row": {
				"3": 45,
				"4": 21,
				"6": 11,
				"7": 11
			},
			"col": {
				"3": 1,
				"4": 3,
				"6": 2,
				"7": 2
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "indicator",
					"settings": {
						"title": "Spontaneous Breath",
						"value": "datasources[\"RESPIMATIC100\"][\"SPONTANEOUS\"]",
						"on_text": "SPONTANEOUS"
					}
				},
				{
					"type": "indicator",
					"settings": {
						"title": "Mandatory Breath",
						"value": "datasources[\"RESPIMATIC100\"][\"MANDATORY\"]",
						"on_text": "MANDATORY"
					}
				}
			]
		},
		{
			"title": "System Date and Time",
			"width": 1,
			"row": {
				"3": 51,
				"4": 11,
				"6": 17,
				"7": 17
			},
			"col": {
				"3": 1,
				"4": 2,
				"6": 2,
				"7": 2
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"TIME\"]",
						"animate": true
					}
				}
			]
		},
		{
			"title": "Previous Breath Estimated Volumes",
			"width": 1,
			"row": {
				"3": 55,
				"4": 21,
				"6": 21,
				"7": 21
			},
			"col": {
				"3": 1,
				"4": 2,
				"6": 2,
				"7": 2
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "Estimated Tidal Volume Delivered",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"VTDEL\"]",
						"animate": true,
						"units": "ml"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Estimated Minute Volume Delivered",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"MVDEL\"]",
						"animate": true,
						"units": "litres / min"
					}
				}
			]
		},
		{
			"title": "Support Pressure Parameters",
			"width": 1,
			"row": {
				"3": 61,
				"4": 15,
				"6": 23,
				"7": 23
			},
			"col": {
				"3": 1,
				"4": 4,
				"6": 3,
				"7": 3
			},
			"col_width": 1,
			"widgets": [
				{
					"type": "text_widget",
					"settings": {
						"title": "Support Pressure (PS)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"PS\"]\n",
						"animate": true,
						"units": "cm H2O"
					}
				},
				{
					"type": "text_widget",
					"settings": {
						"title": "Support Pressure Duration (TPS)",
						"size": "regular",
						"value": "datasources[\"RESPIMATIC100\"][\"TPS\"]",
						"animate": true,
						"units": "secs"
					}
				}
			]
		}
	],
	"datasources": [
		{
			"name": "RESPIMATIC100",
			"type": "dweet_io",
			"settings": {
				"thing_id": null,
				"show_full": false,
				"name": "RESPIMATIC100"
			}
		}
	],
	"columns": 4
};

var dataSources={};
dataSources["DUMMY"]= {
  "name": "RESPIMATIC100",
  "type": "dweet_io",
  "settings": {
    "thing_id": "DUMMY",
    "show_full": false,
    "name": "RESPIMATIC100"
  }
};

