const { PermissionsBitField } = require('discord.js');
const { studentRole } = require('../index');

module.exports = {
	slash: true,
	name: 'lock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'locks the server to Students (removes Send Messages permission)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const lockedPermissions = [
			'CreateInstantInvite',
			'AddReactions',
			'Stream',
			'ViewChannel',
			'EmbedLinks',
			'ReadMessageHistory',
			'Connect',
			'Speak',
			'UseVAD',
			'ChangeNickname',
			'ManageEmojisAndStickers',
			'ManageGuildExpressions',
			'UseApplicationCommands',
			'RequestToSpeak',
			'ManageEvents',
			'SendMessagesInThreads',
			'UseSoundboard'
		];
		guild.roles.fetch(studentRole).then(r => {
			r.setPermissions(lockedPermissions).then(() => {
				if (r.permissions.has(PermissionsBitField.Flags.SendMessages)) {
					msgInt.reply("Unable to remove `SEND_MESSAGES` from Student");
				} else {
					msgInt.reply("Server locked to the Student role");
				}
			});
		});
	}
};