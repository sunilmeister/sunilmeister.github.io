var expr1 = {
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
		op: "OR",
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

window.onload = function () {
	sExpr = new searchExpr;
	let str = sExpr.stringify(expr1);
	console.log(str);

	pid = document.getElementById("exprString");
	pid.innerHTML = str;

	lid = document.getElementById("exprContainer");
	lid.innerHTML = "<ul>" + sExpr.createHTML(expr1) + "</ul>";
}


