let points =[
	{name:"initial", 	pos: {X:0, Y:0}},
	{name:"standby", 	pos: {X:0, Y:0}},
	{name:"active", 	pos: {X:0, Y:0}},
	{name:"error", 		pos: {X:0, Y:0}},
	{name:"mbreath", 	pos: {X:0, Y:0}},
	{name:"sbreath", 	pos: {X:0, Y:0}},
	{name:"cmv", 			pos: {X:0, Y:0}},
	{name:"acv", 			pos: {X:0, Y:0}},
	{name:"simv", 		pos: {X:0, Y:0}},
	{name:"psv", 			pos: {X:0, Y:0}},
];
let boxes = [
		{name:"panel", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"lcd", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"peak", 		box: {X:0, Y:0, W:0, H:0}},
		{name:"plat", 		box: {X:0, Y:0, W:0, H:0}},
		{name:"mpeep", 		box: {X:0, Y:0, W:0, H:0}},
		{name:"vt", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"ei", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"rr", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"ipeep", 		box: {X:0, Y:0, W:0, H:0}},
		{name:"pmax", 		box: {X:0, Y:0, W:0, H:0}},
		{name:"ps", 			box: {X:0, Y:0, W:0, H:0}},
		{name:"tps", 			box: {X:0, Y:0, W:0, H:0}},
];

function logPoint(name, point) {
	let str = "{name:'" + name + "'";
	str += ", X:" + point.X;
	str += ", Y:" + point.Y;
	str += "},";
	console.log(str);
}

function logBox(name, box) {
	let str = "{name:'" + name + "'";
	str += ", X:" + box.X;
	str += ", Y:" + box.Y;
	str += ", W:" + box.W;
	str += ", H:" + box.H;
	str += "},";
	console.log(str);
}

var pointIndex = 0;
var boxIndex = 1;
var box = null;
var point = null;

function clickEvent(e) {
	let msgDiv = document.getElementById("message");
	let imgBox = e.target.getBoundingClientRect();

	if (pointIndex < points.length) {
		point = {};
		point.X = e.clientX - imgBox.left;
		point.Y = e.clientY - imgBox.top;
		logPoint(points[pointIndex++].name, point);
		if (pointIndex == points.length) { // done with the last one
			let msg = "Click on top-left of '" + boxes[boxIndex].name + "'" ;
			msgDiv.innerHTML = msg;
		} else {
			let msg = "Click on center of '" + points[pointIndex].name + "'" ;
			msgDiv.innerHTML = msg;
		}
	} else if (boxIndex < boxes.length) {
		if (box === null) { // top-left
			box = {};
			box.X = e.clientX - imgBox.left;
			box.Y = e.clientY - imgBox.top;
			let msg = "Click on bottom-right of '" + boxes[boxIndex].name + "'" ;
			msgDiv.innerHTML = msg;
		} else { // bottom right
			let X = e.clientX - imgBox.left;
			let Y = e.clientY - imgBox.top;
			box.W = X - box.X;
			box.H = Y - box.Y;
			logBox(boxes[boxIndex++].name, box);
			box = null;
			let msg = "Click on top-left of '" + boxes[boxIndex].name + "'" ;
			msgDiv.innerHTML = msg;
		}
	}
}

function doPanel() {
	let panelDiv = document.getElementById("panel");
	let rect = panelDiv.getBoundingClientRect();
	boxes[0].box.W = rect.width;
	boxes[0].box.H = rect.height;
	logBox(boxes[0].name, boxes[0].box);
}

window.onload = function () {
	let msgDiv = document.getElementById("message");
	doPanel();

	pointIndex = 0;
	let msg = "Click on center of '" + points[pointIndex].name + "'" ;
	msgDiv.innerHTML = msg;
}					

