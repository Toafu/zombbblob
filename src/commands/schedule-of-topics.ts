import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../command';

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('schedule-of-topics')
		.setDescription('sends the schedule of topics'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}
		interaction.reply("[Here's the schedule of topics!](https://docs.google.com/spreadsheets/d/1WB25XRF0XTL5HOgDNSinp4cHZN_pxxpetD_qj-PboqQ)");
	}
};