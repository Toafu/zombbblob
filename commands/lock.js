const { Roles: { Student }, communicationsPermissions } = require('../utils');

module.exports = {
	slash: true,
	name: 'lock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'locks the server to Students (unable to communicate)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		guild.roles.fetch(Student).then(r => {
			let newPermissions = r.permissions.remove(communicationsPermissions);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(communicationsPermissions)) {
					msgInt.reply("Unable to remove permissions from Student");
				} else {
					msgInt.reply("Server locked to the Student role");
				}
			});
		});
	}
};