import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Roles, communicationsPermissions } from '../utils';
import { Command } from '../command';

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('locks the server to Students (unable to communicate)'),
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

		const resultMessage = await studentRole.setPermissions(studentRole.permissions.remove(communicationsPermissions))
			.then(() => "Server locked to the Student role")
			.catch(() => "Unable to remove permissions from Student");

		await interaction.reply(resultMessage);
	}
};