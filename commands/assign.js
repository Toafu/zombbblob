const { PermissionsBitField } = require("discord.js");

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
			description: 'Provide a userID, mention, or username',
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
	callback: async ({ guild, args, user, interaction: msgInt }) => {
		let userQuery = args[0]; //Try just ID first
		let userMention = userQuery.slice(2, userQuery.length - 1);
		let roleID = args[1];
		roleID = roleID.slice(3, roleID.length - 1);
		let member = guild.members.cache.get(userQuery);
		let role = guild.roles.cache.get(roleID);
		if (!role) {
			await guild.roles.fetch().then(roles => roles.find(role => role.name === args[1])).then(r => {
				if (r) { //We use 'r' to differentiate from 'role' within .find(), even though they're in different scopes
					msgInt.reply(`Did you mean <@&${r.id}>? Make sure it's mentioned in the argument.`);
				} else {
					msgInt.reply(`Unable to find role with ID/name: \`${args[1]}\``);
				}
			});
			return;
		}
		await guild.members.fetch(user.id).then(u => {
			if (u.roles.highest.position < role.position && !u.permissions.has(PermissionsBitField.Flags.Administrator)) {
				msgInt.reply(`<:blobdisapproval:1039016273343951009> You cannot assign yourself a role higher than what you have (Administrators can bypass).`);
				throw `${user.tag} attempted to gain power.`;
			}
		}).then(() => {
			if (!member) {
				member = guild.members.cache.get(userMention); //See if it's a mention
			};
			if (!member) { //Username
				guild.members.search({ query: userQuery, limit: 5 }).then(async result => { //returns a map of [userID, GuildMember]
					const keys = result.keys();
					if (result.size > 1) { //yaaay duplicates
						let targets = [];
						for (let i = 0; i < result.size; ++i) {
							let keyID = keys.next().value;
							targets.push(`<@${keyID}> - ${keyID}`);
						}
						targets = targets.join(`\n`);
						msgInt.reply(`I found more than one user. Please reassign the role with the desired user's ID:\n${targets}`);
						return;
					} else { //At most one exists
						member = guild.members.cache.get(keys.next().value);
						if (!member) {
							msgInt.reply(`Could not find user ${userQuery}`);
						} else {
							await member.roles.add(role);
							await msgInt.reply(`Successfully assigned the ${role.name} role to ${member.user.username}`);
						}
					}
				});
			} else { //Mention or ID
				member.roles.add(role);
				msgInt.reply(`Successfully assigned the ${role.name} role to ${member.user.username}`);
			}
		}).catch(e => {console.log(e)});
	},
};