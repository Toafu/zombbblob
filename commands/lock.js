const { PermissionsBitField } = require('discord.js');
const { SendMessages, SendMessagesInThreads, Connect, Speak } = PermissionsBitField.Flags;
const { studentRole } = require('../index');

module.exports = {
	slash: true,
	name: 'lock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'locks the server to Students (unable to communicate)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const permissionsToRemove = [
			SendMessages,
			SendMessagesInThreads,
			Connect,
			Speak
		];
		guild.roles.fetch(studentRole).then(r => {
			let newPermissions = r.permissions.remove(permissionsToRemove);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(permissionsToRemove)) {
					msgInt.reply("Unable to remove permissions from Student");
				} else {
					msgInt.reply("Server locked to the Student role");
				}
			});
		});
	}
};