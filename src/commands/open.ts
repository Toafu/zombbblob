import { BaseGuildTextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';

export const open: Command = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('opens the channel to students (syncs with parent category permissions)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.channel === null || interaction.guild === null) {
			return;
		}

		await (interaction.channel as BaseGuildTextChannel).lockPermissions();
		await interaction.reply(`<#${interaction.channel.id}> opened`);
	}
};