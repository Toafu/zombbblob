import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../command';

import { ConfigHandler } from '../../config';
const { Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('ia-notes')
		.setDescription('sends the ia notes'),
	init: () => {},
	authorizedRoleIDs: [Roles.Student],
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}
		
		await interaction.reply("[Here you go!](https://ajzhou.gitlab.io/eecs281/notes/)");
	}
};