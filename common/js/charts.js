// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
// Below are all chart data utilities
/////////////////////////////////////////////////////////////////

function toggleDataSeries(e) {
  if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  }
  else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

/////////////////////////////////////////////////////////////////
// Below are all chart user-interface utilities
/////////////////////////////////////////////////////////////////

function chartInsertOnTop() {
  allCharts = document.getElementById(ALL_CHARTS_ID);
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
  temp = document.getElementById(EDIT_MENU_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content,EDIT_CHART_MENU_CLASS);
  node = template.cloneNode(true);
  containerNode.insertBefore(node, bnode.parentNode.nextSibling);
  app.cboxTree = new CheckboxTree(CBOX_TREE_ROOT_ID);
  box = app.allChartsContainerInfo[containerNode.id];
  box.updateMenu(EDIT_CHART_MENU_ID);
  app.cboxTree.PropagateFromLeafCheckboxes();
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
  if (app.cboxTree) delete app.cboxTree;
  menuDiv = document.getElementById(EDIT_CHART_MENU_ID);
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
  box = app.allChartsContainerInfo[containerNode.id];
  box.updateOptions(EDIT_CHART_MENU_ID);
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
  temp = document.getElementById(CHART_CONTAINER_TEMPLATE_ID);
  template = findChildNodeByClass(temp.content,CHART_CONTAINER_CLASS);
  node = template.cloneNode(true);
  node.id = CHART_CONTAINER_ID_PREFIX + (currentChartContainerNum++) ;
  body = findChildNodeByClass(node,CHART_BODY_CLASS);
  box = new ChartBox(body);
  storeChartContainerId(node.id,box);
  return node;
}

function numberOfExistingCharts() {
  return (Object.keys(app.allChartsContainerInfo).length);
}

function findChartContainerId(id) {
  obj = app.allChartsContainerInfo[id];
  if (!obj || (typeof obj == 'undefined')) return null;
  return obj;
}

function storeChartContainerId(id, chartBox) {
  app.allChartsContainerInfo[id] = chartBox;
}

function removeChartContainerId(id) {
  delete app.allChartsContainerInfo[id];
}

function treeCheckboxClicked(cbox) {
  app.cboxTree.CheckboxClicked(cbox);
}

