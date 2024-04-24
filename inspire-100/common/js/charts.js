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
  // Open edit menu for the new chart box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartInsert(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  let newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  // Open edit menu for the new chart box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartAppend(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  let newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  // Open edit menu for the new chart box
  let enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartEdit(bnode) {
  removeChartEditMenu();
  let containerNode = findAncestorChartContainerNode(bnode);
  let temp = document.getElementById(CHART_EDIT_MENU_TEMPLATE_ID);
  let template = findChildNodeByClass(temp.content, CHART_EDIT_CHART_MENU_CLASS);
  let node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  session.charts.boxTree = new CheckboxTree(CHART_CBOX_TREE_ROOT_ID);
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
  } else {
    removeChartEditMenu();
  }
}

function removeChartEditMenu() {
  if (session.charts.boxTree) delete session.charts.boxTree;
  let menuDiv = document.getElementById(CHART_EDIT_CHART_MENU_ID);
  if (!menuDiv) return;
  let titleNode = document.getElementById("ChartTitleId");
  titleNode.removeEventListener("keypress", chartTitleKeypressListener);
  menuDiv.remove();
}

function chartMenuCancel(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  removeChartEditMenu();
}

function chartMenuSubmit(bnode) {
  let containerNode = findAncestorChartContainerNode(bnode);
  let box = session.charts.allChartsContainerInfo[containerNode.id];
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

  // check for too many datapoints to render
  session.charts.numChartDatapoints 
      = session.reportRange.maxBnum - session.reportRange.minBnum + 1;
  if (session.charts.numChartDatapoints <= CHART_ALERT_THRESHOLD) {
    renderAllCharts();
    return;
  } else {
      modalAlert("Too many Breaths selected (" + session.charts.numChartDatapoints +")", 
        "Use Range Selector to select " + CHART_ALERT_THRESHOLD + " or less"
        + "\nbreaths to display"); 
      return;
  }
}

function renderAllCharts() {
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
