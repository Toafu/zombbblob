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
			description: 'Provide a userID, mention, or username',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'timeout_length_in_sec',
			description: 'How long (sec) the timeout will be',
			required: true,
			type: ApplicationCommandOptionType.Number,
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
		let userQuery = args[0]; //Try just ID first
		let userMention = userQuery.slice(2, userQuery.length - 1);
		// We use 'm' to differentiate it from member, which refers to the user of the command
		let m = guild.members.cache.get(userQuery);
		if (!m) {
			m = guild.members.cache.get(userMention); //See if it's a mention
		};
		if (!m) { //Username
			guild.members.search({ query: userQuery, limit: 5 }).then(async result => { //returns a map of [userID, GuildMember]
				const keys = result.keys();
				if (result.size > 1) { //yaaay duplicates
					let targets = [];
					for (let i = 0; i < result.size; ++i) {
						let keyID = keys.next().value;
						targets.push(`<@${keyID}> - ${keyID}`);
					}
					targets = targets.join(`\n`);
					msgInt.reply(`I found more than one user. Please use the desired user's ID:\n${targets}`);
					return;
				} else { //At most one exists
					m = guild.members.cache.get(keys.next().value);
					if (!m) {
						msgInt.reply(`Could not find user ${userQuery}`);
					} else {
						m.timeout(1000 * args[1], reason).then(() => { msgInt.reply(`Timed out ${m.user.username} for ${args[1]} seconds`); });
					}
				}
			});
		} else { //Mention or ID
			m.timeout(1000 * args[1], reason).then(() => { msgInt.reply(`Timed out ${m.user.username} for ${args[1]} seconds`); });
		}
	},
};