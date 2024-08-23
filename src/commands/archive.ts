import { ChannelType, PermissionsBitField, Guild, SlashCommandBuilder, ChatInputCommandInteraction, CategoryChannel } from "discord.js";
import { Channels, Semesters, Roles } from '../utils';
import { Command } from "../command";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('archive')
		.addStringOption(option => option
			.setName('semester')
			.setDescription('Provide a semester and year formatted like F22')
			.setRequired(true))
		.setDescription('archives the requested channel category'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const semester = interaction.options.getString('semester', true).toLowerCase();
		if (semester.length === 3 && (semester.startsWith('f') || semester.startsWith('s') || semester.startsWith('w'))) {
			const year = semester.slice(1).padStart(4, '20'); //Remove first character, pad YY into YYYY
			const categoryName = `${Semesters.get(semester[0])} ${year}`;

			const channels = await interaction.guild.channels.fetch();
			const categoryToArchive = channels.find(cat => cat !== null && cat.type === ChannelType.GuildCategory && cat.name === categoryName);
			if (!categoryToArchive) {
				await deferredReply.edit(`Unable to find category called \`${categoryName}\``);
				return;
			}

			await categoryToArchive.setName(`${categoryName} (Archived)`);

			await categoryToArchive.permissionOverwrites.edit(Roles.Student, { SendMessages: false });
			await categoryToArchive.permissionOverwrites.edit(Roles.StudentAlumni, { SendMessages: false });

			for (const childChannel of (categoryToArchive as CategoryChannel).children.cache.values()) {
				await childChannel.lockPermissions();
			}

			const highestNonArchiveChannel = await interaction.guild.channels.fetch(Channels.smallstudyrooms);
			if (highestNonArchiveChannel === null) {
				await deferredReply.edit("Failed to fetch highest non-archive channel!");
				return;
			}

			if (highestNonArchiveChannel instanceof CategoryChannel) {
				await categoryToArchive.setPosition(highestNonArchiveChannel.position + 1, { reason: "/archive" });
			}
			else {
				await deferredReply.edit("Highest non-archive channel is not a category!");
				return;
			}


			deferredReply.edit(`Successfully archived ${categoryName}`);
		} else {
			deferredReply.edit('Invalid semester format. Must follow `[F/S/W][Last two digits of year]`');
		}
	}
};