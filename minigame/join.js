const lightMode = '1065432702431526932';
const darkMode = '1065432906111135784';

module.exports = {
	slash: true,
	name: 'join',
	category: 'potatobot',
	maxArgs: 0,
	description: 'Join the war!',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const RNG = Math.floor(Math.random() * 2);
		let lightModeSize;
		let darkModeSize;
		let check = true;
		await msgInt.deferReply();
		await guild.roles.fetch(lightMode).then(async r => {
			if (await r.members.get(msgInt.user.id) != undefined) {
				check = false;
				throw `You have already joined the Light Side`;
			}
			lightModeSize = r.members.size;
		}).catch(async e => { await msgInt.editReply(e); });
		await guild.roles.fetch(darkMode).then(async r => {
			if (await r.members.get(msgInt.user.id) != undefined) {
				check = false;
				throw `You have already joined the Dark Side`;
			}
			darkModeSize = r.members.size;
		}).catch(async e => { await msgInt.editReply(e); });

		if (!check) { return; } //This was the only way to get no interaction errors

		//The below logic assumes teams are balanced
		//Balanced is defined as both teams are either equal or one member different in size
		guild.members.fetch(msgInt.user.id).then(async u => {
			if (darkModeSize >= lightModeSize + 2) {
				await u.roles.add(lightMode);
				await msgInt.editReply(`Welcome to the Light Mode`);
			} else if (lightModeSize >= darkModeSize + 2) {
				await u.roles.add(darkMode);
				await msgInt.editReply(`Welcome to the Dark Mode`);
			} else if (RNG == 0) {
				await u.roles.add(lightMode);
				await msgInt.editReply(`Welcome to the Light Mode`);
			} else {
				await u.roles.add(darkMode);
				await msgInt.editReply(`Welcome to the Dark Mode`);
			}
		});
	}
};
