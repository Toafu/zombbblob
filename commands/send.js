const { ApplicationCommandOptionType, SlashCommandBuilder } = require("discord.js");

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
module.exports = {
	data: new SlashCommandBuilder()
		.setName('send')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to be sent in')
			.setRequired(true))
		.addStringOption(option => option
			.setName('message')
			.setDescription('The message to be sent')
			.setRequired(true))	
		.setDescription('sends a message as the bot in the specified channel'),
	execute: async (interaction) => {
		const targetChannel = interaction.options.getChannel('channel');
		targetChannel.send(interaction.options.getString('message'))
			.catch(() => { interaction.reply(`Unable to send message. You may have selected a category (<#${targetChannel.id}>) or provided an invalid channel ID.`); }); 
		await interaction.reply(`Message sent in <#${targetChannel.id}>`);
	}
};