// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var breathSelectRoot = -1;
var breathSelectMin = -1;
var breathSelectMax = -1;

function clearBreathSelection() {
	breathSelectRoot = -1;
	breathSelectMin = -1;
	breathSelectMax = -1;
}

function updateSearchResults() {
	//console.log("updateSearch");
	let div = document.getElementById("searchResults");
	if (!session.search.criteria.isValid()) {
		div.style.display = "none";
		return;
	}
	if (session.search.criteria.isEmpty()) {
		div.style.display = "none";
		return;
	}
	div.style.display = "block";

	let tableDiv = document.getElementById('searchResultsTbl');
	tableDiv.innerHTML = "";

	session.search.results = [];
	matchSearchExpr();
}

function matchSearchExpr() {
	//clearBreathSelection();

	let div = document.getElementById("searchResults");
	if (!session.search.criteria.isValid()) {
		div.style.display = "none";
		modalAlert("INVALID Search Criteria", "Fill in all the fields");
		return;
	}
	if (session.search.criteria.isEmpty()) {
		div.style.display = "none";
		modalAlert("EMPTY Search Criteria", "Specify Search Criteria");
		return;
	}
	div.style.display = "block";

	if (session.search.range === null) {
		session.search.range = cloneObject(session.reportRange);
	}
	let minBnum = session.search.range.minBnum;
	let maxBnum = session.search.range.maxBnum - 1;
	//console.log("minBnum", minBnum,"maxBnum",maxBnum);
	if (minBnum > maxBnum) return;

	let captionDiv = document.getElementById("searchResultsCaption");
	captionDiv.innerHTML = "SEARCH RESULTS in Breath number range [" 
													+ minBnum + ", " + maxBnum + "]";

	let bnum = minBnum;
	if (session.search.results.length) {
		// already some search results
		// start from where we left off at the last bnum in the results
		let len = session.search.results.length;
		let pValue = session.search.results[len - 1];
		if (pValue === null) return;
		bnum = pValue.bnum + 1;
	}

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

	let tableHTML = createMatchingTableHdrHTML() + createMatchingTableEntriesHTML();
	let tableDiv = document.getElementById('searchResultsTbl');
	tableDiv.innerHTML = tableHTML;
}

function createMatchingTableHdrHTML() {
	if (!session) return "";
	if (!session.search.criteria) return "";
	if (!session.search.criteria.isValid()) return "";
	if (session.search.criteria.isEmpty()) return "";

	let paramSet = session.search.paramSet;

	let str = "<thead class=searchResultsTblTheadCls><tr>";
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

 	str += '<tbody class=searchResultsTblTbodyCls>';
	for (let i=0; i<numResults; i++) {
		let pValues = session.search.results[i];
		if (pValues === null) continue;

		let bnum = pValues.bnum;
		str += '<tr>';
		str += '<td><input class=searchRangeBoxCls type=checkbox value=' + i;
		str += ' onclick="breathSelectCheckbox(event, this)" ';
		str += 'onmouseenter="searchCheckboxEnter()" onmouseleave="searchCheckboxLeave()"></input></td>';
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
		str += ' class=searchMoreCls onclick="matchSearchExpr()">' + numResults + ' Matches: Click for more</td>';
	}
	str += '</tr>';

 	str += '</tbody>';
	return str;
}

function padMinBnum(bnum) {
	if (bnum <= 3) bnum = 1;
	else bnum = bnum - 3;
	return bnum;
}

function padMaxBnum(bnum) {
	let numBreaths = session.breathTimes.length;
	if (bnum >= (numBreaths - 3)) bnum = numBreaths;
	else bnum = bnum + 3;
	return bnum;
}

function showSelectedMatchingBreathRange() {
	let tableDiv = document.getElementById('searchResultsTbl');
	let tbody = tableDiv.tBodies[0];
	if (tbody.rows.length <= 1) return;

	//console.log("breathSelectMin", breathSelectMin, "breathSelectMax", breathSelectMax);

	let rangeStr = "[" + padMinBnum(session.search.results[breathSelectMin].bnum) + " - ";
	rangeStr += padMaxBnum(session.search.results[breathSelectMax].bnum) + "]";

	let str = "Zoom all other views to Breath range " + rangeStr ;
	let pDiv = document.getElementById('setMatchingRange');
	pDiv.innerHTML = "<U>" + str + "</U>";

	for (let i=0; i<tbody.rows.length - 1; i++) {
		let row = tbody.rows[i];

		// Handle the checkboxes
		if ((i <= breathSelectMax) && (i >= breathSelectMin)) {
			row.cells[0].firstChild.checked = true;
		} else {
			row.cells[0].firstChild.checked = false;
		}

		// Handle background color
		for (let j=0; j<row.cells.length ; j++) {
			if ((i <= breathSelectMax) && (i >= breathSelectMin)) {
				row.cells[j].style.backgroundColor = palette.lightgreen;
			} else {
				row.cells[j].style.backgroundColor = palette.blue;
			}
		}
	}
}

function breathSelectCheckbox(e, cbox) {
	let cboxVal = Number(cbox.value);

	if ((breathSelectRoot == -1) || !e.shiftKey) {
		// Some checkbox clicked 
		// without SHIFT key - take it as start of selection
		// Initial Root element can be selected with our without SHIFT
		breathSelectRoot = cboxVal;
		breathSelectMin = cboxVal;
		breathSelectMax = cboxVal;
	} else if (cboxVal < breathSelectRoot) {
		breathSelectMin = cboxVal;
		breathSelectMax = breathSelectRoot;
	} else {
		breathSelectMax = cboxVal;
		breathSelectMin = breathSelectRoot;
	}

	showSelectedMatchingBreathRange();
}

function setRangeSelectorForSelectedBreaths() {
	let minBnum = padMinBnum(session.search.results[breathSelectMin].bnum);
	let maxBnum = padMaxBnum(session.search.results[breathSelectMax].bnum);

	session.reportRange = createReportRange(false, minBnum, maxBnum);

	let rangeStr = "[" + minBnum + " - " + maxBnum + "]";
	let str = "Other views Range Select set to \n" + rangeStr ;
	modalInfo(str, "Selected Breaths below (GREEN)");
}

function searchCheckboxEnter() {
	document.getElementById("searchCheckboxTooltip").style.display = "block" ;
}

function searchCheckboxLeave() {
	document.getElementById("searchCheckboxTooltip").style.display = "none" ;
}
