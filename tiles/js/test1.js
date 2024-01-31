let test1Uids = [
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'ACTIVE',
		breaths: 55,
		attention: false,
	},
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'ACTIVE',
		breaths: 57,
		attention: false,
	},
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'ACTIVE',
		breaths: 600,
		attention: false,
	},
	{
		uid: 'UID_1111111111111111',
		patient: 'Betty Boop',
		state: 'ACTIVE',
		breaths: 734,
		attention: false,
	},
];

var test1Index = 0;
function test1() {
	if (test1Index == test1Uids.length) return;
	console.log("test1 adding", test1Index);
	let uidObj = test1Uids[test1Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test1();
}, 2000)


