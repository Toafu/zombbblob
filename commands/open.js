module.exports = {
	slash: true,
	name: 'open',
	category: 'potatobot',
	maxArgs: 0,
	description: 'opens the channel to students (syncs with parent category permissions)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ channel, interaction: msgInt }) => {
		channel.lockPermissions().then(() => msgInt.reply(`<#${channel.id}> opened`));
	}
};