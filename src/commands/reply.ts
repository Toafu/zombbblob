import { ApplicationCommandOptionType, BaseGuildTextChannel, ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { Command } from "../command";

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
		let IDs = interaction.options.getString('message_link', true).split('/');
		// https://discord.com/channels/734492640216744017/926625772595191859/926654292524404817
		// args[0][1]  [2]       [3]            [4]               [5]                [6]
		if (IDs.length != 7) {
			interaction.reply("Please make sure you are providing a valid message link.");
			return;
		}
		interaction.guild.channels.fetch(IDs[5]).then(async c => { //Extract channel and ignore guild part of link
			if (c === null) {
				await interaction.reply("Could not fetch channel!");
				return;
			}

			if (!(c instanceof TextChannel)) {
				await interaction.reply("Channel must be a text channel!");
				return;
			}

			(c as unknown as TextChannel).messages.fetch(IDs[6]).then(async m => { //Extract message from channel
				await m.reply(replyMessage).then(() => { interaction.reply(`Replied to ${m.url}`); })
					.catch(() => { interaction.reply(`Unable to reply to message.`); return; });
			})
				.catch(() => { interaction.reply(`Unable to find message. Please verify that the message link is valid.`); });
		})
			.catch(() => { interaction.reply(`Unable to reply to message. Please verify that the message link is valid.`); });
	}
};
