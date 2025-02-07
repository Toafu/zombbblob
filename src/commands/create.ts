import { BaseGuildTextChannel, ChannelType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { semesterStringToCategoryName } from '../utils';
import { Command } from "../command";

import { ConfigHandler } from "../config";
const { Channels, Roles } = ConfigHandler.getInstance().getConfig();

//the ability to create channels for a semester (e.g. /create F22)
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('create')
		.addStringOption(option => option
			.setName('semester')
			.setDescription('Provide a semester and year formatted like F22')
			.setRequired(true))
		.setDescription('creates a category for channels of this semester'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.guild) {
			return;
		}

		const deferredReply = await interaction.deferReply();

		const [error, categoryName] = semesterStringToCategoryName(interaction.options.getString('semester', true).toLowerCase());

		if (error !== null) {
			await deferredReply.edit(error.message);
			return;
		}

		const categoryAboveNewestSemester = await interaction.guild.channels.fetch(Channels.category_above_newest_semester);
		if (categoryAboveNewestSemester === null) {
			await deferredReply.edit("Failed to fetch the category that goes above the newest semester!");
			return;
		}

		if (categoryAboveNewestSemester.type !== ChannelType.GuildCategory) {
			await deferredReply.edit(`Channel "<#${categoryAboveNewestSemester.id}>" marked as the category that goes above the newest semester is not a category!`)
			return;
		}
			
		const semesterCategory = await interaction.guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });;
		await semesterCategory.setPosition(categoryAboveNewestSemester.position + 1); //Staff-Only Channels is at Position 0

		const publicChannelNames = ['general', 'labs', 'random'];
		const privateChannelNames = ['project-0', 'project-1', 'project-2', 'project-3', 'project-4', 'midterm-exam', 'final-exam'];
		
		// Create the public channels normally
		for (const channelName of publicChannelNames) {
			const channel = await interaction.guild.channels.create({ name: channelName, type: ChannelType.GuildText })
			await channel.setParent(semesterCategory);
		}

		// Create the private channels with permissions already constructed
		for (const channelName of privateChannelNames) {
			const channel = await interaction.guild.channels.create({
				name: channelName,
				type: ChannelType.GuildText,
				permissionOverwrites: [
					{	// Disabling @everyone makes channel private
						id: interaction.guild.roles.everyone,
						deny: [PermissionsBitField.Flags.ViewChannel]
					},
					{
						id: Roles.Staff,
						allow: [PermissionsBitField.Flags.ViewChannel]
					},
				]
			});

			await channel.setParent(semesterCategory, { lockPermissions: false });
		}

		// Find #piano-gang and #old-timers and move them to the current semester under the public channels
		const lastPublicChannelName = publicChannelNames[publicChannelNames.length-1];
		const lastPublicChannel = semesterCategory.children.cache.find(channel => channel.name === lastPublicChannelName);
		if (lastPublicChannel === undefined) {
			await deferredReply.edit(`Failed to find last public channel (\`${lastPublicChannelName}\`)`);
			return;
		}

		const pianoGangChannel = (await interaction.guild.channels.fetch(Channels.pianogang)) as BaseGuildTextChannel;
		await pianoGangChannel.setParent(semesterCategory);
		await pianoGangChannel.setPosition(lastPublicChannel.position);

		const oldTimersChannel = (await interaction.guild.channels.fetch(Channels.oldtimers)) as BaseGuildTextChannel;
		await oldTimersChannel.setParent(semesterCategory);
		await oldTimersChannel.setPosition(lastPublicChannel.position+1);

		deferredReply.edit(`${categoryName} successfully created. Remember to also fix the Onboarding settings for Students.`);
	}
};