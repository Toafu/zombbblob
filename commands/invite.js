const { SlashCommandBuilder } = require("discord.js");

//the ability to create invites with number of uses (e.g., /invite N)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.addIntegerOption(option => option
			.setName('n')
			.setDescription('Number of invite uses')
			.setRequired(false))
		.setDescription('creates an invite with a set number of uses (default unlimited)'),
	execute: async (interaction) => {
		const numUses = interaction.options.getInteger('n');

		if (numUses === null) {
			interaction.reply('discord.gg/fnVXyhfh33');
		} else {
			interaction.guild.invites.create('1275582059833851926', { maxUses: numUses, maxAge: 0 }).then(i => {
				interaction.reply(`discord.gg/${i.code}`);
			});
		}
	}
};