module.exports = {
	slash: true,
	name: 'unlock',
	category: 'potatobot',
	maxArgs: 0,
	description: 'unlocks channel to students (syncs with parent category permissions)',
	testOnly: true, //so the slash command updates instantly
	callback: async ({ channel, interaction: msgInt }) => {
		channel.lockPermissions().then(() => msgInt.reply(`<#${channel.id}> unlocked`));
	}
};