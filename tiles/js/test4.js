let test4Uids = [
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'ACTIVE',
		breaths: 65,
		attention: false,
	},
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'ACTIVE',
		breaths: 67,
		attention: false,
	},
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'ACTIVE',
		breaths: 66,
		attention: false,
	},
	{
		uid: 'UID_4444444444444444',
		patient: 'James Bond',
		state: 'ACTIVE',
		breaths: 634,
		attention: false,
	},
];

var test4Index = 0;
function test4() {
	if (test4Index == test4Uids.length) return;
	console.log("test4 adding", test4Index);
	let uidObj = test4Uids[test4Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test4();
}, 4000)


