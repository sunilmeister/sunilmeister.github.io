let testUids = [
	{
		uid: 'UID_1111222233334444',
		patient: 'Elmer Fudd',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_5555666677778888',
		patient: 'Bugs Bunny',
		state: 'STANDBY',
		breaths: 564,
		attention: false,
	},
	{
		uid: 'UID_AAAABBBBCCCCDDDD',
		patient: 'Mickey Mouse',
		state: 'ACTIVE',
		breaths: 78532,
		attention: true,
	},
	{
		uid: 'UID_0000222244446666',
		patient: 'James Bond',
		state: 'ERROR',
		breaths: 20134,
		attention: true,
	},
];

var uidIndex = 0;
function runTest() {
	if (uidIndex == testUids.length) return;
	console.log("TEST adding", uidIndex);
	let uidObj = testUids[uidIndex++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	sessionStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	runTest();
}, 4000)


