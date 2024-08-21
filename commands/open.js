const { SlashCommandBuilder } = require('discord.js');
const { Roles: { Student }, communicationsPermissions } = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('opens the channel to students (syncs with parent category permissions)'),
	execute: async (interaction) => {
		interaction.channel.lockPermissions().then(() => interaction.reply(`<#${interaction.channel.id}> opened`));
	}
};