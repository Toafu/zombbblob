import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { communicationsPermissions } from '../utils';
import { Command } from '../command';

import { ConfigHandler } from "../config";
const { Roles } = ConfigHandler.getInstance().getConfig();

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('unlocks the server to Students (able to communicate)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const studentRole = await interaction.guild.roles.fetch(Roles.Student);
		if (studentRole === null) {
			await interaction.reply("Could not fetch Student role");
			return;
		}

		const resultMessage = await studentRole.setPermissions(studentRole.permissions.add(communicationsPermissions))
			.then(() => "Server unlocked to the Student role")
			.catch(() => "Unable to add permissions to Student");

		await interaction.reply(resultMessage);
	}
};