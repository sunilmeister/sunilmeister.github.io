let test3Uids = [
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'ACTIVE',
		breaths: 65,
		attention: false,
	},
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'ACTIVE',
		breaths: 67,
		attention: false,
	},
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'ACTIVE',
		breaths: 66,
		attention: false,
	},
	{
		uid: 'UID_3333333333333333',
		patient: 'Mickey Mouse',
		state: 'ACTIVE',
		breaths: 634,
		attention: false,
	},
];

var test3Index = 0;
function test3() {
	if (test3Index == test3Uids.length) return;
	console.log("test3 adding", test3Index);
	let uidObj = test3Uids[test3Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test3();
}, 3500)


