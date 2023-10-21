const { PermissionsBitField } = require('discord.js');
const { studentRole } = require('../index');

module.exports = {
	slash: true,
	name: 'unlock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'unlocks the server to Students (adds Send Messages permission)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ guild, interaction: msgInt }) => {
		const unlockedPermissions = [
			'CreateInstantInvite',
			'AddReactions',
			'Stream',
			'ViewChannel',
			'SendMessages',
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
			r.setPermissions(unlockedPermissions).then(() => {
				if (!r.permissions.has(PermissionsBitField.Flags.SendMessages)) {
					msgInt.reply("Unable to add `SEND_MESSAGES` to Student");
				} else {
					msgInt.reply("Server unlocked to the Student role");
				}
			});
		});
	}
};