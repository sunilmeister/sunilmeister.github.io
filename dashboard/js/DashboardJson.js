var uiJson = {
  "version": 1,
  "allow_edit": false,
  "plugins": [],
  "panes": [{
      "title": "Measured Pressures",
      "width": 1,
      "row": {
        "3": 1,
        "4": 1,
        "5": 1,
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
      "widgets": [{
          "type": "gauge",
          "settings": {
            "title": "PEAK",
            "value": "datasources[\"RESPIMATIC100\"][\"PIP\"]",
            "units": "cm H2O",
            "min_value": 0,
            "max_value": "60"
          }
        },
        {
          "type": "gauge",
          "settings": {
            "title": "PLATEAU",
            "value": "datasources[\"RESPIMATIC100\"][\"PLAT\"]",
            "units": "cm H2O",
            "min_value": 0,
            "max_value": "60"
          }
        },
        {
          "type": "gauge",
          "settings": {
            "title": "PEEP",
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
        "5": 1
      },
      "col": {
        "3": 2,
        "4": 2,
        "5": 2
      },
      "col_width": 2,
      "widgets": [{
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
      "title": "Respimatic Control Parameters",
      "width": 1,
      "row": {
        "3": 11,
        "4": 1,
        "5": 1,
        "6": 11,
        "7": 11
      },
      "col": {
        "3": 2,
        "4": 4,
        "5": 4,
        "6": 3,
        "7": 3
      },
      "col_width": 1,
      "widgets": [{
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
        },
        {
          "type": "text_widget",
          "settings": {
            "title": "Support Pressure (PS)",
            "size": "regular",
            "value": "datasources[\"RESPIMATIC100\"][\"PS\"]",
            "animate": true,
            "units": "cm H2O"
          }
        },
        {
          "type": "text_widget",
          "settings": {
            "title": "Support Pressure Termination (TPS)",
            "size": "regular",
            "value": "datasources[\"RESPIMATIC100\"][\"TPS\"]",
            "animate": true,
          }
        },
        {
          "type": "indicator",
          "settings": {
            "title": "Parameter Set Changes",
            "value": "datasources[\"RESPIMATIC100\"][\"PENDING\"]",
            "on_text": "UNCOMMITTED CHANGES",
            "off_text": "NO CHANGES IN PROGRESS"
          }
        }
      ]
    },
    {
      "title": "System State",
      "width": 1,
      "row": {
        "3": 11,
        "4": 11,
        "5": 11,
        "6": 1,
        "7": 1
      },
      "col": {
        "3": 3,
        "4": 2,
        "5": 3,
        "6": 1,
        "7": 1
      },
      "col_width": 1,
      "widgets": [{
          "type": "indicator",
          "settings": {
            "title": "Run Pre-use Checks",
            "value": "datasources[\"RESPIMATIC100\"][\"INITIAL\"]",
            "on_text": "INITIAL",
	    "off_text": ""
          }
        },
        {
          "type": "indicator",
          "settings": {
            "title": "Set Control Parameters",
            "value": "datasources[\"RESPIMATIC100\"][\"STANDBY\"]",
            "on_text": "STANDBY",
	    "off_text": ""
          }
        },
        {
          "type": "indicator",
          "settings": {
            "title": "Breath Delivery In Progress",
            "value": "datasources[\"RESPIMATIC100\"][\"RUNNING\"]",
            "on_text": "RUNNING",
	    "off_text": ""
          }
        },
        {
          "type": "indicator",
          "settings": {
            "title": "ALARM (Maintenance Breaths)",
            "value": "datasources[\"RESPIMATIC100\"][\"ERROR\"]",
            "on_text": "ERROR",
	    "off_text": ""
          }
        }
      ]
    },
    {
      "title": "Breaths Detected Past Minute",
      "width": 1,
      "row": {
        "3": 21,
        "4": 21,
        "5": 21,
        "6": 25,
        "7": 25
      },
      "col": {
        "3": 1,
        "4": 3,
        "5": 2,
        "6": 1,
        "7": 1
      },
      "col_width": 1,
      "widgets": [{
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
      "title": "Instanteneous Lung Compliance",
      "width": 1,
      "row": {
        "3": 25,
        "4": 21,
        "5": 21,
        "6": 27,
        "7": 27
      },
      "col": {
        "3": 3,
        "4": 4,
        "5": 1,
        "6": 2,
        "7": 2
      },
      "col_width": 1,
      "widgets": [{
          "type": "text_widget",
          "settings": {
            "title": "Instantaneous Static Compliance",
            "size": "regular",
            "value": "datasources[\"RESPIMATIC100\"][\"STATIC\"]",
            "animate": true,
            "units": "ml / cm H2O"
          }
        },
        {
          "type": "text_widget",
          "settings": {
            "title": "Instantaneous Dynamic Compliance",
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
        "3": 27,
        "4": 15,
        "5": 21,
        "6": 27,
        "7": 27
      },
      "col": {
        "3": 1,
        "4": 3,
        "5": 4,
        "6": 1,
        "7": 1
      },
      "col_width": 1,
      "widgets": [{
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
        "3": 29,
        "4": 21,
        "5": 21,
        "6": 11,
        "7": 11
      },
      "col": {
        "3": 2,
        "4": 2,
        "5": 3,
        "6": 2,
        "7": 2
      },
      "col_width": 1,
      "widgets": [{
          "type": "indicator",
          "settings": {
            "title": "Patient Initiated",
            "value": "datasources[\"RESPIMATIC100\"][\"SPONTANEOUS\"]",
            "on_text": "SPONTANEOUS",
	    "off_text": ""
          }
        },
        {
          "type": "indicator",
          "settings": {
            "title": "System Initiated",
            "value": "datasources[\"RESPIMATIC100\"][\"MANDATORY\"]",
            "on_text": "MANDATORY",
	    "off_text": ""
          }
        }
      ]
    },
    {
      "title": "Attention",
      "width": 1,
      "row": {
        "3": 31,
        "4": 11,
        "5": 11,
        "6": 17,
        "7": 17
      },
      "col": {
        "3": 3,
        "4": 3,
        "5": 2,
        "6": 2,
        "7": 2
      },
      "col_width": 1,
      "widgets": [{
        "type": "indicator",
        "settings": {
          "title": "Intervention Needed",
          "value": "datasources[\"RESPIMATIC100\"][\"ATTENTION\"]",
          "on_text": "ACHTUNG !",
	  "off_text": ""
        }
      }]
    },
    {
      "title": "Estimated Delivered Volumes",
      "width": 1,
      "row": {
        "3": 35,
        "4": 21,
        "5": 15,
        "6": 21,
        "7": 21
      },
      "col": {
        "3": 3,
        "4": 1,
        "5": 2,
        "6": 2,
        "7": 2
      },
      "col_width": 1,
      "widgets": [{
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
      "title": "Patient [ID] (Gender) Age",
      "width": 1,
      "row": {
        "4": 27
      },
      "col": {
        "4": 3
      },
      "col_width": 2,
      "widgets": [{
        "type": "text_widget",
        "settings": {
          "size": "regular",
          "value": "datasources[\"RESPIMATIC100\"][\"PMISC\"]",
          "animate": true,
          "units": "yrs"
        }
      }]
    },
    {
      "title": "Patient Name",
      "width": 1,
      "row": {
        "4": 28
      },
      "col": {
        "4": 1
      },
      "col_width": 2,
      "widgets": [{
        "type": "text_widget",
        "settings": {
          "size": "regular",
          "value": "datasources[\"RESPIMATIC100\"][\"PNAME\"]",
          "animate": true
        }
      }]
    }
  ],
  "datasources": [{
    "name": "RESPIMATIC100",
    "type": "dweet_io",
    "settings": {
      "thing_id": null,
      "show_full": false,
      "name": "RESPIMATIC100"
    }
  }],
  "columns": 4
};

var dataSources = {};
dataSources["DUMMY"] = {
  "name": "RESPIMATIC100",
  "type": "dweet_io",
  "settings": {
    "thing_id": "DUMMY",
    "show_full": false,
    "name": "RESPIMATIC100"
  }
};

