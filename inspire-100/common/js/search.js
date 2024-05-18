// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// Same DIV is shared for various exports by changing the onclick function
function exportSearchExpr() {
  let exportBtn = document.getElementById("exportFileBtn");
	exportBtn.onclick = function() { exportExprFile() };
	let exportDiv = document.getElementById("exportDiv");
	exportDiv.style.display = "block";
}

function importSearchExpr() {
	let importDiv = document.getElementById("importExprDiv");
	importDiv.style.display = "block";
}

function cancelExprImport() {
	let importDiv = document.getElementById("importExprDiv");
	importDiv.style.display = "none";
}

