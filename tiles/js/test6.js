let test6Uids = [
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'ACTIVE',
		breaths: 65,
		attention: false,
	},
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'ACTIVE',
		breaths: 67,
		attention: false,
	},
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'ACTIVE',
		breaths: 66,
		attention: false,
	},
	{
		uid: 'UID_6666666666666666',
		patient: 'Batman Robin',
		state: 'ERROR',
		breaths: 634,
		attention: false,
	},
];

var test6Index = 0;
function test6() {
	if (test6Index == test6Uids.length) return;
	console.log("test6 adding", test6Index);
	let uidObj = test6Uids[test6Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test6();
}, 6000)


