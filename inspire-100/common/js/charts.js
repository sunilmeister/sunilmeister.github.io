// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all chart data utilities
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all chart user-interface utilities
/////////////////////////////////////////////////////////////////

function chartInsertInitial() {
  let allCharts = document.getElementById(ALL_CHARTS_ID);
  let newContainer = createNewChartContainer();
  allCharts.insertBefore(newContainer, null);
	// Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);

}

function chartInsert(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  let newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
	// Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartAppend(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  let newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
	// Open edit menu for the new wave box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartEdit(bnode) {
  document.getElementById(CHART_EDIT_CHART_MENU_ID).style.display="block";
  let containerNode = findAncestorChartContainerNode(bnode);
  session.charts.boxTree = new CheckboxTree(CHART_CBOX_TREE_ROOT_ID, containerNode.id);
  let box = session.charts.allChartsContainerInfo[containerNode.id];
  box.updateMenu(CHART_EDIT_CHART_MENU_ID);
  session.charts.boxTree.PropagateFromLeafCheckboxes();
  // Treat <ENTER> as accept button for TITLE
  let titleNode = document.getElementById("ChartTitleId");
  titleNode.addEventListener("keypress", chartTitleKeypressListener);
}

function chartDelete(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  removeChartContainerId(containerNode.id);
  containerNode.remove();
  if (numberOfExistingCharts() == 0) {
    modalWarning("CHART BOX", "No chart container left\nCreating new empty one");
    chartInsertInitial();
  }
  removeChartEditMenu();
}

function removeChartEditMenu() {
  let menuDiv = document.getElementById(CHART_EDIT_CHART_MENU_ID);
  if (!menuDiv) return;
  if (session.charts.boxTree) {
  	let containerNodeId = session.charts.boxTree.BoxContainerId();
  	let cdiv = document.getElementById(containerNodeId);
  	let bdiv = findChildNodeByClass(cdiv, CHART_BANNER_CLASS);
		bdiv.style.backgroundColor = palette.darkblue;
  	let menuDiv = document.getElementById(CHART_EDIT_CHART_MENU_ID);
		menuDiv.style.display = "none";
		session.charts.boxTree = null;
	}
}

var chartMenuBlinkColor = false;
function blinkChartMenu() {
	if (!session) return;
  if (!session.charts.boxTree) return;
  let menuDiv = document.getElementById(CHART_EDIT_CHART_MENU_ID);
	if (!menuDiv) return;
 	let containerNodeId = session.charts.boxTree.BoxContainerId();
 	let cdiv = document.getElementById(containerNodeId);
 	let mdiv = document.getElementById(CHART_MENU_BANNER_ID);
 	let bdiv = findChildNodeByClass(cdiv, CHART_BANNER_CLASS);
	if (chartMenuBlinkColor) {
		bdiv.style.backgroundColor = palette.darkblue;
		mdiv.style.backgroundColor = palette.darkblue;
		chartMenuBlinkColor = false;
	} else {
		bdiv.style.backgroundColor = palette.orange;
		mdiv.style.backgroundColor = palette.orange;
		chartMenuBlinkColor = true;
	}
}

setInterval(() => {
	blinkChartMenu();
}, 1000)

function chartMenuCancel(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  removeChartEditMenu();
}

function chartMenuSubmit(bnode) {
  let containerNodeId = session.charts.boxTree.BoxContainerId();
  let box = session.charts.allChartsContainerInfo[containerNodeId];
  box.updateOptions(CHART_EDIT_CHART_MENU_ID);
  //removeChartEditMenu();
  box.render();
}

var currentChartContainerNum = 0;

function createNewChartContainer() {
  let temp = document.getElementById(CHART_CONTAINER_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, CHART_CONTAINER_CLASS);
  let node = template.cloneNode(true);
  node.id = CHART_CONTAINER_ID_PREFIX + (currentChartContainerNum++);
  let body = findChildNodeByClass(node, CHART_BODY_CLASS);
  let box = new ChartBox(body);
  storeChartContainerId(node.id, box);
  return node;
}

function numberOfExistingCharts() {
  return (Object.keys(session.charts.allChartsContainerInfo).length);
}

function findChartContainerId(id) {
  let obj = session.charts.allChartsContainerInfo[id];
  if (!obj || isUndefined(obj)) return null;
  return obj;
}

function storeChartContainerId(id, chartBox) {
  session.charts.allChartsContainerInfo[id] = chartBox;
}

function removeChartContainerId(id) {
  delete session.charts.allChartsContainerInfo[id];
}

function chartTreeCheckboxClicked(cbox) {
  session.charts.boxTree.CheckboxClicked(cbox);
  chartMenuSubmit(cbox);
}

function findAncestorChartContainerNode(node) {
  return findAncestorNodeByClassName(node, CHART_CONTAINER_CLASS);
}

function findAncestorChartBodyNode(node) {
  return findAncestorNodeByClassName(node, CHART_BODY_CLASS);
}

function createAllCharts() {
  if (!session.sessionDataValid) {
    modalAlert("Data Gathering in process", "Give us a second and try again");
    return;
  }

  if (numberOfExistingCharts() == 0) {
    chartInsertInitial(); // always have chart box for user to start with
  }

  renderAllCharts();
}

function renderAllCharts() {
	// check for too many datapoints to render
  let numDataPoints = session.charts.range.maxBnum - session.charts.range.minBnum + 1;
	let sparseInterval = 1;
  if (numDataPoints > CHART_ALERT_THRESHOLD) {
		sparseInterval = Math.ceil(numDataPoints / CHART_ALERT_THRESHOLD);
    modalWarning("Breath Range SPAN (" + numDataPoints +") too big!", 
        "Using interval of " + sparseInterval + " breaths");
	}
	session.charts.numChartDatapoints = numDataPoints / sparseInterval;
	session.charts.sparseInterval = sparseInterval;

  for (let id in session.charts.allChartsContainerInfo) {
    session.charts.allChartsContainerInfo[id].render();
  }
}

function resizeAllCharts() {
  for (let id in session.charts.allChartsContainerInfo) {
    let box = session.charts.allChartsContainerInfo[id];
		box.resizeFonts();
	}

	// renderAllCharts();
}

function submitChartXaxis(bnode) {
  chartMenuSubmit(bnode);
}

function chartTitleKeypressListener(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    let titleNode = document.getElementById("ChartTitleId");
    chartMenuSubmit(titleNode);
  }
}
