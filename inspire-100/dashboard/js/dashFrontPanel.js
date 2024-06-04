// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

// ////////////////////////////////////////////////////
// Positions of various fields in pixels for some zoom factor
// ////////////////////////////////////////////////////
var fpPanel = {name:'panel', X:0, Y:0, W:571.1875, H:787.125};

var fpLeds = {
	{name:'initial', 	X:90, 	Y:111},
	{name:'standby', 	X:90, 	Y:192},
	{name:'active', 	X:90, 	Y:273},
	{name:'cmv', 			X:90, 	Y:377},
	{name:'acv', 			X:90, 	Y:431},
	{name:'error', 		X:480, 	Y:112},
	{name:'mbreath', 	X:480, 	Y:192},
	{name:'sbreath', 	X:480, 	Y:274},
	{name:'simv', 		X:480, 	Y:377},
	{name:'psv', 			X:480, 	Y:431},
};

var fpLcd = {
	{name:'lcd', 			X:187, Y:123, W:194, H:67},
};

var fp7Segs = {
	{name:'peak', 	X:153, Y:249, W:66, H:50},
	{name:'plat', 	X:248, Y:250, W:66, H:50},
	{name:'mpeep', 	X:343, Y:250, W:66, H:50},
	{name:'vt', 		X:155, Y:371, W:99, H:50},
	{name:'ei', 		X:283, Y:372, W:33, H:50},
	{name:'rr', 		X:344, Y:372, W:66, H:50},
	{name:'ipeep', 	X:88,  Y:467, W:66, H:50},
	{name:'pmax', 	X:193, Y:468, W:66, H:50},
	{name:'ps', 		X:305, Y:469, W:66, H:50},
	{name:'tps', 		X:413, Y:468, W:66, H:50},
};

function createFpDivs() {
}

function updateFrontPanel() {
}
