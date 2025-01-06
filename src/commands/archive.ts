import { ChannelType, SlashCommandBuilder, ChatInputCommandInteraction, CategoryChannel } from "discord.js";
import { semesterStringToCategoryName } from '../utils';
import { Command } from "../command";

import { ConfigHandler } from "../config";
const { Channels, SERVER_ID } = ConfigHandler.getInstance().getConfig();

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
		if (interaction.guild === null) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const [error, categoryName] = semesterStringToCategoryName(interaction.options.getString('semester', true).toLowerCase());

		if (error !== null) {
			await deferredReply.edit(error.message);
			return;
		}
		
		const channels = await interaction.guild.channels.fetch();
		const categoryToArchive = channels.find(cat => cat !== null && cat.type === ChannelType.GuildCategory && cat.name === categoryName);
		if (!categoryToArchive || !(categoryToArchive instanceof CategoryChannel)) {
			await deferredReply.edit(`Unable to find category called \`${categoryName}\``);
			return;
		}

		await categoryToArchive.setName(`${categoryName} (Archived)`);

		await categoryToArchive.permissionOverwrites.edit(SERVER_ID, { SendMessages: false });

		for (const childChannel of categoryToArchive.children.cache.values()) {
			await childChannel.lockPermissions();
		}

		const highestNonArchiveChannel = await interaction.guild.channels.fetch(Channels.smallstudyrooms);
		if (highestNonArchiveChannel === null) {
			await deferredReply.edit("Failed to fetch highest non-archive channel!");
			return;
		}

		if (!(highestNonArchiveChannel instanceof CategoryChannel)) {
			await deferredReply.edit("Highest non-archive channel is not a category!");
			return;
		}

		await categoryToArchive.setPosition(highestNonArchiveChannel.position, { reason: "/archive" });

		await deferredReply.edit(`Successfully archived ${categoryName}`);
	}
};