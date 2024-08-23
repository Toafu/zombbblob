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

		interaction.guild.roles.fetch(Roles.Student).then(async r => {
			if (r === null) {
				await interaction.reply("Could not fetch Student role");
				return;
			}
			let newPermissions = r.permissions.remove(communicationsPermissions);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(communicationsPermissions)) {
					interaction.reply("Unable to remove permissions from Student");
				} else {
					interaction.reply("Server locked to the Student role");
				}
			});
		});
	}
};