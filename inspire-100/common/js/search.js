// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function createMatchingTableHdrHTML() {
	if (!session) return "";
	if (!session.searchExpression) return "";
	if (!session.searchExpression.isValid()) return "";
	if (!session.searchExpression.isEmpty()) return "";

	let paramSet = session.searchExpression.paramSet();

	let str = "<thead><tr>";
	str += "<th>Range</th>";
	str += "<th colspan=3>Matching Breaths</th>";
	str += "<th colspan=" + paramSet.length + ">Parameter Values</th>";
	str += "</tr><tr>";
	str += "<th>Select</th>";
	str += "<th>Number</th>";
	str += "<th>Date</th>";
	for (let i=0; i<paramSet.length; i++) {
		str += "<th>";
		session.params[paramSet[i]].Name();
		str += "</th>";
	}
	str += "</tr></head>";
	return str;
}
