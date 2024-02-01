let test7Uids = [
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 26,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 52,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 108,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 334,
		attention: false,
	},
];

var test7Index = 0;
function test7() {
	if (test7Index == test7Uids.length) return;
	console.log("test7 adding", test7Index);
	let uidObj = test7Uids[test7Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	localStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test7();
}, 2500)


