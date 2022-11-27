// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all chart data utilities
/////////////////////////////////////////////////////////////////
const MAX_CHART_DATAPOINTS = 60;
var chartRangeLimit = MAX_CHART_DATAPOINTS;
var minChartBreathNum = 0;
var maxChartBreathNum = 0;
var chartPrevSystemBreathNum = -1;
var totalMissedBreaths = 0;
const CHART_XAXIS_MAX_TICK_MARKS = 25;
const CHART_FONT_SIZE = 50;
const CHART_INTERLACED_COLOR = 'white' ;
const CHART_HORIZONTAL_GRID_COLOR = '#8F99FB' ;

function toggleDataSeries(e) {
  if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  }
  else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

var lastValidBreathTime = 0;
var lastWarningTime = 0;
var lastErrorTime = 0;
var prevBreathRecorded = 0;

function chartProcessJsonRecord(jsonData) {
  curTime = new Date(jsonData.created);
  for (var key in jsonData) {
    if (key == 'content') {
      if (typeof jsonData.content["WMSG"] != 'undefined') {
        if (chartExpectWarningMsg) { // back to back with Previous msg not yet fully received
          var msg = {
            'created': lastWarningTime,
            'L1': chartL1,
            'L2': chartL2,
            'L3': chartL3,
            'L4': chartL4
          };
          warningMsgs.push(msg);
        }
        lastWarningTime = jsonData.created;
        chartExpectWarningMsg = true;
        warningValues.push({
          "time": curTime,
          "value": ++warningNum
        });
      }
      if (typeof jsonData.content["EMSG"] != 'undefined') {
        if (chartExpectErrorMsg) { // back to back with Previous msg not yet fully received
          var msg = {
            'created': lastErrorTime,
            'L1': chartL1,
            'L2': chartL2,
            'L3': chartL3,
            'L4': chartL4
          };
          errorMsgs.push(msg);
        }
        lastErrorTime = jsonData.created;
        chartExpectErrorMsg = true;
        errorValues.push({
          "time": curTime,
          "value": ++errorNum
        });
      }
      for (var ckey in jsonData.content) {
        value = jsonData.content[ckey];
        if (chartL1 && chartL2 && chartL3 && chartL4) {
          if (chartExpectErrorMsg || chartExpectWarningMsg) {
            var msgTime;
            if (chartExpectWarningMsg) {
              msgTime = lastWarningTime;
            }
            else {
              msgTime = lastErrorTime;
            }
            var msg = {
              'created': msgTime,
              'L1': chartL1,
              'L2': chartL2,
              'L3': chartL3,
              'L4': chartL4
            };
            if (chartExpectWarningMsg) {
              warningMsgs.push(msg);
            }
            else {
              errorMsgs.push(msg);
            }
            chartExpectWarningMsg = false;
            chartExpectErrorMsg = false;
            chartL1 = chartL2 = chartL3 = chartL4 = "";
          }
        }
        if (ckey == "L1") {
          if (chartExpectWarningMsg || chartExpectErrorMsg) {
            if (!chartL1) chartL1 = jsonData.content['L1'];
          }
        }
        else if (ckey == "L2") {
          if (chartExpectWarningMsg || chartExpectErrorMsg) {
            if (!chartL2) chartL2 = jsonData.content['L2'];
          }
        }
        else if (ckey == "L3") {
          if (chartExpectWarningMsg || chartExpectErrorMsg) {
            if (!chartL3) chartL3 = jsonData.content['L3'];
          }
        }
        else if (ckey == "L4") {
          if (chartExpectWarningMsg || chartExpectErrorMsg) {
            if (!chartL4) chartL4 = jsonData.content['L4'];
          }
        }
        else if (ckey == "BNUM") {
	  var bnumValue = parseChecksumString(value);
	  if (bnumValue==null) {
	    console.log("Bad BNUM value = " + value + " sys = " + systemBreathNum);
	    continue; // will count as missing
	  }
          value = Number(bnumValue);
          breathTimes.push({
            "time": curTime,
            "valid": true
          });
	  if (prevBreathRecorded != prevBreathMandatory) {
            breathTypeValues.push({
              "time": curTime,
              "value": prevBreathMandatory?1:0
            });
	    prevBreathRecorded = prevBreathMandatory;
	  }

          if (chartPrevSystemBreathNum == -1) { // initialize
            chartPrevSystemBreathNum = value - 1;
          }
          systemBreathNum = value;
          breathsMissing = systemBreathNum - chartPrevSystemBreathNum - 1;
	  totalMissedBreaths += breathsMissing;

	  if (breathsMissing) {
	    var msg = {
              'created': curTime,
              'L1': String(breathsMissing) + " Breath(s) missed",
              'L2': "Info not received by",
              'L3': "Dashboard due to",
              'L4': "Internet packet loss"
            };
            infoMsgs.push(msg);
	  }

	  updateChartRangeOnNewBreath(systemBreathNum - chartPrevSystemBreathNum);
          chartPrevSystemBreathNum = value;
          if (breathsMissing) {
            console.log("Breaths Missing =" + breathsMissing);
            console.log("Before systemBreathNum=" + systemBreathNum);
            missingBreaths.push({
              "time": curTime,
              "value": breathsMissing
            });
            // stuff dummy breaths 1 sec apart because the fastest breath is 2 secs
            lastBreathNum = breathTimes.length;
            for (i = 1; i <= breathsMissing; i++) {
              breathTimes.push({
                "time": lastValidBreathTime + i,
                "valid": false
              });
            }
            // record breaks for graphing
            missingBreathWindows.push({
              "startValue": lastBreathNum+0.5,
              "endValue": lastBreathNum + breathsMissing + 0.5,
              "type": "zigzag",
              "lineColor": "black",
              "autoCalculate": true
            });
	    if (!lastValidBreathTime) lastValidBreathTime=startDate;
            missingTimeWindows.push({
              "startValue": ((new Date(lastValidBreathTime) - startDate)/1000)+0.5,
              "endValue": ((new Date(curTime) - startDate)/1000)-0.5,
	      "type": "zigzag",
              "lineColor": "black",
              "autoCalculate": true
            });
          }
          lastValidBreathTime = curTime;
        }
        else if (ckey == "BREATH") {
	  prevBreathMandatory = (value=="MANDATORY");
        }
        else if (ckey == "FIO2") {
          if (validDecimalInteger(value) && (value <= 100)) {
            fiO2Values.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            fiO2Values.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "O2PURITY") {
          if (validDecimalInteger(value) && (value <= 100)) {
            o2PurityValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            o2PurityValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "O2FLOWX10") {
          if (validDecimalInteger(value)) {
            o2FlowValues.push({
              "time": curTime,
              "value": (value / 10)
            });
          }
          else {
            o2FlowValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "MBPM") {
          if (validDecimalInteger(value)) {
            mbpmValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            mbpmValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "SBPM") {
          if (validDecimalInteger(value)) {
            sbpmValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            sbpmValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "STATIC") {
          if (validDecimalInteger(value)) {
            scompValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            scompValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "DYNAMIC") {
          if (validDecimalInteger(value)) {
            dcompValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            dcompValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "VTDEL") {
          if (validDecimalInteger(value)) {
            vtdelValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            vtdelValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "MVDEL") {
          if (validFloatNumber(value)) {
            mvdelValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            mvdelValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "PIP") {
          if (validDecimalInteger(value)) {
            peakValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            peakValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "PLAT") {
          if (validDecimalInteger(value)) {
            platValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            platValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "MPEEP") {
          if (validDecimalInteger(value)) {
            mpeepValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            mpeepValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
        else if (ckey == "TEMP") {
          if (validDecimalInteger(value)) {
            tempValues.push({
              "time": curTime,
              "value": Number(value)
            });
          }
          else {
            tempValues.push({
              "time": curTime,
              "value": null
            });
          }
        }
      }
    }
  }
}

/////////////////////////////////////////////////////////////////
// Below are all chart user-interface utilities
/////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var checkBoxTreeRootId = "checkBoxTreeRoot";
var cboxTree = null;

var chartContainerIdPrefix = "chartContainer";
var chartContainerTemplateId = "chartContainerTemplate";
var editMenuTemplateId = "editMenuTemplate";
var chartBodyClass = "chartBody";
var editChartMenuClass = "chartEditMenu";
var editChartMenuId = "chartDropDownMenu";
var chartContainerClass = "chartContainer";
var allChartsId = "chartsDiv";
var allChartContainerInfo = {};
var cboxTreeRootId = "checkBoxTreeRoot";
var cboxTree = null;

function chartInsertOnTop() {
  allCharts = document.getElementById(allChartsId);
  //console.log("chartInsertOnTop ");
  newContainer = createNewChartContainer();
  allCharts.insertBefore(newContainer, allCharts.firstChild);
  removeChartEditMenu();
}

function chartInsert(bnode) {
  containerNode = bnode.parentNode.parentNode;
  //console.log("chartInsert " + containerNode.id);
  newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  removeChartEditMenu();
}

function chartAppend(bnode) {
  containerNode = bnode.parentNode.parentNode;
  //console.log("chartAppend " + containerNode.id);
  newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  removeChartEditMenu();
}

function chartEdit(bnode) {
  removeChartEditMenu();
  containerNode = bnode.parentNode.parentNode;
  //console.log("chartEdit " + containerNode.id);
  temp = document.getElementById(editMenuTemplateId);
  template = findChildNodeByClass(temp.content,editChartMenuClass);
  node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  cboxTree = new CheckboxTree(cboxTreeRootId);
  box = allChartContainerInfo[containerNode.id];
  box.updateMenu(editChartMenuId);
  cboxTree.PropagateFromLeafCheckboxes();
}

function chartDelete(bnode) {
  containerNode = bnode.parentNode.parentNode;
  //console.log("chartDelete " + containerNode.id);
  removeChartContainerId(containerNode.id);
  containerNode.remove();
  if (numberOfExistingCharts()==0) {
    alert("No chart container left\nCreating new empty one");
    chartInsertOnTop();
  }
  removeChartEditMenu();
}

function removeChartEditMenu() {
  if (cboxTree) delete cboxTree;
  menuDiv = document.getElementById(editChartMenuId);
  if (!menuDiv) return;
  menuDiv.remove();
}

function chartMenuCancel(bnode) {
  containerNode = bnode.parentNode.parentNode.parentNode;
  console.log("chartMenuCancel " + containerNode.id);
  removeChartEditMenu();
}

function chartMenuSubmit(bnode) {
  containerNode = bnode.parentNode.parentNode.parentNode;
  box = allChartContainerInfo[containerNode.id];
  box.updateOptions(editChartMenuId);
  removeChartEditMenu();
  box.render();
}

function findChildNodeByClass(node, className) {
  var res = null;
  node.childNodes.forEach(function(n) {
    if (n.className == className) {
      res = n;
      return;
    }
  });
  return res;
}

var currentChartContainerNum = 0;
function createNewChartContainer() {
  temp = document.getElementById(chartContainerTemplateId);
  template = findChildNodeByClass(temp.content,chartContainerClass);
  node = template.cloneNode(true);
  node.id = chartContainerIdPrefix + (currentChartContainerNum++) ;
  body = findChildNodeByClass(node,chartBodyClass);
  box = new ChartBox(body);
  storeChartContainerId(node.id,box);
  return node;
}

function numberOfExistingCharts() {
  return (Object.keys(allChartContainerInfo).length);
}

function findChartContainerId(id) {
  obj = allChartContainerInfo[id];
  if (!obj || (typeof obj == 'undefined')) return null;
  return obj;
}

function storeChartContainerId(id, chartBox) {
  allChartContainerInfo[id] = chartBox;
}

function removeChartContainerId(id) {
  delete allChartContainerInfo[id];
}

function treeCheckboxClicked(cbox) {
  cboxTree.CheckboxClicked(cbox);
}

