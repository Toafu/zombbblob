const { PermissionsBitField } = require('discord.js');
const { SendMessages, SendMessagesInThreads, Connect, Speak } = PermissionsBitField.Flags;
const { studentRole } = require('../index');

module.exports = {
	slash: true,
	name: 'unlock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'unlocks the server to Students (able to communicate)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const permissionsToAdd = [
			SendMessages,
			SendMessagesInThreads,
			Connect,
			Speak
		];
		guild.roles.fetch(studentRole).then(r => {
			let newPermissions = r.permissions.add(permissionsToAdd);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(permissionsToAdd)) {
					msgInt.reply("Server unlocked to the Student role");
				} else {
					msgInt.reply("Unable to add permissions to Student");
				}
			});
		});
	}
};