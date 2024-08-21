import { ApplicationCommandOptionType, BaseGuildTextChannel, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
export const send: Command = {
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
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		const targetChannel = interaction.options.getChannel('channel', true);
		if (targetChannel !instanceof BaseGuildTextChannel) {
			await interaction.reply("Target channel must be a guild text channel!");
			return;
		}
		(targetChannel as unknown as BaseGuildTextChannel).send(interaction.options.getString('message', true))
			.catch(() => { interaction.reply(`Unable to send message. You may have selected a category (<#${targetChannel.id}>) or provided an invalid channel ID.`); }); 
		await interaction.reply(`Message sent in <#${targetChannel.id}>`);
	}
};