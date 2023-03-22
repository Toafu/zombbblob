const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
	slash: true,
	name: 'archive',
	category: 'potatobot',
	minArgs: 1,
	maxArgs: 1,
	options: [
		{
			name: 'semester',
			description: 'Provide a semester and year formatted like F22',
			required: true,
			type: 3,
		}
	],
	expectedArgs: "<[F/S/W][Last two digits of year]>",
	description: 'archives the requested channel category',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, text, interaction: msgInt }) => {
		const semesters = {
			f: 'Fall',
			s: 'Spring',
			w: 'Winter'
		};
		const semester = text.toLowerCase();
		if (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w')) {
			let categoryName = semesters[semester.at(0)];
			let year = semester.slice(1); //Remove first character
			year = year.padStart(4, '20'); //Pads up to 4 character string
			categoryName = categoryName + ` ${year}`;
			// Scuffed workaround because renaming inside the first fetch doesn't work
			let categoryID = "";
			guild.channels.fetch().then(c => {
				c = Array.from(c.filter(ch => ch.type === ChannelType.GuildCategory && ch.name === categoryName).values())[0];
				categoryID = c.id;
				c.permissionOverwrites.set([
					{
						id: guild.roles.everyone,
						deny: [PermissionsBitField.Flags.SendMessages]
					},
					{	// Staff role
						id: "734552983261675691",
						allow: [PermissionsBitField.Flags.SendMessages]
					},
				]);
				c.children.cache.forEach((child) => child.lockPermissions());
			}).then(() => { // WHYYYYYYY
				guild.channels.fetch(categoryID).then(c => {
					// Anger fills my soul at this block, but I can't make it work above otherwise.
					c.setName(`${categoryName} (Archived)`);
				});
				msgInt.reply(`Successfully archived ${categoryName}`);
			}).catch(() => msgInt.reply(`Unable to archive category: ${categoryName}`));
		} else {
			msgInt.reply('Invalid semester format');
		}
	}
};