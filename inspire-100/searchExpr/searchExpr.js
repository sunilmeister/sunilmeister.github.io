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
	// Evaluate the value of the expression at a particular breath number
	// recursive
	eval(exprJson, bnum) {
		if (exprJson.type == "op") {
			let rhs = exprJson.rhs;
			let rhsVal = this.eval(rhs, bnum);
			let lhs = exprJson.lhs;
			let lhsVal = null;
			if (this.isBinaryExpr(exprJson)) {
				lhsVal = this.eval(lhs, bnum);
			}
			return this.evalOp(exprJson.op, lhsVal, rhsVal);

		} else if (exprJson.type == "param") {
			return session.params[exprJson.paramKey].ValueAtBnum(bnum);

		} else if (exprJson.type == "const") {
			return exprJson.constValue;
		}
	}

	// Normal math expression - not stringified json
	stringify(exprJson) {
		if (exprJson.type == "op") {
			let lhs = exprJson.lhs;
			let lhsStr = null;
			let rhs = exprJson.rhs;
			let rhsStr = this.stringify(rhs);
			if (this.isBinaryExpr(exprJson)) {
				lhsStr = this.stringify(lhs);
			}
			return this.stringifyOp(exprJson.op, lhsStr, rhsStr);

		} else if (exprJson.type == "param") {
			return exprJson.paramName;

		} else if (exprJson.type == "const") {
			if (exprJson.constName != "") {
				return '"' + exprJson.constName + '"';
			} else {
				return exprJson.constValue;
			}
		}
		return "";
	}

	// HTML unordered list
	createHTML(exprJson) {
		if (exprJson.type == "op") {
			if (this.isLeafExpr(exprJson)) {
				return this.createLeafHTML(exprJson);
			} else if (this.isUnaryExpr(exprJson)) {
				return this.createUnaryExprHTML(exprJson);
			} else {
				return this.createBinaryExprHTML(exprJson);
			}
		} else return ""; 
	}

	// Binary logical expression
	createBinaryExprHTML(exprJson) {
		let lhs = exprJson.lhs;
		let lhsStr = this.createHTML(lhs);
		let rhs = exprJson.rhs;
		let rhsStr = this.createHTML(rhs);
		let str = lhsStr;
		str += "<li id=" + exprJson.id + " class=opExprLi>";
		str += "<span class=opExprSpan>" + this.createExprSelectHTML(exprJson); 
		str += "</span></li>";
		str +=  rhsStr;
		return "<ul class=opExprUl>" + str + "</ul>";
	}

	// Unary logical expression
	createUnaryExprHTML(exprJson) {
		let rhs = exprJson.rhs;
		let rhsStr = this.createHTML(rhs);
		let str = "<ul class=opExprUl>" ;
		str += "<li id=" + exprJson.id + " class=opExprLi>";
		str += "<span class=opExprSpan>" + this.createExprSelectHTML(exprJson); 
		str += "</span></li>";
		str +=   rhsStr + "</ul>";
		return str;
	}

	createLeafHTML(exprJson) {
		// This is necessarily of the form "param op constant"
		let lhsStr = exprJson.lhs.paramName;
		let rhsStr = null;
		if (exprJson.rhs.constName != "") {
			rhsStr = '"' + exprJson.rhs.constName + '"';
		} else {
			rhsStr = exprJson.rhs.constValue;
		}
		let str = "<li id=" + exprJson.id + " class=leafExprLi>";
		str += "<span class=leafExprSpan>" ; 
		str += this.createLeafSelectHTML(exprJson);
		str += "</span></li>";
		return str;
	}

	// HTML unordered list
	createSelectOptionsHTML(exprJson) {
		if (exprJson.type == "op") {
			if (this.isLeafExpr(exprJson)) {
				return this.createLeafSelectOptionsHTML(exprJson);
			} else if (this.isUnaryExpr(exprJson)) {
				return this.createUnaryExprSelectOptionsHTML(exprJson);
			} else {
				return this.createBinaryExprSelectOptionsHTML(exprJson);
			}
		} else return ""; 
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

	// //////////////////////////////////////////////////////////////
	// Private functions below
	// //////////////////////////////////////////////////////////////

	isLeafExpr(exprJson) {
		// Leaf exprs have lhs and rhs
		// Further lhs is param and rhs is const
		if (this.isUnaryExpr(exprJson)) return false;
		let lhs = exprJson.lhs;
		let rhs = exprJson.rhs;
		if ((lhs.type == "param") && (rhs.type == "const")) return true;
		else return false;
	}

	isBinaryExpr(exprJson) {
		// Binary expressions have lhs and rhs
		if (!isUndefined(exprJson.lhs) && (exprJson.lhs !== null)) {
			if (!isUndefined(exprJson.rhs) && (exprJson.rhs !== null)) return true;
		}
		return false;
	}

	isUnaryExpr(exprJson) {
		// Unary expressions only have rhs
		if (isUndefined(exprJson.lhs) || (exprJson.lhs === null)) return true;
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

		if (op == "==") {
			return lhsVal == rhsVal;
		}
		if (op == "!=") {
			return lhsVal == rhsVal;
		}
		if (op == ">") {
			return lhsVal > rhsVal;
		}
		if (op == ">=") {
			return lhsVal >= rhsVal;
		}
		if (op == "<") {
			return lhsVal < rhsVal;
		}
		if (op == "<=") {
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

		if (op == "==") {
			return "(" + lhsStr + " == " + rhsStr + ")";
		}
		if (op == "!=") {
			return "(" + lhsStr + " != " + rhsStr + ")";
		}
		if (op == ">") {
			return "(" + lhsStr + " > " + rhsStr + ")";
		}
		if (op == ">=") {
			return "(" + lhsStr + " >= " + rhsStr + ")";
		}
		if (op == "<") {
			return "(" + lhsStr + " < " + rhsStr + ")";
		}
		if (op == "<=") {
			return "(" + lhsStr + " <= " + rhsStr + ")";
		}
	}

	formParamSelectId(exprJson) {
		return exprJson.id.replace(SEARCH_NODE_ID_PREFIX, PARAM_NODE_ID_PREFIX);
	}

	formConstEnumSelectId(exprJson) {
		return exprJson.id.replace(SEARCH_NODE_ID_PREFIX, SELECT_ENUM_NODE_ID_PREFIX);
	}

	formConstNumSelectId(exprJson) {
		return exprJson.id.replace(SEARCH_NODE_ID_PREFIX, INPUT_NUM_NODE_ID_PREFIX);
	}

	formOpSelectId(exprJson) {
		return exprJson.id.replace(SEARCH_NODE_ID_PREFIX, OP_NODE_ID_PREFIX);
	}

	createLeafSelectHTML(exprJson) {
		let str = "<select id=" + this.formParamSelectId(exprJson.lhs);
		str += " class=paramSelectCls></select>" ;

		str += "<select id=" + this.formOpSelectId(exprJson);
		str += " class=leafOpSelectCls></select>" ;

		str += "<select id=" + this.formConstEnumSelectId(exprJson.rhs);
		str += " class=constEnumSelectCls style='display:inline-block'></select>" ;

		str += "<input type=number id=" + this.formConstNumSelectId(exprJson.rhs);
		str += " class=constNumberSelectCls style='display:none'></input>" ;

		return str;
	}

	createExprSelectHTML(exprJson) {
		let str = "<select id=" + this.formOpSelectId(exprJson);
		str += " class=exprOpSelectCls></select>" ;
		return str;
	}

	// This must be done AFTER the HTML is added to the DOM
	createUnaryExprSelectOptionsHTML(exprJson) {
		const logicOps = ["NOT", "AND", "OR", "XOR"];
		let pid = this.formOpSelectId(exprJson);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< logicOps.length; i++) {
			let opt = document.createElement("option"); 
			opt.text = logicOps[i];
			opt.value = logicOps[i];
			dropdown.options.add(opt);
		}
		dropdown.value = exprJson.op;

		this.createSelectOptionsHTML(exprJson.rhs);
	}

	// This must be done AFTER the HTML is added to the DOM
	createBinaryExprSelectOptionsHTML(exprJson) {
		const logicOps = ["NOT", "AND", "OR", "XOR"];
		let pid = this.formOpSelectId(exprJson);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< logicOps.length; i++) {
			let opt = document.createElement("option"); 
			opt.text = logicOps[i];
			opt.value = logicOps[i];
			dropdown.options.add(opt);
		}
		dropdown.value = exprJson.op;

		this.createSelectOptionsHTML(exprJson.lhs);
		this.createSelectOptionsHTML(exprJson.rhs);
	}

	// This must be done AFTER the HTML is added to the DOM
	createLeafSelectOptionsHTML(exprJson) {
		let pid = this.formParamSelectId(exprJson.lhs);
		let dropdown = document.getElementById(pid);
		
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			let opt = document.createElement("option"); 
			opt.text = param.name;
			opt.value = param.name;
			dropdown.options.add(opt);
		}
		dropdown.value = exprJson.lhs.paramName;

		// find the key for the param
		let paramKey = null;
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			if (param.name == exprJson.lhs.paramName) {
				paramKey = param.key;
				break;
			}
		}

		// The constant could be select or an input
		// Selectively display the correct one
		let sid = this.formConstEnumSelectId(exprJson.rhs);
		let sdd = document.getElementById(sid);
		let iid = this.formConstNumSelectId(exprJson.rhs);
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
			sdd.value = exprJson.rhs.constName;
		} else {
			sdd.style.display = "none" ;
			idd.style.display = "inline-block" ;
			idd.value = exprJson.rhs.constValue;
		}

		// Dropdown list for operators
		let oid = this.formOpSelectId(exprJson);
		let oo = document.getElementById(oid);
		let opRange = paramOps[paramType.type];
		for (let i=0; i< opRange.length; i++) {
			let op = opRange[i];
			let opt = document.createElement("option"); 
			opt.text = op;
			opt.value = op;
			oo.options.add(opt);
		}
		oo.value = exprJson.op;
	}

}
