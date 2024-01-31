// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var tileColors = [
	"#CEF7FF",
	"#A5D8FF",
	"#E9F1F7",
	"#D9E9F8",
	"#A3C3E0",
];

var colorIndex = 0;
function getNextTileColor() {
	let color = tileColors[colorIndex++];
	if (colorIndex == tileColors.length) colorIndex = 0;
	return color;
}
