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
var allChartsId = "allCharts";
var allChartContainerInfo = {};
var cboxTreeRootId = "checkBoxTreeRoot";
var cboxTree = null;
var chartsXrange = null;

function chartInsertOnTop() {
  allCharts = document.getElementById(allChartsId);
  //console.log("chartInsertOnTop ");
  newContainer = createNewChartContainer();
  allCharts.insertBefore(newContainer, null);
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
  cboxTree = new checkboxTree(cboxTreeRootId);
  box = allChartContainerInfo[containerNode.id];
  box.updateMenu(editChartMenuId);
  cboxTree.PropagateFromLeafCheckboxes();
}

function chartDelete(bnode) {
  containerNode = bnode.parentNode.parentNode;
  //console.log("chartDelete " + containerNode.id);
  removeChartContainerId(containerNode.id);
  containerNode.remove();
  if (isChartContainerIdEmpty()) {
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
  console.log("chartMenuSubmit " + containerNode.id);
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
  box = new chartBox(node);
  storeChartContainerId(node.id,box);
  return node;
}

function isChartContainerIdEmpty() {
  return (Object.keys(allChartContainerInfo).length==0);
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

window.onload = function() {
  //cboxTree = new checkboxTree(checkBoxTreeRootId);
}

