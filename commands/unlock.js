const { Roles: { Student }, communicationsPermissions } = require('../utils');

module.exports = {
	slash: true,
	name: 'unlock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'unlocks the server to Students (able to communicate)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		guild.roles.fetch(Student).then(r => {
			let newPermissions = r.permissions.add(communicationsPermissions);
			r.setPermissions(newPermissions).then(() => {
				// Verify permissions were removed
				if (r.permissions.has(communicationsPermissions)) {
					msgInt.reply("Server unlocked to the Student role");
				} else {
					msgInt.reply("Unable to add permissions to Student");
				}
			});
		});
	}
};