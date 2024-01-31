let test2Uids = [
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'ACTIVE',
		breaths: 65,
		attention: true,
	},
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'ACTIVE',
		breaths: 67,
		attention: true,
	},
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'ACTIVE',
		breaths: 66,
		attention: true,
	},
	{
		uid: 'UID_2222222222222222',
		patient: 'Bugs Bunny',
		state: 'ERROR',
		breaths: 634,
		attention: true,
	},
];

var test2Index = 0;
function test2() {
	if (test2Index == test2Uids.length) return;
	console.log("test2 adding", test2Index);
	let uidObj = test2Uids[test2Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test2();
}, 3000)


