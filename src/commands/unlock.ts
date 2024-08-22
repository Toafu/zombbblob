import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { communicationsPermissions, Roles } from '../utils';
import { Command } from '../command';

export const unlock: Command = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('unlocks the server to Students (able to communicate)'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		interaction.guild.roles.fetch(Roles.Student).then(async r => {
			if (r === null) {
				await interaction.reply("Failed to fetch Student role!");
				return;
			}

			let newPermissions = r.permissions.add(communicationsPermissions);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(communicationsPermissions)) {
					interaction.reply("Server unlocked to the Student role");
				} else {
					interaction.reply("Unable to add permissions to Student");
				}
			});
		});
	}
};