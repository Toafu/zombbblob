const { ApplicationCommandOptionType } = require("discord.js");

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
module.exports = {
	slash: true,
	name: 'send',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 2,
	options: [
		{
			name: 'channel',
			description: 'The channel to be sent in',
			required: true,
			type: ApplicationCommandOptionType.Channel,
		},
		{
			name: 'message',
			description: 'The message to be sent',
			required: true,
			type: ApplicationCommandOptionType.String,
		}
	],
	expectedArgs: "<channel> <message>",
	description: 'sends a message as the bot in the specified channel',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt }) => {
		const channelID = args[0];
		guild.channels.fetch(channelID)
			.then(async c => { c.send(args[1]); await msgInt.reply(`Message sent in <#${channelID}>`); })
			.catch(() => { msgInt.reply(`Unable to send message. You may have selected a category (<#${channelID}>) or provided an invalid channel ID.`); });
	}
};