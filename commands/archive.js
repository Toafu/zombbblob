const { ChannelType, PermissionsBitField } = require("discord.js");
const { Semesters, Roles: { Student, StudentAlumni, Staff } } = require('../utils');

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
		const semester = text.toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			let categoryName = Semesters[semester.at(0)];
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
						id: Student,
						deny: [PermissionsBitField.Flags.SendMessages]
					},
					{
						id: StudentAlumni,
						deny: [PermissionsBitField.Flags.SendMessages]
					},
					{
						id: Staff,
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
			msgInt.reply('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};