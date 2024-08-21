const { SlashCommandBuilder } = require('discord.js');
const { Roles: { Student }, communicationsPermissions } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lock')
		.setDescription('locks the server to Students (unable to communicate)'),
	execute: async (interaction) => {
		interaction.guild.roles.fetch(Student).then(r => {
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