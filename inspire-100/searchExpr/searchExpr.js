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
const CHECKBOX_NODE_ID_PREFIX = "SCheckbox_" ;

// //////////////////////////////////////////////////////////////
// No error checking done on the expression JSON
// It must be correct by construction before passing it to this class
// //////////////////////////////////////////////////////////////
class searchExpr {
	constructor(exprJson, treeDivId, textId) {
		if (isUndefined(exprJson) || !exprJson) this .exprJson = {};
		else this.exprJson = exprJson;

		this.containerDiv = document.getElementById(treeDivId);
		this.textDiv = document.getElementById(textId);
		this.errorHTMLNodes = [];
	}

	updateIds() {
		searchExprNodeNum = 0;
		this.updateIdRecursive(this.exprJson);
	}

	addBeforeSelectedExpr(htmlElem) {
		this.addWrtSelectedExpr(htmlElem, "before");
	}

	addAfterSelectedExpr(htmlElem) {
		this.addWrtSelectedExpr(htmlElem, "after");
	}

	deleteSelectedLeafExpr(htmlElem) {
		let selectedLeafNode = this.findNode(htmlElem.id); // shared id with HTML
		if (!selectedLeafNode) {
			alert("Nothing to delete");
			return;
		}
		let parentElem = htmlElem.parentElement;
		let parentNode = this.findNode(parentElem.id); // shared id with HTML

		if (!parentNode) {
			this.exprJson = {}; // Nothing left
		} else {
			let lhsId = parentNode.lhs.id;
			let rhsId = parentNode.rhs.id;
			let remaining = null;
			if (lhsId == selectedLeafNode.id) {
				parentNode.lhs = {};
				remaining = parentNode.rhs;
			} else if (rhsId == selectedLeafNode.id) {
				parentNode.rhs = {};
				remaining = parentNode.lhs;
			}

			let grampaElem = parentElem.parentElement;
			let grampaNode = this.findNode(grampaElem.id); // shared id with HTML
			if (!grampaNode) {
				this.exprJson = remaining; // Top level
			} else {
				lhsId = grampaNode.lhs.id;
				rhsId = grampaNode.rhs.id;

				if (lhsId == parentNode.id) {
					grampaNode.lhs = remaining;
				} else if (rhsId == parentNode.id) {
					grampaNode.rhs = remaining;
				}
			}
		}

		this.render();
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
		// Always start with <ul>
		let str = this.createHTMLRecursive(this.exprJson);
		if (str.indexOf("<ul") != 0) {
			str = "<ul class=opExprUl>" + str;
			str += "</ul>";
		}
		return str;
	}

	// render into a div
	render() {
		// Always have at least one to start with
		console.log("isValid",this.isValid(), "isEmpty", this.isEmpty());
		if (this.isEmpty()) {
			this.exprJson = this.createLeafExpr();
		}
		this.updateIds();

		this.textDiv.innerHTML = this.stringify();
		this.containerDiv.innerHTML = this.createHTML();
		this.createSelectOptionsHTML();
		this.errorHTMLNodes = this.collectNullValueElements();
		for (let i=0; i < this.errorHTMLNodes.length; i++) {
			let elem = this.errorHTMLNodes[i];
			console.log(elem);
			if (elem.className == "exprOpSelectCls") {
				elem.style.backgroundColor = palette.orange;
			} else {
				elem.style.backgroundColor = palette.modal;
			}
		}
	}

	findNode(nodeId) {
		return this.findNodeRecursive(this.exprJson, nodeId);
	}

	isEmpty() {
		return this.isEmptyExpr(this.exprJson);
	}
	
	isValid() {
		return this.isValidRecursive(this.exprJson);
	}

	changeExprParam(htmlSelectElem) {
		let nodeId = this.formParamNodeId(htmlSelectElem.id);
		let node = this.findNode(nodeId);
		node.paramName = htmlSelectElem.value;

		let paramKey = null;
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			if (param.name == node.paramName) {
				paramKey = param.key;
				break;
			}
		}
		node.paramKey = paramKey;

