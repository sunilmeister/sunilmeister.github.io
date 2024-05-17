var exprJson = {
	id: "SExprNode_1",
	type: "op",
	op: "AND",
	lhs: {
		id: "SExprNode_N",
		type: "op",
		op: "NOT",
		rhs: {
			id: "SExprNode_2",
			type: "op",
			op: "EQ",
			lhs: {
				id: "SExprNode_3",
				type: "param",
				paramName: "MODE_SETTING",
				paramKey: "mode",
			},
			rhs: {
				id: "SExprNode_4",
				type: "const",
				constName: "CMV",
				constValue: 0,
			},
		},
	},
	rhs: {
		id: "SExprNode_4X",
		type: "op",
		op: "OR",
		lhs: {
			id: "SExprNode_5",
			type: "op",
			op: "LEQ",
			lhs: {
				id: "SExprNode_6",
				type: "param",
				paramName: "PEAK_PRESSURE",
				paramKey: "peak",
			},
			rhs: {
				id: "SExprNode_70",
				type: "const",
				constName: "",
				constValue: 32,
			},
		},
		rhs: {
			id: "SExprNode_77",
			type: "op",
			op: "GT",
			lhs: {
				id: "SExprNode_78",
				type: "param",
				paramName: "TIDAL_VOLUME",
				paramKey: "vtdel",
			},
			rhs: {
				id: "SExprNode_8",
				type: "const",
				constName: "",
				constValue: 450,
			},
		},
	},
}

var searchExpression = null;

function exprConstEnumChangeClick(htmlElem) {
	searchExpression.changeExprConstEnum(htmlElem);
}

function exprConstNumChangeClick(htmlElem) {
	searchExpression.changeExprConstNum(htmlElem);
}

function exprParamChangeClick(htmlElem) {
	searchExpression.changeExprParam(htmlElem);
}

function exprOpChangeClick(htmlElem) {
	searchExpression.changeExprOp(htmlElem);
}

window.onload = function () {
	searchExpression = new searchExpr(exprJson, "exprContainer");
	console.log("isEmpty", searchExpression.isEmpty());
	console.log("isValid", searchExpression.isValid());

	searchExpression.render();

	let str = searchExpression.stringify();
	pid = document.getElementById("exprString");
	pid.innerHTML = str;
}


