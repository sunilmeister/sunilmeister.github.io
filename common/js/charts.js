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
  allCharts = document.getElementById(ALL_CHARTS_ID);
  //console.log("chartInsertInitial ");
  newContainer = createNewChartContainer();
  allCharts.insertBefore(newContainer, null);
  // Open edit menu for the new chart box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartInsert(bnode) {
  containerNode = findAncestorChartContainerNode(bnode);
  //console.log("chartInsert " + containerNode.id);
  newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode);
  // Open edit menu for the new chart box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartAppend(bnode) {
  containerNode = findAncestorChartContainerNode(bnode);
  //console.log("chartAppend " + containerNode.id);
  newContainer = createNewChartContainer();
  containerNode.parentNode.insertBefore(newContainer, containerNode.nextSibling);
  // Open edit menu for the new chart box
  enode = findChildNodeByClass(newContainer, EDIT_ICON_CLASS);
  chartEdit(enode);
}

function chartEdit(bnode) {
  removeChartEditMenu();
  containerNode = findAncestorChartContainerNode(bnode);
  //console.log("chartEdit " + containerNode.id);
  temp = document.getElementById(CHART_EDIT_MENU_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content, CHART_EDIT_CHART_MENU_CLASS);
  node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  session.charts.boxTree = new CheckboxTree(CHART_CBOX_TREE_ROOT_ID);
  box = session.charts.allChartsContainerInfo[containerNode.id];
  box.updateMenu(CHART_EDIT_CHART_MENU_ID);
  session.charts.boxTree.PropagateFromLeafCheckboxes();
}

function chartDelete(bnode) {
  containerNode = findAncestorChartContainerNode(bnode);
  //console.log("chartDelete " + containerNode.id);
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
  menuDiv = document.getElementById(CHART_EDIT_CHART_MENU_ID);
  if (!menuDiv) return;
  menuDiv.remove();
}

function chartMenuCancel(bnode) {
  containerNode = findAncestorChartContainerNode(bnode);
  console.log("chartMenuCancel " + containerNode.id);
  removeChartEditMenu();
}

function chartMenuSubmit(bnode) {
  containerNode = findAncestorChartContainerNode(bnode);
  box = session.charts.allChartsContainerInfo[containerNode.id];
  box.updateOptions(CHART_EDIT_CHART_MENU_ID);
  //removeChartEditMenu();
  box.render();
}

var currentChartContainerNum = 0;

function createNewChartContainer() {
  temp = document.getElementById(CHART_CONTAINER_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content, CHART_CONTAINER_CLASS);
  node = template.cloneNode(true);
  node.id = CHART_CONTAINER_ID_PREFIX + (currentChartContainerNum++);
  body = findChildNodeByClass(node, CHART_BODY_CLASS);
  box = new ChartBox(body);
  storeChartContainerId(node.id, box);
  return node;
}

function numberOfExistingCharts() {
  return (Object.keys(session.charts.allChartsContainerInfo).length);
}

function findChartContainerId(id) {
  obj = session.charts.allChartsContainerInfo[id];
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

  if (session.charts.firstTimeChartsEntry) {
    //showEditIconReminder();
    session.charts.firstTimeChartsEntry = false;
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
  for (id in session.charts.allChartsContainerInfo) {
    session.charts.allChartsContainerInfo[id].render();
  }
}

function submitChartXaxis(bnode) {
  chartMenuSubmit(bnode);
}