		// clear out op and const nodes to make them invalid
		let parentElem = htmlSelectElem.parentElement;
		let opElem = findChildNodeByClass(parentElem, "leafOpSelectCls");
		let opNodeId = this.formOpNodeId(opElem.id);
		node = this.findNode(opNodeId);
		node.op = null;

		let constElem = findChildNodeByClass(parentElem, "constEnumSelectCls");
		let constNodeId = this.formConstEnumNodeId(constElem.id);
		node = this.findNode(constNodeId);
		node.constName = null;
		node.constValue = null;

		constElem = findChildNodeByClass(parentElem, "constNumberSelectCls");
		constNodeId = this.formConstNumNodeId(constElem.id);
		node = this.findNode(constNodeId);
		node.constName = null;
		node.constValue = null;

		this.render();
	}

	changeExprOp(htmlSelectElem) {
		let nodeId = this.formOpNodeId(htmlSelectElem.id);
		let node = this.findNode(nodeId);
		node.op = htmlSelectElem.value;

		this.render();
	}

	changeExprConstEnum(htmlSelectElem) {
		let parentElem = htmlSelectElem.parentElement;
		let paramElem = findChildNodeByClass(parentElem, "paramSelectCls");
		let paramNodeId = this.formParamNodeId(paramElem.id);
		let paramKey = this.findNode(paramNodeId).paramKey;
		let paramType = session.params[paramKey].type;
		let paramRange = paramType.range;

		let nodeId = this.formConstEnumNodeId(htmlSelectElem.id);
		let node = this.findNode(nodeId);
		node.constName = htmlSelectElem.value;
		node.constValue = paramRange[node.constName];

		this.render();
	}

	changeExprConstNum(htmlSelectElem) {
		let nodeId = this.formConstNumNodeId(htmlSelectElem.id);
		let node = this.findNode(nodeId);
		node.constName = "";
		node.constValue = htmlSelectElem.value;

		this.render();
	}

	// //////////////////////////////////////////////////////////////
	// Private functions below
	// //////////////////////////////////////////////////////////////

	isEmptyExpr(json) {
		if (isUndefined(json) || (json === null)) return true;
		if (Object.keys(json).length === 0) return true;
		return false;
	}

	updateIdRecursive(json) {
		if (this.isEmptyExpr(json)) return;
		json.id = SEARCH_NODE_ID_PREFIX + (searchExprNodeNum++);

		let rhs = json.rhs;
		if (!isUndefined(rhs) && (rhs !== null)) {
			this.updateIdRecursive(rhs);
		}

		let lhs = json.lhs;
		if (!isUndefined(lhs) && (lhs !== null)) {
			this.updateIdRecursive(lhs);
		}
	}

	collectNullValueElements() {
		let result = [];

		let arr = document.getElementsByTagName("select");
		for (let i=0; i<arr.length; i++) {
			let elem = arr[i];
			if ((elem.value === null) || (elem.value == "")) result.push(elem);
		}

		arr = document.getElementsByTagName("input");
		for (let i=0; i<arr.length; i++) {
			let elem = arr[i];
			if ((elem.value === null) || (elem.value == "")) result.push(elem);
		}

		return result;
	}

	createSelectOptionsHTML() {
		this.createSelectOptionsHTMLRecursive(this.exprJson);
	}

	isValidRecursive(json) {
		if (this.isEmptyExpr(json)) return false;

		if (isUndefined(json.type)) return false;
		if (!json.type) return false;

		if (isUndefined(json.id)) return false;
		if (!json.id) return false;

		if (isUndefined(json.op) || !json.op) {
			if (json.type == "param") {
				if (isUndefined(json.paramName) || !json.paramName) return false;
				if (isUndefined(json.paramKey) || !json.paramKey) return false;
				return true;
			} else if (json.type == "const") {
				if (isUndefined(json.constValue) || (json.constValue === null)) return false;
				return true;
			} else {
				return false;
			}
		}

		let rhs = json.rhs;
		if (!this.isValidRecursive(rhs)) return false;

		let lhs = json.lhs;
		if (!this.isValidRecursive(lhs)) return false;

		return true;
	}

	findNodeRecursive(json, nodeId) {
		if (this.isEmptyExpr(json)) return null;
		if (json.id == nodeId) return json;

		let rhs = json.rhs;
		let node = this.findNodeRecursive(rhs, nodeId);
		if (node) return node;

		let lhs = json.lhs;
		node = this.findNodeRecursive(lhs, nodeId);
		if (node) return node;

		return null;
	}

	evalRecursive(json, bnum) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			let rhs = json.rhs;
			let rhsVal = this.evalRecursive(rhs, bnum);
			let lhs = json.lhs;
			let lhsVal = this.evalRecursive(lhs, bnum);
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
			let lhsStr = this.stringifyRecursive(lhs);
			let rhs = json.rhs;
			let rhsStr = this.stringifyRecursive(rhs);
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
			} else {
				return this.createLogicExprHTML(json);
			}
		} 
		return null; 
	}

	// Logic logical expression
	createLogicExprHTML(json) {
		let lhs = json.lhs;
		let lhsStr = this.createHTMLRecursive(lhs);
		let rhs = json.rhs;
		let rhsStr = this.createHTMLRecursive(rhs);
		let str = lhsStr;
		str += "<li id=" + json.id + " class=opExprLi>";
		str += "<span class=opExprSpan>" + this.createExprSelectHTML(json); 
		str += "</span></li>";
		str +=  rhsStr;
		return "<ul class=opExprUl id=" + json.id + ">" + str + "</ul>";
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
  	str += '<div class=exprMenu>';
  	str += '<img class=exprMenuImgBtn src=../common/img/pen.png></img>';
  	str += '<div class=exprMenu-content>';
  	str += '<p class=exprMenuActionCls onclick="deleteSelectedExpr(this)">DELETE</p>';
  	str += '<p class=exprMenuActionCls onclick="addBeforeSelectedExpr(this)">INSERT</p>';
  	str += '<p class=exprMenuActionCls onclick="addAfterSelectedExpr(this)">APPEND</p>';
  	str += '</div>';
  	str += '</div>';

		str += this.createLeafSelectHTML(json);
		str += "</span></li>";
		return str;
	}

	createSelectOptionsHTMLRecursive(json) {
		if (this.isEmptyExpr(json)) return null;

		if (json.type == "op") {
			if (this.isLeafExpr(json)) {
				return this.createLeafSelectOptionsHTML(json);
			} else {
				return this.createLogicExprSelectOptionsHTML(json);
			}
		} 
		return null; 
	}

	// dir can be "after" or "before"
	addWrtSelectedExpr(htmlElem, dir) {
		let selectedLeafNode = this.findNode(htmlElem.id); // shared id with HTML
		if (!selectedLeafNode) {
			alert("Nothing selected");
			return;
		}

		let parentElem = htmlElem.parentElement;
		let parentNode = this.findNode(parentElem.id); // shared id with HTML

		let newLeaf = this.createLeafExpr();
		let newOp = this.createNodeOp();
		if (dir == "after") {
			newOp.rhs = newLeaf;
			newOp.lhs = selectedLeafNode;
		} else if (dir == "before") {
			newOp.lhs = newLeaf;
			newOp.rhs = selectedLeafNode;
		}

		if (!parentNode) {
			this.exprJson = newOp;
		} else {
			let lhsId = parentNode.lhs.id;
			let rhsId = parentNode.rhs.id;
			if (lhsId == selectedLeafNode.id) {
				parentNode.lhs = newOp;
			} else if (rhsId == selectedLeafNode.id) {
				parentNode.rhs = newOp;
			}
		}
		
		this.render();
	}

	createLeafExpr() {
		let lhs = this.createNodeParam();
		let rhs = this.createNodeConst();
		let expr = this.createNodeOp();
		expr.lhs = lhs;
		expr.rhs = rhs;
		return expr;
	}

	createNodeParam() {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "param",
			paramName: null,
			paramKey: null,
		};
	}

	createNodeConst() {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "const",
			constName: null,
			constValue: null,
		};
	}

	createNodeOp() {
		let nodeId = SEARCH_NODE_ID_PREFIX + String(searchExprNodeNum++);
		return {
			id: nodeId,
  		type: "op",
			op: null,
			lhs: null,
			rhs: null,
		};
	}

	isLeafExpr(json) {
		if (this.isEmptyExpr(json)) return null;

		// Leaf exprs have lhs and rhs
		// Further lhs is param and rhs is const
		let lhs = json.lhs;
		let rhs = json.rhs;
		if ((lhs.type == "param") && (rhs.type == "const")) return true;
		else return false;
	}

	// Evaluate the value of a sub-expression
	evalOp(op, lhsVal, rhsVal) {
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

	formCheckboxNodeId(htmlId) {
		return htmlId.replace(CHECKBOX_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
	}

	formCheckboxSelectId(json) {
		return json.id.replace(SEARCH_NODE_ID_PREFIX, CHECKBOX_NODE_ID_PREFIX);
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
		str += " class=paramSelectCls onchange='exprParamChangeClick(this)'></select>" ;

		str += "<select id=" + this.formOpSelectId(json);
		str += " class=leafOpSelectCls onchange='exprOpChangeClick(this)'></select>" ;

		str += "<select id=" + this.formConstEnumSelectId(json.rhs);
		str += " onchange='exprConstEnumChangeClick(this)' ";
		str += " class=constEnumSelectCls style='display:inline-block'></select>" ;

		str += "<input type=number id=" + this.formConstNumSelectId(json.rhs);
		str += " onchange='exprConstNumChangeClick(this)' ";
		str += " class=constNumberSelectCls style='display:none'></input>" ;

		return str;
	}

	createExprSelectHTML(json) {
		let str = "<select id=" + this.formOpSelectId(json);
		str += " class=exprOpSelectCls onchange='exprOpChangeClick(this)'></select>" ;
		return str;
	}

	// This must be done AFTER the HTML is added to the DOM
	createLogicExprSelectOptionsHTML(json) {
		const logicOps = ["AND", "OR", "XOR"];
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

	createParamDropdown(selectId, value) {
		let dropdown = document.getElementById(selectId);
		
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			let opt = document.createElement("option"); 
			opt.text = param.name;
			opt.value = param.name;
			dropdown.options.add(opt);
		}
		dropdown.value = value;
	}

	createOpDropdown(selectId, paramType, value) {
		let dropdown = document.getElementById(selectId);
		
		// Dropdown list for operators
		let opRange = paramOps[paramType.type];
		for (let i=0; i< opRange.length; i++) {
			let op = opRange[i];
			let opt = document.createElement("option"); 
			opt.text = op;
			opt.value = op;
			dropdown.options.add(opt);
		}

		dropdown.value = value;
	}

	createConstDropdown(json, paramType, constName, constValue) {
		// The constant could be select or an input
		// Selectively display the correct one
		let sid = this.formConstEnumSelectId(json);
		let sdd = document.getElementById(sid);
		let iid = this.formConstNumSelectId(json);
		let idd = document.getElementById(iid);

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
			sdd.value = constName;
		} else {
			sdd.style.display = "none" ;
			idd.style.display = "inline-block" ;
			idd.value = constValue;
		}
	}
		
	// This must be done AFTER the HTML is added to the DOM
	createLeafSelectOptionsHTML(json) {
		// Create param drop down list
		let selectId = this.formParamSelectId(json.lhs);
		this.createParamDropdown(selectId, json.lhs.paramName);
		if (!json.lhs.paramName) return;
		
		// find the key for the param
		let paramKey = null;
		for (let i=0; i< session.allParamsTable.length; i++) {
			let param = session.allParamsTable[i];
			if (param.name == json.lhs.paramName) {
				paramKey = param.key;
				break;
			}
		}
		let paramType = session.params[paramKey].Type();

		// Create op drop down list
		selectId = this.formOpSelectId(json);
		this.createOpDropdown(selectId, paramType, json.op);

		// Create op drop down list
		selectId = this.formOpSelectId(json);
		this.createConstDropdown(json.rhs, paramType, json.rhs.constName, json.rhs.constValue);
	}

}
