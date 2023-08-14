const { ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");

//a way for staff to assign/remove roles
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
			type: ApplicationCommandOptionType.User,
		},
		{
			name: 'role',
			description: 'Mention a role',
			required: true,
			type: ApplicationCommandOptionType.Role,
		},
	],
	expectedArgs: "<user> <role>",
	description: 'assigns a user the specified role',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, args, user, interaction: msgInt }) => {
		const targetUserID = args[0];
		const roleID = args[1];
		const member = guild.members.cache.get(targetUserID);
		const role = guild.roles.cache.get(roleID);
		if (!role) {
			await guild.roles.fetch().then(roles => roles.find(role => role.name === args[1])).then(r => {
				if (r) { //We use 'r' to differentiate from 'role' within .find(), even though they're in different scopes
					msgInt.reply(`Did you mean <@&${r.id}>? Make sure it's mentioned in the argument.`);
				} else {
					msgInt.reply(`Unable to find role with ID: \`${args[1]}\``);
				}
			});
			return;
		}
		await guild.members.fetch(user.id).then(u => {
			if (role.comparePositionTo(u.roles.highest) > 0 && !u.permissions.has(PermissionsBitField.Flags.Administrator)) {
				msgInt.reply(`<:blobdisapproval:1039016273343951009> You cannot assign a role that is higher than your highest role (Administrators can bypass).`);
			} else {
				member.roles.add(role);
				msgInt.reply(`Successfully assigned the ${role.name} role to ${member.user.username}`);
			}
		});
	},
};