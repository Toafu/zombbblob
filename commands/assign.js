//a way for staff to assign/remove roles (it might be easier to use a universal syntax for all roles like "/assign staff" instead of $staff, which is not as efficient
module.exports = {
	slash: true,
	name: 'assign',
	category: 'potatobot',
	minArgs: 2,
	maxArgs: 2,
	options: [
		{
		  name: 'user',
		  description: 'Mention a user',
		  required: true,
		  type: 3,
		},
		{
		  name: 'role',
		  description: 'Mention a role',
		  required: true,
		  type: 3,
		},
	  ],
	expectedArgs: "<user> <role>",
	description: 'assigns a user the specified role',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, interaction: msgInt }) => {
		let userQuery = args[0]; //Try just ID first
		let userMention = userQuery.slice(2, userQuery.length - 1);
		let roleID = args[1];
		roleID = roleID.slice(3, roleID.length - 1);
		let member = guild.members.cache.get(userQuery);
		let role = guild.roles.cache.get(roleID);
		if (!role) {
			msgInt.reply(`Could not find role with ID ${roleID}`);
			return;
		}
		if (!member) {
			member = guild.members.cache.get(userMention); //See if it's a mention
		};
		if (!member) {
			guild.members.search({query: userQuery, limit: 5}).then(async result => { //returns a map of [userID, GuildMember]
				let targets = [];
				if (result.size > 1) { //yaaay duplicates
					const keys = result.keys();
					for (let i = 0; i < result.size; ++i) {
						let keyID = keys.next().value;
						targets.push(`<@${keyID}> - ${keyID}`);
					}
					targets = targets.join(`\n`);
					msgInt.reply(`I found more than one user. Please reassign the role with the desired user's ID:\n${targets}`);
					const collector = msgInt.channel.createMessageCollector({ time: 15000, max: 1 });
					collector.on('collect', m => {
						member = guild.members.cache.get(m);
					});
					if (!member) {
						await msgInt.edit(`Could not find user ${userQuery}`);
						return;
					}
				}
			});
		}
		
		await member.roles.add(role);
		await msgInt.reply(`Successfully assigned the ${role.name} role to ${member.user.username}`);
	},
};