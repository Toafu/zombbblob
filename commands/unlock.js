const { SlashCommandBuilder } = require('discord.js');
const { Roles: { Student }, communicationsPermissions } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlock')
		.setDescription('unlocks the server to Students (able to communicate)'),
	execute: async (interaction) => {
		interaction.guild.roles.fetch(Student).then(r => {
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