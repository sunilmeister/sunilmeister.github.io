// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

/*
 * Various types of nodes that make up a search expression
 *
        {
         "id": "SExprNode_0",
         "type": "op",
         "opName": "AND",
         "lhs": {
          "id": "SExprNode_8",
          "type": "op",
          "opName": "=",
          "lhs": {
           "id": "SExprNode_10",
           "type": "param",
           "paramName": "MODE_SETTING",
           "paramKey": "mode"
          },
          "rhs": {
           "id": "SExprNode_9",
           "type": "const",
           "constName": "CMV",
           "constValue": 0
          }
         },
         "rhs": {
          "id": "SExprNode_1",
          "type": "op",
          "opName": "OR",
          "lhs": {
           "id": "SExprNode_5",
           "type": "op",
           "opName": "<",
           "lhs": {
            "id": "SExprNode_7",
            "type": "param",
            "paramName": "PEAK_PRESSURE",
            "paramKey": "peak"
           },
           "rhs": {
            "id": "SExprNode_6",
            "type": "const",
            "constName": "",
            "constValue": 32
           }
          },
          "rhs": {
           "id": "SExprNode_2",
           "type": "op",
           "opName": ">",
           "lhs": {
            "id": "SExprNode_4",
            "type": "param",
            "paramName": "TIDAL_VOLUME",
            "paramKey": "vtdel"
           },
           "rhs": {
            "id": "SExprNode_3",
            "type": "const",
            "constName": "",
            "constValue": 450
           }
          }
         }
        }
*/

var searchExprNodeNum = 0;
const SEARCH_NODE_ID_PREFIX = "SExprNode_" ;
const PARAM_NODE_ID_PREFIX = "SExprParam_" ;
const CONST_NODE_ID_PREFIX = "SExprConst_" ;
const CONST_ENUM_ID_PREFIX = "SExprConstEnum_" ;
const CONST_NUMBER_ID_PREFIX = "SExprConstNum_" ;
const SELECT_ENUM_NODE_ID_PREFIX = "SExprEnum_" ;
const INPUT_NUM_NODE_ID_PREFIX = "SExprNum_" ;
const INPUT_TEXT_NODE_ID_PREFIX = "SExprText_" ;
const OP_NODE_ID_PREFIX = "SExprOp_" ;
const UNITS_NODE_ID_PREFIX = "SExprUnits_" ;

// //////////////////////////////////////////////////////////////
// No error checking done on the expression JSON
// It must be correct by construction before passing it to this class
// //////////////////////////////////////////////////////////////
class searchExpr {
  constructor(exprJson, treeDivId, textId, resultsId) {
    if (isUndefined(exprJson) || !exprJson) this .exprJson = {};
    else this.exprJson = exprJson;

    this.containerDiv = document.getElementById(treeDivId);
    this.textDiv = document.getElementById(textId);
    this.resultsDiv = document.getElementById(resultsId);

    this.exprChanged();
  }

  exprChanged() {
    this.paramSet = [];
    this.paramValues = {bnum: null, values: {}};

    clearBreathSelection();
    session.search.paramSet = [];
    session.search.results = [];

    this.render();
    this.resultsDiv.style.display = "none";
  }

  paramSetUsed() {
    return this.paramSet;
  }

  paramValuesAt(bnum) {
    if (this.paramValues.bnum != bnum) {
      this.updateParamValues(bnum); // evaluate the whole set of params
    }
    return this.paramValues;
  }

  clearExpr() {
    this.exprJson = {};
    this.exprChanged();
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

    this.exprChanged();
  }

  updateParamValues(bnum) {
    for (let i=0; i<this.paramSet.length; i++) {
      let paramKey = this.paramSet[i];
      let value = session.params[paramKey].ValueAtBnum(bnum);
      this.paramValues.values[paramKey] = value;
    }
    this.paramValues.bnum = bnum;
  }

