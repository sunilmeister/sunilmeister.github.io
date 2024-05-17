// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/*
 * Various types of nodes that make up a search expression
 *

*/

var searchExprNodeNum = 0;
const SEARCH_NODE_ID_PREFIX = "SExprNode_" ;
const PARAM_NODE_ID_PREFIX = "SExprParam_" ;
const CONST_NODE_ID_PREFIX = "SExprConst_" ;
const CONST_ENUM_ID_PREFIX = "SExprConstEnum_" ;
const CONST_NUMBER_ID_PREFIX = "SExprConstNum_" ;
const SELECT_ENUM_NODE_ID_PREFIX = "SExprEnum_" ;
const INPUT_NUM_NODE_ID_PREFIX = "SExprNum_" ;
const OP_NODE_ID_PREFIX = "SExprOp_" ;

// //////////////////////////////////////////////////////////////
// No error checking done on the expression JSON
// It must be correct by construction before passing it to this class
// //////////////////////////////////////////////////////////////
class searchExpr {
	constructor(exprJson) {
		this.exprJson = exprJson;
	}

	// Evaluate the value of the expression at a particular breath number
	evaluate(bnum) {
		return this.evalRecursive(this.exprJson, bnum);
	}

	// Normal math expression - not stringified json
	stringify() {
		return this.stringifyRecursive(this.exprJson);
	}

	// Convert to HTML for display
	createHTML() {
		return this.createHTMLRecursive(this.exprJson);
	}

	// render into a div
	render(divId) {
		let containerDiv = document.getElementById(divId);
		containerDiv.innerHTML = this.createHTML();
		this.createSelectOptionsHTML();
	}

	findNode(nodeId) {
		return this.findNodeRecursive(this.exprJson, nodeId);
	}

	isEmpty() {
		return this.isEmptyExpr(this.exprJson);
	}
	

	// //////////////////////////////////////////////////////////////
	// Private functions below
	// //////////////////////////////////////////////////////////////

	isEmptyExpr(json) {
		if (isUndefined(json) || (json === null)) return true;
		if (Object.keys(json).length === 0) return true;
		return false;
	}

	createSelectOptionsHTML() {
		this.createSelectOptionsHTMLRecursive(this.exprJson);
	}

	findNodeRecursive(json, nodeId) {
		if (this.isEmptyExpr(json)) return null;
		if (json.id == nodeId) return json;

		let rhs = json.rhs;
		let node = this.findNodefindNodeRecursive(rhs, nodeId);
		if (node) return node;

		if (this.isBinaryExpr(json)) {
			let lhs = json.lhs;
			node = this.findNodefindNodeRecursive(lhs, nodeId);
			if (node) return node;
		}
		return null;
	}

