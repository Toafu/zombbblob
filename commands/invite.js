const { ApplicationCommandOptionType } = require("discord.js");

//the ability to create invites with number of uses (e.g., /invite N)
module.exports = {
	slash: true,
	name: 'invite',
	category: 'potatobot',
	minArgs: 0,
	maxArgs: 1,
	options: [
		{
			name: 'n',
			description: 'Number of invite uses',
			required: false,
			type: ApplicationCommandOptionType.Integer,
		}
	],
	expectedArgs: "<N>",
	description: 'creates an invite with a set number of uses (default unlimited)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt }) => {
		if (!args[0]) {
			msgInt.reply('discord.gg/fnVXyhfh33');
		} else {
			guild.invites.create('734492640757678083', { maxUses: parseInt(args[0]), maxAge: 0 }).then(i => {
				msgInt.reply(`discord.gg/${i.code}`);
			});
		}
	}
};