  // Evaluate the value of the expression at a particular breath number
  evaluate(bnum) {
    this.updateParamValues(bnum); // evaluate the whole set of params
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
    // console.log("isValid",this.isValid(), "isEmpty", this.isEmpty());
    if (this.isEmpty()) {
      this.exprJson = this.createLeafExpr();
    }
    this.updateIds();

    this.textDiv.innerHTML = this.stringify();
    this.containerDiv.innerHTML = this.createHTML();
    this.createSelectOptionsHTML();

    //console.log("paramSet", this.paramSet);
  }

  importJson(json) {
    let save = this.exprJson;
    this.exprJson = json;
    if (!this.isValid()) {
      this.exprJson = save;
      return false;
    } 

    this.exprChanged();
    return true;
  }

  exportJson(fileName) {
    if (!this.isValid()) return false;
    fileName += ".search.json";
    download(JSON.stringify(this.exprJson, null, 1), fileName, "text/xml");
    return true;
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

  FindParamKey(paramName) {
    for (let i=0; i< session.allParamsTable.length; i++) {
      let groupParams = session.allParamsTable[i].params;

      for (let p=0; p<groupParams.length; p++) {
        let param = groupParams[p];
        if (param.name == paramName) return param.key;
      }
    }
    return null;
  }

  changeExprParam(htmlSelectElem) {
    let nodeId = this.formParamNodeId(htmlSelectElem.id);
    let node = this.findNode(nodeId);
    node.paramName = htmlSelectElem.value;

    let paramKey = this.FindParamKey(node.paramName);;
    node.paramKey = paramKey;

    // clear out op and const nodes to make them invalid
    let parentElem = htmlSelectElem.parentElement;
    let opElem = findChildNodeByClass(parentElem, "leafOpSelectCls");
    let opNodeId = this.formOpNodeId(opElem.id);
    node = this.findNode(opNodeId);
    node.opName = null;

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

    constElem = findChildNodeByClass(parentElem, "constTextSelectCls");
    constNodeId = this.formConstTextNodeId(constElem.id);
    node = this.findNode(constNodeId);
    node.constName = null;
    node.constValue = null;

    this.exprChanged();
  }

  changeExprOp(htmlSelectElem) {
    let nodeId = this.formOpNodeId(htmlSelectElem.id);
    let node = this.findNode(nodeId);
    node.opName = htmlSelectElem.value;

    this.exprChanged();
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

    this.exprChanged();
  }

  changeExprConstNum(htmlSelectElem) {
    let nodeId = this.formConstNumNodeId(htmlSelectElem.id);
    let node = this.findNode(nodeId);
    node.constName = "";
    node.constValue = htmlSelectElem.value;

    this.exprChanged();
  }

  changeExprConstText(htmlSelectElem) {
    let nodeId = this.formConstTextNodeId(htmlSelectElem.id);
    let node = this.findNode(nodeId);
    node.constName = "";
    node.constValue = htmlSelectElem.value;

    this.exprChanged();
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
    if (isDefined(rhs) && (rhs !== null)) {
      this.updateIdRecursive(rhs);
    }

    let lhs = json.lhs;
    if (isDefined(lhs) && (lhs !== null)) {
      this.updateIdRecursive(lhs);
    }
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

    if (isUndefined(json.opName) || !json.opName) {
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
      return this.evalOp(json.opName, lhsVal, rhsVal);

    } else if (json.type == "param") {
      if (this.paramValues.bnum != bnum) {
        this.updateParamValues(bnum); // evaluate the whole set of params
      }
      return this.paramValues.values[json.paramKey];

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
      return this.stringifyOp(json.opName, lhsStr, rhsStr);

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
    // Keep track of all the params involved in the expression
    let paramKey = json.lhs.paramKey;
    if (paramKey && (this.paramSet.indexOf(paramKey) == -1)) {
      this.paramSet.push(paramKey);
    }

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
    str += '<p class=exprMenuActionCls onclick="addBeforeSelectedExpr(this)">ADD Before</p>';
    str += '<p class=exprMenuActionCls onclick="addAfterSelectedExpr(this)">ADD After</p>';
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
    
    this.exprChanged();
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

    if (op == "=") {
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
    if (op == "&#x220B") {
      // case insensitive
      return String(lhsVal).toLowerCase().includes(String(rhsVal).toLowerCase());
    }
    if (op == "!&#x220B") {
      // case insensitive
      return !String(lhsVal).toLowerCase().includes(String(rhsVal).toLowerCase());
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

    if (op == "=") {
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
    if (op == "&#x220B") {
      // case insensitive
      return "(" + lhsStr + " &#x220B '" + rhsStr + "')";
    }
    if (op == "!&#x220B") {
      // case insensitive
      return "(" + lhsStr + " !&#x220B '" + rhsStr + "')";
    }
  }

  formCheckboxNodeId(htmlId) {
    return htmlId.replace(CHECKBOX_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
  }

  formUnitsSelectId(json) {
    return json.id.replace(SEARCH_NODE_ID_PREFIX, UNITS_NODE_ID_PREFIX);
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

  formConstTextSelectId(json) {
    return json.id.replace(SEARCH_NODE_ID_PREFIX, INPUT_TEXT_NODE_ID_PREFIX);
  }

  formConstTextNodeId(htmlId) {
    return htmlId.replace(INPUT_TEXT_NODE_ID_PREFIX, SEARCH_NODE_ID_PREFIX);
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

    str += "<input type=text id=" + this.formConstTextSelectId(json.rhs);
    str += " onchange='exprConstTextChangeClick(this)' ";
    str += " class=constTextSelectCls style='display:none'></input>" ;

    str += "<p id=" + this.formUnitsSelectId(json.lhs);
    str += " class=unitsSelectCls></p>" ;

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
    dropdown.value = json.opName;

    this.createSelectOptionsHTMLRecursive(json.lhs);
    this.createSelectOptionsHTMLRecursive(json.rhs);
  }

  createParamDropdown(selectId, value) {
    let dropdown = document.getElementById(selectId);
    
    for (let i=0; i< session.allParamsTable.length; i++) {
      let optGroup = session.allParamsTable[i];
      let groupParams = session.allParamsTable[i].params;
      let groupNode = document.createElement("OPTGROUP");
      groupNode.label = optGroup.name;
      groupNode.classList.add("paramGroupCls");
      
      dropdown.options.add(groupNode);

      for (let p=0; p<groupParams.length; p++) {
        let param = groupParams[p];
        let opt = document.createElement("option"); 
        opt.text = param.name;
        opt.value = param.name;
        opt.classList.add("paramSelectCls");
        groupNode.appendChild(opt);
      }
    }
    dropdown.value = value;
  }

  createOpDropdown(selectId, paramType, value) {
    let dropdown = document.getElementById(selectId);
    
    // Dropdown list for operators
    let opRange = paramOps[paramType.type];
    if (opRange !== null) {
      for (let i=0; i< opRange.length; i++) {
        let op = opRange[i];
        let opt = document.createElement("option"); 
        opt.innerHTML = op;
        opt.value = op;
        dropdown.options.add(opt);
      }
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
    let tid = this.formConstTextSelectId(json);
    let tdd = document.getElementById(tid);

    if (paramType.type == "ENUM") {
      // Dropdown list for enumerators
      sdd.style.display = "inline-block" ;
      idd.style.display = "none" ;
      tdd.style.display = "none" ;
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
    } else if (paramType.type == "NUMBER") {
      sdd.style.display = "none" ;
      idd.style.display = "inline-block" ;
      tdd.style.display = "none" ;
      idd.value = constValue;
      if (paramType.range.min !== null) idd.min = paramType.range.min;
      if (paramType.range.max !== null) idd.max = paramType.range.max;
      if (paramType.range.step !== null) idd.step = paramType.range.step;
    } else if (paramType.type == "STRING") {
      sdd.style.display = "none" ;
      idd.style.display = "none" ;
      tdd.style.display = "inline-block" ;
      tdd.value = constValue;
    }
  }
    
  // This must be done AFTER the HTML is added to the DOM
  createLeafSelectOptionsHTML(json) {
    // Create param drop down list
    let selectId = this.formParamSelectId(json.lhs);
    this.createParamDropdown(selectId, json.lhs.paramName);
    if (!json.lhs.paramName) return;
    
    // find the key for the param
    let paramKey = this.FindParamKey(json.lhs.paramName);;
    let paramType = session.params[paramKey].Type();
    let units = session.params[paramKey].Units();
    let unitsElm = document.getElementById(this.formUnitsSelectId(json.lhs));
    unitsElm.innerHTML = units;

    // Create op drop down list
    selectId = this.formOpSelectId(json);
    this.createOpDropdown(selectId, paramType, json.opName);

    // Create op drop down list
    selectId = this.formOpSelectId(json);
    this.createConstDropdown(json.rhs, paramType, json.rhs.constName, json.rhs.constValue);
  }

}

// ////////////////////////////////////////////////////////
// Various click event handlers
// ////////////////////////////////////////////////////////

function addBeforeSelectedExpr(btn) {
  let leafExprElem = btn.parentElement.parentElement.parentElement.parentElement;
  session.search.criteria.addBeforeSelectedExpr(leafExprElem);
}

function addAfterSelectedExpr(btn) {
  let leafExprElem = btn.parentElement.parentElement.parentElement.parentElement;
  session.search.criteria.addAfterSelectedExpr(leafExprElem);
}

function deleteSelectedExpr(btn) {
  let leafExprElem = btn.parentElement.parentElement.parentElement.parentElement;
  session.search.criteria.deleteSelectedLeafExpr(leafExprElem);
}

function exprConstEnumChangeClick(htmlElem) {
  session.search.criteria.changeExprConstEnum(htmlElem);
}

function exprConstNumChangeClick(htmlElem) {
  session.search.criteria.changeExprConstNum(htmlElem);
}

function exprConstTextChangeClick(htmlElem) {
  session.search.criteria.changeExprConstText(htmlElem);
}

function exprParamChangeClick(htmlElem) {
  session.search.criteria.changeExprParam(htmlElem);
}

function exprOpChangeClick(htmlElem) {
  session.search.criteria.changeExprOp(htmlElem);
}

function importSearchFile() {
  let elm = document.getElementById("searchFileSelector");
  let fileName = elm.value;
  if (!fileName) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }
  let file = elm.files[0];
  if (!file) {
    modalAlert("File not found", "Import Cancelled");
    return;
  }

  let reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = function (evt) {
    exprJson = parseJSONSafely(evt.target.result);
    if (!session.search.criteria.importJson(exprJson)) {
      modalAlert("File corrupted", "Import Cancelled");
    }
    cancelSearchImport();
  }
}

function exportSearchFile() {
  fileName = document.getElementById("exportSearchFileName").value;
  if (fileName) {
    if (!session.search.criteria.exportJson(fileName)) {
      modalAlert("Expression not valid", "Export Cancelled");
    }
    document.getElementById("exportSearchDiv").style.display = "none";
  }
}

function clearSearchExpr() {
  session.search.criteria.clearExpr();
  clearBreathSelection();
}

// Same DIV is shared for various exports by changing the onclick function
function exportSearchExpr() {
  let exportDiv = document.getElementById("exportSearchDiv");
  exportDiv.style.display = "block";
}

function importSearchExpr() {
  let importDiv = document.getElementById("importSearchDiv");
  importDiv.style.display = "block";
}

function cancelSearchImport() {
  let importDiv = document.getElementById("importSearchDiv");
  importDiv.style.display = "none";
}

function cancelSearchExport() {
  let exportDiv = document.getElementById("exportSearchDiv");
  exportDiv.style.display = "none";
}

