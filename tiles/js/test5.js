let test5Uids = [
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'INIT',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'STANDBY',
		breaths: 0,
		attention: false,
	},
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'ACTIVE',
		breaths: 65,
		attention: false,
	},
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'ACTIVE',
		breaths: 67,
		attention: false,
	},
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'ACTIVE',
		breaths: 66,
		attention: false,
	},
	{
		uid: 'UID_5555555555555555',
		patient: 'The Joker',
		state: 'ACTIVE',
		breaths: 634,
		attention: false,
	},
];

var test5Index = 0;
function test5() {
	if (test5Index == test5Uids.length) return;
	console.log("test5 adding", test5Index);
	let uidObj = test5Uids[test5Index++];
	uidObj.updatedAt = Date();
	let key = ACTIVE_UID_PREFIX + uidObj.uid;
	sessionStorage.setItem(key, JSON.stringify(uidObj));
}

setInterval(() => {
	test5();
}, 5000)


