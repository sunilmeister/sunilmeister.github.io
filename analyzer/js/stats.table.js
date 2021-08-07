var patientName, patientInfo;
var numMandatory, numSpontaneous;
var altitude;
var modes = [];
var bpms = [];
var ies = [];
var peeps = [];
var pmaxs = [];
var pss = [];
var tpss = [];

var minPeak, maxPeak;
var minPlat, maxPlat;
var minPeep, maxPeep;
var minVt, maxVt;
var minMv, maxMv;
var minMbpm, maxMbpm;
var minSbpm, maxSbpm;
var minScomp, maxScomp;
var minDcomp, maxDcomp;
var minTemp, maxTemp;

/////////////////////////////////////////////////////////////////
// Construct the tables required for reporting statistics
/////////////////////////////////////////////////////////////////
function paramTableRow(table,field,units,value) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + value + '>----</div>';
}

function minMaxTableRow(table,field,units,minDiv,maxDiv) {
  row = table.insertRow();

  cell = row.insertCell();
  cell.innerHTML = field;

  cell = row.insertCell();
  cell.innerHTML = units;
  cell.innerHTML = '<div style="font-size: 0.7em">' + units + '</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + minDiv + '>----</div>';

  cell = row.insertCell();
  cell.innerHTML = '<div id=' + maxDiv + '>----</div>';
}

function constructStatMinMaxTable() {
  var table = document.getElementById("statsMinMaxTable");

  minMaxTableRow(table,"Peak Pressure","cmH20","peakMin","peakMax");
  minMaxTableRow(table,"Plateau Pressure","cmH20","platMin","platMax");
  minMaxTableRow(table,"PEEP Pressure","cmH20","peepMin","peepMax");

  minMaxTableRow(table,"Tidal Volume Delivered","ml","vtMin","vtMax");
  minMaxTableRow(table,"Minute Volume Delivered","litres / min","mvMin","mvMax");

  minMaxTableRow(table,"Mandatory BPM","bpm","mbpmMin","mbpmMax");
  minMaxTableRow(table,"Spontaneous BPM","bpm","sbpmMin","sbpmMax");

  minMaxTableRow(table,"Instantaneous Static Compliance","ml / cmH20","scMin","scMax");
  minMaxTableRow(table,"Instantaneous Dynamic Compliance","ml / cmH20","dcMin","dcMax");

  minMaxTableRow(table,"System Temperature","deg C","tempMin","tempMax");
}

function constructStatParamTable() {
  var table = document.getElementById("statsParamTable");

  paramTableRow(table,"Ventilation Mode","","mode");
  paramTableRow(table,"Breaths Per Minute","bpm","bpm");
  paramTableRow(table,"I:E Ratio","","ie");
  paramTableRow(table,"PEEP Pressure","cm H20","peep");
  paramTableRow(table,"Maximum Pressure","cm H20","pmax");
  paramTableRow(table,"Support Pressure","cm H20","ps");
  paramTableRow(table,"Support Pressure Termination","","tps");
}

function displayStats() {
  el = document.getElementById("peakMin");
  el.innerHTML = String(minPeak);
  el = document.getElementById("peakMax");
  el.innerHTML = String(maxPeak);
  el = document.getElementById("platMin");
  el.innerHTML = String(minPlat);
  el = document.getElementById("platMax");
  el.innerHTML = String(maxPlat);
  el = document.getElementById("peepMin");
  el.innerHTML = String(minPeep);
  el = document.getElementById("peepMax");
  el.innerHTML = String(maxPeep);
  el = document.getElementById("vtMin");
  el.innerHTML = String(minVt);
  el = document.getElementById("vtMax");
  el.innerHTML = String(maxVt);
  el = document.getElementById("mvMin");
  el.innerHTML = String(minMv);
  el = document.getElementById("mvMax");
  el.innerHTML = String(maxMv);
  el = document.getElementById("mbpmMin");
  el.innerHTML = String(minMbpm);
  el = document.getElementById("mbpmMax");
  el.innerHTML = String(maxMbpm);
  el = document.getElementById("sbpmMin");
  el.innerHTML = String(minSbpm);
  el = document.getElementById("sbpmMax");
  el.innerHTML = String(maxMbpm);
  el = document.getElementById("scMin");
  el.innerHTML = String(minScomp);
  el = document.getElementById("scMax");
  el.innerHTML = String(maxScomp);
  el = document.getElementById("dcMin");
  el.innerHTML = String(minDcomp);
  el = document.getElementById("dcMax");
  el.innerHTML = String(maxDcomp);
  el = document.getElementById("tempMin");
  el.innerHTML = String(minTemp);
  el = document.getElementById("tempMax");
  el.innerHTML = String(minTemp);
  
  el = document.getElementById("mode");
  el.innerHTML=String(modes);
  el = document.getElementById("bpm");
  el.innerHTML=String(bpms);
  el = document.getElementById("ie");
  el.innerHTML=String(ies);
  el = document.getElementById("peep");
  el.innerHTML=String(peeps);
  el = document.getElementById("pmax");
  el.innerHTML=String(pmaxs);
  el = document.getElementById("ps");
  el.innerHTML=String(pss);
  el = document.getElementById("tps");
  el.innerHTML=String(tpss);

  if (patientName) {
    el = document.getElementById("pName");
    el.innerHTML = "Patient Name: " + String(patientName);
  }
  if (patientInfo) {
    el = document.getElementById("pInfo");
    el.innerHTML = "Patient Info: " + String(patientInfo) +"yrs";
  }
  el = document.getElementById("mandatory");
  el.innerHTML = "Number of Mandatory Breaths: " + String(numMandatory);
  el = document.getElementById("spontaneous");
  el.innerHTML = "Number of Spontaneous Breaths: " + String(numSpontaneous);
  el = document.getElementById("altitude");
  el.innerHTML = "System Deployment Altitude: " + String(altitude);
}

