const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
	slash: true,
	name: 'reply',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 2,
	options: [
		{
			name: 'message_link',
			description: 'The message to reply to',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'reply_text',
			description: 'The reply message',
			required: true,
			type: ApplicationCommandOptionType.String,
		}
	],
	expectedArgs: "<message_link> <reply text>",
	description: 'replies to a message as the bot',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt }) => {
		let IDs = args[0].split('/');
		// https://discord.com/channels/734492640216744017/926625772595191859/926654292524404817
		// args[0][1]  [2]       [3]            [4]               [5]                [6]
		if (IDs.length != 7) {
			msgInt.reply("Please make sure you are providing a valid message link.");
			return;
		}
		guild.channels.fetch(IDs[5]).then(c => { //Extract channel and ignore guild part of link
			c.messages.fetch(IDs[6]).then(async m => { //Extract message from channel
				await m.reply(args[1]).then(() => { msgInt.reply(`Replied to ${m.url}`); })
					.catch(() => { msgInt.reply(`Unable to reply to message.`); return; });
			})
				.catch(() => { msgInt.reply(`Unable to find message. Please verify that the message link is valid.`); });
		})
			.catch(() => { msgInt.reply(`Unable to reply to message. Please verify that the message link is valid.`); });
	}
};
