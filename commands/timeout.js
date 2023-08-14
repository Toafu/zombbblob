const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
	slash: true,
	name: 'timeout',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 3,
	options: [
		{
			name: 'user',
			description: 'Mention a user',
			required: true,
			type: ApplicationCommandOptionType.User,
		},
		{
			name: 'timeout_length_in_sec',
			description: 'How long (sec) the timeout will be',
			required: true,
			type: ApplicationCommandOptionType.Integer,
		},
		{
			name: 'reason',
			description: 'The logged reason for this timeout',
			required: false,
			type: ApplicationCommandOptionType.String,
		},
	],
	expectedArgs: "<user> <timeout_seconds> (reason)",
	description: 'times out a user for some amount of seconds',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt, member }) => {
		let reason = `By ${member.user.tag}: `;
		if (args[2]) { reason += args[2]; } else { reason += `They deserved it`; }
		const targetUserID = args[0];
		await guild.members.fetch(targetUserID).then(u => {
			u.timeout(1000 * args[1], reason)
				.then(() => { msgInt.reply(`Timed out <@${targetUserID}> for ${args[1]} seconds`); })
				.catch(() => { msgInt.reply(`Unable to time out <@${targetUserID}>.`); });
		});
	},
};