function gatherStats(jsonData) {
  for (var key in jsonData) {
    if (key=='content') {
      for (var ckey in jsonData.content) {
	value = jsonData.content[ckey];
        if (ckey=="L1") {
        } else if (ckey=="L2") {
        } else if (ckey=="L3") {
        } else if (ckey=="L4") {
        } else if (ckey=="INITIAL") {
        } else if (ckey=="STANDBY") {
        } else if (ckey=="RUNNING") {
        } else if (ckey=="ERROR") {
        } else if (ckey=="MANDATORY") {
        } else if (ckey=="SPONTANEOUS") {
        } else if (ckey=="BTOG") {
        } else if (ckey=="ATTENTION") {
        } else if (ckey=="PENDING") {
        } else if (ckey=="MODE") {
        } else if (ckey=="VT") {
        } else if (ckey=="RR") {
        } else if (ckey=="EI") {
        } else if (ckey=="IPEEP") {
        } else if (ckey=="PMAX") {
        } else if (ckey=="PS") {
        } else if (ckey=="TPS") {
        } else if (ckey=="MBPM") {
	  if (value != "--") {
	    if (maxMbpm < value) {
	      maxMbpm = value;
	    }
	    if (minMbpm > value) {
	      minMbpm = value;
	    }
	  }
        } else if (ckey=="SBPM") {
	  if (value != "--") {
	    if (maxSbpm < value) {
	      maxSbpm = value;
	    }
	    if (minSbpm > value) {
	      minSbpm = value;
	    }
	  }
        } else if (ckey=="STATIC") {
	  if (value != "--") {
	    if (maxScomp < value) {
	      maxScomp = value;
	    }
	    if (minScomp > value) {
	      minScomp = value;
	    }
	  }
        } else if (ckey=="DYNAMIC") {
	  if (value != "--") {
	    if (maxDcomp < value) {
	      maxDcomp = value;
	    }
	    if (minDcomp > value) {
	      minDcomp = value;
	    }
	  }
        } else if (ckey=="VTDEL") {
	  if (value != "--") {
	    if (maxVt < value) {
	      maxVt = value;
	    }
	    if (minVt > value) {
	      minVt = value;
	    }
	  }
        } else if (ckey=="MVDEL") {
	  if (value != "--") {
	    if (maxMv < value) {
	      maxMv = value;
	    }
	    if (minMv > value) {
	      minMv = value;
	    }
	  }
        } else if (ckey=="PIP") {
	  if (value != "--") {
	    if (maxPeak < value) {
	      maxPeak = value;
	    }
	    if (minPeak > value) {
	      minPeak = value;
	    }
	  }
        } else if (ckey=="PLAT") {
	  if (value != "--") {
	    if (maxPlat < value) {
	      maxPlat = value;
	    }
	    if (minPlat > value) {
	      minPlat = value;
	    }
	  }
        } else if (ckey=="MPEEP") {
	  if (value != "--") {
	    if (maxPeep < value) {
	      maxPeep = value;
	    }
	    if (minPeep > value) {
	      minPeep = value;
	    }
	  }
        } else if (ckey=="TEMP") {
	  if (maxTemp < value) {
	    maxTemp = value;
	  }
	  if (minTemp > value) {
	    minTemp = value;
	  }
        } else if (ckey=="ALT") {
	    altitude = value;
        } else if (ckey=="PNAME") {
	    patientName = value;
        } else if (ckey=="PMISC") {
	    patientInfo = value;
        }
      }
    }
  }
}

function statsProcessJsonRecord(key, lastRecord) {
  var req = indexedDB.open(dbName, dbVersion);
  req.onsuccess = function(event) {
    // Set the db variable to our database so we can use it!  
    var db = event.target.result;
    dbReady = true;

    var tx = db.transaction(dbObjStoreName, 'readonly');
    var store = tx.objectStore(dbObjStoreName);
    var keyReq = store.get(key);
    keyReq.onsuccess = function(event) {
      var jsonData = keyReq.result;
      gatherStats(jsonData);
      if (lastRecord) displayStats();
    }
  }
}

function gatherAndDisplayStats() {
  if (allDbKeys.length==0) {
    alert("Selected Session has no data");
    return;
  }

  for (i=0; i<allDbKeys.length; i++) {
    key = allDbKeys[i];
    if (!keyWithinAnalysisRange(key)) continue;
    lastRecord = (i==(allDbKeys.length-1));
    statsProcessJsonRecord(key, lastRecord);
  }
}

function initStats() {
  patientName = ""
  patientInfo = ""
  numMandatory = 0;
  numSpontaneous = 0;
  altitude = 0;
  
  modes = [];
  bpms = [];
  ies = [];
  peeps = [];
  pmaxs = [];
  pss = [];
  tpss = [];
  
  minPeak = 999999;
  maxPeak = -999999;
  minPlat = 999999;
  maxPlat = -999999;
  minPeep = 999999;
  maxPeep = -999999;
  minVt = 999999;
  maxVt = -999999;
  minMv = 999999;
  maxMv = -999999;
  minMbpm = 999999;
  maxMbpm = -999999;
  minSbpm = 999999;
  maxSbpm = -999999;
  minScomp = 999999;
  maxScomp = -999999;
  minDcomp = 999999;
  maxDcomp = -999999;
  minTemp = 999999;
  maxTemp = -999999;
}

function collectStats() {
  constructStatMinMaxTable();
  constructStatParamTable();
  gatherAndDisplayStats();
  displayStats();
}
