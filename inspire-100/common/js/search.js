// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function matchSearchExpr() {
	let div = document.getElementById("searchResults");
	div.style.display = "block";

	if (session.search.range === null) {
		session.search.range = cloneObject(session.reportRange);
	}
	let minBnum = session.search.range.minBnum;
	let maxBnum = session.search.range.maxBnum;

	let bnum = minBnum;
	let matchNum = 0;

	// Do search for SEARCH_ITEMS_AT_A_TIME at a time
	while (1) {
		if (bnum > maxBnum) break;
		if (matchNum >= SEARCH_ITEMS_AT_A_TIME) break;
		let v = session.search.criteria.evaluate(bnum);
		if (v === true) {
			matchNum++;
			let pValues = session.search.criteria.paramValuesAt(bnum);
			session.search.results.push(cloneObject(pValues));
		}
		bnum++;
	}
	if (matchNum < SEARCH_ITEMS_AT_A_TIME) {
		// signal end of search
		session.search.results.push(null);
	}
	
	session.search.paramSet = cloneObject(session.search.criteria.paramSetUsed());
	//session.search.results.push(null);

	let tableHTML = createMatchingTableHdrHTML() + createMatchingTableEntriesHTML();
	let tableDiv = document.getElementById('searchResultsTbl');
	tableDiv.innerHTML = tableHTML;
}

function createMatchingTableHdrHTML() {
	if (!session) return "";
	if (!session.search.criteria) return "";
	//console.log("isValid", session.search.criteria.isValid(), "isEmpty", session.search.criteria.isEmpty())
	if (!session.search.criteria.isValid()) return "";
	if (session.search.criteria.isEmpty()) return "";

	let paramSet = session.search.paramSet;

	//console.log("Header");
	let str = "<thead><tr>";
	str += "<th>Range</th>";
	str += "<th colspan=3>Matching Breaths</th>";
	str += "<th colspan=" + paramSet.length + ">Parameter Values</th>";
	str += "</tr><tr>";
	str += "<th>Select</th>";
	str += "<th>Number</th>";
	str += "<th>Date</th>";
	str += "<th>Time</th>";
	for (let i=0; i<paramSet.length; i++) {
		str += "<th>";
		let paramKey = paramSet[i];
		str += session.params[paramKey].Name();
		str += "</th>";
	}
	str += "</tr></head>";
	return str;
}

function createMatchingTableEntriesHTML() {
	if (!session) return "";
	if (!session.search.criteria) return "";
	if (!session.search.criteria.isValid()) return "";
	if (session.search.criteria.isEmpty()) return "";

	let str = "";
	let paramSet = session.search.paramSet;
	let results = session.search.results;
	let numResults = results.length;
	let searchDone = false;
	if ((numResults != 0) && (results[numResults-1] === null)) {
		searchDone = true;
		numResults --;
	}

 	str += '<tbody>';
	for (let i=0; i<numResults; i++) {
		let pValues = session.search.results[i];
		if (pValues === null) continue;

		let bnum = pValues.bnum;
		str += '<tr>';
		str += '<td><input class=searchRangeBoxCls type="checkbox"></input></td>';
		str += '<td>' + bnum + '</td>' ;
		let btime = session.breathTimes[bnum];

		str += '<td>' + dateToDateStr(btime) + '</td>' ;
		str += '<td>' + dateToTimeStr(btime) + '</td>' ;
		for (let p=0; p<paramSet.length; p++) {
			let paramKey = paramSet[p];
			let paramVal = pValues.values[paramKey];
			let paramType = session.params[paramKey].Type();
			if (paramType.type == "ENUM") {
				let enumRange = paramType.range;
    		Object.keys(enumRange).forEach(key => {
        	const value = enumRange[key];
					if (value == paramVal) {
						str += '<td>' + key + '</td>';
						return;
					}
    		});
			} else {
				str += '<td>' + paramVal + '</td>';
			}
		}
		str += '</tr>';
	}
	
	// closing row
	str += '<tr><td colspan=' + (paramSet.length + 4);
	if (searchDone) {
		str += ' class=searchNoMoreCls>' + numResults + ' Matches: End of Search</td>';
	} else {
		str += ' class=searchMoreCls>' + numResults + ' Matches: Click for more</td>';
	}
	str += '</tr>';

 	str += '</tbody>';
	return str;
}
