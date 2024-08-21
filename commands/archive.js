const { ChannelType, PermissionsBitField, Guild, SlashCommandBuilder } = require("discord.js");
const { Channels, Semesters, Roles: { Student, StudentAlumni, Staff } } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.addStringOption(option => option
			.setName('semester')
			.setDescription('Provide a semester and year formatted like F22')
			.setRequired(true))
		.setDescription('archives the requested channel category'),
	execute: async (interaction) => {
		const deferredReply = await interaction.deferReply();

		const semester = interaction.options.getString('semester').toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			const year = semester.slice(1).padStart(4, '20'); //Remove first character, pad YY into YYYY
			const categoryName = `${Semesters[semester.at(0)]} ${year}`;

			const channels = await interaction.guild.channels.fetch();
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

			const highestNonArchiveChannel = await interaction.guild.channels.fetch(Channels.smallstudyrooms);
			await categoryToArchive.setPosition(highestNonArchiveChannel.position + 1, { reason: "/archive" });

			deferredReply.edit(`Successfully archived ${categoryName}`);
		} else {
			deferredReply.edit('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};