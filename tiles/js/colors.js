// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

var tileColors = [
	"#CEF7FF",
	"#FFC09F",
	"#A5D8FF",
	"#ADF7B6",
	"#E9F1F7",
	"#A0CED9",
	"#D9E9F8",
	"#FCF5C7",
	"#A3C3E0",
	"#FFC09F",
];

var colorIndex = 0;
function getNextTileColor() {
	let color = tileColors[colorIndex++];
	if (colorIndex == tileColors.length) colorIndex = 0;
	return color;
}
