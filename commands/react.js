const { ApplicationCommandOptionType, SlashCommandBuilder } = require("discord.js");

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
module.exports = {
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
	execute: async (interaction) => {
		const reactionEmote = interaction.options.getString('reaction_emote');
		let IDs = interaction.options.getString('message_link').split('/');
		// https://discord.com/channels/734492640216744017/926625772595191859/926654292524404817
		// args[0][1]  [2]       [3]            [4]               [5]                [6]
		if (IDs.length != 7) {
			interaction.reply("Please make sure you are providing a valid message link.");
			return;
		}
		interaction.guild.channels.fetch(IDs[5]).then(c => { //Extract channel and ignore guild part of link
			c.messages.fetch(IDs[6]).then(async m => { //Extract message from channel
				await m.react(reactionEmote).then(() => { interaction.reply(`Reacted ${reactionEmote} to ${m.url}`); })
					.catch(() => { interaction.reply(`Unable to find emoji \`${reactionEmote}\`.`); return; });
			})
				.catch(() => { interaction.reply(`Unable to find message. Please verify that the message link is valid.`); });
		})
			.catch(() => { interaction.reply(`Unable to react to message. Please verify that the message link is valid.`); });
	}
};
