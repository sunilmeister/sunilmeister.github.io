// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/*
 * Various types of nodes that make up a search expression
 *
node: {
	id: "id",
  type: "op",
	op: "AND|OR|...",
	lhs: {node:{}},
	rhs: {node:{}}
}

node: {
	id: "id",
  type: "param",
	paramName: "paramName",
	paramKey: "paramName",
}

node: {
	id: "id",
  type: "const",
	constName: "",
	constValue: "value",
}

// Below json represents the expression
// (mode==CMV) AND ((peak<=32) OR (vt > 400))
{
	id: "id1",
	type: "op",
	op: "AND",
	lhs: {
		id: "id2",
		type: "op",
		op: "==",
		lhs: {
			id: "id3",
			type: "param",
			paramName: "MODE_SETTING",
			paramKey: "mode",
		},
		rhs: {
			id: "id4",
			type: "const",
			constName: "CMV",
			constValue: 0,
		},
	},
	rhs: {
		id: "id4",
		type: "op",
		op: "OR"
		lhs: {
			id: "id5",
			type: "op",
			op: "<=",
			lhs: {
				id: "id6",
				type: "param",
				paramName: "PEAK_PRESSURE",
				paramKey: "peak",
			},
			rhs: {
				id: "id7",
				type: "const",
				constName: "",
				constValue: 32,
			},
		},
		rhs: {
			id: "id7",
			type: "op",
			op: ">",
			lhs: {
				id: "id7",
				type: "param",
				paramName: "TIDAL_VOLUME",
				paramKey: "vtdel",
			},
			rhs: {
				id: "id8",
				type: "const",
				constName: "",
				constValue: 450,
			},
		},
	},
}

*/

var searchExprNodeNum = 0;
const SEARCH_EXPR_NODE_ID_PREFIX = "SNode_" ;

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
		let imgClass = "class='iconButton opIconLi'";
		let iconHTML = "<span class=opIconSpan>" + 
			"<img " + imgClass + " src=../common/img/pen.png onclick='opEditClick(this)'>" +
			"<img " + imgClass + " src=../common/img/plus.png onclick='opAddClick(this)'>" +
			"<img " + imgClass + " src=../common/img/trash-bin.png onclick='opDeleteClick(this)'>" +
			"</span>";

		let lhs = exprJson.lhs;
		let lhsStr = this.createHTML(lhs);
		let rhs = exprJson.rhs;
		let rhsStr = this.createHTML(rhs);
		let str = lhsStr;
		str += "<li id=" + exprJson.id + " class=opExprLi>" + iconHTML; 
		str += "<span class=opExprSpan>" + exprJson.op + "</span></li>";
		str +=  rhsStr;
		return "<ul class=opExprUl>" + str + "</ul>";
	}

	// Unary logical expression
	createUnaryExprHTML(exprJson) {
		let imgClass = "class='iconButton opIconLi'";
		let iconHTML = "<span class=opIconSpan>" + 
			"<img " + imgClass + " src=../common/img/pen.png onclick='opEditClick(this)'>" +
			"<img " + imgClass + " src=../common/img/plus.png onclick='opAddClick(this)'>" +
			"<img " + imgClass + " src=../common/img/trash-bin.png onclick='opDeleteClick(this)'>" +
			"</span>";

		let rhs = exprJson.rhs;
		let rhsStr = this.createHTML(rhs);
		let str = "<ul class=opExprUl>" ;
		str += "<li id=" + exprJson.id + " class=opExprLi>" + iconHTML; 
		str += "<span class=opExprSpan>" + exprJson.op + "</span></li>";
		str +=   rhsStr + "</ul>";
		console.log(str);
		return str;
	}

	createLeafHTML(exprJson) {
		let imgClass = "class='iconButton leafIconLi'";
		let iconHTML = "<span class=leafIconSpan>" + 
			"<img " + imgClass + " src=../common/img/pen.png onclick='leafEditClick(this)'>" +
			"<img " + imgClass + " src=../common/img/plus.png onclick='leafAddClick(this)'>" +
			"<img " + imgClass + " src=../common/img/trash-bin.png onclick='leafDeleteClick(this)'>" +
			"</span>";

		// This is necessarily of the form "param op constant"
		let lhsStr = exprJson.lhs.paramName;
		let rhsStr = null;
		if (exprJson.rhs.constName != "") {
			rhsStr = '"' + exprJson.rhs.constName + '"';
		} else {
			rhsStr = exprJson.rhs.constValue;
		}
		let str = "<li id=" + exprJson.id + " class=leafExprLi>" + iconHTML; 
		str += "<span class=leafExprSpan>" ; 
		str += lhsStr + " " + exprJson.op + " " + rhsStr ;
		str += "</span></li>";
		return str;
	}

	createNodeParam(paramName, paramKey) {
		let nodeId = SEARCH_EXPR_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "param",
			paramName: paramName,
			paramKey: paramKey,
		};
	}

	createNodeConst(constName, constValue) {
		let nodeId = SEARCH_EXPR_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "const",
			constName: constName,
			constValue: constValue,
		};
	}

	createNodeOp(op, lhs, rhs) {
		let nodeId = SEARCH_EXPR_NODE_ID_PREFIX + String(searchExprNodeNum++);
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
			return "NOT(" + lhsStr + ")";
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
}
