import { ApplicationCommandOptionType, BaseGuildTextChannel, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { Command } from "../command";
import { parseMessageLink } from "../utils";

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('reply')
		.addStringOption(option => option
			.setName('message_link')
			.setDescription('The message to react to')
			.setRequired(true))
		.addStringOption(option => option
			.setName('reply_text')
			.setDescription('The reply message')
			.setRequired(true))	
		.setDescription('replies to a message as the bot'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const replyMessage = interaction.options.getString('reply_text', true);
		
		const [error, messageLinkParts] = parseMessageLink(interaction.options.getString('message_link', true));
		if (error !== null) {
			await interaction.reply(error.message);
			return;
		}

		const channel = interaction.guild.channels.fetch(messageLinkParts.channelID);
		
		if (channel === null) {
			await interaction.reply("Could not fetch channel!");
			return;
		}

		if (!(channel instanceof TextChannel)) {
			await interaction.reply("Channel must be a text channel!");
			return;
		}

		const message = await channel.messages.fetch(messageLinkParts.messageID)
			.then(message => message)
			.catch(_ => null);
		
		if (message === null) {
			await interaction.reply("Could not fetch message");
			return;
		}

		await message.reply(replyMessage);
		await interaction.reply(`Replied to ${message.url}`);
	}
};
