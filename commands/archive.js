const { ChannelType, PermissionsBitField, Guild } = require("discord.js");
const { Channels, Semesters, Roles: { Student, StudentAlumni, Staff } } = require('../utils');

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
			const channels = await guild.channels.fetch();
			const categoryToArchive = channels.find(cat => cat.type === ChannelType.GuildCategory && cat.name === categoryName);
			if (!categoryToArchive) {
				msgInt.reply(`Unable to find category called \`${categoryName}\``);
				return;
			}
			await categoryToArchive.setName(`${categoryName} (Archived)`);
			await categoryToArchive.permissionOverwrites.edit(Student, { SendMessages: false });
			await categoryToArchive.permissionOverwrites.edit(StudentAlumni, { SendMessages: false });
			await categoryToArchive.children.cache.each(c => {
				c.lockPermissions();
			});
			const t = await guild.channels.fetch(Channels.smallstudyrooms);
			// Attempting to put a "higher" category below another actually puts it two below the target
			await categoryToArchive.edit({position: t.rawPosition + 1});
			await categoryToArchive.edit({position: categoryToArchive.position - 1});
			msgInt.reply(`Successfully archived ${categoryName}`);
		} else {
			msgInt.reply('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};