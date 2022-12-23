const { ApplicationCommandOptionType } = require("discord.js");

//There should be a command to make PotatoBot send custom messages, but only accessible by staff in the staff chat
module.exports = {
	slash: true,
	name: 'react',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 2,
	options: [
		{
			name: 'message_link',
			description: 'The message to react to',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'reaction_emote', // <:zombbblob:1026136422572372170>
			description: 'The emote for the reaction',
			required: true,
			type: ApplicationCommandOptionType.String,
		}
	],
	expectedArgs: "<message link> <reaction emote>",
	description: 'reacts with an emote to a specified message',
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
				await m.react(args[1]).then(() => { msgInt.reply(`Reacted ${args[1]} to ${m.url}`); })
					.catch(() => { msgInt.reply(`Unable to find emoji \`${args[1]}\`.`); return; });
			})
				.catch(() => { msgInt.reply(`Unable to find message. Please verify that the message link is valid.`); });
		})
			.catch(() => { msgInt.reply(`Unable to react to message. Please verify that the message link is valid.`); });
	}
};
