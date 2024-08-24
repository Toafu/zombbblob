import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../command";
import { parseMessageLink } from "../utils";

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('react')
		.addStringOption(option => option
			.setName('message_link')
			.setDescription('The message to react to')
			.setRequired(true))
		.addStringOption(option => option
			.setName('reaction_emote')
			.setDescription('The emote for the reaction')
			.setRequired(true))	
		.setDescription('reacts with an emote to a specified message'),
	init: () => {},
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (interaction.guild === null) {
			return;
		}

		const reactionEmote = interaction.options.getString('reaction_emote', true);

		const [error, messageLinkParts] = parseMessageLink(interaction.options.getString('message_link', true));
		if (error !== null) {
			await interaction.reply(error.message);
			return;
		}

		const channel = await interaction.guild.channels.fetch(messageLinkParts.channelID);
		
		if (channel === null) {
			await interaction.reply("Could not fetch channel!");
			return;
		}

		if (!channel.isTextBased()) {
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

		await message.react(reactionEmote);
		await interaction.reply(`Reacted ${reactionEmote} to ${message.url}`);
	}
};
