var checkBoxTreeRootId = "checkBoxTreeRoot";
var cboxTree = null;

window.onload = function() {
  cboxTree = new checkboxTree(checkBoxTreeRootId);
}

function CheckboxClicked(cbox) {
  cboxTree.CheckboxClicked(cbox);
}