	evalRecursive(json, bnum) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			let rhs = json.rhs;
			let rhsVal = this.evalRecursive(rhs, bnum);
			let lhs = json.lhs;
			let lhsVal = null;
			if (this.isBinaryExpr(json)) {
				lhsVal = this.evalRecursive(lhs, bnum);
			}
			return this.evalOp(json.op, lhsVal, rhsVal);

		} else if (json.type == "param") {
			return session.params[json.paramKey].ValueAtBnum(bnum);

		} else if (json.type == "const") {
			return json.constValue;
		}
		return null;
	}

	stringifyRecursive(json) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			let lhs = json.lhs;
			let lhsStr = null;
			let rhs = json.rhs;
			let rhsStr = this.stringifyRecursive(rhs);
			if (this.isBinaryExpr(json)) {
				lhsStr = this.stringifyRecursive(lhs);
			}
			return this.stringifyOp(json.op, lhsStr, rhsStr);

		} else if (json.type == "param") {
			return json.paramName;

		} else if (json.type == "const") {
			if (json.constName != "") {
				return '"' + json.constName + '"';
			} else {
				return json.constValue;
			}
		}
		return null;
	}

	// HTML unordered list
	createHTMLRecursive(json) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			if (this.isLeafExpr(json)) {
				return this.createLeafHTML(json);
			} else if (this.isUnaryExpr(json)) {
				return this.createUnaryExprHTML(json);
			} else {
				return this.createBinaryExprHTML(json);
			}
		} 
		return null; 
	}

	// Binary logical expression
	createBinaryExprHTML(json) {
		let lhs = json.lhs;
		let lhsStr = this.createHTMLRecursive(lhs);
		let rhs = json.rhs;
		let rhsStr = this.createHTMLRecursive(rhs);
		let str = lhsStr;
		str += "<li id=" + json.id + " class=opExprLi>";
		str += "<span class=opExprSpan>" + this.createExprSelectHTML(json); 
		str += "</span></li>";
		str +=  rhsStr;
		return "<ul class=opExprUl>" + str + "</ul>";
	}

	// Unary logical expression
	createUnaryExprHTML(json) {
		let rhs = json.rhs;
		let rhsStr = this.createHTMLRecursive(rhs);
		let str = "<ul class=opExprUl>" ;
		str += "<li id=" + json.id + " class=opExprLi>";
		str += "<span class=opExprSpan>" + this.createExprSelectHTML(json); 
		str += "</span></li>";
		str +=   rhsStr + "</ul>";
		return str;
	}

	createLeafHTML(json) {
		// This is necessarily of the form "param op constant"
		let lhsStr = json.lhs.paramName;
		let rhsStr = null;
		if (json.rhs.constName != "") {
			rhsStr = '"' + json.rhs.constName + '"';
		} else {
			rhsStr = json.rhs.constValue;
		}
		let str = "<li id=" + json.id + " class=leafExprLi>";
		str += "<span class=leafExprSpan>" ; 
		str += this.createLeafSelectHTML(json);
		str += "</span></li>";
		return str;
	}

	createSelectOptionsHTMLRecursive(json) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			if (this.isLeafExpr(json)) {
				return this.createLeafSelectOptionsHTML(json);
			} else if (this.isUnaryExpr(json)) {
				return this.createUnaryExprSelectOptionsHTML(json);
			} else {
				return this.createBinaryExprSelectOptionsHTML(json);
			}
		} 
		return null; 
	}

	createNodeParam(paramName, paramKey) {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "param",
			paramName: paramName,
			paramKey: paramKey,
		};
	}

	createNodeConst(constName, constValue) {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "const",
			constName: constName,
			constValue: constValue,
		};
	}

	createNodeOp(op, lhs, rhs) {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "op",
			op: op,
			lhs: cloneObject(lhs),
			rhs: cloneObject(rhs),
		};
	}

	isLeafExpr(json) {
		if (this.isEmptyExpr(json)) return null;

		// Leaf exprs have lhs and rhs
		// Further lhs is param and rhs is const
		if (this.isUnaryExpr(json)) return false;
		let lhs = json.lhs;
		let rhs = json.rhs;
		if ((lhs.type == "param") && (rhs.type == "const")) return true;
		else return false;
	}

	isBinaryExpr(json) {
		if (this.isEmptyExpr(json)) return null;

		// Binary expressions have lhs and rhs
		if (!isUndefined(json.lhs) && (json.lhs !== null)) {
			if (!isUndefined(json.rhs) && (json.rhs !== null)) return true;
		}
		return false;
	}

	isUnaryExpr(json) {
		if (this.isEmptyExpr(json)) return null;

		// Unary expressions only have rhs
		if (isUndefined(json.lhs) || (json.lhs === null)) return true;
		else return false;
	}

	// Evaluate the value of a sub-expression
	evalOp(op, lhsVal, rhsVal) {
		if (op == "NOT") {
			return !rhsVal;
		}
		if (op == "AND") {
			return lhsVal && rhsVal;
		}
		if (op == "OR") {
			return lhsVal || rhsVal;
		}
		if (op == "XOR") {
  		return (lhsVal && !rhsVal) || (!lhsVal && rhsVal);
		}

		if (op == "EQ") {
			return lhsVal == rhsVal;
		}
		if (op == "NEQ") {
			return lhsVal == rhsVal;
		}
		if (op == "GT") {
			return lhsVal > rhsVal;
		}
		if (op == "GEQ") {
			return lhsVal >= rhsVal;
		}
		if (op == "LT") {
			return lhsVal < rhsVal;
		}
		if (op == "LEQ") {
			return lhsVal <= rhsVal;
		}
	}

	// Stringify a sub-expression 
	stringifyOp(op, lhsStr, rhsStr) {
		if (op == "NOT") {
			return "NOT(" + rhsStr + ")";
		}
		if (op == "AND") {
			return "(" + lhsStr + " AND " + rhsStr + ")";
		}
		if (op == "OR") {
			return "(" + lhsStr + " OR " + rhsStr + ")";
		}
		if (op == "XOR") {
			return "(" + lhsStr + " XOR " + rhsStr + ")";
		}

		if (op == "EQ") {
			return "(" + lhsStr + " == " + rhsStr + ")";
		}
		if (op == "NEQ") {
			return "(" + lhsStr + " != " + rhsStr + ")";
		}
		if (op == "GT") {
			return "(" + lhsStr + " > " + rhsStr + ")";
		}
		if (op == "GEQ") {
			return "(" + lhsStr + " >= " + rhsStr + ")";
		}
		if (op == "LT") {
			return "(" + lhsStr + " < " + rhsStr + ")";
		}
		if (op == "LEQ") {
			return "(" + lhsStr + " <= " + rhsStr + ")";
		}
	}

	formParamNodeId(htmlId) {
		return htmlId.replace(PARAM_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
	}

	formParamSelectId(json) {
		return json.id.replace(SEARCH_NODE_ID_PREFIX, PARAM_NODE_ID_PREFIX);
	}

	formConstEnumSelectId(json) {
		return json.id.replace(SEARCH_NODE_ID_PREFIX, SELECT_ENUM_NODE_ID_PREFIX);
	}

	formConstEnumNodeId(htmlId) {
		return htmlId.replace(SELECT_ENUM_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
	}

	formConstNumSelectId(json) {
		return json.id.replace(SEARCH_NODE_ID_PREFIX, INPUT_NUM_NODE_ID_PREFIX);
	}

	formConstNumNodeId(htmlId) {
		return htmlId.replace(INPUT_NUM_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
	}

	formOpSelectId(json) {
		return json.id.replace(SEARCH_NODE_ID_PREFIX, OP_NODE_ID_PREFIX);
	}

	formOpNodeId(htmlId) {
		return htmlId.replace(OP_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
	}

	createLeafSelectHTML(json) {
		let str = "<select id=" + this.formParamSelectId(json.lhs);
		str += " class=paramSelectCls></select>" ;

		str += "<select id=" + this.formOpSelectId(json);
		str += " class=leafOpSelectCls></select>" ;

		str += "<select id=" + this.formConstEnumSelectId(json.rhs);
		str += " class=constEnumSelectCls style='display:inline-block'></select>" ;

		str += "<input type=number id=" + this.formConstNumSelectId(json.rhs);
		str += " class=constNumberSelectCls style='display:none'></input>" ;

		return str;
	}

	createExprSelectHTML(json) {
		let str = "<select id=" + this.formOpSelectId(json);
		str += " class=exprOpSelectCls></select>" ;
		return str;
	}

	// This must be done AFTER the HTML is added to the DOM
	createUnaryExprSelectOptionsHTML(json) {
		const logicOps = ["NOT", "AND", "OR", "XOR"];
		let pid = this.formOpSelectId(json);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< logicOps.length; i++) {
			let opt = document.createElement("option"); 
			opt.text = logicOps[i];
			opt.value = logicOps[i];
			dropdown.options.add(opt);
		}
		dropdown.value = json.op;

		this.createSelectOptionsHTMLRecursive(json.rhs);
	}

	// This must be done AFTER the HTML is added to the DOM
	createBinaryExprSelectOptionsHTML(json) {
		const logicOps = ["NOT", "AND", "OR", "XOR"];
		let pid = this.formOpSelectId(json);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< logicOps.length; i++) {
			let opt = document.createElement("option"); 
			opt.text = logicOps[i];
			opt.value = logicOps[i];
			dropdown.options.add(opt);
		}
		dropdown.value = json.op;

		this.createSelectOptionsHTMLRecursive(json.lhs);
		this.createSelectOptionsHTMLRecursive(json.rhs);
	}

	// This must be done AFTER the HTML is added to the DOM
	createLeafSelectOptionsHTML(json) {
		let pid = this.formParamSelectId(json.lhs);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			let opt = document.createElement("option"); 
			opt.text = param.name;
			opt.value = param.name;
			dropdown.options.add(opt);
		}
		dropdown.value = json.lhs.paramName;

		// find the key for the param
		let paramKey = null;
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			if (param.name == json.lhs.paramName) {
				paramKey = param.key;
				break;
			}
		}

		// The constant could be select or an input
		// Selectively display the correct one
		let sid = this.formConstEnumSelectId(json.rhs);
		let sdd = document.getElementById(sid);
		let iid = this.formConstNumSelectId(json.rhs);
		let idd = document.getElementById(iid);

		let paramType = session.params[paramKey].type;
		if (paramType.type == "ENUM") {
			// Dropdown list for enumerators
			sdd.style.display = "inline-block" ;
			idd.style.display = "none" ;
			let paramRange = paramType.range;
			let values = Object.keys(paramRange);
			for (let i=0; i< values.length; i++) {
				let value = values[i];
				let opt = document.createElement("option"); 
				opt.text = value;
				opt.value = value;
				sdd.options.add(opt);
			}
			sdd.value = json.rhs.constName;
		} else {
			sdd.style.display = "none" ;
			idd.style.display = "inline-block" ;
			idd.value = json.rhs.constValue;
		}

		// Dropdown list for operators
		let oid = this.formOpSelectId(json);
		let oo = document.getElementById(oid);
		let opRange = paramOps[paramType.type];
		for (let i=0; i< opRange.length; i++) {
			let op = opRange[i];
			let opt = document.createElement("option"); 
			opt.text = op;
			opt.value = op;
			oo.options.add(opt);
		}
		oo.value = json.op;
	}

}
