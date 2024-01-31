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
		breaths: 65,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 67,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 66,
		attention: false,
	},
	{
		uid: 'UID_7777777777777777',
		patient: 'Dennis Menace',
		state: 'ACTIVE',
		breaths: 634,
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
	sessionStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test7();
}, 2500)


