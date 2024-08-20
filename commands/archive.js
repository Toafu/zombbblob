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
		const deferredReply = await msgInt.deferReply();

		const semester = text.toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			const year = semester.slice(1).padStart(4, '20'); //Remove first character, pad YY into YYYY
			const categoryName = `${Semesters[semester.at(0)]} ${year}`;

			const channels = await guild.channels.fetch();
			const categoryToArchive = channels.find(cat => cat.type === ChannelType.GuildCategory && cat.name === categoryName);
			if (!categoryToArchive) {
				await deferredReply.edit(`Unable to find category called \`${categoryName}\``);
				return;
			}

			await categoryToArchive.setName(`${categoryName} (Archived)`);

			await categoryToArchive.permissionOverwrites.edit(Student, { SendMessages: false });
			await categoryToArchive.permissionOverwrites.edit(StudentAlumni, { SendMessages: false });

			for (const [_, childChannel] of categoryToArchive.children.cache) {
				await childChannel.lockPermissions();
			}

			const highestNonArchiveChannel = await guild.channels.fetch(Channels.smallstudyrooms);
			await categoryToArchive.setPosition(highestNonArchiveChannel.position + 1, { reason: "/archive" });

			deferredReply.edit(`Successfully archived ${categoryName}`);
		} else {
			deferredReply.edit('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};